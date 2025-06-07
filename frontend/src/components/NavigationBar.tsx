import {NavLink, useFetcher, useRouteLoaderData} from "react-router";
import type {AuthUser} from "../auth.ts";

export default function NavigationBar() {
    const {user} = useRouteLoaderData("root") as { user: AuthUser | null };
    const fetcher = useFetcher();

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
                    <img
                        src={`/api/user/${user.username}/avatar`} //TODO add stock photo if none is found
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                    <span className="font-semibold">{user.username}</span>
                    <button
                        type="submit"
                        className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 font-medium"
                    >
                        Logout
                    </button>
                </fetcher.Form>
            )}
        </nav>
    )
}