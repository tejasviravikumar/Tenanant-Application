import { useState, useRef } from "react";
import styles from "./Profile.module.css";

// WhatsApp-style default grey silhouette avatar (inline SVG as data URL)
const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23DFE5E7'/%3E%3Ccircle cx='100' cy='85' r='38' fill='%23B0BEC5'/%3E%3Cellipse cx='100' cy='185' rx='65' ry='50' fill='%23B0BEC5'/%3E%3C/svg%3E";

function Profile() {
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);
  const [toast, setToast] = useState(false);
  const fileRef = useRef();

  const handleAvatarClick = () => fileRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      setHasCustomAvatar(true);
      showToast("Photo updated ✓");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setAvatarSrc(DEFAULT_AVATAR);
    setHasCustomAvatar(false);
    showToast("Photo removed");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(false), 2200);
  };

  return (
    <>
      <div className={styles["profile-page"]}>

        {/* Profile Header */}
        <div className={`${styles["profile-header"]} ${styles.card}`}>
          <div className={styles["profile-left"]}>

            <div
              className={styles["avatar-wrapper"]}
              onClick={handleAvatarClick}
              title="Change photo"
            >
              <img src={avatarSrc} alt="profile" className={styles["profile-avatar"]} />

              <div className={styles["avatar-overlay"]}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Change Photo</span>
              </div>

              {hasCustomAvatar && (
                <button className={styles["avatar-remove"]} onClick={handleRemove}>×</button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className={styles["avatar-input"]}
              onChange={handleFileChange}
            />

            <div className={styles["profile-details"]}>
              <h2>Rajesh Kumar</h2>
              <p className={styles.location}>📍 Skyview Apartments, Unit 402</p>

              <div className={styles["profile-tags"]}>
                <span className={styles["move-in"]}>Moved in: Jan 2024</span>
                <span className={styles.status}>ACTIVE</span>
              </div>
            </div>
          </div>

          <button className={styles["edit-btn"]}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Info Grid */}
        <div className={styles["profile-info-grid"]}>

          {/* Personal Information */}
          <div className={`${styles.card} ${styles["personal-info"]}`}>
            <h3>👤 Personal Information</h3>

            <div className={styles["info-item"]}>
              <label>Full Name</label>
              <p>Rajesh Kumar</p>
            </div>

            <div className={styles["info-item"]}>
              <label>Email</label>
              <p>rajesh.k@example.com</p>
            </div>

            <div className={styles["info-item"]}>
              <label>Phone Number</label>
              <p>+91 98765 43210</p>
            </div>

            <div className={styles["info-item"]}>
              <label>Emergency Contact</label>
              <p>Sunita Kumar (+91 98765 00000)</p>
            </div>

            <div className={styles["info-item"]}>
              <label>Permanent Address</label>
              <p>12-B, Park Avenue, Bangalore, KA - 560001</p>
            </div>
          </div>

          {/* Rental Information */}
          <div className={`${styles.card} ${styles["rental-info"]}`}>
            <h3>🔑 Rental Information</h3>

            <div className={styles["info-row"]}>
              <div>
                <label>Property</label>
                <p>Skyview Apartments</p>
              </div>
              <div>
                <label>Unit</label>
                <p>402 (2BHK)</p>
              </div>
            </div>

            <div className={styles["rent-box"]}>
              <p>Monthly Rent</p>
              <span className={styles["rent-amount"]}>₹15,000</span>
            </div>

            <div className={styles["info-row"]}>
              <div>
                <label>Lease Start</label>
                <p>Jan 01, 2024</p>
              </div>
              <div>
                <label>Lease End</label>
                <p>Dec 31, 2024</p>
              </div>
            </div>

            <div className={styles["info-item"]}>
              <label>Advance Paid</label>
              <p>₹45,000</p>
            </div>
          </div>

        </div>

        {/* Account Settings */}
        <div className={`${styles.card} ${styles["account-settings"]}`}>
          <h3>⚙️ Account Settings</h3>

          <div className={styles["settings-grid"]}>
            <div className={styles["setting-card"]}>
              <span className={styles["setting-icon"]}>🔒</span>
              <p>Change Password</p>
            </div>

            <div className={styles["setting-card"]}>
              <span className={styles["setting-icon"]}>🔔</span>
              <p>Notification Prefs</p>
            </div>

            <div className={styles["setting-card"]}>
              <span className={styles["setting-icon"]}>📄</span>
              <p>Download Docs</p>
            </div>

            <div className={`${styles["setting-card"]} ${styles.logout}`}>
              <span className={styles["setting-icon"]}>🚪</span>
              <p>Logout Account</p>
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      <div className={`${styles["upload-toast"]} ${toast ? styles.show : ""}`}>
        {toast}
      </div>
    </>
  );
}

export default Profile;