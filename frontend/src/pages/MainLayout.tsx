import {Outlet} from "react-router"

function MainLayout() {

    return (
        <>
            <div>Navbar</div>
            <Outlet/>
        </>
    )
}

export default MainLayout
