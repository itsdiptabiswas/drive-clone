"use client";

import EmptyInfoAnimation from '@/app/assets/empty-info.json';
import useDeviceWidth from '@/app/hooks/useWidth';
import { DATA_TYPE } from '@/app/lib/database/interfaces/files.interfaces';
import { useAppDispatch, useAppSelector } from "@/app/store";
import { toggleInfo } from "@/app/store/actions/info.actions";
import { disabledClick } from '@/app/utils/index.utils';
import Image from 'next/image';
import dynamic from "next/dynamic";
import { useEffect, useRef } from 'react';
import { getFileIconByType } from '../fileListItem/utils/index.utils';
import ResourceInfoLoader from "../loader/resourceInfloLoader";
import ResourceBody from './components/resourceBody';
import style from './style.module.scss';

const LottiePlayer = dynamic(() => import("../lottiePlayer"), { ssr: false });
const ManageAccess = dynamic(() => import('./components/manageAccess'), { ssr: false });



const ResourceDetails = () => {
    const ref = useRef<HTMLElement>(null);
    const { isTablet } = useDeviceWidth()
    const { show, data, loading, selectedResourceId } = useAppSelector(state => state?.resourceInfo)
    const dispatch = useAppDispatch()
    const resourceInfo = data?.[selectedResourceId]

    const toggleResourceInfo = () => {
        dispatch(toggleInfo())
    }

    useEffect(() => {
        if (!isTablet) return;

        function handleClick(e: MouseEvent) {
            const target = e.target as Element
            const isDisabled = disabledClick(target);
            if (isDisabled) return;

            if ((ref.current && !ref.current?.contains(target) && show)) {
                dispatch(toggleInfo(false))
            }
        }

        document.addEventListener("click", handleClick)
        return () => {
            document.removeEventListener("click", handleClick)
        }
    }, [dispatch, isTablet])


    return (
        <>
            <section ref={ref} id="resource-info" className={`${style.resourceInfo} ${show ? style.active : ""}`}>
                <div className={style.body}>
                    <div className={style.header}>
                        <div className="d-flex align-items-center">
                            {resourceInfo?.dataType === DATA_TYPE.FOLDER ? <i className="bi bi-folder-fill"></i> : resourceInfo?.mimeType && <Image className='me-2' src={getFileIconByType(resourceInfo?.mimeType ?? "")} width={20} height={20} alt={"file-icon"} />}
                            <span>{resourceInfo?.name}</span>
                        </div>

                        <i className="bi bi-x" onClick={toggleResourceInfo}></i>
                    </div>
                    {loading ? <ResourceInfoLoader /> : !resourceInfo ? <div className="w-100 d-flex justify-content-center align-items-center mt-4">
                        <LottiePlayer animationData={EmptyInfoAnimation} loop width={200} height={200} />
                    </div> : <ResourceBody />}

                </div>

            </section>
            <ManageAccess />

            <div className='backdrop'></div>

        </>

    )
}

export default ResourceDetails


