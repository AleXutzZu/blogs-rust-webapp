import {type ActionFunctionArgs, type LoaderFunctionArgs, useFetcher, useLoaderData} from "react-router";
import type {Post} from "../components/PostCard.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {PostsPaginatorBar} from "../components/Paginator.tsx";
import {useAuthContext} from "../auth.ts";
import {EditableProfilePicture, ViewerProfilePicture} from "../components/ProfilePicture.tsx";
import {format} from "date-fns";
import PostLoadingSkeleton from "../components/PostLoadingSkeleton.tsx";
import {CreatePostDialog} from "../components/CreatePostDialog.tsx";

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
    if (request.method === "delete" && type === "delete-post") {
        //TODO
        return {success: true, type: "delete-post"};
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
    const [isLoading, setLoading] = useState(false);

    const updatePosts = useCallback((posts: Post[]) => {
        setPosts(posts);
    }, []);

    const updateLoading = useCallback((loading: boolean) => {
        setLoading(loading);
    }, []);

    const user = authMethods.getLoggedUser();

    return (
        <div className="mx-auto w-full md:w-2/3 mt-24 px-4 md:px-0 max-w-4xl">
            <div className="flex items-center flex-col md:flex-row gap-4">
                {user && user.username == data.user.username && <EditableProfilePicture/>}
                {(!user || (user.username !== data.user.username)) && <ViewerProfilePicture username={data.user.username}/>}
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
                {user && user.username == data.user.username && <CreatePostDialog/>}
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
    const fetcher = useFetcher();

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

                {currentUser && <fetcher.Form className="flex items-center cursor-pointer" method="delete">
                    <input className="hidden" readOnly name="type" value="delete-post"/>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="size-5 stroke-red-400">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                    </svg>
                    <button type="submit" className="text-red-400 font-medium cursor-pointer hidden md:block">Delete</button>
                </fetcher.Form>}

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

