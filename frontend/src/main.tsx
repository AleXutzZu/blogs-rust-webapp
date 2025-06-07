import {createRoot} from 'react-dom/client'
import './index.css'
import MainLayout from './pages/MainLayout.tsx'
import {createBrowserRouter, redirect, RouterProvider} from "react-router";
import PostsPage, {loader as postsLoader} from "./pages/PostsPage.tsx";
import CreatePostPage from "./pages/CreatePostPage.tsx";
import LoginPage, {action as loginAction, loader as loginLoader} from "./pages/LoginPage.tsx";
import SignUpPage, {action as signUpAction} from "./pages/SignUpPage.tsx";
import {authProvider, protectedLoaderWrapper} from "./auth.ts";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        async loader() {
            const user = await authProvider.checkAuth();
            return {user: user}
        },
        id: "root",
        children: [
            {
                index: true,
                element: <PostsPage/>,
                loader: postsLoader,
            },
            {
                path: "login",
                element: <LoginPage/>,
                action: loginAction,
                loader: loginLoader
            },
            {
                path: "signup",
                element: <SignUpPage/>,
                action: signUpAction
            },
            {
                path: "user",
            },
            {
                path: "create",
                element: <CreatePostPage/>,
                loader: protectedLoaderWrapper()
            }
        ]
    },
    {
        path: "/logout",
        async action() {
            await authProvider.signOut();
            return redirect("/");
        }
    }
])

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>
)
