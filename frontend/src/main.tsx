import {createRoot} from 'react-dom/client'
import './index.css'
import MainLayout from './pages/MainLayout.tsx'
import {createBrowserRouter, RouterProvider} from "react-router";
import PostsPage, {loader as postsLoader} from "./pages/PostsPage.tsx";
import CreatePostPage from "./pages/CreatePostPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        children: [
            {
                index: true,
                element: <PostsPage/>,
                loader: postsLoader,
            },
            {
                path: "login",
                element: <LoginPage/>
            },
            {
                path: "signup",
                element: <SignUpPage/>
            },
            {
                path: "user",
            },
            {
                path: "create",
                element: <CreatePostPage/>
            }
        ]
    }
])

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>
)
