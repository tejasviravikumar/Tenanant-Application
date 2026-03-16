import { useRef, useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { useAvatar } from "../Avatarcontent/Avatarcontent";
import {
  MapPin,
  User,
  Key,
  Settings,
  Lock,
  Bell,
  FileDown,
  LogOut,
} from "lucide-react";

function Profile() {
  const { avatarSrc, setAvatarSrc, DEFAULT_AVATAR } = useAvatar();
  const hasCustomAvatar = avatarSrc !== DEFAULT_AVATAR;
  const [toast, setToast] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    emergencyContact: "",
    permanentAddress: "",
    apartment: {},
  });

  const fileRef = useRef();

  // Helper: get JWT token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Helper: build auth headers
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  // Fetch profile data
  useEffect(() => {
    const token = getToken();
    if (!token) {
      // No token — redirect to login
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError(null);

    fetch("http://localhost:8080/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data.user || {});
        if (data.user?.avatarUrl) setAvatarSrc(data.user.avatarUrl);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load profile. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarClick = () => fileRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      showToast("Photo updated ✓");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setAvatarSrc(DEFAULT_AVATAR);
    showToast("Photo removed");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(false), 2200);
  };

  const toggleEdit = () => setEditMode(!editMode);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Only send the fields the backend's updateProfile accepts
    const payload = {
      firstname: profile.firstname,
      lastname: profile.lastname,
      phoneNumber: profile.phoneNumber,
      emergencyContact: profile.emergencyContact,
      permanentAddress: profile.permanentAddress,
    };

    fetch("http://localhost:8080/api/profile", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
        return res.json();
      })
      .then((updatedUser) => {
        if (!updatedUser) return;
        // Merge updated fields back; keep apartment data intact
        setProfile((prev) => ({ ...prev, ...updatedUser }));
        showToast("Profile updated ✓");
        setEditMode(false);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to update profile ✗");
      });
  };

  const handleLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("token"); // Clear JWT
    showToast("Logging out…");
    setTimeout(() => (window.location.href = "/login"), 1000);
  };

  if (loading) {
    return <div className={styles["profile-loading"]}>Loading profile…</div>;
  }

  if (error) {
    return <div className={styles["profile-error"]}>{error}</div>;
  }

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
              <img
                src={avatarSrc}
                alt="profile"
                className={styles["profile-avatar"]}
              />
              <div className={styles["avatar-overlay"]}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Change Photo</span>
              </div>
              {hasCustomAvatar && (
                <button
                  className={styles["avatar-remove"]}
                  onClick={handleRemove}
                >
                  ×
                </button>
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
              <h2>
                {profile.firstname} {profile.lastname}
              </h2>
              <p className={styles.location}>
                <MapPin size={14} strokeWidth={2.5} />
                {profile.apartment?.propertyName}, Unit{" "}
                {profile.apartment?.apartmentNumber}
              </p>
            </div>
          </div>

          <button className={styles["edit-btn"]} onClick={toggleEdit}>
            {editMode ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        {/* Info Grid */}
        <div className={styles["profile-info-grid"]}>
          {/* Personal Information */}
          <div className={`${styles.card} ${styles["personal-info"]}`}>
            <h3>
              <span className={styles["section-icon"]}>
                <User size={16} strokeWidth={2.5} />
              </span>
              Personal Information
            </h3>

            <div className={styles["info-item"]}>
              <label>First Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="firstname"
                  value={profile.firstname || ""}
                  onChange={handleChange}
                  placeholder="First Name"
                />
              ) : (
                <p>{profile.firstname}</p>
              )}
            </div>

            <div className={styles["info-item"]}>
              <label>Last Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="lastname"
                  value={profile.lastname || ""}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
              ) : (
                <p>{profile.lastname}</p>
              )}
            </div>

            <div className={styles["info-item"]}>
              <label>Email</label>
              {/* Email is not updatable via the backend endpoint — read-only */}
              <p>{profile.email}</p>
            </div>

            <div className={styles["info-item"]}>
              <label>Phone Number</label>
              {editMode ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={profile.phoneNumber || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.phoneNumber}</p>
              )}
            </div>

            <div className={styles["info-item"]}>
              <label>Emergency Contact</label>
              {editMode ? (
                <input
                  type="text"
                  name="emergencyContact"
                  value={profile.emergencyContact || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.emergencyContact}</p>
              )}
            </div>

            <div className={styles["info-item"]}>
              <label>Permanent Address</label>
              {editMode ? (
                <textarea
                  name="permanentAddress"
                  value={profile.permanentAddress || ""}
                  onChange={handleChange}
                  rows={2}
                />
              ) : (
                <p>{profile.permanentAddress}</p>
              )}
            </div>

            {editMode && (
              <button className={styles["save-btn"]} onClick={handleSave}>
                Save Changes
              </button>
            )}
          </div>

          {/* Rental Information (Read-only) */}
          <div className={`${styles.card} ${styles["rental-info"]}`}>
            <h3>
              <span className={styles["section-icon"]}>
                <Key size={16} strokeWidth={2.5} />
              </span>
              Rental Information
            </h3>

            <div className={styles["info-row"]}>
              <div>
                <label>Property</label>
                <p>{profile.apartment?.propertyName}</p>
              </div>
              <div>
                <label>Unit</label>
                <p>{profile.apartment?.apartmentNumber}</p>
              </div>
            </div>

            <div className={styles["rent-box"]}>
              <p>Monthly Rent</p>
              <span className={styles["rent-amount"]}>
                ₹{profile.apartment?.monthlyRent}
              </span>
            </div>

            <div className={styles["info-row"]}>
              <div>
                <label>Lease Start</label>
                <p>
                  {profile.apartment?.leaseStart
                    ? new Date(profile.apartment.leaseStart).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <label>Lease End</label>
                <p>
                  {profile.apartment?.leaseEnd
                    ? new Date(profile.apartment.leaseEnd).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className={styles["info-item"]}>
              <label>Advance Paid</label>
              <p>₹{profile.apartment?.advancePaid}</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className={`${styles.card} ${styles["account-settings"]}`}>
          <h3>
            <span className={styles["section-icon"]}>
              <Settings size={16} strokeWidth={2.5} />
            </span>
            Account Settings
          </h3>

          <div className={styles["settings-grid"]}>
            <div className={styles["setting-card"]}>
              <Lock size={26} strokeWidth={1.8} className={styles["setting-icon"]} />
              <p>Change Password</p>
            </div>

            <div className={styles["setting-card"]}>
              <Bell size={26} strokeWidth={1.8} className={styles["setting-icon"]} />
              <p>Notification Prefs</p>
            </div>

            <div className={styles["setting-card"]}>
              <FileDown size={26} strokeWidth={1.8} className={styles["setting-icon"]} />
              <p>Download Docs</p>
            </div>

            <div
              className={`${styles["setting-card"]} ${styles.logout}`}
              onClick={handleLogout}
            >
              <LogOut size={26} strokeWidth={1.8} className={styles["setting-icon"]} />
              <p>Logout Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={styles["modal-backdrop"]} onClick={cancelLogout}>
          <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["modal-icon"]}>
              <LogOut size={28} strokeWidth={1.8} />
            </div>
            <h4>Log out of Skyview?</h4>
            <p>You'll need to sign in again to access your account.</p>
            <div className={styles["modal-actions"]}>
              <button className={styles["modal-cancel"]} onClick={cancelLogout}>
                Cancel
              </button>
              <button className={styles["modal-confirm"]} onClick={confirmLogout}>
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`${styles["upload-toast"]} ${toast ? styles.show : ""}`}>
        {toast}
      </div>
    </>
  );
}

export default Profile;