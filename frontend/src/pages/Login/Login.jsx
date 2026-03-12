// src/pages/Login/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import headerImage from "../../assets/image.png";

import { MdEmail } from "react-icons/md";
import { IoMdLock } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { IoEyeOffSharp } from "react-icons/io5";
import axios from "axios";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await axios.post("http://localhost:8080/auth/login", {
        email: email,
        password: password
      });

      const token = response.data.token;

      localStorage.setItem("token", token);

      navigate("/");

    } catch (error) {

      if (error.response) {
        alert(error.response.data);
      } else {
        alert("Server error");
      }

    }
  };

  return (
    <div className={styles["login-page"]}>

      <div className={styles["login-card"]}>

        <img src={headerImage} alt="header" className={styles["login-logo"]} />

        <div className={styles["login-header"]}>
          <h1>Tenant Portal Login</h1>
          <p>
            Sign in to access your tenant dashboard, manage payments,
            and submit maintenance requests.
          </p>
        </div>

        <form className={styles["login-form"]} onSubmit={handleSubmit}>

          {/* Email */}
          <div className={styles["form-group"]}>
            <label>Email</label>

            <div className={styles["input-wrapper"]}>
              <MdEmail className={styles["input-icon"]} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles["form-group"]}>
            <label>Password</label>

            <div className={styles["input-wrapper"]}>
              <IoMdLock className={styles["input-icon"]} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                className={styles["password-toggle"]}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffSharp /> : <IoEye />}
              </span>

            </div>
          </div>

          <button type="submit">Sign In</button>

        </form>

        <div className={styles["login-footer"]}>
          <p>
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
        </div>

      </div>

    </div>
  );
}

export default Login;