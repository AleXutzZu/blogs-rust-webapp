import {type HTMLInputTypeAttribute} from "react";
import * as Yup from "yup";
import {FormProvider, useForm, useFormContext} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import type {ObjectSchema} from "yup";
import {type ActionFunctionArgs, useSubmit} from "react-router";

type PostForm = {
    title: string,
    body: string,
    image?: FileList
}

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (!result.ok) {
        return {error: "TODO: Comprehensive error here."}
    }
}

export default function CreatePostPage() {
    const submit = useSubmit();

    const validationSchema = Yup.object({
        title: Yup.string().required("Title is required"),
        body: Yup.string().required("Body is required"),
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
        if (file) formData.append("image", file);

        await submit(formData, {
            method: "post",
            encType: "multipart/form-data"
        });
    };

    return (
        <FormProvider {...methods}>

            <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4 mt-12 w-2/3 my-auto"
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
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Create post
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}

function PostInput(props: {
    name: keyof PostForm,
    type: HTMLInputTypeAttribute,
    className?: string,
    accept?: string,
    label: string
}) {
    const {register} = useFormContext<PostForm>();

    return (
        <>
            <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">
                {props.label}
            </label>
            <input
                {...register(props.name)} type={props.type}
                className={props.className}
                accept={props.accept}
            />
        </>
    );
}

function PostTextArea(props: { name: keyof PostForm, label: string }) {
    const {register} = useFormContext<PostForm>();

    return (
        <>
            <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">
                {props.label}
            </label>
            <textarea
                {...register(props.name)}
                rows={5}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
            />
        </>
    );
}