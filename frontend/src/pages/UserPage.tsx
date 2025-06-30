import {type LoaderFunctionArgs, useFetcher, useLoaderData, useSearchParams} from "react-router";
import type {Post} from "../components/PostCard.tsx";
import {useCallback, useEffect, useState} from "react";

const POSTS_PER_PAGE = 7;

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
            <div className="flex flex-col md:flex-row md:space-x-3">
                <div className="flex flex-col space-y-6 items-center">
                    <PostsPaginatorBar totalPosts={data.user.totalPosts} initialPosts={data.user.posts}
                                       username={data.user.username} updateCallback={updatePosts}/>
                    {posts.map(post => <UserProfilePost {...post} key={post.id}/>)}
                </div>
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

interface PaginatorProps {
    totalPosts: number,
    initialPosts: Post[],
    username: string,
    updateCallback: (posts: Post[]) => void;
}

function PaginatorPageButton({page, active, updatePage}: {
    page: number,
    active: boolean,
    updatePage: (index: number) => void
}) {

    const activeClasses = "relative z-10 inline-flex items-center bg-blue-600 px-4 " +
        "py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 " +
        "focus-visible:outline-blue-600";
    const inactiveClasses = "relative inline-flex items-center px-4 py-2 " +
        "text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 " +
        "focus:z-20 focus:outline-offset-0"

    return (
        <button onClick={() => updatePage(page)}
                className={active ? activeClasses : inactiveClasses}
        >{page}</button>
    );
}

function PaginatorSpan() {
    return (
        <span
            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold
             text-gray-700 ring-1 ring-gray-300 ring-inset focus:outline-offset-0">
              ...
        </span>
    )
}

function PostsPaginatorBar(props: PaginatorProps) {
    const totalPages = (Math.floor(props.totalPosts / 7) + (props.totalPosts % 7 == 0 ? 0 : 1));
    const pageButtons = [];
    const [searchParams, setSearchParams] = useSearchParams();

    const fetcher = useFetcher();

    const currentPage = Number(searchParams.get("page") || 1);

    useEffect(() => {
        if (currentPage === 1) {
            props.updateCallback(props.initialPosts);
        } else {
            fetcher.load(`/users/${props.username}?page=${currentPage}`);
        }
    }, [currentPage]);

    useEffect(() => {
        if (fetcher.data) props.updateCallback(fetcher.data.user.posts);
    }, [fetcher.data]);

    const isLoading = fetcher.state !== "idle";

    console.log(isLoading);

    const start = (currentPage - 1) * POSTS_PER_PAGE + 1;
    const end = Math.min(start + POSTS_PER_PAGE - 1, props.totalPosts);

    const disableNext = currentPage == totalPages;
    const disablePrev = currentPage == 1;

    const handleNext = () => {
        if (!disableNext) setSearchParams({page: String(currentPage + 1)});
    };
    const handlePrev = () => {
        if (!disablePrev) setSearchParams({page: String(currentPage - 1)});
    };

    const handleButtonClick = (index: number) => {
        setSearchParams({page: String(index)});
    };

    //Preparing buttons
    if (totalPages <= 9) {
        for (let i = 1; i <= totalPages; ++i) {
            pageButtons.push(<PaginatorPageButton page={i} active={i == currentPage} updatePage={handleButtonClick}/>);
        }
    } else {
        //Put first 3 and last 3
        let foundPage = false;
        for (let i = 1; i <= 3; ++i) {
            pageButtons.push(<PaginatorPageButton page={i} active={i == currentPage} updatePage={handleButtonClick}/>);
            if (i == currentPage) foundPage = true;
        }

        for (let i = totalPages - 2; i <= totalPages; ++i) {
            pageButtons.push(<PaginatorPageButton page={i} active={i == currentPage} updatePage={handleButtonClick}/>);
            if (i == currentPage) foundPage = true;
        }
        //Means we can put a single ...
        if (foundPage) {
            pageButtons.splice(3, 0, <PaginatorSpan/>);
        } else {
            //This page must be inserted between the first and last 3
            pageButtons.splice(3, 0, <PaginatorPageButton page={currentPage} active updatePage={handleButtonClick}/>);

            //Now we need to check how many we have on the left and right so we have an idea if we need to insert a span
            if (currentPage - 3 > 2) pageButtons.splice(3, 0, <PaginatorSpan/>);
            else {
                if (currentPage - 3 == 2) pageButtons.splice(3, 0, <PaginatorPageButton
                    page={currentPage - 1} active={false} updatePage={handleButtonClick}/>);
            }

            //Same story but on the other side
            if (totalPages - 2 - currentPage > 2) pageButtons.splice(-3, 0, <PaginatorSpan/>);
            else {
                if (totalPages - 2 - currentPage == 2) pageButtons.splice(-3, 0, <PaginatorPageButton
                    page={currentPage + 1} active={false} updatePage={handleButtonClick}/>);
            }
        }
    }


    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 w-full">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={handlePrev} disabled={disablePrev}>Previous
                </button>
                <button
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={handleNext} disabled={disableNext}>Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{start}</span> to <span
                        className="font-medium">{end}</span> of <span
                        className="font-medium">{props.totalPosts}</span> posts
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs"
                                  aria-label="Pagination">
                        <button
                            className="cursor-pointer relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1
                            ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            onClick={handlePrev} disabled={disablePrev}>
                            <span className="sr-only">Previous</span>
                            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                 data-slot="icon">
                                <path fill-rule="evenodd"
                                      d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                                      clip-rule="evenodd"/>
                            </svg>
                        </button>
                        {pageButtons}
                        <button
                            className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2
                           text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            onClick={handleNext} disabled={disableNext}>
                            <span className="sr-only">Next</span>
                            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                 data-slot="icon">
                                <path fill-rule="evenodd"
                                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                                      clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>

    );
}

function EditableProfilePicture({username}: { username: string }) {
    const [stockPhoto, setStockPhoto] = useState(false);


    return (
        <div
            className="size-48 rounded-full border-2 p-4 hover:cursor-pointer relative group">

            {!stockPhoto &&
                <img src={`/users/${username}/avatar`} alt="User Profile" onError={() => setStockPhoto(true)}
                     className="rounded-full"/>}
            {stockPhoto && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-full stroke-gray-700 transition-all ease-in duration-150 hover:brightness-75">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
            </svg>}

            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300"/>
            <span
                className="absolute inset-0 flex items-center justify-center
                 text-white opacity-0 group-hover:opacity-100 transition duration-300 font-bold text-lg">Change</span>
        </div>
    );
}