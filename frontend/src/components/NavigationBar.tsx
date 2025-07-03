import {Link, NavLink, useFetcher} from "react-router";
import {useAuthContext} from "../auth.ts";
import {useState} from "react";

export default function NavigationBar() {
    const fetcher = useFetcher();
    const authMethods = useAuthContext();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const user = authMethods.getLoggedUser();
    const avatarLink = authMethods.getProfilePictureLink();
    const stockPhoto = authMethods.isStockPhoto();


    return (
        <nav className="bg-blue-600 text-white shadow-md px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <NavLink
                        to="/"
                        className={({isActive}) =>
                            `text-lg font-semibold hover:text-blue-200 transition ${
                                isActive ? "underline" : ""
                            }`
                        }
                    >
                        Feed
                    </NavLink>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {!user && (
                        <NavLink
                            to="/login"
                            className={({isActive}) =>
                                `text-white hover:text-blue-200 font-medium ${
                                    isActive ? "underline" : ""
                                }`
                            }
                        >
                            Login
                        </NavLink>
                    )}

                    {user && (
                        <fetcher.Form
                            method="post"
                            action="/logout"
                            className="flex items-center gap-3 bg-blue-500 px-4 py-2 rounded-xl shadow-sm"
                        >
                            {!stockPhoto ? (
                                <img
                                    src={avatarLink ?? undefined}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                    onError={() => authMethods.setStockPhoto(true)}
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                    />
                                </svg>
                            )}
                            <Link
                                to={`/users/${user.username}`}
                                className="font-semibold hover:underline"
                            >
                                {user.username}
                            </Link>
                            <button
                                type="submit"
                                className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 font-medium transition"
                            >
                                Logout
                            </button>
                        </fetcher.Form>
                    )}
                </div>

                <button
                    className="md:hidden focus:outline-none"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        {mobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="mt-3 space-y-2 md:hidden">
                    {!user && (
                        <NavLink
                            to="/login"
                            className="block text-white hover:text-blue-200 font-medium px-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login
                        </NavLink>
                    )}

                    {user && (
                        <fetcher.Form method="post" action="/logout">
                            <div className="flex items-center gap-3 px-2">
                                {!stockPhoto ? (
                                    <img
                                        src={avatarLink ?? undefined}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                        onError={() => authMethods.setStockPhoto(true)}
                                    />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                        />
                                    </svg>
                                )}
                                <Link
                                    to={`/users/${user.username}`}
                                    className="font-semibold hover:underline"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {user.username}
                                </Link>
                                <button
                                    type="submit"
                                    className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 font-medium transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </fetcher.Form>
                    )}
                </div>
            )}
        </nav>
    );
}