import { CgProfile } from "react-icons/cg";
import { IoIosNotifications } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkLogin);
    window.addEventListener("authChange", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("authChange", checkLogin);
    };
  }, []);

  const getNavClass = ({ isActive }) =>
    isActive
      ? `${styles["nav-link"]} ${styles.active}`
      : styles["nav-link"];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles["left-section"]}>
          <div className={styles["navbar-logo"]}>MyApp</div>

          <ul className={styles["navbar-links"]}>
            <li>
              <NavLink to="/" className={getNavClass}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/payments" className={getNavClass}>
                Payments
              </NavLink>
            </li>
            <li>
              <NavLink to="/maintenance" className={getNavClass}>
                Maintenance
              </NavLink>
            </li>
            <li>
              <NavLink to="/parking" className={getNavClass}>
                Parking
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={getNavClass}>
                Profile
              </NavLink>
            </li>
          </ul>
        </div>

        <div className={styles["right-section"]}>
          {isLoggedIn ? (
            <>
              <NavLink to="/notifications">
                <IoIosNotifications
                  className={styles["notification-bell"]}
                  size={25}
                />
              </NavLink>
              <NavLink to="/profile">
                <CgProfile className={styles["profile-pic"]} size={30} />
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" className={styles["auth-btn"]}>
              Sign In
            </NavLink>
          )}
        </div>
      </nav>
      <hr />
    </>
  );
}

export default Navbar;