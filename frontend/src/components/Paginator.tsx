import type {Post} from "./PostCard.tsx";
import {useFetcher, useSearchParams} from "react-router";
import {useEffect} from "react";

const POSTS_PER_PAGE = 7;

interface PaginatorProps {
    totalPosts: number,
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

export function PostsPaginatorBar(props: PaginatorProps) {
    const totalPages = (Math.floor(props.totalPosts / POSTS_PER_PAGE) + (props.totalPosts % POSTS_PER_PAGE == 0 ? 0 : 1));
    const pageButtons = [];
    const [searchParams, setSearchParams] = useSearchParams();

    const fetcher = useFetcher();

    const currentPage = Math.min(Number(searchParams.get("page") || 1), totalPages);

    useEffect(() => {
        fetcher.load(`/users/${props.username}?page=${currentPage}`);
    }, [currentPage]);

    useEffect(() => {
        if (fetcher.data) props.updateCallback(fetcher.data.user.posts);
    }, [fetcher.data]);

    const isLoading = fetcher.state !== "idle";

    console.log(isLoading);

    const start = Math.min((currentPage - 1) * POSTS_PER_PAGE + 1, props.totalPosts);
    const end = Math.min(start + POSTS_PER_PAGE - 1, props.totalPosts);

    const disableNext = currentPage >= totalPages;
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
            pageButtons.push(<PaginatorPageButton page={i} active={i == currentPage} updatePage={handleButtonClick}
                                                  key={i}/>);
        }
    } else {
        //Put first 3 and last 3
        let foundPage = false;
        for (let i = 1; i <= 3; ++i) {
            pageButtons.push(<PaginatorPageButton page={i} active={i == currentPage} updatePage={handleButtonClick}
                                                  key={i}/>);
            if (i == currentPage) foundPage = true;
        }

        for (let i = totalPages - 2; i <= totalPages; ++i) {
            pageButtons.push(<PaginatorPageButton page={i} active={i == currentPage} updatePage={handleButtonClick}
                                                  key={i}/>);
            if (i == currentPage) foundPage = true;
        }
        //Means we can put a single ...
        if (foundPage) {
            pageButtons.splice(3, 0, <PaginatorSpan key={totalPages + 1}/>);
        } else {
            //This page must be inserted between the first and last 3
            pageButtons.splice(3, 0, <PaginatorPageButton page={currentPage} active updatePage={handleButtonClick}
                                                          key={totalPages + 2}/>);

            //Now we need to check how many we have on the left and right so we have an idea if we need to insert a span
            if (currentPage - 3 > 2) pageButtons.splice(3, 0, <PaginatorSpan key={totalPages + 3}/>);
            else {
                if (currentPage - 3 == 2) pageButtons.splice(3, 0, <PaginatorPageButton
                    page={currentPage - 1} active={false} updatePage={handleButtonClick} key={totalPages + 4}/>);
            }

            //Same story but on the other side
            if (totalPages - 2 - currentPage > 2) pageButtons.splice(-3, 0, <PaginatorSpan key={totalPages + 5}/>);
            else {
                if (totalPages - 2 - currentPage == 2) pageButtons.splice(-3, 0, <PaginatorPageButton
                    page={currentPage + 1} active={false} updatePage={handleButtonClick} key={totalPages + 6}/>);
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
                            ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed"
                            onClick={handlePrev} disabled={disablePrev}>
                            <span className="sr-only">Previous</span>
                            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                 data-slot="icon">
                                <path fillRule="evenodd"
                                      d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                                      clipRule="evenodd"/>
                            </svg>
                        </button>
                        {pageButtons}
                        <button
                            className="cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2
                           text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed"
                            onClick={handleNext} disabled={disableNext}>
                            <span className="sr-only">Next</span>
                            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                 data-slot="icon">
                                <path fillRule="evenodd"
                                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                                      clipRule="evenodd"/>
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>

    );
}