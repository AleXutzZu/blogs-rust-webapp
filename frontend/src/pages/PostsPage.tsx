import Post, {type IPost} from "../components/Post.tsx";
import {useEffect, useState} from "react";

export default function PostsPage() {
    const [posts, setPosts] = useState<IPost[]>([]);
    useEffect(() => {
        fetch("/api/posts").then(result => result.json()).then(values => setPosts(values as IPost[]));
    }, []);

    return (
        <div className="flex flex-col items-center pt-12">
            {posts.map(post => <Post {...post}/>)}
        </div>
    )
}