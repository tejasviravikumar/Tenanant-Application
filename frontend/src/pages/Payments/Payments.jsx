import styles from "./Payments.module.css";

function Payments() {
  return (
    <div className={styles["payments-page"]}>

      {/* Page Title */}
      <div className={styles["page-header"]}>
        <h1>Rent Payments</h1>
        <p>Manage your monthly dues and view billing history</p>
      </div>

      <div className={styles["payments-grid"]}>

        {/* LEFT COLUMN */}
        <div className={styles["payments-left"]}>

          {/* Payment Summary */}
          <div className={`${styles.card} ${styles["payment-summary"]}`}>
            <div className={styles["summary-info"]}>
              <p className={styles["due-date"]}>Next Due: Oct 5, 2024</p>
              <h2 className={styles["rent-amount"]}>₹15,000</h2>

              <div className={styles["summary-tags"]}>
                <span className={`${styles.tag} ${styles.success}`}>Pending: ₹0</span>
                <span className={`${styles.tag} ${styles.neutral}`}>Last Paid: Sep 3, 2024</span>
              </div>
            </div>

            <div className={styles["summary-actions"]}>
              <button className={styles["pay-btn"]}>Pay Rent</button>
              <button className={styles["breakdown-btn"]}>View Breakdown</button>
            </div>
          </div>

          {/* Reminder */}
          <div className={styles["reminder-card"]}>
            <div>
              <h3>Upcoming Payment Reminder</h3>
              <p>
                Next rent due in 12 days. Please ensure funds are available in
                your linked UPI account.
              </p>
            </div>

            <button className={styles["dismiss-btn"]}>Dismiss</button>
          </div>

          {/* Payment History */}
          <div className={`${styles.card} ${styles["history-card"]}`}>
            <div className={styles["history-header"]}>
              <h3>Payment History</h3>
              <button className={styles["filter-btn"]}>Filter</button>
            </div>

            <table className={styles["payment-table"]}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Receipt</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>September 2024</td>
                  <td>₹15,000</td>
                  <td>
                    <span className={`${styles.status} ${styles.paid}`}>Paid</span>
                  </td>
                  <td>Sep 3, 2024</td>
                  <td>Download</td>
                </tr>

                <tr>
                  <td>August 2024</td>
                  <td>₹15,000</td>
                  <td>
                    <span className={`${styles.status} ${styles.paid}`}>Paid</span>
                  </td>
                  <td>Aug 2, 2024</td>
                  <td>Download</td>
                </tr>

                <tr>
                  <td>July 2024</td>
                  <td>₹15,000</td>
                  <td>
                    <span className={`${styles.status} ${styles.paid}`}>Paid</span>
                  </td>
                  <td>Jul 5, 2024</td>
                  <td>Download</td>
                </tr>

                <tr>
                  <td>June 2024</td>
                  <td>₹15,000</td>
                  <td>
                    <span className={`${styles.status} ${styles.late}`}>Late Paid</span>
                  </td>
                  <td>Jun 10, 2024</td>
                  <td>Download</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className={styles["payments-right"]}>

          {/* Payment Method */}
          <div className={styles.card}>
            <h3>Payment Method</h3>

            <div className={styles["payment-method"]}>
              <p className={styles["method-title"]}>Current Method</p>
              <p className={styles["method-value"]}>UPI (rajesh.k@upi)</p>
            </div>

            <button className={styles["change-method-btn"]}>
              Change Method
            </button>
          </div>

          {/* AutoPay */}
          <div className={styles.card}>
            <h3>Auto-Pay</h3>
            <p>
              Never miss a payment. Rent will be automatically deducted
              on the 1st of every month.
            </p>
          </div>

          {/* Support */}
          <div className={styles["support-card"]}>
            <h3>Need help?</h3>
            <p>
              If you're having trouble making a payment,
              contact building management.
            </p>

            <button>Contact Support</button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Payments;