import { authOptions } from "@/app/lib/authConfig"
import { connectDB } from "@/app/lib/database/db"
import { ACCESS_TYPE } from "@/app/lib/database/interfaces/access.interface"
import { DATA_TYPE } from "@/app/lib/database/interfaces/files.interfaces"
import { ResourceService } from "@/app/lib/database/services/resource.service"
import { ApiResponse } from "@/app/utils/response"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { revalidateTag } from "next/cache"
import { NextRequest } from "next/server"



export const GET = async (req: NextRequest, { params }: { params: { resourceId: string } }) => {
    const response = new ApiResponse()
    const service = new ResourceService()
    try {

        const session = await getServerSession(authOptions)
        const url = new URL(req.nextUrl).searchParams
        const searchWithDeleted = !!url.get("deleted")

        if (!session) return response.status(401).send("Unauthorized")
        const user = session.user

        const resourceId = params?.resourceId;

        if (!resourceId) return response.status(422).send("Please provide a resourceId ID");

        const isValid = mongoose.Types.ObjectId.isValid(resourceId);
        if (!isValid) return response.status(422).send("Invalid FolderId provided")

        await connectDB();

        const hasAccess = await service.checkAccess(String(user._id), {
            resourceId: resourceId ?? "",
        }, { withDeleted: searchWithDeleted })

        if (!hasAccess?.success) {
            //TODO: redirect to another page not found / no permissions
            return response.status(403).send("Unauthorized")
        }

        const data = await service.resourceInfo(resourceId, String(user._id), {
            withDeleted: searchWithDeleted
        })

        return response.status(200).send({
            data
        })

    }
    catch (_err: unknown) {
        const err = _err as { message: string }
        console.error("Error - ", err)
        return response.status(500).send(err?.message)
    }
}

export const PATCH = async (req: NextRequest, { params }: { params: { resourceId: string } }) => {
    const response = new ApiResponse()
    const service = new ResourceService()
    try {
        const session = await getServerSession(authOptions)

        if (!session) return response.status(401).send("Unauthorized")
        const user = session.user
        const resourceId = params?.resourceId;

        if (!resourceId) return response.status(422).send("Please provide a resourceId ID");

        const isValid = mongoose.Types.ObjectId.isValid(resourceId);
        if (!isValid) return response.status(422).send("Invalid FolderId provided")

        await connectDB();

        const hasAccess = await service.checkAccess(String(user._id), {
            resourceId: resourceId ?? "",
            accessType: ACCESS_TYPE.WRITE
        })

        if (!hasAccess?.success) {
            //TODO: redirect to another page not found / no permissions
            return response.status(403).send("Unauthorized")
        }

        await service.softDeleteResourceById(resourceId)
        if (hasAccess?.resource?.dataType === DATA_TYPE.FOLDER) {
            revalidateTag("folders")
        } else revalidateTag("files")
        revalidateTag("resources")
        return response.status(200).send("Deleted")

    }
    catch (_err: unknown) {
        const err = _err as { message: string }
        console.error("Error - ", err)
        return response.status(500).send(err?.message)
    }
}

export const POST = async (req: NextRequest, { params }: { params: { resourceId: string } }) => {
    const response = new ApiResponse()
    const service = new ResourceService()
    try {
        const session = await getServerSession(authOptions)

        if (!session) return response.status(401).send("Unauthorized")
        const user = session.user
        const resourceId = params?.resourceId;

        if (!resourceId) return response.status(422).send("Please provide a resourceId ID");

        const isValid = mongoose.Types.ObjectId.isValid(resourceId);
        if (!isValid) return response.status(422).send("Invalid FolderId provided")

        await connectDB();

        const hasAccess = await service.checkAccess(String(user._id), {
            resourceId: resourceId ?? "",
            accessType: ACCESS_TYPE.WRITE
        }, { withDeleted: true })

        if (!hasAccess?.success) {
            //TODO: redirect to another page not found / no permissions
            return response.status(403).send("Unauthorized")
        }

        await service.restoreDeletedResources(resourceId, { withDeleted: true })
        revalidateTag("resources")
        if (hasAccess?.resource?.dataType === DATA_TYPE.FOLDER) {
            revalidateTag("folders")
        } else revalidateTag("files")
        return response.status(200).send("Restored")

    }
    catch (_err: unknown) {
        const err = _err as { message: string }
        console.error("Error - ", err)
        return response.status(500).send(err?.message)
    }
}

export const DELETE = async (req: NextRequest, { params }: { params: { resourceId: string } }) => {
    const response = new ApiResponse()
    const service = new ResourceService()
    try {
        const session = await getServerSession(authOptions)

        if (!session) return response.status(401).send("Unauthorized")
        const user = session.user
        const resourceId = params?.resourceId;

        if (!resourceId) return response.status(422).send("Please provide a resourceId ID");

        const isValid = mongoose.Types.ObjectId.isValid(resourceId);
        if (!isValid) return response.status(422).send("Invalid FolderId provided")

        await connectDB();

        const hasAccess = await service.checkAccess(String(user._id), {
            resourceId: resourceId ?? "",
            accessType: ACCESS_TYPE.WRITE
        }, { withDeleted: true })

        if (!hasAccess?.success) {
            //TODO: redirect to another page not found / no permissions
            return response.status(403).send("Unauthorized")
        }

        await service.deleteForever(resourceId, { withDeleted: true })
        revalidateTag("resources")
        return response.status(200).send("Restored")

    }
    catch (_err: unknown) {
        const err = _err as { message: string }
        console.error("Error - ", err)
        return response.status(500).send(err?.message)
    }
}