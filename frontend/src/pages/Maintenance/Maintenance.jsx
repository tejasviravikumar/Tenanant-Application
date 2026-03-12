import styles from "./Maintenance.module.css";

export default function Maintenance() {
  return (
    <div className={styles["maintenance-page"]}>

      <main className={styles["main-content"]}>

        {/* Overview Cards */}
        <div className={styles["overview-grid"]}>

          <div className={styles["overview-card"]}>
            <p>Total Requests</p>
            <h2>14</h2>
          </div>

          <div className={styles["overview-card"]}>
            <p>Open</p>
            <h2 className={styles.primary}>3</h2>
          </div>

          <div className={styles["overview-card"]}>
            <p>In Progress</p>
            <h2 className={styles.warning}>2</h2>
          </div>

          <div className={styles["overview-card"]}>
            <p>Resolved</p>
            <h2 className={styles.success}>9</h2>
          </div>

        </div>

        <div className={styles["maintenance-layout"]}>

          {/* Raise Complaint */}
          <div className={styles["complaint-box"]}>
            <h3>Raise a New Request</h3>

            <form className={styles["complaint-form"]}>

              <input placeholder="Complaint Title" type="text" />

              <select>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>HVAC / AC</option>
                <option>Appliances</option>
                <option>General Repair</option>
              </select>

              <textarea
                placeholder="Tell us more about the problem..."
                rows="4"
              ></textarea>

              <button type="button" className={styles["submit-btn"]}>
                Submit Request
              </button>

            </form>
          </div>

          {/* Active Requests */}
          <div className={styles["requests-section"]}>

            <h3>Active Requests</h3>

            <div className={styles["request-card"]}>
              <h4>Kitchen Sink Leakage</h4>
              <span className={styles["status-progress"]}>In Progress</span>

              <p>
                Water is dripping from the pipe under the sink causing a puddle.
              </p>

              <small>Submitted Oct 24, 2023</small>
            </div>

            <div className={styles["request-card"]}>
              <h4>Flickering Living Room Lights</h4>
              <span className={styles["status-open"]}>Open</span>

              <p>Main chandelier flickers constantly.</p>

              <small>Submitted Oct 25, 2023</small>
            </div>

          </div>

        </div>

        {/* Maintenance History */}
        <div className={styles["history-section"]}>

          <div className={styles["history-header"]}>
            <h3>Maintenance History</h3>
            <button className={styles["download-btn"]}>Download PDF</button>
          </div>

          <table className={styles["history-table"]}>

            <thead>
              <tr>
                <th>Issue</th>
                <th>Category</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Resolved</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>Broken Door Handle</td>
                <td>General</td>
                <td className={styles.success}>Resolved</td>
                <td>Sep 12 2023</td>
                <td>Sep 14 2023</td>
              </tr>

              <tr>
                <td>AC Filter Replacement</td>
                <td>HVAC</td>
                <td className={styles.success}>Resolved</td>
                <td>Aug 20 2023</td>
                <td>Aug 20 2023</td>
              </tr>

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}