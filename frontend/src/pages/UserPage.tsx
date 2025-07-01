import {type ActionFunctionArgs, type LoaderFunctionArgs, useActionData, useLoaderData, useSubmit} from "react-router";
import type {Post} from "../components/PostCard.tsx";
import {type HTMLInputTypeAttribute, useCallback, useEffect, useRef, useState} from "react";
import {PostsPaginatorBar} from "../components/Paginator.tsx";
import {useAuthContext} from "../auth.ts";
import ReactModal from "react-modal";
import type {ObjectSchema} from "yup";
import * as Yup from "yup";
import {FormProvider, useForm, useFormContext} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {EditableProfilePicture, ViewerProfilePicture} from "../components/ProfilePicture.tsx";
import toast from "react-hot-toast";
import {format} from "date-fns";

interface UserDTO {
    username: string,
    posts: Post[],
    totalPosts: number,
}

export async function loader({params, request}: LoaderFunctionArgs) {
    const url = new URL(request.url);
    let page = parseInt(url.searchParams.get("page") ?? "1", 10);

    if (isNaN(page)) page = 1;
    const response = await fetch(`/api/users/${params.username}?page=${page}`);
    if (!response.ok) throw new Response("", {status: 404, statusText: "User not found"});

    const user = await response.json() as UserDTO;

    return {user, page};
}

export type UserActionResult = {
    success: boolean,
    error?: string,
    type: "post" | "avatar"
}

export async function action({params, request}: ActionFunctionArgs): Promise<UserActionResult> {
    const formData = await request.formData();

    const type = formData.get("type") as string;

    if (type === "post") {
        const result = await fetch("/api/posts/create", {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (!result.ok) {
            return {success: false, error: "TODO: Comprehensive error here.", type: "post"}
        }

        return {success: true, type: "post"};
    }

    const result = await fetch(`/api/users/${params.username}`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (result.ok) return {success: true, type: "avatar"};
    return {success: false, error: "TODO", type: "avatar"};
}

export default function UserPage() {
    const data = useLoaderData<typeof loader>();
    const authMethods = useAuthContext();
    const [posts, setPosts] = useState<Post[]>(data.user.posts);

    const updatePosts = useCallback((posts: Post[]) => {
        setPosts(posts);
    }, []);

    const user = authMethods.getLoggedUser();

    return (
        <div className="mx-auto w-full md:w-2/3 mt-24 px-4 md:px-0 max-w-4xl">
            <div className="flex items-center flex-col md:flex-row gap-4">
                {user && user.username == data.user.username && <EditableProfilePicture/>}
                {!user || user.username !== data.user.username && <ViewerProfilePicture username={data.user.username}/>}
                <p className="block font-bold text-3xl">{data.user.username}</p>
            </div>
            <hr className="my-4"/>
            <div className="flex flex-col space-y-6 items-center w-full">
                <PostsPaginatorBar totalPosts={data.user.totalPosts}
                                   username={data.user.username} updateCallback={updatePosts}/>
                {user && user.username == data.user.username && <CreatePostDialogOpener/>}
                {posts.map(post => <UserProfilePost {...post} key={post.id}/>)}
            </div>
        </div>);
}

function UserProfilePost(props: Post) {
    const [expanded, setExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isClipped, setClipped] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const clipped = element.scrollHeight > element.clientHeight;
            setClipped(clipped);
        }
    }, [props.body, imageError]);

    return (
        <div className="relative w-full mx-auto my-6 p-4 rounded-2xl shadow-lg bg-white min-w-xs">
            <h2 className="text-2xl font-semibold">{props.title}</h2>
            <p className="text-sm mb-2">{format(props.date, "MMM do yyyy p")}</p>
            <div ref={contentRef}
                className={`transition-all duration-500 ${
                    expanded ? "h-auto" : "max-h-60 overflow-hidden"
                }`}
            >
                <p className="text-base mb-4 whitespace-pre-line">
                    {props.body}
                </p>
                {!imageError && <img
                    src={`/api/posts/${props.id}/image`}
                    alt="PostCard image"
                    className="rounded-lg w-full mb-4"
                    onError={() => setImageError(true)}
                />}
            </div>

            {!expanded && isClipped && (
                <div className="text-center mt-2">
                    <button
                        onClick={() => setExpanded(true)}
                        className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 transition"
                    >
                        Read more...
                    </button>
                </div>
            )}
        </div>
    );
}

type PostForm = {
    title: string,
    body: string,
    image?: FileList
}

function CreatePostDialogOpener() {
    const [openModal, setOpenModal] = useState(false);
    const handleClick = () => setOpenModal(true);
    const submit = useSubmit();

    const actionData = useActionData() as UserActionResult | undefined;

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
        formData.append("type", "post");
        if (file) formData.append("image", file);

        await submit(formData, {
            method: "post",
            encType: "multipart/form-data",
        });
    };

    useEffect(() => {
        if (actionData?.success && actionData?.type == "post") {
            setOpenModal(false);
            toast.success("Post published", {removeDelay: 5000, position: "top-right"});
            methods.reset();
        }
    }, [actionData]);

    return (
        <>
            <div className="w-full px-16 py-4 rounded-2xl shadow-lg flex items-center space-x-0.5 cursor-pointer"
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
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Publish
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