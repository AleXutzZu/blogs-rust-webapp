import {type ActionFunctionArgs, type LoaderFunctionArgs, useFetcher, useLoaderData} from "react-router";
import type {Post} from "../components/PostCard.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {PostsPaginatorBar} from "../components/Paginator.tsx";

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

export async function action({params, request}: ActionFunctionArgs) {
    const formData = await request.formData();

    const result = await fetch(`/api/users/${params.username}`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    if (result.ok) return {success: true};
}

export default function UserPage() {
    const data = useLoaderData<typeof loader>();
    const [posts, setPosts] = useState<Post[]>(data.user.posts);

    const updatePosts = useCallback((posts: Post[]) => {
        setPosts(posts);
    }, []);

    return (
        <div className="mx-auto w-full md:w-2/3 mt-24 px-4 md:px-0 max-w-4xl">
            <div className="flex items-center flex-col md:flex-row gap-4">
                <EditableProfilePicture username={data.user.username}/>
                <p className="block font-bold text-3xl">{data.user.username}</p>
            </div>
            <hr className="my-4"/>
            <div className="flex flex-col space-y-6 items-center w-full">
                <PostsPaginatorBar totalPosts={data.user.totalPosts} initialPosts={data.user.posts}
                                   username={data.user.username} updateCallback={updatePosts}/>
                {posts.map(post => <UserProfilePost {...post} key={post.id}/>)}
            </div>
        </div>);
}

function UserProfilePost(props: Post) {
    return (
        <div className="w-full rounded-xl shadow-lg px-8 py-6 flex flex-col space-y-2 max-h-80">
            <h1 className="font-bold text-2xl">{props.title}</h1>
            <div className="overflow-hidden">
                <p>{props.body}</p>
            </div>
        </div>
    );
}

function EditableProfilePicture({username}: { username: string }) {
    const [stockPhoto, setStockPhoto] = useState(false);
    const [avatarVersion, setAvatarVersion] = useState(Date.now());
    const fetcher = useFetcher();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            setAvatarVersion(Date.now());
            setStockPhoto(false);
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
                <img src={`/api/users/${username}/avatar?version=${avatarVersion}`} alt="User Profile"
                     onError={() => setStockPhoto(true)}
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