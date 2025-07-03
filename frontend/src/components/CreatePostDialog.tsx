import {type HTMLInputTypeAttribute, useEffect, useState} from "react";
import {FormProvider, useForm, useFormContext} from "react-hook-form";
import {useActionData, useNavigation, useSubmit} from "react-router";
import type {ObjectSchema} from "yup";
import * as Yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import ReactModal from "react-modal";
import type {UserActionResult} from "../pages/UserPage.tsx";

type PostForm = {
    title: string,
    body: string,
    image?: FileList
}

export function CreatePostDialog() {
    const [openModal, setOpenModal] = useState(false);
    const handleClick = () => setOpenModal(true);
    const submit = useSubmit();

    const navigation = useNavigation();
    const actionData = useActionData() as UserActionResult | undefined;

    const validationSchema = Yup.object({
        title: Yup.string().required("A title is required"),
        body: Yup.string().required("A body is required"),
        image: Yup.mixed<FileList>().optional()
            .test("fileSize", "Image is too large", value => {
                if (!value?.[0]) return true;
                return value[0].size < 5 * 1024 * 1024;
            })
            .test("fileType", "Unsupported file type", value => {
                if (!value?.[0]) return true;
                return value[0].type == "image/png";
            })
    }) as ObjectSchema<PostForm>;

    const methods = useForm<PostForm>({
        resolver: yupResolver(validationSchema),
        mode: "onBlur"
    });

    const onSubmit = async (data: PostForm) => {
        const file = data.image?.[0];

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("body", data.body);
        formData.append("type", "post");
        if (file) formData.append("image", file);

        await submit(formData, {
            method: "post",
            encType: "multipart/form-data",
        });
    };

    useEffect(() => {
        if (actionData?.type !== "post") return;

        setOpenModal(false);
        methods.reset();
        if (actionData.success) {
            toast.success("Post published", {removeDelay: 5000, position: "top-right"});
        } else {
            toast.error("An error occurred", {removeDelay: 5000, position: "top-right"});
        }
    }, [actionData]);

    const disableSubmitting = navigation.state === "submitting";

    return (
        <>
            <div
                className="w-full px-16 py-4 rounded-2xl shadow-lg flex items-center space-x-0.5 cursor-pointer bg-white"
                onClick={handleClick}>
                <p className="font-semibold text-gray-600 italic">Start a new post...</p>
            </div>
            <ReactModal isOpen={openModal} shouldCloseOnEsc={true} onRequestClose={() => setOpenModal(false)}
                        className="posts-modal-content">
                <FormProvider {...methods}>

                    <form
                        onSubmit={methods.handleSubmit(onSubmit)}
                        className="p-6 bg-white rounded-2xl shadow-md space-y-4"
                    >
                        <h2 className="text-2xl font-semibold mb-2">Create a Post</h2>

                        <div>
                            <PostInput name={"title"} type={"text"} label="Title"
                                       className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>

                        <div>
                            <PostTextArea name={"body"} label="Body"/>
                        </div>

                        <div>
                            <PostInput name={"image"} type={"file"} accept={"image/png"} label="Upload image"
                                       className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2
                           file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>

                        </div>

                        <div className="text-right">
                            <button disabled={disableSubmitting}
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:not-disabled:bg-blue-700 transition disabled:bg-blue-400"
                            >
                                {disableSubmitting ? "Publishing..." : "Publish"}
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </ReactModal>
        </>

    )
}

function PostInput(props: {
    name: keyof PostForm,
    type: HTMLInputTypeAttribute,
    className?: string,
    accept?: string,
    label: string
}) {
    const {register, formState: {errors}} = useFormContext<PostForm>();

    return (
        <>
            {errors[props.name]?.message &&
                <label htmlFor={props.name}
                       className="block text-sm font-medium text-red-400">{errors[props.name]?.message}
                </label>}
            {!errors[props.name]?.message &&
                <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">
                    {props.label}
                </label>}
            <input
                {...register(props.name)} type={props.type}
                className={props.className}
                accept={props.accept}
            />
        </>
    );
}

function PostTextArea(props: { name: keyof PostForm, label: string }) {
    const {register, formState: {errors}} = useFormContext<PostForm>();

    return (
        <>
            {errors[props.name]?.message &&
                <label htmlFor={props.name}
                       className="block text-sm font-medium text-red-400">{errors[props.name]?.message}
                </label>}
            {!errors[props.name]?.message &&
                <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">
                    {props.label}
                </label>}
                <textarea
                    {...register(props.name)}
                    rows={5}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                />
        </>
    );
}