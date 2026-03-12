import styles from "./Complaints.module.css";

function Complaints() {
  return (
    <div className={styles["complaint-page"]}>

      <main className={styles["main-container"]}>

        <div className={styles["page-header"]}>
          <h1>Raise a Maintenance Complaint</h1>
          <p>
            Report maintenance issues in your apartment. We'll respond within
            24 hours.
          </p>
        </div>

        <div className={styles["layout-grid"]}>

          {/* Complaint Form */}
          <div className={styles["form-section"]}>

            <h3>Complaint Details</h3>

            <input
              type="text"
              placeholder="e.g., Leaking kitchen faucet"
              className={styles["input-field"]}
            />

            <div className={styles["grid-2"]}>

              <select className={styles["input-field"]}>
                <option>Select Category</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Appliances</option>
                <option>Internet</option>
                <option>Other</option>
              </select>

              <select className={styles["input-field"]}>
                <option>Select Area</option>
                <option>Kitchen</option>
                <option>Bathroom</option>
                <option>Bedroom</option>
                <option>Living Room</option>
                <option>Balcony</option>
              </select>

            </div>

            <textarea
              placeholder="Describe the issue in detail..."
              rows="4"
              className={styles["input-field"]}
            ></textarea>

            <div className={styles["upload-box"]}>
              <p>Upload Photos</p>
            </div>

            <div className={styles["priority-grid"]}>

              <label>
                <input type="radio" name="priority" />
                Low
              </label>

              <label>
                <input type="radio" name="priority" />
                Medium
              </label>

              <label>
                <input type="radio" name="priority" />
                Urgent
              </label>

            </div>

            <div className={styles["button-row"]}>

              <button className={styles["submit-btn"]}>
                Submit Complaint
              </button>

              <button className={styles["cancel-btn"]}>
                Cancel
              </button>

            </div>

          </div>

          {/* Sidebar */}
          <div className={styles["sidebar"]}>

            <h3>My Recent Reports</h3>

            <div className={styles["report-item"]}>
              <p>AC not cooling properly</p>
              <small>In Progress • 2 days ago</small>
            </div>

            <div className={styles["report-item"]}>
              <p>Broken tiles in bathroom</p>
              <small>Resolved • Oct 12</small>
            </div>

            <div className={styles["report-item"]}>
              <p>Front door lock stuck</p>
              <small>Open • Just now</small>
            </div>

            <div className={styles["help-card"]}>
              <h4>Need urgent help?</h4>
              <p>Call our 24/7 emergency hotline.</p>
              <button>Call (555) 0123-456</button>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Complaints;