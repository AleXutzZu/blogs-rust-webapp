import {Outlet, useLoaderData} from "react-router"
import NavigationBar from "../components/NavigationBar.tsx";
import {useCallback, useEffect, useState} from "react";
import {AuthContext, type AuthContextMethods, authProvider, type AuthUser} from "../auth.ts";
import {Toaster} from "react-hot-toast";

export async function loader() {
    const user = await authProvider.checkAuth();
    return {user: user}
}
function MainLayout() {
    const data = useLoaderData<typeof loader>();

    useEffect(() => {
        document.title = "RustyPosts | Main Page"
    }, []);

    useEffect(() => {
        const date = Date.now();
        if (!data.user) setProfilePicture(null);
        else setProfilePicture(`/api/users/${data.user?.username}/avatar?v=${date}`);
    }, [data]);

    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [stockPhoto, setStockPhoto] = useState(false);

    const getLoggedUser = useCallback(() => {
        return data.user as AuthUser | null;
    }, [data]);

    const getProfilePictureLink = useCallback(() => {
        return profilePicture;
    }, [profilePicture]);

    const updateProfilePictureLink = useCallback(() => {
        const date = Date.now();
        if (!data.user) setProfilePicture(null);
        else setProfilePicture(`/api/users/${data.user?.username}/avatar?v=${date}`);
        setStockPhoto(false);
    }, [data]);

    const isStockPhoto = useCallback(() => {
        return stockPhoto;
    }, [stockPhoto]);

    const stockPhotoSetter = useCallback((state: boolean) => {
        setStockPhoto(state);
    }, []);

    const methods: AuthContextMethods = {
        getLoggedUser,
        getProfilePictureLink,
        updateProfilePictureLink,
        isStockPhoto,
        setStockPhoto: stockPhotoSetter
    }

    return (
        <AuthContext.Provider value={methods}>
            <NavigationBar/>
            <main className="grow flex bg-gray-50">
                <Outlet/>
            </main>
            <Toaster/>
        </AuthContext.Provider>
    )
}

export default MainLayout
