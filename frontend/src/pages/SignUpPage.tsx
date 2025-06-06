import {type FormEvent, useState} from "react";
import {Link} from "react-router";

export default function SignUpPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log({username, password});
        // Perform signup logic here
    };

    return (
        <div className="m-auto min-h-screen flex items-center justify-center bg-gray-50 min-w-xs">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-md space-y-5"
            >
                <h2 className="text-2xl font-semibold text-center">Sign Up</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="email"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    Sign Up
                </button>

                <p className="text-sm text-center text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}
