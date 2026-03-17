import { authOptions } from "@/app/lib/authConfig";
import { connectDB } from "@/app/lib/database/db";
import { ACCESS_TYPE } from "@/app/lib/database/interfaces/access.interface";
import { DATA_TYPE, FilesAndFolderSchemaType } from "@/app/lib/database/interfaces/files.interfaces";
import { UserSchemaType } from "@/app/lib/database/interfaces/user.interface";
import { ResourceService } from "@/app/lib/database/services/resource.service";
import { StorageService } from "@/app/lib/database/services/storage.service";
import { ApiResponse } from "@/app/utils/response";
import { File } from "buffer";
import { startSession } from "mongoose";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { UpdateNamePayloadSchema } from "../../_validation/data.validation";

export const POST = async (req: NextRequest) => {
    try {
        console.log("Inside File Upload path...")
        await connectDB()
        const mongoSession = await startSession()
        const service = new ResourceService();
        const response = new ApiResponse()
        const storageService = new StorageService()

        const formData = await req?.formData?.();
        const file = formData.get("file");
        const folderId = formData.get("folderId") as string;
        const totalSize = parseInt(formData.get("totalSize") as string)
        const chunkIndex = parseInt(formData.get("chunkIndex") as string)
        const totalChunks = parseInt(formData.get("totalChunks") as string)
        const uploadId = formData.get("uploadId") as string

        if (chunkIndex > 0 && !uploadId) {
            return response.status(400).send("Please provide uploadId!")
        }

        const name = formData.get("name") as string;

        try {
            console.log("After all the data validation")
            const session = await getServerSession(authOptions)
            if (!session) return response.status(401).send("Unauthorized")
            const user = session.user

            if (!file || !(file instanceof File)) {
                return response.status(400).send("No files received.")
            }
            console.log("After getting Server session")

            mongoSession.startTransaction()

            const hasAccess = await service.checkAccess(String(user._id), {
                resourceId: folderId ?? "",
                accessType: ACCESS_TYPE.WRITE
            }, { session: mongoSession })


            if (!hasAccess?.success) {
                //TODO: redirect to another page not found / no permissions
                return response.status(403).send("Unauthorized")
            }


            const canUpload = await storageService.hasUserStorage(String(user?._id), totalSize)

            if (!canUpload) return response.status(422).send({
                message: "You don't have any active subscription space left!",
                subscription: false
            })

            const buffer = Buffer.from(await file.arrayBuffer())


            const { uploadId: awsUploadId, fileInfo } = await service.upload({
                file: buffer,
                fileName: name,
                createdBy: String(user._id),
                parentFolderId: folderId,
                size: totalSize,
                userId: String(user._id),
                chunkIndex,
                totalChunks,
                uploadId
            }, { session: mongoSession });

            await mongoSession.commitTransaction()
            if (chunkIndex === totalChunks - 1) {
                // means file has been uploaded fully
                revalidateTag("files")

                const data = fileInfo as unknown as { userInfo?: UserSchemaType } & FilesAndFolderSchemaType
                data.userInfo = {
                    email: user?.email,
                    firstName: user?.firstName,
                    imageUrl: user?.imageUrl,
                    lastName: user?.lastName,
                    _id: user?._id
                }

                return response.status(201).send({
                    uploadId: awsUploadId,
                    message: "Uploaded",
                    data: data
                })
            }

            return response.status(201).send({
                uploadId: awsUploadId,
                message: "Uploading..."
            })

        }
        catch (_err: unknown) {
            const err = _err as { message: string }
            console.error("Error - ", err)
            await mongoSession.abortTransaction()
            return response.status(500).send(err?.message)
        }
        finally {
            console.log("Run finally")
            await mongoSession.endSession()
        }
    }
    catch (err) {
        console.log("Error while uploading file: ", err)
        throw err
    }
};

export const PATCH = async (req: NextRequest) => {
    const service = new ResourceService()
    const response = new ApiResponse()


    try {
        const session = await getServerSession(authOptions)

        if (!session) return response.status(401).send("Unauthorized")
        const user = session.user

        const body = await req?.json()
        const { id, updatedName } = body;

        const isValid = await UpdateNamePayloadSchema.isValid(body, { abortEarly: false })

        if (!isValid) return response.status(422).send("Invalid Data")

        await connectDB();

        const hasAccess = await service.checkAccess(String(user._id), {
            resourceId: id ?? "",
            accessType: ACCESS_TYPE.WRITE
        })

        if (!hasAccess?.success) {
            //TODO: redirect to another page not found / no permissions
            return response.status(403).send("Unauthorized")
        }

        const fileInfo = await service.findOne({ _id: id })

        if (!fileInfo) return response.status(422).send("No folder found!")

        const fileData = fileInfo.toJSON()

        const fileExistWithName = await service.findOne({ name: updatedName, parentFolderId: fileData?.parentFolderId, _id: { $ne: id }, dataType: DATA_TYPE.FILE })

        if (fileExistWithName) return response.status(422).send("Folder Exists with the name!")

        await service.updateName(id, updatedName)

        revalidateTag(`files`)

        return response.status(200).send("Updated")

    }
    catch (_err: unknown) {
        const err = _err as { message: string }
        console.error("Error - ", err)
        return response.status(500).send(err?.message)
    }

}
