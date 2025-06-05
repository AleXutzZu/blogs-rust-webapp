import {type FormEvent, useState} from "react";

export default function CreatePostPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        //TODO Handle form submission logic here
        console.log({title, body, image});
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4 mt-12 w-2/3"
        >
            <h2 className="text-2xl font-semibold mb-2">Create a Post</h2>

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                    Body
                </label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                    required
                />
            </div>

            <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Upload Image
                </label>
                <input
                    id="image"
                    type="file"
                    accept="image/png"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            <div className="text-right">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Submit
                </button>
            </div>
        </form>
    );
}