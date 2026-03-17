"use client"

import { abortFileUploadApi } from "@/app/_apis_routes/resources";
import { FILE_UPLOAD } from "@/app/_config/const";
import ButtonGroup from "@/app/components/buttonGroup";
import FileListItem from "@/app/components/fileListItem";
import ModalComponent from "@/app/components/modal";
import { FileUploadType } from "@/app/interfaces/index.interface";
import { useAppDispatch } from "@/app/store";
import {
    pushFile,
    toggleModal as toggleModalState
} from "@/app/store/actions";
import { FileDataType } from "@/app/store/reducers/files.reducers";
import { ModalDataType } from "@/app/store/reducers/modal.reducers";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import style from "./style.module.scss";
import { breakIntoChunks } from "./utils/index.util";

type Props = {
    isOpen: boolean;
    data: ModalDataType;
};



const FileUploadModal = ({ isOpen }: Props) => {
    const [isDragging, setIsDragging] = useState(false)
    const [files, setFiles] = useState<FileUploadType[]>([])
    const [hasUploaded, setHasUploaded] = useState<boolean>(false)
    const [uploading, setUploading] = useState(false)
    const { folderId } = useParams<{ folderId: string }>()
    const ref = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch();
    const [abortController, setAbortController] = useState(new AbortController())

    const onClearState = () => {
        setIsDragging(false)
        setFiles([])
        setHasUploaded(false)
        setUploading(false)
    }

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true)
    }

    const toggleModal = useCallback((isOpen?: boolean) => {
        dispatch(
            toggleModalState({
                isOpen: !!isOpen,
                name: FILE_UPLOAD,
            })
        );

        if (!isOpen) {
            onClearState()
        }
    }, [dispatch]);

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        setIsDragging(false)

        if (uploading) return;

        if (hasUploaded) {
            onClearState()
        }

        const dropItems = e.dataTransfer.items;
        if (!dropItems?.length) return;

        const items = Array.from(dropItems)

        for (const it of items) {
            const item = it.webkitGetAsEntry()
            if (item?.isFile) {
                const file = it.getAsFile();
                handleFiles(file)
            }
            else {
                console.log('Its not a directory')
            }
        }

    }

    const handleDragEnd = (e: React.DragEvent<HTMLLabelElement>) => {
        const dropItems = e.dataTransfer.items;
        dropItems.clear()
        setIsDragging(false)
    }

    const handleFiles = (file?: File | null) => {
        if (file)
            setFiles(prev => {
                const isSameName = prev?.find(f => f?.file.name === file?.name)
                if (!isSameName) prev.push({
                    file: file,
                    progress: 0,
                    hasFinished: false,
                    isUploading: false,
                    isFailed: false,
                    uploadId: "",
                    updatedFileName: ""
                })

                return Array.from(prev)
            })
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (uploading) return;

        if (hasUploaded) {
            onClearState()
        }


        const changedFiles = event.target.files

        if (!changedFiles?.length) return;

        const files = Array.from(changedFiles)
        files.forEach(file => handleFiles(file))
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const clearInputFiles = () => {
        const input = document.getElementById("upload-files") as HTMLInputElement
        if (input)
            input.value = ""
    }

    const startUploading = useCallback(async () => {

        let index = 0, hasMoreFile = !!files?.length;

        while (hasMoreFile) {
            const currantFile = files[index];
            if (currantFile?.hasFinished || currantFile?.progress) {
                console.log("Already complete!")
                hasMoreFile = !!files?.[++index]
                continue;

            }

            const data = await breakIntoChunks(currantFile?.file, index, folderId, (progress: number, fileIndex: number, uploadId: string, updatedFileName: string) => {
                setFiles((prev) => {
                    const data = prev[fileIndex];

                    if (data) {
                        if (progress === 100) {
                            data.hasFinished = true
                            data.isUploading = false
                        } else {
                            data.hasFinished = false
                            data.isUploading = true
                        }
                        data.isFailed = false
                        data.progress = progress
                        data.uploadId = uploadId
                        data.updatedFileName = updatedFileName
                        prev[fileIndex] = data
                    }
                    return Array.from(prev)

                })

            }, abortController.signal).catch(err => {
                const error = err as { err: AxiosError, index: number }

                setFiles((prev) => {
                    const data = prev[error?.index];
                    if (data) {
                        data.isFailed = true
                        data.hasFinished = true
                        data.isUploading = false
                        prev[error?.index] = data
                    }
                    return Array.from(prev)
                })
            })


            if (data) {
                dispatch(pushFile(data as FileDataType))
            }

            hasMoreFile = !!files?.[++index]
        }

    }, [abortController?.signal, dispatch, files, folderId])

    const handleSubmit = useCallback((e: React.MouseEvent) => {
        e.preventDefault();

        if (uploading) return;
        if (hasUploaded) {
            toggleModal(false)
            clearInputFiles()
            return;
        }

        if (!files?.length) return;

        setUploading(true)
        startUploading().finally(() => {
            setUploading(false)
            setHasUploaded(true)
        })
    }, [files?.length, hasUploaded, startUploading, toggleModal, uploading])

    const handleCancel = useCallback(() => {
        if (files?.length) {
            abortController.abort()
            const getCurrentFile = files?.find(file => file.isUploading)
            console.log("getCurrentFile", getCurrentFile)
            if (getCurrentFile) {
                abortFileUploadApi(getCurrentFile?.uploadId, getCurrentFile?.updatedFileName)
            }
        }

        toggleModal(false)
        clearInputFiles()
    }, [abortController, files, toggleModal])

    const handleFileDelete = (index: number) => {
        if (uploading) return;
        setFiles(prev => [...prev.filter((_, idx) => idx !== index)])
    }

    useEffect(() => {
        if (uploading) {
            ref.current?.scrollTo(0, 0)
        }
    }, [uploading])

    useEffect(() => {
        if (isOpen) {
            setAbortController(new AbortController())
        }
    }, [isOpen])

    useEffect(() => {
        return () => {
            onClearState()
        }
    }, [isOpen])


    return (
        <ModalComponent
            id={FILE_UPLOAD}
            isOpen={isOpen}
            size="lg" blockHide={!!files?.length}
        >
            <section className={style.wrapper}>
                {!uploading && <label
                    htmlFor="upload-files"
                    className={`${style.upload} ${isDragging && style.dragging}`}
                    onDrop={handleDrop}
                    onDragOverCapture={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragLeave={handleDragLeave}
                >
                    <input id="upload-files" type="file" multiple hidden onChange={handleChange} />
                    <div>
                        <i className="bi bi-file-earmark-code"></i>
                        <div></div>
                    </div>

                    <p><strong>Click here</strong> to upload your file or drag and drop</p>
                    <span>Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.</span>
                </label> || null}

                {files?.length && <div className={style.list} ref={ref}>
                    {files?.length && files?.map((file, index) => <FileListItem className="mb-2" uploading={uploading} key={file.file?.name} media={file} index={index} onDelete={handleFileDelete} />) || null}
                </div> || null}

                <div className={`d-flex justify-content-end align-items-center ${style.buttonGroup}`}>
                    {!hasUploaded && <ButtonGroup handleSubmit={handleCancel} submitText="cancel" className={`cancel me-4`} />}
                    <ButtonGroup
                        type="submit"
                        disabled={uploading}
                        submitText="OK"
                        className={`${style.submit} submit`}
                        loading={uploading}
                        loader="spin"
                        order={-1}
                        handleSubmit={handleSubmit}
                    />
                </div>

            </section>
        </ModalComponent>
    )
}

export default memo(FileUploadModal)