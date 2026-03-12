import styles from "./MainPage.module.css";
import { useNavigate } from "react-router-dom";

function MainPage(){
    const navigate = useNavigate();

    return(
        <>
            <section className={styles["hero"]}>
                <div className={styles["hero-content"]}>
                    <h1>Welcome back,Rajesh!</h1>
                    <span>Skyview Apartments,Unit 402</span>
                    <span>Move-in: Jan 2024</span>
                </div>
            </section>


            <div className={styles["rent-summary"]}>
                <div className={styles["rent-item"]}>
                    <span className={styles["rent-label"]}>Monthly Rent</span>
                    <span className={styles["rent-value"]}>₹25,000</span>
                </div>

                <div className={styles["rent-item"]}>
                    <span className={styles["rent-label"]}>Next Due Date</span>
                    <span className={styles["rent-value"]}>April 5, 2026</span>
                </div>

                <div className={styles["rent-item"]}>
                    <span className={styles["rent-label"]}>Advance Paid</span>
                    <span className={styles["rent-value"]}>₹45,000</span>
                </div>

                <div className={styles["rent-item"]}>
                    <span className={styles["rent-label"]}>Pending Dues</span>
                    <span className={styles["rent-value"]}>₹0</span>
                </div>
            </div>


            <section className={styles["dashboard"]}>

                <div className={styles["rent-status"]}>
                    <div className={styles["rent-title"]}>Current Month Rent</div>

                    <div className={styles["rent-info"]}>
                        <span className={styles["rent-amount"]}>₹25,000</span>
                        <span className={styles["rent-payment-status"]}>Unpaid</span>
                    </div>

                    <span className={styles["rent-due-note"]}>
                        Rent due by April 5th to avoid late fees
                    </span>

                    <button className={styles["rent-pay-btn"]}>Pay Now</button>
                </div>


                <div className={styles["maintenance-section"]}>

                    <div className={styles["maintenance-header"]}>
                        <span className={styles["maintenance-title"]}>Maintenance Requests</span>

                        <button
                            className={styles["maintenance-add-btn"]}
                            onClick={() => navigate("/raiseComplaints")}
                        >
                            + Raise New Complaint
                        </button>
                    </div>


                    <div className={styles["maintenance-card"]}>
                        <span className={styles["maintenance-description"]}>
                            Leaking Kitchen tap <br/>
                            <span className={styles["submitted-on"]}>
                                Submitted on Sep 24, 2025
                            </span>
                        </span>

                        <span className={`${styles["maintenance-status"]} ${styles["open"]}`}>
                            OPEN
                        </span>
                    </div>


                    <div className={styles["maintenance-card"]}>
                        <span className={styles["maintenance-description"]}>
                            Bedroom AC not cooling <br/>
                            <span className={styles["submitted-on"]}>
                                Submitted on Aug 12, 2025
                            </span>
                        </span>

                        <span className={`${styles["maintenance-status"]} ${styles["resolved"]}`}>
                            RESOLVED
                        </span>
                    </div>

                </div>

            </section>


            <table className={styles["payment-table"]}>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Receipt</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>September 2024</td>
                        <td>₹15,000</td>
                        <td>● Paid</td>
                        <td>Sep 03, 2024</td>
                        <td>⬇</td>
                    </tr>

                    <tr>
                        <td>August 2024</td>
                        <td>₹15,000</td>
                        <td className={styles["paid"]}>● Paid</td>
                        <td>Aug 04, 2024</td>
                        <td>⬇</td>
                    </tr>

                    <tr>
                        <td>July 2024</td>
                        <td>₹15,000</td>
                        <td className={styles["paid"]}>● Paid</td>
                        <td>Jul 02, 2024</td>
                        <td>⬇</td>
                    </tr>
                </tbody>

            </table>

        </>
    );
}

export default MainPage;