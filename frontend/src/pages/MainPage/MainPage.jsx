import "./MainPage.css"
function MainPage(){
    return(
        <>
            <section className="hero">
                <div className="hero-content">
                <h1>Welcome back,Rajesh!</h1>
                <span>Skyview Apartments,Unit 402</span>
                <span>Move-in: Jan 2024</span>
                </div>
            </section>


            <div className="rent-summary">
                <div className="rent-item">
                    <span className="rent-label">Monthly Rent</span>
                    <span className="rent-value">₹25,000</span>
                </div>
                <div className="rent-item">
                    <span className="rent-label">Next Due Date</span>
                    <span className="rent-value">April 5, 2026</span>
                </div>
                <div className="rent-item">
                    <span className="rent-label">Advance Paid</span>
                    <span className="rent-value">₹45,000</span>
                </div>
                <div className="rent-item">
                    <span className="rent-label">Pending Dues</span>
                    <span className="rent-value">₹0</span>
                </div>
            </div>

            <section className="dashboard">

                <div className="rent-status">
                    <div className="rent-title">Current Month Rent</div>

                    <div className="rent-info">
                        <span className="rent-amount">₹25,000</span>
                        <span className="rent-payment-status">Unpaid</span>
                    </div>

                    <span className="rent-due-note">
                        Rent due by April 5th to avoid late fees
                    </span>

                    <button className="rent-pay-btn">Pay Now</button>
                </div>


                <div className="maintenance-section">

                    <div className="maintenance-header">
                        <span className="maintenance-title">Maintenance Requests</span>
                        <button className="maintenance-add-btn">+ Raise New Complaint</button>
                    </div>

                    <div className="maintenance-card">
                        <span className="maintenance-description">
                            Leaking Kitchen tap <br/>
                            <span className="submitted-on">Submitted on Sep 24, 2025</span>
                        </span>
                        <span className="maintenance-status open">OPEN</span>
                    </div>

                    <div className="maintenance-card">
                        <span className="maintenance-description">
                            Bedroom AC not cooling <br/>
                            <span className="submitted-on">Submitted on Aug 12, 2025</span>
                        </span>
                        <span className="maintenance-status resolved">RESOLVED</span>
                    </div>

                </div>

            </section>

            <table className="payment-table">
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
                        <td className="paid">● Paid</td>
                        <td>Aug 04, 2024</td>
                        <td>⬇</td>
                    </tr>

                    <tr>
                        <td>July 2024</td>
                        <td>₹15,000</td>
                        <td className="paid">● Paid</td>
                        <td>Jul 02, 2024</td>
                        <td>⬇</td>
                    </tr>
                </tbody>
            </table>

        </>
        
    );
}

export default MainPage