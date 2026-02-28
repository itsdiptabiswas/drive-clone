"use client";

import { Children, PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { ModalSize } from "../interfaces/index.interface";
import style from "../style.module.scss";
import { getModalSize } from "../utils";

type Props = {
	id: string;
	isOpen?: boolean;
	centered?: boolean
	size?: ModalSize,
	blockHide?: boolean
	className?: string;
} & PropsWithChildren;

const ModalComponent = ({ id, children, centered = true, size, blockHide = false, className = "" }: Props) => {
	const modalSize = useMemo(() => getModalSize(size), [size])
	const ref = useRef<string>("")

	useEffect(() => {

		if (ref.current === id) return;
		const modal = document.getElementById(id);

		if (blockHide) {

			if (modal) {
				modal.dataset.bsBackdrop = "static"
				ref.current = id
			}
		}

		return () => {
			modal?.removeAttribute("data-bs-backdrop")
		}

	}, [blockHide, id])

	return (
		<div id={id} className={`${style.modal} ${modalSize} modal ${className}`} tabIndex={-1}>
			<div className={` modal-dialog ${style.dialog} ${centered ? 'modal-dialog-centered' : ''}`}>
				<div className={` modal-content ${style.content}`}>
					<div className={` modal-body ${style.body}`}>
						{Children.count(children) ? children : "Provide Node children"}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModalComponent;
