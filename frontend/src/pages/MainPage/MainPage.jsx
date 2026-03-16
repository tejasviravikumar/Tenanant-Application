import { useState, useEffect } from "react";
import styles from "./MainPage.module.css";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Wallet,
  Clock,
  BadgeCheck,
  AlertCircle,
  CreditCard,
  Wrench,
  Droplets,
  Wind,
  Plus,
  Download,
  CheckCircle2,
  History,
  Send,
} from "lucide-react";

function MainPage() {
  const navigate = useNavigate();

  const [user, setUser]         = useState(null);
  const [payments, setPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading]   = useState(true);

  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = fetch("http://localhost:8080/api/profile", {
      headers: authHeaders,
    }).then((res) => {
      if (res.status === 401) { navigate("/login"); return null; }
      return res.json();
    });

    const fetchPayments = fetch("http://localhost:8080/api/payments", {
      headers: authHeaders,
    }).then((res) => res.json());

    const fetchMaintenance = fetch("http://localhost:8080/api/maintenance", {
      headers: authHeaders,
    }).then((res) => res.json());

    Promise.all([fetchProfile, fetchPayments, fetchMaintenance])
      .then(([profileData, paymentsData, maintenanceData]) => {
        if (profileData) setUser(profileData.user || null);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        setMaintenance(Array.isArray(maintenanceData) ? maintenanceData : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading dashboard…</div>;
  }

  const apartment = user?.apartment ?? {};

  // Latest unpaid rent entry (if any)
  const unpaidRent = payments.find((p) => p.rentPaid === false);

  // Next due date — from unpaid record's lastDateToPay, or auto-calculate as 5th of next month
  const nextDueDate = unpaidRent?.lastDateToPay
    ? new Date(unpaidRent.lastDateToPay).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 5)
          .toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
          });
      })();

  // Pending dues = sum of unpaid rent + maintenance amounts
  const pendingDues = payments
    .filter((p) => p.rentPaid === false || p.maintenancePaid === false)
    .reduce((sum, p) => {
      let amt = 0;
      if (!p.rentPaid) amt += p.rentAmount ?? 0;
      if (!p.maintenancePaid) amt += p.maintenanceFee ?? 0;
      return sum + amt;
    }, 0);

  // Backend already returns: unpaid first, then 5 most recent paid — use as-is
  const last6MonthsPayments = payments;

  // Only show the 2 most recent maintenance requests on the dashboard
  const recentMaintenance = maintenance.slice(0, 2);

  // Category → icon mapping
  const categoryIcon = (category = "") => {
    const c = category.toLowerCase();
    if (c.includes("water") || c.includes("plumb") || c.includes("leak")) return <Droplets size={18} strokeWidth={1.8} />;
    if (c.includes("ac") || c.includes("air") || c.includes("hvac")) return <Wind size={18} strokeWidth={1.8} />;
    return <Wrench size={18} strokeWidth={1.8} />;
  };

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        })
      : "—";

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles["hero-content"]}>
          <h1>Welcome back, {user?.firstname ?? "Tenant"}!</h1>
          <div className={styles["hero-meta"]}>
            <span>
              <MapPin size={14} strokeWidth={2} />
              {apartment.propertyName ?? "—"}, Unit {apartment.apartmentNumber ?? "—"}
            </span>
            <span>
              <CalendarDays size={14} strokeWidth={2} />
              Move-in:{" "}
              {apartment.leaseStart
                ? new Date(apartment.leaseStart).toLocaleDateString("en-IN", {
                    month: "short", year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <span className={styles["hero-badge"]}>ACTIVE TENANT</span>
        </div>
      </section>

      {/* ── Rent Summary Strip ── */}
      <div className={styles["rent-summary"]}>

        <div className={styles["rent-item"]}>
          <div className={styles["rent-item-top"]}>
            <span className={styles["rent-item-icon"]}><Wallet size={16} strokeWidth={2} /></span>
            <span className={styles["rent-label"]}>Monthly Rent</span>
          </div>
          <span className={styles["rent-value"]}>
            ₹{apartment.monthlyRent?.toLocaleString("en-IN") ?? "—"}
          </span>
        </div>

        <div className={styles["rent-item"]}>
          <div className={styles["rent-item-top"]}>
            <span className={styles["rent-item-icon"]}><CalendarDays size={16} strokeWidth={2} /></span>
            <span className={styles["rent-label"]}>Next Due Date</span>
          </div>
          <span className={styles["rent-value"]}>{nextDueDate}</span>
        </div>

        <div className={styles["rent-item"]}>
          <div className={styles["rent-item-top"]}>
            <span className={styles["rent-item-icon"]}><BadgeCheck size={16} strokeWidth={2} /></span>
            <span className={styles["rent-label"]}>Advance Paid</span>
          </div>
          <span className={styles["rent-value"]}>
            ₹{apartment.advancePaid?.toLocaleString("en-IN") ?? "—"}
          </span>
        </div>

        <div className={styles["rent-item"]}>
          <div className={styles["rent-item-top"]}>
            <span className={styles["rent-item-icon"]}><AlertCircle size={16} strokeWidth={2} /></span>
            <span className={styles["rent-label"]}>Pending Dues</span>
          </div>
          <span className={styles["rent-value"]}>
            ₹{pendingDues.toLocaleString("en-IN")}
          </span>
        </div>

      </div>

      {/* ── Dashboard ── */}
      <div className={styles.dashboard}>

        {/* Current Month Rent */}
        <div className={styles["rent-status"]}>
          <div className={styles["rent-title"]}>
            <span className={styles["card-heading"]}>
              <span className={styles["section-icon"]}><CreditCard size={16} strokeWidth={2.5} /></span>
              Current Month Rent
            </span>
          </div>

          <div className={styles["rent-body"]}>
            <div className={styles["rent-info"]}>
              <span className={styles["rent-amount"]}>
                ₹{(unpaidRent?.rentAmount ?? apartment.monthlyRent ?? 0).toLocaleString("en-IN")}
              </span>
              <span className={styles["rent-payment-status"]}>
                {unpaidRent ? "UNPAID" : "PAID"}
              </span>
            </div>

            {unpaidRent && (
              <div className={styles["rent-due-note"]}>
                <AlertCircle size={15} strokeWidth={2} className={styles["rent-due-icon"]} />
                Rent due by <strong>&nbsp;{nextDueDate}&nbsp;</strong> to avoid late fees
              </div>
            )}

            {unpaidRent && (
              <button
                className={styles["rent-pay-btn"]}
                onClick={() => navigate("/payments")}
              >
                <Send size={15} strokeWidth={2.5} />
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className={styles["maintenance-section"]}>
          <div className={styles["maintenance-header"]}>
            <span className={styles["card-heading"]}>
              <span className={styles["section-icon"]}><Wrench size={16} strokeWidth={2.5} /></span>
              Maintenance Requests
            </span>
            <button
              className={styles["maintenance-add-btn"]}
              onClick={() => navigate("/maintenance")}
            >
              <Plus size={14} strokeWidth={2.5} />
              Raise New Complaint
            </button>
          </div>

          <div className={styles["maintenance-body"]}>
            {recentMaintenance.length === 0 ? (
              <p className={styles["no-data"]}>No maintenance requests yet.</p>
            ) : (
              recentMaintenance.map((req) => (
                <div className={styles["maintenance-card"]} key={req.id}>
                  <div className={styles["maintenance-card-icon"]}>
                    {categoryIcon(req.category)}
                  </div>
                  <div className={styles["maintenance-card-body"]}>
                    <span className={styles["maintenance-description"]}>{req.issue}</span>
                    <span className={styles["submitted-on"]}>
                      Submitted on {formatDate(req.submittedDate)}
                    </span>
                  </div>
                  <span
                    className={`${styles["maintenance-status"]} ${
                      req.status === "RESOLVED" ? styles["resolved"] : styles["open"]
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── Payment History ── */}
      <div className={styles["payment-table-wrapper"]}>

        <div className={styles["payment-table-header"]}>
          <span className={styles["card-heading"]}>
            <span className={styles["section-icon"]}><History size={16} strokeWidth={2.5} /></span>
            Payment History <span style={{ fontWeight: 400, fontSize: "0.8rem", opacity: 0.6 }}>(Last 6 months)</span>
          </span>
        </div>

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
            {last6MonthsPayments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem", opacity: 0.5 }}>
                  No payment records found.
                </td>
              </tr>
            ) : (
              last6MonthsPayments.map((p) => {
                const total =
                  (p.rentAmount ?? 0) +
                  (p.maintenanceFee ?? 0) +
                  (p.additionalFee ?? 0);
                const isPaid = p.rentPaid && p.maintenancePaid;
                return (
                  <tr key={p.id}>
                    <td>{p.month ?? "—"}</td>
                    <td>₹{total.toLocaleString("en-IN")}</td>
                    <td>
                      {isPaid ? (
                        <span className={styles.paid}>
                          <CheckCircle2 size={13} strokeWidth={2.5} /> Paid
                        </span>
                      ) : (
                        <span className={styles.unpaid}>Unpaid</span>
                      )}
                    </td>
                    <td>{p.paymentDate ? formatDate(p.paymentDate) : "—"}</td>
                    <td>
                      {isPaid ? (
                        <button className={styles["receipt-btn"]}>
                          <Download size={14} strokeWidth={2.2} />
                        </button>
                      ) : (
                        <span style={{ opacity: 0.35, fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

      </div>

    </div>
  );
}

export default MainPage;