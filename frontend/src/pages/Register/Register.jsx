// src/pages/Register/Register.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { FaUser, FaBuilding } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoMdLock } from "react-icons/io";
import { HiArrowRight } from "react-icons/hi";
import axios from "axios";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!agreed) {
      alert("Please agree to the Terms and Conditions");
      return;
    }

    try {
      await axios.post("http://localhost:8080/auth/register", {
        firstname: firstName,
        lastname: lastName,
        apartmentNumber: apartmentNumber,
        email: email,
        phoneNumber: `+91${phone}`,
        password: password
      });

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        alert(
          typeof data === "object"
            ? data.message || JSON.stringify(data)
            : data
        );
      } else {
        alert("Server error");
      }
    }
  };

  return (
    <div className={styles["register-page"]}>
      <nav className={styles["register-nav"]}>
        <div className={styles["nav-brand"]}>
          <div className={styles["nav-logo"]}>
            <FaBuilding size={20} />
          </div>
          <span>Tenant Portal</span>
        </div>
        <div className={styles["nav-right"]}>
          <span>Already have an account?</span>
          <button
            className={styles["signin-btn"]}
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
      </nav>

      <div className={styles["register-card"]}>
        <div className={styles["register-header"]}>
          <h1>Create Your Tenant Account</h1>
          <p>
            Register to access rent payments, maintenance requests, and your
            tenant dashboard.
          </p>
        </div>

        <form className={styles["register-form"]} onSubmit={handleSubmit}>

          <div className={styles["form-row"]}>
            <div className={styles["form-group"]}>
              <label>First Name</label>
              <div className={styles["input-wrapper"]}>
                <FaUser className={styles["input-icon"]} />
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label>Last Name</label>
              <div className={styles["input-wrapper"]}>
                <FaUser className={styles["input-icon"]} />
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles["form-group"]}>
            <label>Apartment Number</label>
            <div className={styles["input-wrapper"]}>
              <FaBuilding className={styles["input-icon"]} />
              <input
                type="text"
                placeholder="Apt 4B"
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles["form-group"]}>
            <label>Email Address</label>
            <div className={styles["input-wrapper"]}>
              <MdEmail className={styles["input-icon"]} />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles["form-group"]}>
            <label>Mobile Number</label>
            <div className={styles["input-wrapper"]}>
              <span className={styles["phone-prefix"]}>🇮🇳 +91</span>
              <input
                type="tel"
                placeholder="98765 43210"
                value={phone}
                maxLength={10}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                required
              />
            </div>
          </div>

          <div className={styles["form-row"]}>
            <div className={styles["form-group"]}>
              <label>Password</label>
              <div className={styles["input-wrapper"]}>
                <IoMdLock className={styles["input-icon"]} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles["form-group"]}>
              <label>Confirm Password</label>
              <div className={styles["input-wrapper"]}>
                <IoMdLock className={styles["input-icon"]} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles["terms-row"]}>
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the{" "}
              <a href="/terms" className={styles["terms-link"]}>
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className={styles["terms-link"]}>
                Privacy Policy
              </a>
              .
            </label>
          </div>

          <button type="submit" className={styles["submit-btn"]}>
            Create Account <HiArrowRight />
          </button>
        </form>

        <div className={styles["register-footer"]}>
          <p>
            Already have an account?{" "}
            <a href="/login" className={styles["signin-link"]}>
              Sign In here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

