import {useState} from "react";
import {Link} from "react-router";
import {format} from "date-fns";

export interface IPost {
    id: number,
    title: string,
    body: string,
    date: Date,
    username: string,
}

export default function Post(props: IPost) {
    const [expanded, setExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="relative max-w-md lg:max-w-2xl mx-auto my-6 p-4 rounded-2xl shadow-lg bg-white min-w-xs">
            <h2 className="text-2xl font-semibold">{props.title}</h2>
            <p className="text-sm mb-2">by <Link to={`/user/${props.username}`}
                                                 className="italic text-sm">{props.username}</Link> - {format(props.date, "MMM do yyyy")}</p>
            <div
                className={`transition-all duration-500 ${
                    expanded ? "blur-0 h-auto" : "blur-[2px] max-h-60 overflow-hidden"
                }`}
            >
                <p className="text-base mb-4">
                    {props.body}
                </p>
                {!imageError && <img
                    src={`/api/posts${props.id}/image`}
                    alt="Post image"
                    className="rounded-lg w-full mb-4"
                    onError={() => setImageError(true)}
                />}
            </div>

            {!expanded && (
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