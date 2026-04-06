"use client";

import { useAppDispatch } from "@/app/store";
import { toggleModal, ToggleModalType } from "@/app/store/actions";
import { BootstrapMethods } from "@/app/utils/index.utils";
import {
	memo,
	PropsWithChildren,
	useCallback,
	useEffect,
	useRef,
} from "react";
import ModalButtonComponent, { ModalCloseButtonComponent } from "./components/modalButton";
import ModalComponent from "./components/modalComponent";
import { ModalSize } from "./interfaces/index.interface";

type Props = {
	id: string;
	isOpen?: boolean;
	centered?: boolean
	size?: ModalSize,
	blockHide?: boolean,
	className?: string,
	toggleHandler?: () => void
} & PropsWithChildren;

const Modal = (props: Props) => {
	const { id, isOpen, children, centered, size, blockHide, className = "", toggleHandler } = props;
	const instance = useRef<any>(null);
	const dispatch = useAppDispatch()

	const getInstance = useCallback(async () => {
		if (!instance.current) {
			const Modal = await BootstrapMethods.getModal();
			if (Modal) {
				instance.current = new Modal(`#${id}`);
			}
		}
	}, [id]);

	const toggle = useCallback(() => {

		if (!id) return;
		if (toggleHandler) return toggleHandler()

		dispatch(
			toggleModal({
				isOpen: false,
				name: id as ToggleModalType["name"],
			})
		);
	}, [dispatch, id, toggleHandler])

	useEffect(() => {
		getInstance();

		return () => {

			if (instance.current) {
				instance.current.hide()
				toggle()
				// instance.current.dispose()
				// instance.current = null
			}
		}
	}, [getInstance, toggle]);

	useEffect(() => {
		if (!instance?.current) return;
		isOpen ? instance?.current?.show() : instance?.current?.hide();
	}, [isOpen, id]);


	useEffect(() => {
		if (!instance?.current && !id) return;

		const handleHidden = () => {
			toggle()
		};

		const modal = document.getElementById(id);
		modal?.addEventListener("hidden.bs.modal", handleHidden)

		// modals.forEach((modal) =>
		// 	modal?.addEventListener("hidden.bs.modal", handleHidden)
		// );

		return () => {
			if (!id) return;

			const modal = document.getElementById(id);
			modal?.removeEventListener("hidden.bs.modal", handleHidden)
		};
	}, [id, toggle]);

	return (
		<ModalComponent centered={centered} isOpen={isOpen} id={id} size={size} blockHide={blockHide} className={className}>
			{children}
		</ModalComponent>
	);
};


export const ModalButton = ModalButtonComponent;
export const ButtonClose = ModalCloseButtonComponent;

export default memo(Modal);
