"use client";

import { PREVIEW_MODAL } from "@/app/_config/const";
import { FilesAndFolderSchemaType } from "@/app/lib/database/interfaces/files.interfaces";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { toggleModal } from "@/app/store/actions";
import { ModalDataType } from "@/app/store/reducers/modal.reducers";
import { Progress } from "antd";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import dynamic from "next/dynamic";
import { getFileIconByType } from "../fileListItem/utils/index.utils";
import ImagePreview from "./components/imagePreview";
import OtherPreview from "./components/otherPreview";
import TextPreview from "./components/txtPreview";
import useDownload from "./hooks/useDownload";
import style from "./style.module.scss";

const VideoPreview = dynamic(() => import("./components/videoPreview"), { ssr: false });




const PreviewFiles = () => {
    const [isLoadingFile, setIsLoadingFile] = useState(true)
    const {
        previewModal,
        data: fileInfo,
    } = useAppSelector((state) => state.modals);
    const dispatch = useAppDispatch()
    const { startDownload, isDownloading, progress } = useDownload()
    const [isMounted, setMounted] = useState(true)



    const downloadUrl = useMemo(() => {
        if (!fileInfo?._id) return ""
        return `/api/resources/files/download/${fileInfo?._id}`
    }, [fileInfo])

    const handleClick = useCallback(() => {
        flushSync(() => {
            setMounted(false)
        })
        dispatch(toggleModal({
            isOpen: false,
            name: "previewModal"
        }))
    }, [dispatch])

    const toggleFileLoading = useCallback((isLoading = false) => {
        setIsLoadingFile(isLoading)
    }, [])

    const handleDownload = () => {
        if (isDownloading) return;
        startDownload(downloadUrl, fileInfo?.name)
    }

    useEffect(() => {
        if (!previewModal) return;

        const handleKeyDown = (e: KeyboardEvent) => {

            const key = e.key
            const keys = ["Escape"]

            if (!keys.includes(key)) {
                return
            }

            if (key === "Escape") {
                handleClick()
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            setIsLoadingFile(true)
        }
    }, [handleClick, previewModal])

    return (
        <section id={PREVIEW_MODAL} className={style.preview}>
            <header>
                <div className={style.info}>
                    <i className="bi bi-arrow-left" onClick={handleClick}></i>
                    <p>
                        <Image
                            className="me-2"
                            src={getFileIconByType(fileInfo?.mimeType)}
                            alt="fileIcon"
                            width={20}
                            height={20}
                            priority
                        />
                        <span>{fileInfo?.name}</span>
                    </p>
                </div>

                <div className="d-flex justify-content-center align-items-center">
                    {isDownloading ?
                        <Progress status="active" trailColor="white" type="circle" percent={progress} size={20} strokeColor="#6a29ff" />
                        : <i className="bi bi-download" onClick={handleDownload}></i>
                    }
                </div>
            </header>
            <main>
                <RenderPreview
                    isMounted={isMounted}
                    downloadUrl={downloadUrl}
                    fileInfo={fileInfo as ModalDataType & FilesAndFolderSchemaType}
                    isLoadingFile={isLoadingFile}
                    toggleFileLoading={toggleFileLoading}
                />
            </main>
        </section>
    )
}

export default PreviewFiles




function RenderPreview({ fileInfo, isMounted, downloadUrl, isLoadingFile, toggleFileLoading }: { fileInfo: ModalDataType & FilesAndFolderSchemaType, isMounted: boolean, downloadUrl: string, toggleFileLoading: () => void, isLoadingFile: boolean }) {

    const fileUrl = useMemo(() => {
        if (!fileInfo?._id) return ""
        return `/api/resources/files/${fileInfo?._id}`
    }, [fileInfo])

    const isImage = fileInfo?.mimeType?.startsWith?.("image")
    const isVideo = fileInfo?.mimeType?.startsWith?.("video")
    const isText = fileInfo?.mimeType?.startsWith?.("text") || fileInfo?.mimeType?.startsWith?.("application/json") || fileInfo?.mimeType?.startsWith?.("application/javascript")

    if (isImage) {
        return <ImagePreview isOpen={isMounted} isLoading={isLoadingFile} toggle={toggleFileLoading} url={fileUrl} />
    }

    if (isVideo) {
        return <VideoPreview isOpen={isMounted} url={fileUrl} />
    }

    if (isText) {
        return <TextPreview url={downloadUrl} isOpen={isMounted} />
    }


    return <OtherPreview url={downloadUrl} fileName={fileInfo?.name} />
}