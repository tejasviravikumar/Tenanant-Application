import { useState } from "react";
import styles from "./Parking.module.css";

// ── Icons (inline SVG to avoid external deps) ──────────────────────────────
const CarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="8" width="22" height="10" rx="2"/>
    <path d="M5 18v2M19 18v2"/>
    <path d="M6 8l2-4h8l2 4"/>
    <circle cx="8" cy="14" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

const MapIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="#fef3c7"/>
    <circle cx="12" cy="8" r="1.2" fill="#f59e0b"/>
    <rect x="11" y="11" width="2" height="6" rx="1" fill="#f59e0b"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────
const SLOTS = [
  { id: "V01", status: "available" },
  { id: "V02", status: "booked" },
  { id: "V03", status: "available" },
  { id: "V04", status: "available" },
];

const RECENT_BOOKINGS = [
  {
    id: 1,
    date: "Oct 24, 2023",
    time: "14:00 - 18:00",
    vehicle: "KA 03 MG 4421",
    type: "Guest Sedan",
    slot: "V02",
    status: "Upcoming",
  },
  {
    id: 2,
    date: "Oct 22, 2023",
    time: "10:00 - 12:00",
    vehicle: "TN 05 R 1102",
    type: "Guest Hatchback",
    slot: "V04",
    status: "Completed",
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function Parking() {
  const [selectedSlot, setSelectedSlot] = useState("V01");
  const [form, setForm] = useState({
    date: "",
    vehicleType: "Car",
    startTime: "",
    endTime: "",
    visitorVehicleNo: "",
  });

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBooking = () => {
    alert(`Booking confirmed!\nSlot: ${selectedSlot}\nVehicle: ${form.visitorVehicleNo || "—"}`);
  };

  return (
    <div className={styles.page}>
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Parking Management</h1>
          <p>Manage your primary slot and book temporary spots for visitors.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnViewMap}>
            <MapIcon /> View Map
          </button>
          <button className={styles.btnNewBooking}>
            <PlusIcon /> New Booking
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className={styles.mainGrid}>
        {/* ── Left Column ── */}
        <div className={styles.leftColumn}>
          {/* Allocated Slot Card */}
          <div className={styles.slotCard}>
            <div className={styles.slotIconRow}>
              <div className={styles.slotIcon}>
                <CarIcon />
              </div>
              <span className={styles.badgeActive}>ACTIVE</span>
            </div>
            <div className={styles.slotLabel}>Allocated Parking</div>
            <div className={styles.slotName}>Slot P12</div>
            <div className={styles.slotLocation}>Basement 1 • North Wing</div>
            <div className={styles.vehicleChip}>
              <span className={styles.vehicleChipIcon}><PinIcon /></span>
              <div className={styles.vehicleChipText}>
                <strong>TN 09 AB 1234</strong>
                <span>Registered SUV</span>
              </div>
            </div>
            <button className={styles.btnUpdate}>Update Vehicle Details</button>
          </div>

          {/* Parking Regulations */}
          <div className={styles.regulationsCard}>
            <div className={styles.regulationsTitle}>
              <InfoIcon />
              Parking Regulations
            </div>
            <ul className={styles.regulationsList}>
              <li><span className={styles.dot}></span>Only one permanent slot is allocated per apartment unit.</li>
              <li><span className={styles.dot}></span>Visitor parking must be booked at least 2 hours in advance.</li>
              <li><span className={styles.dot}></span>Unauthorized vehicles in residential slots are subject to towing.</li>
              <li><span className={styles.dot}></span>Maximum visitor booking duration is 24 hours per session.</li>
            </ul>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className={styles.rightColumn}>
          {/* Book Visitor Parking */}
          <div className={styles.bookCard}>
            <div className={styles.bookCardHeader}>
              <h2>Book Visitor Parking</h2>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendDotAvailable}`}></div>
                  Available
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.legendDotBooked}`}></div>
                  Booked
                </div>
              </div>
            </div>

            <div className={styles.bookForm}>
              {/* Date */}
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} />
              </div>

              {/* Vehicle Type */}
              <div className={styles.formGroup}>
                <label>Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={handleFormChange}>
                  <option>Car</option>
                  <option>SUV</option>
                  <option>Bike</option>
                  <option>Van</option>
                </select>
              </div>

              {/* Slot Selector — spans rows 1-2, col 3 */}
              <div className={styles.slotSelector}>
                <div className={styles.slotSelectorLabel}>Select Available Slot</div>
                <div className={styles.slotGrid}>
                  {SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      className={`${styles.slotBtn} ${
                        slot.status === "booked"
                          ? styles.slotBtnBooked
                          : selectedSlot === slot.id
                          ? `${styles.slotBtnAvailable} ${styles.selected}`
                          : styles.slotBtnAvailable
                      }`}
                      disabled={slot.status === "booked"}
                      onClick={() => slot.status === "available" && setSelectedSlot(slot.id)}
                    >
                      <span className={styles.slotBtnName}>{slot.id}</span>
                      <span className={styles.slotBtnStatus}>
                        {slot.status === "booked" ? "BOOKED" : "AVAILABLE"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Time */}
              <div className={styles.formGroup}>
                <label>Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleFormChange} />
              </div>

              {/* End Time */}
              <div className={styles.formGroup}>
                <label>End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleFormChange} />
              </div>

              {/* Visitor Vehicle No */}
              <div className={`${styles.formGroup} ${styles.visitorVehicleRow}`}>
                <label>Visitor Vehicle No</label>
                <input
                  type="text"
                  name="visitorVehicleNo"
                  placeholder="e.g. TN 01 XY 9999"
                  value={form.visitorVehicleNo}
                  onChange={handleFormChange}
                />
              </div>

              {/* Book Button */}
              <button className={styles.btnBook} onClick={handleBooking}>
                Book Visitor Parking
              </button>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className={styles.recentCard}>
            <div className={styles.recentHeader}>
              <h2>Recent Bookings</h2>
              <span className={styles.viewHistory}>View History</span>
            </div>
            <table className={styles.bookingsTable}>
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Vehicle Details</th>
                  <th>Slot</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_BOOKINGS.map((booking) => (
                  <tr key={booking.id}>
                    <td className={styles.dateTimeCell}>
                      <strong>{booking.date}</strong>
                      <span>{booking.time}</span>
                    </td>
                    <td className={styles.vehicleCell}>
                      <strong>{booking.vehicle}</strong>
                      <span>{booking.type}</span>
                    </td>
                    <td>
                      <span className={styles.slotLink}>{booking.slot}</span>
                    </td>
                    <td>
                      {booking.status === "Upcoming" ? (
                        <span className={styles.badgeUpcoming}>Upcoming</span>
                      ) : (
                        <span className={styles.badgeCompleted}>Completed</span>
                      )}
                    </td>
                    <td>
                      {booking.status === "Upcoming" ? (
                        <button className={styles.btnCancel}>
                          <XCircleIcon /> Cancel
                        </button>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <span>© 2023 Premium Residences Management. All rights reserved.</span>
        <div className={styles.footerLinks}>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Help Center</a>
        </div>
      </div>
    </div>
  );
}