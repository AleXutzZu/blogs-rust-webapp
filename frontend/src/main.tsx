import {createRoot} from 'react-dom/client'
import './index.css'
import MainLayout, {loader as mainLoader} from './pages/MainLayout.tsx'
import {createBrowserRouter, redirect, RouterProvider} from "react-router";
import PostsPage, {loader as postsLoader} from "./pages/PostsPage.tsx";
import LoginPage, {action as loginAction, loader as loginLoader} from "./pages/LoginPage.tsx";
import SignUpPage, {action as signUpAction} from "./pages/SignUpPage.tsx";
import {authProvider} from "./auth.ts";
import UserPage, {action as userAction, loader as userLoader} from "./pages/UserPage.tsx";
import UserErrorPage from "./pages/UserErrorPage.tsx";
import GlobalErrorPage from "./pages/GlobalErrorPage.tsx";
import {StrictMode} from "react";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        loader: mainLoader,
        id: "root",
        errorElement: <GlobalErrorPage/>,
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
                path: "users/:username",
                element: <UserPage/>,
                loader: userLoader,
                action: userAction,
                errorElement: <UserErrorPage/>
            },
        ]
    },
    {
        path: "/logout",
        async action() {
            await authProvider.signOut();
            return redirect("/");
        }
    },
])

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
)
