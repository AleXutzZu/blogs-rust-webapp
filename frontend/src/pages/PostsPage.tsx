import PostCard, {type Post} from "../components/PostCard.tsx";
import {type LoaderFunctionArgs, useFetcher, useLoaderData} from "react-router";
import {useCallback, useEffect, useState} from "react";
import {LoadingSpinner} from "../components/LoadingSpinner.tsx";

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);

    const page = url.searchParams.get("page") || "1";

    return await fetch(`/api/posts?page=${page}`).then(res => res.json()).then(values => values as Post[]);
}

export default function PostsPage() {
    let initialPosts = useLoaderData<Post[]>();
    const [posts, setPosts] = useState(initialPosts);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [clientHeight, setClientHeight] = useState(0);

    useEffect(() => {
        const scrollListener = () => {
            setClientHeight(window.innerHeight);
            setScrollPosition(window.scrollY);
        };

        if (typeof window !== "undefined") {
            window.addEventListener("scroll", scrollListener);
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("scroll", scrollListener);
            }
        };
    }, []);

    const [height, setHeight] = useState(null);

    const divHeight = useCallback(
        (node: any) => {
            if (node !== null) {
                setHeight(node.getBoundingClientRect().height);
            }
        },
        [posts.length]
    );

    const [shouldFetch, setShouldFetch] = useState(true);
    const fetcher = useFetcher();
    const [page, setPage] = useState(2);

    useEffect(() => {
        if (!shouldFetch || !height) return;
        if (clientHeight + scrollPosition + 100 < height) return;
        if (fetcher.state == "loading") return;
        fetcher.load(`/?index&page=${page}`);


        setShouldFetch(false);
    }, [clientHeight, scrollPosition, fetcher.state]);

    useEffect(() => {
        if (fetcher.data && fetcher.data.length === 0) {
            setShouldFetch(false);
            return;
        }

        if (fetcher.data && fetcher.data.length > 0) {
            setPosts(prevPosts => [...prevPosts, ...fetcher.data]);
            setPage(page => page + 1);
            setShouldFetch(true);
        }
    }, [fetcher.data]);

    const isLoading = fetcher.state === "loading";

    return (
        <div className="flex flex-col items-center mx-auto mt-12 w-full px-2 md:px-0" ref={divHeight}>
            {posts.map(post => <PostCard {...post} key={post.id}/>)}
            {isLoading && <LoadingSpinner/>}
        </div>
    )
}