"use client"

import useToast from "@/app/hooks/useToast";
import { useAppDispatch } from "@/app/store";
import { addProfileData } from "@/app/store/actions";
import { ErrorHandler } from "@/app/utils/index.utils";
import { getSession, signIn } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, MouseEvent, useState } from 'react';
import ButtonGroup from '../../buttonGroup';
import InputGroup from '../../inputGroup';
import { EmailPasswordPropsType, EmailPasswordSchema, LoginFlowState } from '../interfaces/index.interface';
import style from "../style.module.scss";
import { getViewSlideClass } from '../utils/index.util';


type Props = EmailPasswordPropsType

const EmailPassword = ({
    title,
    rememberMe = false,
    submitText,
    active,
    onNext,
    index,
    value,
    setState
}: Props) => {


    const [errors, setErrors] = useState({
        email: "",
        password: "",
    } as Record<keyof LoginFlowState, string>)
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const Toast = useToast()
    const dispatch = useAppDispatch()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (loading) return;

        setErrors({} as Record<keyof LoginFlowState, string>)
        try {
            await EmailPasswordSchema.validate(value, { abortEarly: false })

            if (value.rememberMe) {
                // TODO: remember me logic
            }

            setLoading(true)
            const response = await signIn("credentials", {
                ...value,
                redirect: false
            })


            if (!response?.ok) {
                setLoading(false)
                setErrors(prev => ({
                    ...prev,
                    email: "",
                    password: ""
                }))
                Toast.error("Invalid credentials!")
                return;
            }

            const session = await getSession()
            dispatch(addProfileData({
                email: session?.user?.email as string,
                firstName: session?.user?.firstName as string,
                lastName: session?.user?.lastName as string,
                imageUrl: session?.user?.imageUrl as string,
                _id: session?.user?._id as string
            }))
            router.push("/")
            setLoading(false)
        }
        catch (err: any) {
            const errors = ErrorHandler(err) as Record<string, string>
            if (errors?._validationError) {
                setErrors(errors)
            }
            else {
                Toast.error(String(err))
            }
            console.error(err)
            setLoading(false)
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setState(prev => ({
            ...prev,
            [event.target.id]: event.target.value
        }))
    }

    const handleNextPage = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onNext && onNext()

    }


    return (
        <form className={`${style.emailPassword} ${style.view} ${getViewSlideClass(active, index)}`}>
            <div className={style.wrapper}>
                <h4>{title}</h4>
                <InputGroup
                    className="mb-2"
                    value={value?.email}
                    id="email" type='text'
                    icon={<i className="bi bi-person-fill"></i>}
                    onChange={handleChange}
                    errorMessage={errors?.email || ""}
                    placeHolder='your email' />
                <InputGroup
                    value={value?.password}
                    type='password'
                    id="password"
                    icon={<i className="bi bi-lock-fill"></i>}
                    onChange={handleChange}
                    errorMessage={errors?.password || ""}
                    placeHolder='your password' />
                {rememberMe && <div className={style.remindPassword}>
                    {/* <label htmlFor="checkbox">
                        <input hidden id="checkbox" type="checkbox" onChange={e => setState(prev => ({ ...prev, rememberMe: e.target.checked }))} />
                        <span><i className="bi bi-check2"></i></span>
                        Remember my choice
                    </label> */}
                    <Link onClick={handleNextPage} href={"#"}>Forgot Password?</Link>
                </div>}

                <ButtonGroup loading={loading} submitText={submitText} handleSubmit={handleSubmit} type="submit" />

            </div>
            <div className={style.signupLink}>
                <Link href={"/getting-started"}>Don&#39;t have an account?</Link>
            </div>

        </form>
    )
}

export default EmailPassword