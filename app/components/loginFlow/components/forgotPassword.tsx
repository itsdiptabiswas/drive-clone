import { forgotPasswordApi } from '@/app/_apis_routes/user'
import useToast from '@/app/hooks/useToast'
import { ErrorHandler } from '@/app/utils/index.utils'
import { useMutation } from '@tanstack/react-query'
import { ChangeEvent, useState } from 'react'
import ButtonGroup from '../../buttonGroup'
import InputGroup from '../../inputGroup'
import { ForgotPasswordPropsType, ForgotPasswordSchema } from '../interfaces/index.interface'
import style from '../style.module.scss'
import { getViewSlideClass } from '../utils/index.util'

type Props = ForgotPasswordPropsType

const ForgotPassword = ({
    title,
    submitText,
    active,
    onNext,
    index,
    goBack,
    value,
    setState
}: Props) => {


    const mutation = useMutation({ mutationFn: forgotPasswordApi })
    const [errors, setErrors] = useState({
        email: "",
    })
    const Toast = useToast()


    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setState(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }))
    }

    const handleSubmit = async () => {
        if (mutation?.isPending) return;

        setErrors({ email: "" })
        try {
            await ForgotPasswordSchema.validate(value, { abortEarly: false })
            await mutation.mutateAsync(value.email)
            onNext && onNext()
        }
        catch (err: any) {
            const errors = ErrorHandler(err) as { email: string } & Record<string, string>
            if (errors?._validationError) {
                setErrors(errors)
            }
            else {
                Toast.error(String(errors))
            }
            console.error(err)
        }
    }

    const handleBack = () => {
        goBack()
    }


    return (
        <div className={`${style.view} ${getViewSlideClass(active, index)}`}>
            <div className="d-flex flex-column w-100">
                <div className="d-flex align-items-center w-100">
                    <i onClick={handleBack} className="bi bi-chevron-left" style={{ cursor: "pointer" }}></i>
                    <h4 className="flex-fill text-center">{title}</h4>
                </div>

                <p className="mt-5 mb-0">No problem! Just enter the email address associated with your account, and we&#39;ll send you a link to reset your password.</p>
            </div>


            <InputGroup
                name='email'
                className={errors?.email && style.error || ""}
                type='email'
                icon={<i className="bi bi-envelope-fill"></i>}
                value={value?.email}
                errorMessage={errors?.email}
                onChange={handleChange}
                disabled={mutation?.isPending}
                placeHolder='enter your email'
            />
            <ButtonGroup submitText={submitText} handleSubmit={handleSubmit} disabled={mutation?.isPending} loading={mutation?.isPending} />

        </div>
    )
}

export default ForgotPassword