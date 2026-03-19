import React, { useState, useEffect } from "react";
import * as QRCode from "qrcode";
import styles from "./Parking.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// API LAYER — mirrors every other page in the app
// JwtFilter reads "Authorization: Bearer <token>" and sets Authentication
// authentication.getName() in the controller returns the email
// ─────────────────────────────────────────────────────────────────────────────
const API = "/api/parking";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { ...authHeaders(), ...(opts.headers || {}) },
    });
    if (!res.ok) {
      console.error(`[Parking] ${path} → HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[Parking] ${path} failed:`, err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIXED SLOT ALLOCATIONS
// Each apartment has ONE permanent allocated slot (residential).
// Visitor slots (V-01 to V-05) are for guest bookings only.
// This mirrors the real parking_bookings fixture in ParkingService.java
// and your actual userdetails / apartment table data.
// ─────────────────────────────────────────────────────────────────────────────
const PERMANENT_SLOTS = [
  // Residential slots — one per apartment (fixed, cannot be booked)
  { id:"A-101", zone:"Block A", floor:"Basement 1", status:"ASSIGNED", assignedTo:"Arjun Kumar",   unit:"Apt A101", note:null },
  { id:"A-102", zone:"Block A", floor:"Basement 1", status:"ASSIGNED", assignedTo:"Priya Sharma",  unit:"Apt A102", note:null },
  { id:"A-103", zone:"Block A", floor:"Basement 2", status:"ASSIGNED", assignedTo:"Rahul Verma",   unit:"Apt A103", note:null },
  { id:"A-104", zone:"Block A", floor:"Basement 2", status:"ASSIGNED", assignedTo:"Sneha Reddy",   unit:"Apt A104", note:null },
  { id:"A-105", zone:"Block A", floor:"Ground",     status:"ASSIGNED", assignedTo:"Karthik Iyer",  unit:"Apt A105", note:null },
  { id:"A-106", zone:"Block A", floor:"Ground",     status:"ASSIGNED", assignedTo:"Meera Nair",    unit:"Apt A106", note:null },
  // Visitor slots — bookable via "Assign Spot"
  { id:"V-01",  zone:"Visitor", floor:"Basement 1", status:"VACANT",   assignedTo:null,            unit:null,       note:null },
  { id:"V-02",  zone:"Visitor", floor:"Basement 1", status:"VACANT",   assignedTo:null,            unit:null,       note:null },
  { id:"V-03",  zone:"Visitor", floor:"Ground",     status:"VACANT",   assignedTo:null,            unit:null,       note:null },
  { id:"V-04",  zone:"Visitor", floor:"Ground",     status:"VACANT",   assignedTo:null,            unit:null,       note:null },
  { id:"V-05",  zone:"Visitor", floor:"Basement 2", status:"VACANT",   assignedTo:null,            unit:null,       note:null },
  // Maintenance slots
  { id:"P-01",  zone:"Block P", floor:"Ground",     status:"MAINTENANCE", assignedTo:null,         unit:null,       note:"Repairs Ongoing" },
  { id:"P-02",  zone:"Block P", floor:"Basement 1", status:"MAINTENANCE", assignedTo:null,         unit:null,       note:"Line marking" },
];

// Map apartmentNumber → their fixed residential slot id
const APT_TO_SLOT = {
  "A101": "A-101",
  "A102": "A-102",
  "A103": "A-103",
  "A104": "A-104",
  "A105": "A-105",
  "A106": "A-106",
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — only used when backend is unreachable
// ─────────────────────────────────────────────────────────────────────────────
const MOCK = {
  userDetails: {
    firstname: "Arjun", lastname: "Kumar",
    email: "arjun.kumar@email.com",
    phoneNumber: "9876500000",
    apartmentNumber: "A101",
  },
  apartment: {
    propertyName: "Skyview Apartments",
    apartmentNumber: "A101",
    leaseEnd: "2027-01-01",
    monthlyRent: 50000,
  },
  bookings: [
    { id:1, date:"Oct 24, 2024", timeFrom:"14:00", timeTo:"18:00", vehicleNumber:"KA 01 AB 1234", vehicleDesc:"Guest Sedan",    slotId:"V-01", status:"COMPLETED" },
    { id:2, date:"Nov 05, 2024", timeFrom:"09:00", timeTo:"11:00", vehicleNumber:"KA 03 MG 4421", vehicleDesc:"Delivery Van",   slotId:"V-02", status:"COMPLETED" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const FLOORS      = ["All Floors", "Ground", "Basement 1", "Basement 2"];
const FILTER_TABS = ["All Slots", "Vacant", "Assigned", "Maintenance"];

const SLOT_COLORS = {
  "A": "#2563eb",   // residential → blue
  "V": "#16a34a",   // visitor     → green
  "P": "#dc2626",   // maintenance → red
};
const slotColor = (id) => SLOT_COLORS[id?.[0]] || "#6b7280";

function statusCls(status) {
  return ({
    VACANT:"tagVacant", ASSIGNED:"tagAssigned", MAINTENANCE:"tagMaint",
    UPCOMING:"tagUpcoming", COMPLETED:"tagCompleted",
    CANCELLED:"tagCancelled", ACTIVE:"tagActive",
  }[status] || "");
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Parking() {

  const [userDetails, setUserDetails] = useState(null);
  const [apartment,   setApartment]   = useState(null);
  const [slots,       setSlots]       = useState(PERMANENT_SLOTS);
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [filterTab,   setFilterTab]   = useState("All Slots");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [mapOpen,     setMapOpen]     = useState(false);

  const EMPTY = { visitorName:"", vehicleNumber:"", vehicleDesc:"", date:"", duration:"1" };
  const [form,        setForm]        = useState(EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [pass,        setPass]        = useState(null);
  const [qrUrl,       setQrUrl]       = useState(null);
  const [cancelling,  setCancelling]  = useState(null);

  // ─── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([loadUser(), loadBookings()])
           .finally(() => setLoading(false));
  }, []);

  // After user loads, overlay live bookings on visitor slots
  useEffect(() => {
    if (bookings.length > 0) overlayLiveBookings(bookings);
  }, [bookings]);

  // GET /api/parking/user-details
  async function loadUser() {
    const data = await apiFetch("/user-details");
    if (data) {
      setUserDetails(data.userDetails);
      setApartment(data.apartment);
    } else {
      setUserDetails(MOCK.userDetails);
      setApartment(MOCK.apartment);
    }
  }

  // GET /api/parking/bookings/history
  // reads from parking_bookings table via ParkingRepository.findByApartmentIdOrdered()
  async function loadBookings() {
    const data = await apiFetch("/bookings/history");
    if (data) {
      setBookings(data.map(b => ({
        ...b,
        timeFrom:    b.timeFrom    || "—",
        timeTo:      b.timeTo      || "—",
        vehicleDesc: b.vehicleDesc || "",
        slotId:      b.slotId      || "—",
      })));
    } else {
      setBookings(MOCK.bookings);
    }
  }

  // Overlay UPCOMING/ACTIVE bookings onto the visitor slots so they show as ASSIGNED
  function overlayLiveBookings(bkgs) {
    const today = new Date().toISOString().split("T")[0];
    const active = bkgs.filter(b => b.status === "UPCOMING" || b.status === "ACTIVE");

    setSlots(PERMANENT_SLOTS.map(slot => {
      // Only visitor slots can be dynamically occupied
      if (!slot.id.startsWith("V-")) return slot;
      const liveBooking = active.find(b => b.slotId === slot.id);
      if (liveBooking) {
        return {
          ...slot,
          status:     "ASSIGNED",
          assignedTo: liveBooking.visitorName || "Visitor",
          unit:       liveBooking.vehicleNumber,
          note:       null,
        };
      }
      return { ...slot, status:"VACANT", assignedTo:null, unit:null };
    }));
  }

  // ─── Slot counts ──────────────────────────────────────────────────────────
  const counts = {
    "All Slots":  slots.length,
    Vacant:       slots.filter(s => s.status === "VACANT").length,
    Assigned:     slots.filter(s => s.status === "ASSIGNED").length,
    Maintenance:  slots.filter(s => s.status === "MAINTENANCE").length,
  };

  const visibleSlots = slots.filter(s => {
    const fl = floorFilter === "All Floors" || s.floor === floorFilter;
    const tb = filterTab === "All Slots"
            || (filterTab === "Vacant"      && s.status === "VACANT")
            || (filterTab === "Assigned"    && s.status === "ASSIGNED")
            || (filterTab === "Maintenance" && s.status === "MAINTENANCE");
    return fl && tb;
  });

  // ─── My allocated permanent slot ─────────────────────────────────────────
  const mySlotId   = APT_TO_SLOT[apartment?.apartmentNumber] || "—";
  const mySlotData = PERMANENT_SLOTS.find(s => s.id === mySlotId);

  // ─── Generate pass ────────────────────────────────────────────────────────
  // POST /api/parking/bookings/create
  // saves a row to parking_bookings, returns pass with qrContent
  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.visitorName || !form.vehicleNumber || !form.date) return;
    setFormLoading(true);

    const body = {
      visitorName:   form.visitorName,
      vehicleNumber: form.vehicleNumber,
      vehicleDesc:   form.vehicleDesc,
      date:          form.date,
      durationHours: parseInt(form.duration),
      // No spotId — ParkingService auto-assigns first free V- slot
    };

    const passData = await apiFetch("/bookings/create", {
      method: "POST",
      body:   JSON.stringify(body),
    });

    if (passData) {
      try {
        const url = await QRCode.toDataURL(passData.qrContent, {
          width: 220, margin: 2,
          color: { dark: "#1e293b", light: "#ffffff" },
        });
        setQrUrl(url);
      } catch (err) {
        console.error("QR error:", err);
      }
      setPass(passData);
      await loadBookings(); // refresh from DB
    } else {
      // Offline fallback
      const bookedAt  = new Date(form.date);
      const expiresAt = new Date(bookedAt.getTime() + parseInt(form.duration) * 3600000);
      const mockPass  = {
        passId:          "PASS-OFFLINE",
        spotId:          "V-01",
        tenantName:      `${userDetails?.firstname} ${userDetails?.lastname}`,
        apartmentNumber: apartment?.apartmentNumber,
        propertyName:    apartment?.propertyName,
        visitorName:     form.visitorName,
        vehicleNumber:   form.vehicleNumber,
        durationHours:   parseInt(form.duration),
        date:            bookedAt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
        validUntil:      expiresAt.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }),
        qrContent:       `PARKING PASS\nVisitor: ${form.visitorName}\nVehicle: ${form.vehicleNumber}\nSpot: V-01`,
      };
      try {
        const url = await QRCode.toDataURL(mockPass.qrContent, {
          width:220, margin:2, color:{dark:"#1e293b", light:"#ffffff"},
        });
        setQrUrl(url);
      } catch {}
      setPass(mockPass);
    }

    setFormLoading(false);
  }

  function downloadPass() {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `parking-pass-${pass?.passId || "pass"}.png`;
    a.click();
  }

  function resetDrawer() {
    setForm(EMPTY);
    setPass(null);
    setQrUrl(null);
    setDrawerOpen(false);
  }

  // PATCH /api/parking/bookings/{id}/cancel
  async function handleCancel(bookingId) {
    setCancelling(bookingId);
    await apiFetch(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status:"CANCELLED" } : b)
    );
    setCancelling(null);
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}/>
        <p>Loading Parking Management…</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Parking Management</h1>
          <p className={styles.pageSub}>Manage your primary slot and explore available parking inventory.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={() => setMapOpen(true)}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 18V5m0 0L9 7"/>
            </svg>
            View Map
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => { setDrawerOpen(true); setPass(null); setQrUrl(null); }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Assign Spot
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* ── Left sidebar ── */}
        <aside className={styles.leftCol}>

          {/* Allocated Slot Card */}
          <div className={styles.slotCard}>
            <div className={styles.slotCardTop}>
              <div className={styles.slotIcon}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h1l1-1V9l-2-3H9m3 10H9m0 0v-4m0 4H6m3-4V9"/>
                </svg>
              </div>
              <span className={styles.activeTag}>ACTIVE</span>
            </div>

            <p className={styles.slotLabel}>YOUR ALLOCATED SLOT</p>
            {/* Derived from apartmentNumber in userdetails table via APT_TO_SLOT map */}
            <h2 className={styles.slotNumber}>Slot {mySlotId}</h2>
            <p className={styles.slotSub}>
              {mySlotData?.floor || "Basement 1"} • {mySlotData?.zone || "Block A"}
            </p>

            <div className={styles.vehicleRow}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <div>
                {/* phoneNumber from userdetails table */}
                <p className={styles.vehicleNum}>{userDetails?.phoneNumber || "—"}</p>
                <p className={styles.vehicleType}>Registered Vehicle</p>
              </div>
            </div>

            {/* Tenant name from userdetails table */}
            <div className={styles.tenantInfoRow}>
              <span>{userDetails?.firstname} {userDetails?.lastname}</span>
              <span className={styles.tenantApt}>{apartment?.propertyName}</span>
            </div>

            <button className={styles.updateVehicleBtn}>Update Vehicle Details</button>
          </div>

          {/* Parking Rules */}
          <div className={styles.rulesCard}>
            <div className={styles.rulesHeader}>
              <div className={styles.rulesIconWrap}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <h3 className={styles.rulesTitle}>Parking Rules</h3>
            </div>
            <ul className={styles.rulesList}>
              <li>Only one permanent slot is allocated per apartment unit.</li>
              <li>Visitor parking must be booked at least 2 hours in advance.</li>
              <li>Unauthorized vehicles in residential slots are subject to towing.</li>
            </ul>
          </div>
        </aside>

        {/* ── Right main ── */}
        <main className={styles.rightCol}>

          {/* Parking Inventory */}
          <section className={styles.inventoryCard}>
            <div className={styles.inventoryHeader}>
              <div>
                <h2 className={styles.inventoryTitle}>Parking Inventory</h2>
                <p className={styles.inventorySub}>Live status of all parking slots in the facility</p>
              </div>
              <div className={styles.selectWrap}>
                <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className={styles.floorSelect}>
                  {FLOORS.map(f => <option key={f}>{f}</option>)}
                </select>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10z"/></svg>
              </div>
            </div>

            <div className={styles.filterTabs}>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  className={`${styles.filterTab} ${filterTab === tab ? styles.filterTabActive : ""}`}
                  onClick={() => setFilterTab(tab)}
                >
                  {tab} ({counts[tab] ?? 0})
                </button>
              ))}
            </div>

            <div className={styles.slotsGrid}>
              {visibleSlots.map(slot => (
                <div
                  key={slot.id}
                  className={`${styles.slotTile} ${slot.id === mySlotId ? styles.slotTileMine : ""}`}
                >
                  <div className={styles.slotTileTop}>
                    <span className={styles.slotTileId} style={{ color: slotColor(slot.id) }}>
                      {slot.id}
                    </span>
                    <span className={`${styles.slotTag} ${styles[statusCls(slot.status)] || ""}`}>
                      {slot.status === "MAINTENANCE" ? "MAINT." : slot.status}
                    </span>
                  </div>
                  {slot.assignedTo
                    ? <><p className={styles.slotTenantName}>{slot.assignedTo}</p><p className={styles.slotUnit}>{slot.unit}</p></>
                    : slot.note
                    ? <p className={styles.slotNote}>{slot.note}</p>
                    : <p className={styles.slotZone}>{slot.zone}</p>
                  }
                  {slot.id === mySlotId && (
                    <span className={styles.mySlotBadge}>YOUR SLOT</span>
                  )}
                </div>
              ))}
              {visibleSlots.length === 0 && (
                <p className={styles.emptySlots}>No slots match the current filter.</p>
              )}
            </div>
          </section>

          {/* Recent Bookings — from parking_bookings table */}
          <section className={styles.bookingsCard}>
            <div className={styles.bookingsHeader}>
              <div>
                <h2 className={styles.bookingsTitle}>Recent Bookings</h2>
                <p className={styles.bookingsSub}>History of your visitor parking requests</p>
              </div>
              <button className={styles.viewAllBtn}>View Full History</button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>DATE &amp; TIME</th>
                    <th>VEHICLE DETAILS</th>
                    <th>SLOT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 6).map(b => (
                    <tr key={b.id}>
                      <td>
                        <p className={styles.tdDate}>{b.date}</p>
                        <p className={styles.tdTime}>{b.timeFrom} - {b.timeTo}</p>
                      </td>
                      <td>
                        <p className={styles.tdVehicleNum}>{b.vehicleNumber}</p>
                        <p className={styles.tdVehicleDesc}>{b.vehicleDesc}</p>
                      </td>
                      <td><span className={styles.slotPill}>{b.slotId}</span></td>
                      <td>
                        <span className={`${styles.statusTag} ${styles[statusCls(b.status)] || ""}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {(b.status === "UPCOMING" || b.status === "ACTIVE") ? (
                          <button
                            className={styles.cancelBtn}
                            disabled={cancelling === b.id}
                            onClick={() => handleCancel(b.id)}
                          >
                            {cancelling === b.id
                              ? <span className={styles.miniSpinner}/>
                              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Cancel</>
                            }
                          </button>
                        ) : (
                          <button className={styles.invoiceBtn}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.emptyRow}>
                        No bookings yet — click "Assign Spot" to book a visitor slot.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* ── Booking Drawer ── */}
      {drawerOpen && (
        <div className={styles.overlay} onClick={resetDrawer}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>New Visitor Booking</h2>
              <button className={styles.closeBtn} onClick={resetDrawer}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleGenerate} className={styles.drawerForm}>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>Visitor Name</label>
                  <input type="text" placeholder="e.g. Name"
                    value={form.visitorName}
                    onChange={e => setForm({...form, visitorName: e.target.value})}
                    required />
                </div>
                <div className={styles.formField}>
                  <label>Vehicle Number</label>
                  <input type="text" placeholder="KA 01 AB 1234"
                    value={form.vehicleNumber}
                    onChange={e => setForm({...form, vehicleNumber: e.target.value})}
                    required />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>Vehicle Description</label>
                  <input type="text" placeholder="e.g. Guest Sedan"
                    value={form.vehicleDesc}
                    onChange={e => setForm({...form, vehicleDesc: e.target.value})} />
                </div>
                <div className={styles.formField}>
                  <label>Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>Duration</label>
                  <div className={styles.selectWrap}>
                    <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}>
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="8">Full Day (8h)</option>
                    </select>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10z"/></svg>
                  </div>
                </div>
                <div className={styles.formField}>
                  <label>Booked For</label>
                  <div className={styles.readonlyField}>
                    {userDetails?.firstname} {userDetails?.lastname} · {apartment?.apartmentNumber}
                  </div>
                </div>
              </div>
              <button type="submit" className={styles.generateBtn} disabled={formLoading}>
                {formLoading ? <span className={styles.btnSpinner}/> : "Generate Digital Pass"}
              </button>
            </form>

            {/* Pass Preview */}
            {pass && (
              <div className={styles.passSection}>
                <p className={styles.passPreviewLabel}>DIGITAL PASS PREVIEW</p>
                <div className={styles.passCard}>
                  <div className={styles.passCardHeader}>
                    <div className={styles.passLogoWrap}><span>P</span></div>
                    <p className={styles.passCardTitle}>VISITOR PASS</p>
                    <span className={styles.oneTimeTag}>ONE-TIME USE</span>
                  </div>
                  {qrUrl && (
                    <div className={styles.qrWrap}>
                      <img src={qrUrl} alt="QR Code" className={styles.qrImg}/>
                    </div>
                  )}
                  <div className={styles.passDetails}>
                    <div className={styles.passDetailRow}>
                      <span>VISITOR NAME</span>
                      <strong>{pass.visitorName?.toUpperCase()}</strong>
                    </div>
                    <div className={styles.passDetailRow}>
                      <span>VEHICLE NO.</span>
                      <strong>{pass.vehicleNumber}</strong>
                    </div>
                    <div className={styles.passDetailRow}>
                      <span>SPOT</span>
                      <strong>{pass.spotId}</strong>
                    </div>
                    <div className={styles.passDetailRowDouble}>
                      <div><span>DATE</span><strong>{pass.date}</strong></div>
                      <div><span>VALID UNTIL</span><strong>{pass.validUntil}</strong></div>
                    </div>
                  </div>
                </div>
                <div className={styles.passActions}>
                  <button className={styles.downloadBtn} onClick={downloadPass}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Download Image
                  </button>
                  <button className={styles.shareBtn}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                    Share with Visitor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Map Modal ── */}
      {mapOpen && (
        <div className={styles.overlay} onClick={() => setMapOpen(false)}>
          <div className={styles.mapModal} onClick={e => e.stopPropagation()}>
            <div className={styles.mapModalHeader}>
              <h2>Parking Map — {apartment?.propertyName}</h2>
              <button className={styles.closeBtn} onClick={() => setMapOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.mapGrid}>
              {slots.map(slot => (
                <div key={slot.id}
                  className={`${styles.mapSpot} ${
                    slot.id === mySlotId      ? styles.mapMine  :
                    slot.status === "VACANT"      ? styles.mapFree  :
                    slot.status === "MAINTENANCE" ? styles.mapMaint : styles.mapTaken
                  }`}
                  title={slot.assignedTo || slot.note || slot.zone}>
                  <span>{slot.id}</span>
                  {slot.id === mySlotId && <span className={styles.mapMineLabel}>YOU</span>}
                </div>
              ))}
            </div>
            <div className={styles.mapLegend}>
              <span><i className={`${styles.mapDot} ${styles.mapMine}`}/>Your Slot</span>
              <span><i className={`${styles.mapDot} ${styles.mapFree}`}/>Vacant</span>
              <span><i className={`${styles.mapDot} ${styles.mapTaken}`}/>Assigned</span>
              <span><i className={`${styles.mapDot} ${styles.mapMaint}`}/>Maintenance</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2024 {apartment?.propertyName || "Skyview Apartments"}. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Help Center</a>
        </div>
      </footer>
    </div>
  );
}