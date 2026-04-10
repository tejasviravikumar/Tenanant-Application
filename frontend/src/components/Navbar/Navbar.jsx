import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import Pfp from "../../pages/Pfp/Pfp";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });
  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", checkLogin);
    window.addEventListener("authChange", checkLogin);
    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("authChange", checkLogin);
    };
  }, []);

  const getNavClass = ({ isActive }) =>
    isActive ? `${styles["nav-link"]} ${styles.active}` : styles["nav-link"];

  return (
    <nav className={styles.navbar}>
      {/* Logo — left column */}
      <div className={styles["left-section"]}>
        <NavLink to="/" className={styles["navbar-logo"]}>
          <div className={styles["logo-icon"]}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className={styles["logo-text"]}>TenantPortal</span>
        </NavLink>
      </div>

      {/* Nav Links — centre column */}
      <ul className={styles["navbar-links"]}>
        <li><NavLink to="/"            className={getNavClass}>Dashboard</NavLink></li>
        <li><NavLink to="/payments"    className={getNavClass}>Payments</NavLink></li>
        <li><NavLink to="/maintenance" className={getNavClass}>Maintenance</NavLink></li>
        <li><NavLink to="/parking"     className={getNavClass}>Parking</NavLink></li>
        <li><NavLink to="/profile"     className={getNavClass}>Profile</NavLink></li>
      </ul>

      {/* Right — right column */}
      <div className={styles["right-section"]}>
        {isLoggedIn ? (
          <>
            <Pfp />
          </>
        ) : (
          <NavLink to="/login" className={styles["auth-btn"]}>Sign In</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;