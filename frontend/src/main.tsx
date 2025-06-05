import {createRoot} from 'react-dom/client'
import './index.css'
import MainLayout from './pages/MainLayout.tsx'
import {createBrowserRouter, RouterProvider} from "react-router";
import PostsPage from "./pages/PostsPage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        children: [
            {
                index: true,
                element: <PostsPage/>
            },
            {
                path: "login",
            },
            {
                path: "user",
            }
        ]
    }
])

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>
)
