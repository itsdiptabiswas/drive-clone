"use client"

import { DEFAULT_IMAGE } from '@/app/_config'
import { User } from 'next-auth'
import { useMemo, useState } from 'react'
import { Rings } from 'react-loader-spinner'
import LocalImage from '../LocalImage'
import style from "./style.module.scss"

type Props = {
    user?: Pick<User, "_id" | "firstName" | "lastName" | "imageUrl">,
    width?: number
    height?: number
    className?: string
    isLoading?: boolean
    style?: React.CSSProperties
}

const AvatarComponent = ({ user: _user, width, height, className = "", isLoading = false, ...rest }: Props) => {

    const [hasError, setHasError] = useState(false)

    const firstWord = useMemo(() => {
        return `${_user?.firstName?.charAt(0)}${_user?.lastName?.charAt(0)}`
    }, [_user])


    return (
        <div className={`${style.avatar} ${className}`} style={rest?.style}>
            <div className={style.wrapper} style={{ width, height }}>
                {
                    !isLoading ? <>
                        {_user?.imageUrl && !hasError && <LocalImage
                            src={_user?.imageUrl ?? ""}
                            alt='avatar-image'
                            fill
                            placeholder='blur'
                            loading='lazy'
                            blurDataURL={DEFAULT_IMAGE}
                            onHasError={setHasError}
                        />}

                        <p>{firstWord?.[0] + firstWord[1]}</p></>
                        : <div className="d-flex w-100 justify-content-center align-items-center">
                            <Rings
                                height="30"
                                width="20"
                                color="black"
                            />
                        </div>
                }
            </div>
        </div>
    )
}

export default AvatarComponent