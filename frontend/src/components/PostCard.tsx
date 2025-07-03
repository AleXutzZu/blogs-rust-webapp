import {useEffect, useRef, useState} from "react";
import {Link} from "react-router";
import {format} from "date-fns";

export interface Post {
    id: number,
    title: string,
    body: string,
    date: Date,
    username: string,
}

export default function PostCard(props: Post) {
    const [expanded, setExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isClipped, setClipped] = useState(false);

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const clipped = element.scrollHeight > element.clientHeight;
            setClipped(clipped);
        }
    }, [props.body, imageError]);

    return (
        <div className="relative w-full max-w-2xl mx-auto my-6 p-4 rounded-2xl shadow-lg bg-white">
            <h2 className="text-2xl font-semibold truncate">{props.title}</h2>
            <p className="text-sm mb-2">by <Link to={`/users/${props.username}`}
                                                 className="italic text-sm">{props.username}</Link> - {format(props.date, "MMM do yyyy p")}
            </p>
            <div ref={contentRef}
                 className={`transition-all duration-500 ${
                     expanded ? "h-auto" : "max-h-60 overflow-hidden"
                 }`}
            >
                <p className="text-base mb-4 whitespace-pre-line break-words">
                    {props.body}
                </p>
                {!imageError && <img
                    src={`/api/posts/${props.id}/image`}
                    alt="PostCard image"
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