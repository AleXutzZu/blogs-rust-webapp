import {Outlet} from "react-router"
import NavigationBar from "../components/NavigationBar.tsx";

function MainLayout() {

    return (
        <>
            <NavigationBar/>
            <Outlet/>
        </>
    )
}

export default MainLayout
