import { toast } from 'sonner'


export const TOAST_ICON = {
    success: <i className="bi bi-check-lg icon"></i>,
    error: <i className="bi bi-cone-striped icon"></i>,
}

const useToast = () => {

    const success = (message: string) => {
        toast(message, {
            className: "success",
            icon: TOAST_ICON.success,
        })
    }

    const error = (message: string) => {
        toast(message, {
            className: "error",
            icon: TOAST_ICON.error,
        })
    }


    return {
        success,
        error
    }

}

export default useToast



export const toastMessage = (message: string, type: "success" | "error") => {
    return toast(message, {
        className: type,
        icon: TOAST_ICON[type],
    })
}