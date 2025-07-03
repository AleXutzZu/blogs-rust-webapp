import {useEffect, useState} from "react";
import {useFetcher} from "react-router";
import toast from "react-hot-toast";
import type {UserActionResult} from "../pages/UserPage.tsx";
import ReactModal from "react-modal";
import {FormProvider, useForm} from "react-hook-form";


export default function DeletePostDialog({id}: { id: number }) {
    const [openModal, setOpenModal] = useState(false);
    const handleClick = () => setOpenModal(true);

    const fetcher = useFetcher();
    useEffect(() => {
        const actionData = fetcher.data as UserActionResult | undefined;
        if (!actionData) return;
        if (actionData.type !== "delete-post") return;
        setOpenModal(false);

        if (actionData.success) {
            toast.success("Post successfully deleted", {
                removeDelay: 5000,
                position: "top-right",
            });
        } else {
            toast.error("An error occurred, please try again", {
                removeDelay: 5000,
                position: "top-right",
            })
        }
    }, [fetcher.data]);

    const methods = useForm();

    const onSubmit = async () => {
        const formData = new FormData();
        formData.append("type", "delete-post");
        formData.append("id", id.toString());
        await fetcher.submit(formData, {
            method: "delete",
            encType: "multipart/form-data",
        });
    }

    return (
        <>
            <div className="flex items-center cursor-pointer" onClick={handleClick}>
                <input type="text" className="hidden" readOnly name="type" value="delete-post"/>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                     stroke="currentColor" className="size-5 stroke-red-400">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                </svg>
                <button type="submit" className="text-red-400 font-medium cursor-pointer hidden md:block">Delete
                </button>
            </div>
            <ReactModal isOpen={openModal} onRequestClose={() => setOpenModal(false)}
                        className="posts-delete-modal-content">
                <FormProvider {...methods}>
                    <form className="size-full bg-white shadow-md p-6 rounded-xl flex flex-col"
                          onSubmit={methods.handleSubmit(onSubmit)}>
                        <h1 className="font-bold text-2xl">Delete post? </h1>
                        <p className="font-medium text-red-400 text-md">This action cannot be undone.</p>
                        <div className="flex gap-4 justify-end mt-6">
                            <button
                                type="submit"
                                className="text-base font-semibold text-white bg-red-500 px-5 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="text-base font-semibold text-gray-700 bg-gray-200 px-5 py-2 rounded-lg shadow hover:bg-gray-300 transition duration-200"
                                onClick={() => setOpenModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </FormProvider>

            </ReactModal>
        </>
    )
}