"use client"

import { useAppSelector } from '@/app/store';
import Image, { ImageLoader } from 'next/image';
import React, { Dispatch, SetStateAction, useCallback } from 'react';

type Props = {
    style?: React.CSSProperties;
    fill?: boolean;
    alt: string;
    src: string;
    sizes?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    onLoad?: React.ReactEventHandler<HTMLImageElement>,
    placeholder?: "blur" | "empty"
    loading?: "lazy" | "eager",
    blurDataURL?: string
    className?: string
    onHasError?: Dispatch<SetStateAction<boolean>>
}

const LocalImage = ({ style, fill, alt, sizes, priority, onLoad, src, placeholder, loading, blurDataURL, className, onHasError }: Props) => {
    const { type } = useAppSelector(state => state.network)
    const imageLoader: ImageLoader = useCallback(({ src, width }) => {
        const origin = window.location.origin
        return `${origin}/${src}?w=${width}&quality=${type}`
    }, [type])

    return (
        <Image
            className={className}
            src={src}
            loader={imageLoader}
            style={style}
            fill={fill}
            alt={alt}
            sizes={sizes}
            priority={priority}
            onLoad={onLoad}
            placeholder={placeholder}
            loading={loading}
            blurDataURL={blurDataURL}
            onError={() => onHasError?.(true)}
        />
    )
}

export default LocalImage