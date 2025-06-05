import {Outlet} from "react-router"
import NavigationBar from "../components/NavigationBar.tsx";

function MainLayout() {

    return (
        <>
            <NavigationBar/>
            <main className="grow flex bg-gray-50">
                <Outlet/>
            </main>
        </>
    )
}

export default MainLayout
