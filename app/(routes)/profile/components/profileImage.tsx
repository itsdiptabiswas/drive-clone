"use client"

import { updateImageApi } from "@/app/_apis_routes/user";
import { DEFAULT_IMAGE } from "@/app/_config";
import LocalImage from "@/app/components/LocalImage";
import { RootState } from "@/app/store";
import { ProfileStateType } from "@/app/store/reducers/profile.reduce";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import style from "../style.module.scss";

const ProfileImageComponent = () => {
	const [hasError, setHasError] = useState(false)
	const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE)
	const { update } = useSession();
	const { data } = useSelector<RootState, ProfileStateType>(
		(state) => state.profile
	);
	const [isError, setError] = useState(false)

	const mutation = useMutation({ mutationFn: updateImageApi })
	// const Toast = useToast()

	const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
		setError(false)
		try {
			const files = e.target.files;
			const file = files?.[0];


			if (!file) return;
			const formData = new FormData();
			formData.append("image", file)



			const node = document.getElementById("profile-image") as HTMLInputElement
			node.value = ""

			const url = URL.createObjectURL(file)
			setImageUrl(url)

			await mutation.mutateAsync(formData)
			update({
				user: {
					...data,
					imageUrl: `/api/users/image/${data?._id}?time=${Date.now()}`
				}
			})
		}
		catch (err: any) {
			console.error("Error while getting file ", err)
			// const error = err as AxiosError<{ message: string }>
			// const message = error?.response?.data?.message || error?.message
			// Toast.error(message)
			setError(true)
		}

	}

	const handleClick = (e: MouseEvent<HTMLLabelElement>) => {
		if (mutation.isPending) {
			e.preventDefault();
			e.stopPropagation()
		}
	}

	useEffect(() => {
		if (!data?.imageUrl) return;
		const defaultImage = hasError ? `assets/default_avatar.png` : data?.imageUrl
		setImageUrl(defaultImage)
	}, [data?.imageUrl, hasError])

	return (
		<div className={style.profileImage}>
			<LocalImage
				className={`${style.image} ${isError ? style.error : ""}`}
				src={imageUrl ?? ""}
				alt='profile'
				fill
				sizes="(max-width: 50px) 50vw"
				placeholder='blur'
				loading='lazy'
				blurDataURL={DEFAULT_IMAGE}
				onHasError={setHasError}
			/>

			<label htmlFor="profile-image" onClick={handleClick}>
				<input
					id="profile-image"
					type="file"
					accept="image/*"
					hidden
					onChange={handleChange}
				/>
				{mutation.isPending ? <div className={`${style.loader} spinner-border`} role="status">
					<span className="visually-hidden">Loading...</span>
				</div> : <i className='bi bi-camera-fill'></i>}
			</label>
		</div>
	);
};

export default ProfileImageComponent;
