import "./Profile.css";

function Profile() {
  return (
    <div className="profile-page">

      {/* Profile Header */}
      <div className="profile-header card">
        <div className="profile-left">
          <img
            src="/profile-avatar.png"
            alt="profile"
            className="profile-avatar"
          />

          <div className="profile-details">
            <h2>Rajesh Kumar</h2>
            <p className="location">Skyview Apartments, Unit 402</p>

            <div className="profile-tags">
              <span className="move-in">Moved in: Jan 2024</span>
              <span className="active">ACTIVE</span>
            </div>
          </div>
        </div>

        <button className="edit-btn">Edit Profile</button>
      </div>


      {/* Info Section */}
      <div className="profile-info-grid">

        {/* Personal Information */}
        <div className="card personal-info">
          <h3>Personal Information</h3>

          <div className="info-item">
            <label>Full Name</label>
            <p>Rajesh Kumar</p>
          </div>

          <div className="info-item">
            <label>Email</label>
            <p>rajesh.k@example.com</p>
          </div>

          <div className="info-item">
            <label>Phone Number</label>
            <p>+91 98765 43210</p>
          </div>

          <div className="info-item">
            <label>Emergency Contact</label>
            <p>Sunita Kumar (+91 98765 00000)</p>
          </div>

          <div className="info-item">
            <label>Permanent Address</label>
            <p>12-B, Park Avenue, Bangalore</p>
          </div>
        </div>


        {/* Rental Information */}
        <div className="card rental-info">
          <h3>Rental Information</h3>

          <div className="info-row">
            <div>
              <label>Property</label>
              <p>Skyview Apartments</p>
            </div>

            <div>
              <label>Unit</label>
              <p>402 (2BHK)</p>
            </div>
          </div>

          <div className="rent-box">
            <p>Monthly Rent</p>
            <h3>₹15,000</h3>
          </div>

          <div className="info-row">
            <div>
              <label>Lease Start</label>
              <p>Jan 01, 2024</p>
            </div>

            <div>
              <label>Lease End</label>
              <p>Dec 31, 2024</p>
            </div>
          </div>

          <div className="info-item">
            <label>Advance Paid</label>
            <p>₹45,000</p>
          </div>
        </div>

      </div>


      {/* Account Settings */}
      <div className="card account-settings">
        <h3>Account Settings</h3>

        <div className="settings-grid">

          <div className="setting-card">
            <p>Change Password</p>
          </div>

          <div className="setting-card">
            <p>Notification Prefs</p>
          </div>

          <div className="setting-card">
            <p>Download Docs</p>
          </div>

          <div className="setting-card logout">
            <p>Logout Account</p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Profile;