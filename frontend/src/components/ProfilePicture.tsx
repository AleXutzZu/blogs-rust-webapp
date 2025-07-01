import {useEffect, useRef, useState} from "react";
import {useAuthContext} from "../auth.ts";
import {useFetcher} from "react-router";

export function ViewerProfilePicture(props: { username: string }) {
    const [stockPhoto, setStockPhoto] = useState(false);

    return (
        <div
            className="size-48 rounded-full border-2 p-2">
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
    const fetcher = useFetcher();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stockPhoto = authMethods.isStockPhoto();
    const avatarLink = authMethods.getProfilePictureLink();

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            authMethods.updateProfilePictureLink();
        }
    }, [fetcher.state, fetcher.data]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = () => {
        fileInputRef.current?.form?.requestSubmit();
    }

    return (
        <fetcher.Form method="post" encType="multipart/form-data"
                      className="size-48 rounded-full border-2 p-2 hover:cursor-pointer relative group"
                      onClick={handleClick}>

            {!stockPhoto &&
                <img src={avatarLink} alt="User Profile"
                     onError={() => authMethods.setStockPhoto(true)}
                     className="rounded-full"/>}
            {stockPhoto && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-full stroke-gray-700 transition-all ease-in duration-150 hover:brightness-75">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
            </svg>}

            <input className="hidden" type="file" accept="image/png" ref={fileInputRef} onChange={handleChange}
                   name="avatar"/>
            <div
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300"/>
            <span
                className="absolute inset-0 flex items-center justify-center
                 text-white opacity-0 group-hover:opacity-100 transition duration-300 font-bold text-lg">Change</span>
        </fetcher.Form>
    );
}