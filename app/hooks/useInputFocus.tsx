'use client'

import { useEffect, useRef } from 'react'

const useInputFocus = ({ trigger }: { trigger: boolean }) => {
    const inputRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
        if (inputRef.current && trigger) {
            inputRef.current.focus()
            setTimeout(() => {
                inputRef.current?.focus()
            }, 500)
        }
    }, [trigger])


    return {
        inputRef: inputRef
    }
}

export default useInputFocus