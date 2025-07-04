import {type ActionFunctionArgs, type LoaderFunctionArgs, useLoaderData} from "react-router";
import type {Post} from "../components/PostCard.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {PostsPaginatorBar} from "../components/Paginator.tsx";
import {useAuthContext} from "../auth.ts";
import {EditableProfilePicture, ViewerProfilePicture} from "../components/ProfilePicture.tsx";
import {format} from "date-fns";
import PostLoadingSkeleton from "../components/PostLoadingSkeleton.tsx";
import {CreatePostDialog} from "../components/CreatePostDialog.tsx";
import DeletePostDialog from "../components/DeletePostDialog.tsx";

interface UserDTO {
    username: string,
    joined: Date,
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
    type: "post" | "avatar" | "delete-post"
}

export async function action({params, request}: ActionFunctionArgs): Promise<UserActionResult> {
    const formData = await request.formData();

    const type = formData.get("type") as UserActionResult["type"];
    if (request.method === "DELETE" && type === "delete-post") {
        const id = formData.get("id") as string;

        const result = await fetch(`/api/posts/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (result.ok) return {success: true, type: "delete-post"};
        return {success: false, type: "delete-post"};
    }

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
    if (type === "avatar") {

        const result = await fetch(`/api/users/${params.username}`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        if (result.ok) return {success: true, type: "avatar"};
        return {success: false, error: "TODO", type: "avatar"};
    }
    throw new Error("Invalid request");
}

export default function UserPage() {
    const data = useLoaderData<typeof loader>();
    const authMethods = useAuthContext();
    const [posts, setPosts] = useState<Post[]>(data.user.posts);
    const [isLoading, setLoading] = useState(false);

    const updatePosts = useCallback((posts: Post[]) => {
        setPosts(posts);
    }, []);

    const updateLoading = useCallback((loading: boolean) => {
        setLoading(loading);
    }, []);

    const user = authMethods.getLoggedUser();

    const isCurrentUser = user?.username === data.user.username;

    return (
        <div className="mx-auto w-full md:w-2/3 mt-24 px-4 md:px-0 max-w-4xl">
            <div className="flex items-center flex-col md:flex-row gap-4">
                {isCurrentUser && <EditableProfilePicture/>}
                {!isCurrentUser &&
                    <ViewerProfilePicture username={data.user.username}/>}
                <div className="flex flex-col items-center md:items-start">
                    <p className="block font-bold text-5xl">{data.user.username}</p>
                    <p className="italic text-gray-400 text-lg">est. {format(data.user.joined, "MMM do yyyy")}</p>
                </div>
            </div>
            <hr className="my-4"/>
            <div className="flex flex-col space-y-6 items-center w-full">
                <PostsPaginatorBar totalPosts={data.user.totalPosts}
                                   username={data.user.username} updateCallback={updatePosts}
                                   updateLoading={updateLoading}/>
                {isCurrentUser && <CreatePostDialog/>}
                {!isLoading && posts.map(post => <UserProfilePost post={post} key={post.id}
                                                                  username={data.user.username}/>)}
                {isLoading && <PostLoadingSkeleton/>}
            </div>
        </div>);
}

interface ProfilePost {
    post: Post,
    username: string,
}

function UserProfilePost(props: ProfilePost) {
    const [expanded, setExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isClipped, setClipped] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const authMethods = useAuthContext();

    const currentUser = authMethods.getLoggedUser()?.username === props.username;

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const clipped = element.scrollHeight > element.clientHeight;
            setClipped(clipped);
        }
    }, [props.post.body, imageError]);

    return (
        <div className="relative w-full mx-auto my-6 p-4 rounded-2xl shadow-lg bg-white min-w-xs">
            <div className="w-full flex items-center justify-between">
                <h2 className="text-2xl font-semibold overflow-hidden truncate">{props.post.title}</h2>
                {currentUser && <DeletePostDialog id={props.post.id}/>}
            </div>
            <p className="text-sm mb-2">{format(props.post.date, "MMM do yyyy p")}</p>
            <div ref={contentRef}
                 className={`transition-all duration-500 ${
                     expanded ? "h-auto" : "max-h-60 overflow-hidden"
                 }`}
            >
                <p className="text-base mb-4 whitespace-pre-line break-words">
                    {props.post.body}
                </p>
                {!imageError && <img
                    src={`/api/posts/${props.post.id}/image`}
                    alt="Post image"
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

