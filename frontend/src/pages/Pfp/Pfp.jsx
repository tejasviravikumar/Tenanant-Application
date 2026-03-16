import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Pfp.module.css";
import { useAvatar } from "../Avatarcontent/Avatarcontent";

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Pfp() {
  const { avatarSrc, setAvatarSrc, DEFAULT_AVATAR } = useAvatar();
  const isCustom = avatarSrc !== DEFAULT_AVATAR;
  const navigate = useNavigate();

  const [open, setOpen]     = useState(false);
  const [toast, setToast]   = useState(false);
  const [user, setUser]     = useState(null);
  const fileRef             = useRef();

  // Fetch profile when modal opens
  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8080/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => setUser(data.user || null))
      .catch((err) => console.error(err));
  }, [open]);

  const fullName = user
    ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
    : "Loading…";

  // Format leaseStart as "Mon YYYY" for "Member Since"
  const memberSince = user?.apartment?.leaseStart
    ? new Date(user.apartment.leaseStart).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(false), 2200);
  };

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

  const handleRemove = () => {
    setAvatarSrc(DEFAULT_AVATAR);
    showToast("Photo removed");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userAvatar");
    setAvatarSrc(DEFAULT_AVATAR);
    window.dispatchEvent(new Event("authChange"));
    setOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Navbar trigger button */}
      <button
        className={styles.triggerBtn}
        onClick={() => setOpen(true)}
        title="View profile"
        aria-label="Open profile"
      >
        <img src={avatarSrc} alt="profile" className={styles.triggerAvatar} />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleFileChange}
      />

      {/* Modal */}
      {open && (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Profile Details">

            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <div className={styles.modalTitleIcon}><UserIcon /></div>
                Profile Details
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {/* Avatar */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrap}>
                <img src={avatarSrc} alt={fullName} className={styles.avatar} />
                <span className={styles.onlineDot} aria-hidden="true" />
              </div>
              <h2 className={styles.userName}>{fullName}</h2>
              <div className={styles.activeBadge}>
                <span className={styles.activeDot} />
                ACTIVE TENANT
              </div>
            </div>

            {/* Photo Action Buttons */}
            <div className={styles.photoActions}>
              <button className={styles.btnChangePhoto} onClick={() => fileRef.current.click()}>
                <CameraIcon /> Change Photo
              </button>
              <button
                className={styles.btnRemove}
                onClick={handleRemove}
                disabled={!isCustom}
                style={!isCustom ? { opacity: 0.45, cursor: "not-allowed" } : {}}
              >
                <TrashIcon /> Remove
              </button>
            </div>

            {/* Info Cards */}
            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <span className={styles.infoCardIcon}><CalendarIcon /></span>
                <span className={styles.infoCardLabel}>Member Since</span>
                <span className={styles.infoCardValue}>{memberSince}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoCardIcon}><ShieldIcon /></span>
                <span className={styles.infoCardLabel}>Verified</span>
                <span className={styles.infoCardValue}>Yes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button className={styles.btnEditProfile} onClick={() => { setOpen(false); navigate("/profile"); }}>
                Edit Profile Details
              </button>
              <button className={styles.btnLogout} onClick={handleLogout}>
                <LogoutIcon /> Logout
              </button>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              {user?.apartment?.propertyName
                ? `${user.apartment.propertyName} · Unit ${user.apartment.apartmentNumber}`
                : "Loading…"}
            </div>

          </div>
        </div>
      )}

      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>
        {toast}
      </div>
    </>
  );
}