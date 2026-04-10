import { useState, useEffect, useRef } from "react";
import styles from "./Payments.module.css";
import {
  CreditCard,
  Download,
  ChevronRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null);

  // 🔥 NEW: instant lock (fix spam clicking)
  const isProcessing = useRef(false);

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  // ── Fetch Payments ─────────────────────────────────────────
  const loadPayments = () =>
    fetch("http://localhost:8080/api/payments", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return null;
        }
        if (!res.ok) throw new Error(`Failed to load payments (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (data) setPayments(data);
      });

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    loadPayments()
      .catch((err) => {
        console.error(err);
        setError("Could not load payments.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Derived Data ───────────────────────────────────────────
 const getNextMonth = () => {
  const now = new Date();
  return now.toLocaleString("en-IN", { month: "long", year: "numeric" });
};

let nextDue = payments.find((p) => !p.rentPaid);

// 🔥 fallback if no unpaid found
if (!nextDue) {
  const currentMonth = getNextMonth();

  nextDue = {
    month: currentMonth,
    rentAmount: payments[0]?.rentAmount || 0,
    maintenanceFee: payments[0]?.maintenanceFee || 0,
    additionalFee: 0,
    rentPaid: false,
    maintenancePaid: false,
    lastDateToPay: new Date(),
  };
}

  const totalDue = nextDue
    ? (nextDue.rentAmount || 0) +
      (nextDue.maintenancePaid ? 0 : nextDue.maintenanceFee || 0) +
      (nextDue.additionalFee || 0)
    : 0;

  const pendingAmount = payments
    .filter((p) => !p.rentPaid)
    .reduce(
      (sum, p) =>
        sum +
        (p.rentAmount || 0) +
        (!p.maintenancePaid ? p.maintenanceFee || 0 : 0) +
        (p.additionalFee || 0),
      0
    );

  const lastPaid = payments.find((p) => p.rentPaid && p.paymentDate);

  // ── FIXED Pay Handler ──────────────────────────────────────
  const handlePayRent = async (payment) => {
    // 🚫 HARD LOCK
    if (!payment || isProcessing.current) return;

    isProcessing.current = true;
    setPayingId(payment.id);

    try {
      const res = await fetch("http://localhost:8080/api/payments", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          month: payment.month,
          lastDateToPay: payment.lastDateToPay,
          rentAmount: payment.rentAmount,
          rentPaid: true,
          maintenanceFee: payment.maintenanceFee,
          maintenancePaid: true,
          additionalFee: payment.additionalFee,
        }),
      });

      // ✅ FIX: match backend response
      if (res.status === 400) {
        alert("Already paid for this month.");
        return;
      }

      if (!res.ok) throw new Error("Payment failed");

      // Refresh UI
      await loadPayments();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    } finally {
      isProcessing.current = false;
      setPayingId(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amt) =>
    amt == null ? "₹0" : `₹${Number(amt).toLocaleString("en-IN")}`;

  const getStatus = (payment) => {
    if (!payment.rentPaid)
      return { label: "Unpaid", cls: styles.statusUnpaid };

    if (payment.paymentDate && payment.lastDateToPay) {
      if (new Date(payment.paymentDate) > new Date(payment.lastDateToPay)) {
        return { label: "Late Paid", cls: styles.statusLate };
      }
    }

    return { label: "Paid", cls: styles.statusPaid };
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading)
    return (
      <div className={styles.loading}>
        <span className={styles.loadingDot} />Loading payments…
      </div>
    );

  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Rent Payments</h1>
          <p className={styles.subtitle}>
            Manage your monthly dues and view billing history
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          {/* ── Due Card ── */}
          <div className={styles.dueCard}>
            {nextDue ? (
              <>
                <div className={styles.dueTop}>
                  <span className={styles.dueLabel}>
                    <Calendar size={13} strokeWidth={2.5} />
                    NEXT DUE:{" "}
                    {nextDue.lastDateToPay
                      ? formatDate(nextDue.lastDateToPay).toUpperCase()
                      : "—"}
                  </span>
                </div>

                <div className={styles.dueMiddle}>
                  <div className={styles.dueAmount}>
                    {formatAmount(totalDue)}
                  </div>

                  <button
                    className={styles.payBtn}
                    onClick={() => handlePayRent(nextDue)}
                    disabled={
                      isProcessing.current ||
                      payingId !== null ||
                      nextDue.rentPaid
                    }
                  >
                    <CreditCard size={17} />
                    {payingId === nextDue.id
                      ? "Processing…"
                      : "Pay Rent"}
                  </button>
                </div>

                <div className={styles.dueMeta}>
                  <span className={styles.pendingChip}>
                    <CheckCircle2 size={14} />
                    Pending: {formatAmount(pendingAmount)}
                  </span>

                  <span className={styles.lastPaid}>
                    <Calendar size={13} />
                    Last Paid:{" "}
                    {lastPaid
                      ? formatDate(lastPaid.paymentDate)
                      : "—"}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.allClear}>
                <CheckCircle2 size={36} />
                <div>
                  <p className={styles.allClearTitle}>
                    All payments up to date!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── History Table ── */}
          <div className={styles.historyCard}>
            <h3>Payment History</h3>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((p) => {
                  const status = getStatus(p);
                  const total =
                    (p.rentAmount || 0) +
                    (p.maintenanceFee || 0) +
                    (p.additionalFee || 0);

                  return (
                    <tr key={p.id}>
                      <td>{p.month}</td>
                      <td>{formatAmount(total)}</td>
                      <td>
                        <span className={status.cls}>
                          {status.label}
                        </span>
                      </td>
                      <td>{formatDate(p.paymentDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button
              className={styles.viewAllBtn}
              onClick={async () => {
                try {
                  const res = await fetch(
                    "http://localhost:8080/api/payments/all",
                    { headers: authHeaders() }
                  );
                  const data = await res.json();
                  setPayments(data);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              View Full Payment History <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;