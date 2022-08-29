import { CSidebar, CSidebarNav, CNavTitle, CNavItem } from "@coreui/react";
// import { Link } from "react-router-dom";
import React from "react";

const Sidebar = () => {
    const logoutFn = () => {
        localStorage.clear();
        // navigate, route, link, window
        window.location.href = "/"; 

    }

    // const userType = localStorage.getItem("userType")

    // if(userType === 'CUSTOMER') {
    //     return (

    //     )
    // }
    return (
        <CSidebar unfoldable className="bg-dark vh-95">
            <CSidebarNav>
                <CNavItem className="bg-dark text-center d-flex">
                    <i className="bi bi-pie-chart m-2"></i>
                    <h5 className="mx-5 my-1 fw-bolder">TETHERX</h5>
                </CNavItem>
                <CNavTitle className="">
                    A CRM App for all your needs...
                </CNavTitle>
                <CNavItem className="d-flex">
                    <i className="bi bi-box-arrow-left m-2"></i>
                    <a to="/admin" className="text-decoration-none"><span className="mx-5 my-1">Home</span></a>
                  
                </CNavItem>
                <CNavItem className="d-flex">
                    <i className="bi bi-box-arrow-left m-2"></i>
                    <span className="mx-5 my-1"
                     onClick={logoutFn}
                     >Logout</span>
                </CNavItem>
               
               {/* {usertype && ()} */}

            </CSidebarNav>

        </CSidebar>

    )
}

export default Sidebar;