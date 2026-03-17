import mongoose, { Schema, Types } from "mongoose";

export interface FileNameCounterDocument {
    _id: Types.ObjectId;
    parentFolderId: Types.ObjectId | null;
    userId: Types.ObjectId | null;
    baseName: string;
    nextVersion: number;
    createdAt: Date;
    updatedAt: Date;
}

const fileNameCounterSchema = new Schema<FileNameCounterDocument>({
    parentFolderId: {
        type: Schema.Types.ObjectId,
        ref: "files_and_folders",
        default: null
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        default: null
    },
    baseName: {
        type: String,
        required: true,
        trim: true
    },
    nextVersion: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

fileNameCounterSchema.index({
    parentFolderId: 1,
    userId: 1,
    baseName: 1
}, {
    unique: true
});

export const FileNameCounterModel = (mongoose.models.file_name_counters ??
    mongoose.model<FileNameCounterDocument>("file_name_counters", fileNameCounterSchema));

