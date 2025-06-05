import Post, {type IPost} from "../components/Post.tsx";
import {useLoaderData} from "react-router";

export async function loader() {
    return await fetch("api/posts").then(res => res.json()).then(values => values as IPost[]);
}

export default function PostsPage() {
    let posts = useLoaderData<IPost[]>();

    return (
        <div className="flex flex-col items-center mx-auto mt-12">
            {posts.map(post => <Post {...post}/>)}
        </div>
    )
}