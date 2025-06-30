import Post, {type Post} from "../components/Post.tsx";
import {useLoaderData} from "react-router";

export async function loader() {
    return await fetch("api/posts").then(res => res.json()).then(values => values as Post[]);
}

export default function PostsPage() {
    let posts = useLoaderData<Post[]>();

    return (
        <div className="flex flex-col items-center mx-auto mt-12 w-5/6 md:w-2/3">
            {posts.map(post => <Post {...post} key={post.id}/>)}
        </div>
    )
}