import {Link} from "react-router";

export default function GlobalErrorPage() {


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-red-500 mb-4">
                    <svg
                        className="mx-auto h-16 w-16"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.676 1.732-3L13.732 4c-.77-1.324-2.694-1.324-3.464 0L3.35 17c-.77 1.324.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                <p className="text-gray-600 mb-6">
                    An unexpected error occurred. Please try again later or contact support if the problem
                    persists.
                </p>
                <Link
                    to="/"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Go Back
                </Link>
            </div>
        </div>
    );
}
