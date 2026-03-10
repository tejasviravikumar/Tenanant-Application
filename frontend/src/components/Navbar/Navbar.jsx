import { CgProfile } from "react-icons/cg";
import { IoIosNotifications } from "react-icons/io";
import { NavLink } from "react-router-dom";
import "./Navbar.css"

function Navbar(){
    return(
        <>
            <nav className="navbar">
                <div className="left-section">
                    <div className="navbar-logo">MyApp</div>
                    <ul className="navbar-links">
                        <li><NavLink to="/" className={({isActive})=> isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink></li>
                        <li><NavLink to="/payments" className={({isActive})=> isActive ? "nav-link active" : "nav-link"}>Payments</NavLink></li>
                        <li><NavLink to="/maintenance" className={({isActive})=> isActive ? "nav-link active" : "nav-link"}>Maintenance</NavLink></li>
                        <li><NavLink to="/profile" className={({isActive})=> isActive ? "nav-link active" : "nav-link"}>Profile</NavLink></li>
                    </ul>
                </div>

                <div className="right-section">
                    <NavLink to="/notifications">
                        <IoIosNotifications className="notification-bell" size={25} />
                    </NavLink>
                    <NavLink to="/profile">
                        <CgProfile className="profile-pic" size={30}/>
                    </NavLink>
                </div>
            </nav>

            <hr></hr>
        </>
    );   
}

export default Navbar