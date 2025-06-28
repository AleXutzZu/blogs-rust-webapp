import {Link, NavLink, useFetcher, useRouteLoaderData} from "react-router";
import type {AuthUser} from "../auth.ts";
import {useState} from "react";

export default function NavigationBar() {
    const {user} = useRouteLoaderData("root") as { user: AuthUser | null };
    const fetcher = useFetcher();
    const [stockPhoto, setStockPhoto] = useState(false);

    return (
        <nav className="bg-blue-600 text-white shadow-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <NavLink
                    to="/"
                    className={({isActive}) =>
                        `text-white hover:text-blue-100 font-medium ${isActive ? 'underline' : ''}`
                    }
                >
                    All Posts
                </NavLink>

                <NavLink
                    to="/create"
                    className={({isActive}) =>
                        `text-white hover:text-blue-100 font-medium ${isActive ? 'underline' : ''}`
                    }
                >
                    Create Post
                </NavLink>
            </div>
            {!user && (
                <NavLink
                    to="/login"
                    className={({isActive}) =>
                        `text-white hover:text-blue-100 font-medium ${isActive ? 'underline' : ''}`
                    }
                >
                    Login
                </NavLink>
            )}
            {user && (
                <fetcher.Form className="flex items-center gap-4 bg-blue-500 px-3 py-2 rounded-xl shadow-md"
                              method="post" action="/logout">

                    {!stockPhoto && <img
                        src={`/api/users/${user.username}/avatar`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        onError={() => setStockPhoto(true)}
                    />}
                    {stockPhoto &&
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                        </svg>
                    }

                    <Link className="font-semibold" to={`/users/${user.username}`}>{user.username}</Link>
                    <button
                        type="submit"
                        className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 font-medium transition-colors duration-150 ease-in"
                    >
                        Logout
                    </button>
                </fetcher.Form>
            )}
        </nav>
    )
}