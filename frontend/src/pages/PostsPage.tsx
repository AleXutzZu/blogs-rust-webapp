import PostCard, {type Post} from "../components/PostCard.tsx";
import {useLoaderData} from "react-router";

export async function loader() {
    return await fetch("/api/posts").then(res => res.json()).then(values => values as Post[]);
}

export default function PostsPage() {
    let posts = useLoaderData<Post[]>();

    return (
        <div className="flex flex-col items-center mx-auto mt-12 w-full px-2 md:px-0">
            {posts.map(post => <PostCard {...post} key={post.id}/>)}
        </div>
    )
}