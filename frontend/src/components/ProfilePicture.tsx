import {useEffect, useRef, useState} from "react";
import {useAuthContext} from "../auth.ts";
import {Form, useActionData} from "react-router";
import type {UserActionResult} from "../pages/UserPage.tsx";
import toast from "react-hot-toast";

export function ViewerProfilePicture(props: { username: string }) {
    const [stockPhoto, setStockPhoto] = useState(false);

    return (
        <div
            className="size-48 rounded-full border-2 border-gray-700">
            {!stockPhoto &&
                <img src={`/api/users/${props.username}/avatar`} alt="User Profile"
                     onError={() => setStockPhoto(true)}
                     className="rounded-full"/>}
            {stockPhoto && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-full stroke-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
            </svg>}

        </div>
    )
}

export function EditableProfilePicture() {
    const authMethods = useAuthContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const actionData = useActionData() as UserActionResult | undefined;

    const stockPhoto = authMethods.isStockPhoto();
    const avatarLink = authMethods.getProfilePictureLink();

    useEffect(() => {
        if (actionData?.type != "avatar") return;

        if (actionData.success) {
            authMethods.updateProfilePictureLink();
            toast.success("Profile picture has been updated successfully", {removeDelay: 5000, position: "top-right"});
        } else {
            toast.error("An error occurred: " + actionData.error);
        }
    }, [actionData]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = () => {
        fileInputRef.current?.form?.requestSubmit();
    }

    return (
        <Form method="post" encType="multipart/form-data"
              className="size-48 rounded-full border-2 border-gray-700 hover:cursor-pointer relative group"
              onClick={handleClick}>

            {!stockPhoto &&
                <img src={avatarLink ?? undefined} alt="User Profile"
                     onError={() => authMethods.setStockPhoto(true)}
                     className="rounded-full"/>}
            {stockPhoto && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-full stroke-gray-700 transition-all ease-in duration-150 hover:brightness-75">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
            </svg>}
            <input className="hidden" name="type" value="avatar" readOnly/>
            <input className="hidden" type="file" accept="image/png" ref={fileInputRef} onChange={handleChange}
                   name="avatar"/>
            <div
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300"/>
            <span
                className="absolute inset-0 flex items-center justify-center
                 text-white opacity-0 group-hover:opacity-100 transition duration-300 font-bold text-lg">Change</span>
        </Form>
    );
}