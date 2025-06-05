import {NavLink} from "react-router";

export default function NavigationBar() {
    return (
        <nav className="flex items-center justify-between bg-blue-500 py-4 px-16">
            <div className="flex h-full items-center space-x-12">
                <NavLink to={"/"} className="text-xl text-gray-200 font-bold">Posts</NavLink>
                <NavLink to={"/create"} className="text-xl text-gray-200 font-bold">Create</NavLink>
            </div>
            <NavLink to={"/login"} className="text-xl text-gray-200 font-bold">Login</NavLink>
        </nav>
    )
}