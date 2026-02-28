"use client"

import { SEARCH_MODAL } from "@/app/_config/const"
import Hamburger from "@/app/components/hamburger"
import Modal, { ButtonClose } from "@/app/components/modal"
import useDeviceWidth from "@/app/hooks/useWidth"
import { PropsWithChildren, useCallback, useContext } from "react"
import { toggleSearchModal } from "../store/actions"
import { SearchContext } from "../store/context"
import style from '../style.module.scss'


const SearchLayout = ({ children }: PropsWithChildren) => {
    const { dispatch, state } = useContext(SearchContext);
    const { width } = useDeviceWidth()


    const toggleModal = useCallback((isOpen?: boolean) => {
        dispatch(toggleSearchModal(isOpen || false))
    }, [])


    return (
        <div className={style.wrapper}>
            <Hamburger />
            <button onClick={() => toggleModal(true)}>
                <i className='bi bi-search'></i>
                <p>Search File..</p>
            </button >
            <Modal centered={false} isOpen={state?.isOpen} id={SEARCH_MODAL} size="xl" className={style.searchModal} toggleHandler={toggleModal}>
                {width > 700 && <ButtonClose className={style.modalClose} onClick={() => toggleModal(false)} /> || null}
                {children}
            </Modal>
        </div>

    )
}

export default SearchLayout