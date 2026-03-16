import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandInput, ListPartsCommand, PutObjectCommand, S3, UploadPartCommand } from "@aws-sdk/client-s3";
import { BUCKET_PATH } from "../_config/const";
import { UploadFileType } from "../lib/database/interfaces/files.interfaces";
import { MAX_CHUNK_COUNT } from "../lib/lib";



const s3Client = new S3({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    endpoint: process.env.OBJECT_SPACE_ENDPOINT,
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.OBJECT_SPACE_KEY,
        secretAccessKey: process.env.OBJECT_SECRET_KEY
    }
});


export class LOCAL_S3 {
    private bucket = BUCKET_PATH;
    private key: string = ""
    private body?: Buffer;
    private metadata: { isPublic?: boolean } & Record<string, any> = {}
    uploadId?: string = ""

    constructor({ key, body, uploadId }: {
        key: string,
        body?: Buffer | ArrayBuffer,
        uploadId?: string
    }) {
        this.key = key

        if (body)
            this.body = Buffer.from(body)

        if (uploadId) {
            this.uploadId = uploadId
        }
    }

    private async getListOfParts() {
        if (!this.uploadId) throw new Error("UploadId is required!")
        const command = new ListPartsCommand({
            "Bucket": this.bucket,
            "Key": this.key,
            "UploadId": this.uploadId,
        })
        const lists = await s3Client.send(command)

        return lists?.Parts?.map(part => ({
            "ETag": part?.ETag,
            "PartNumber": part?.PartNumber
        }))
    }

    setMetadata(data: { isPublic: boolean } & Record<string, any>) {
        this.metadata = data;
        return this
    }

    async put() {
        if (!this.body) {
            throw new Error("No body provided s3 put")
        }

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: this.key,
            Body: this.body,
            ServerSideEncryption: "AES256",
            Metadata: this.metadata
        })

        return await s3Client.send(command)
    }

    async get(payload?: {
        Range?: string
    }) {

        const params: GetObjectCommandInput = {
            Bucket: this.bucket,
            Key: this.key,
        }

        if (payload?.Range) {
            params.Range = payload?.Range
        }

        const command = new GetObjectCommand(params)

        return await s3Client.send(command)
    }

    async delete() {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: this.key,
        })

        return await s3Client.send(command)
    }

    async createMultipartUpload() {
        const input = {
            "Bucket": this.bucket,
            "Key": this.key
        };
        const command = new CreateMultipartUploadCommand({
            ...input,
            // Expires: new Date(new Date().setTime(new Date().getHours() + 1)),
        });
        const response = await s3Client.send(command);

        this.uploadId = response.UploadId
        return response
    }

    async uploadPart(params: Pick<UploadFileType, "file">, chunkIndex: number) {
        if (!this.uploadId) new Error("UploadId is required!")

        const partNumber = Math.floor(chunkIndex / MAX_CHUNK_COUNT) + 1

        const input = {
            "Bucket": this.bucket,
            "Key": this.key,
            "Body": params?.file,
            "PartNumber": partNumber,
            "UploadId": this.uploadId
        };
        const command = new UploadPartCommand(input);
        const response = await s3Client.send(command);
        return response?.ETag
    }

    async completeMultipartUpload() {
        if (!this.uploadId) new Error("UploadId is required!")
        const parts = await this.getListOfParts()


        const input = {
            "Bucket": this.bucket,
            "Key": this.key,
            "UploadId": this.uploadId,
            "MultipartUpload": {
                "Parts": parts
            },
        };
        const command = new CompleteMultipartUploadCommand(input);
        await s3Client.send(command);
        this.uploadId = ""
    }


    async abortMultipartUpload() {
        if (!this.uploadId) {
            await this.delete()
            return
        }

        const input = {
            "Bucket": this.bucket,
            "Key": this.key,
            "UploadId": this.uploadId,
        };
        const command = new AbortMultipartUploadCommand(input);
        await s3Client.send(command);
    }



}
