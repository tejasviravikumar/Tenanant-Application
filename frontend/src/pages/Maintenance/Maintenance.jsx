import { useState, useRef, useEffect } from "react";
import styles from "./Maintenance.module.css";
import {
  Wrench, Send, ClipboardList, CheckCircle2, AlertCircle,
  Clock3, Search, MoreHorizontal, ChevronDown, X, Image, Trash2,
} from "lucide-react";

/* ── Camera icon ─────────────────────────────────────────────── */
const CameraPlus = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
    <line x1="12" y1="11" x2="12" y2="15"/>
    <line x1="10" y1="13" x2="14" y2="13"/>
  </svg>
);

/* ── Constants ───────────────────────────────────────────────── */
const CATEGORIES = [
  "Select Category","Plumbing","Electrical","HVAC / AC",
  "Appliances","Structural","Cosmetic","Other",
];
const LOCATIONS = [
  "Select Area","Kitchen","Bedroom","Bathroom",
  "Living Room","Entrance","Balcony","Common Area",
];
const PRIORITIES = ["Low","Medium","Urgent"];

const PRIORITY_META = {
  Low:    { color:"#16a34a", bg:"#dcfce7", border:"#bbf7d0" },
  Medium: { color:"#d97706", bg:"#fef3c7", border:"#fde68a" },
  Urgent: { color:"#dc2626", bg:"#fee2e2", border:"#fecaca" },
};

const STATUS_META = {
  "IN PROGRESS": { icon:<Clock3 size={10} strokeWidth={2.5}/>, cls:"sp", label:"In Progress" },
  "RESOLVED":    { icon:<CheckCircle2 size={10} strokeWidth={2.5}/>, cls:"sr", label:"Resolved" },
  "OPEN":        { icon:<AlertCircle size={10} strokeWidth={2.5}/>, cls:"so", label:"Open" },
};

const API_BASE   = "http://localhost:8080";
const EMPTY_FORM = { title:"", category:"Select Category", location:"Select Area", description:"", priority:"Low" };

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization:`Bearer ${token}` } : {};
};

/* ── Lightbox ────────────────────────────────────────────────── */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.88)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:9999, cursor:"zoom-out",
    }}>
      <button onClick={onClose} style={{
        position:"absolute", top:20, right:24,
        background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
        color:"#fff", borderRadius:"50%", width:36, height:36, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(8px)",
      }}>
        <X size={18}/>
      </button>
      <img src={src} alt="Full size" onClick={e => e.stopPropagation()} style={{
        maxWidth:"88vw", maxHeight:"88vh", borderRadius:12,
        boxShadow:"0 24px 80px rgba(0,0,0,0.5)",
      }}/>
    </div>
  );
}

/* ── Delete Confirm Modal ────────────────────────────────────── */
function DeleteModal({ complaint, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(15,18,33,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:9998, backdropFilter:"blur(4px)",
    }}>
      <div style={{
        background:"#fff", borderRadius:16, padding:"28px 28px 24px",
        width:380, boxShadow:"0 24px 60px rgba(15,18,33,0.18)",
        animation:"fadeUp 0.18s ease",
      }}>
        {/* Icon */}
        <div style={{
          width:48, height:48, borderRadius:12,
          background:"#fee2e2", display:"flex",
          alignItems:"center", justifyContent:"center",
          marginBottom:16,
        }}>
          <Trash2 size={22} color="#dc2626" strokeWidth={2}/>
        </div>

        <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700, color:"#0f172a" }}>
          Remove Complaint?
        </h3>
        <p style={{ margin:"0 0 6px", fontSize:13.5, color:"#475569", lineHeight:1.5 }}>
          Are you sure you want to remove:
        </p>
        <p style={{
          margin:"0 0 20px", fontSize:13.5, fontWeight:600,
          color:"#0f172a", background:"#f8fafc",
          padding:"8px 12px", borderRadius:8,
          border:"1px solid #e5e9f0",
        }}>
          "{complaint?.issue}"
        </p>

        {/* Only allow deleting OPEN complaints */}
        {complaint?.status !== "OPEN" && (
          <p style={{
            margin:"0 0 16px", fontSize:12.5, color:"#dc2626",
            background:"#fee2e2", padding:"8px 12px",
            borderRadius:8, border:"1px solid #fecaca",
          }}>
            Only OPEN complaints can be removed. This complaint is {complaint?.status}.
          </p>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{
            flex:1, padding:"10px", border:"1.5px solid #e5e9f0",
            borderRadius:9, background:"#fff", color:"#475569",
            fontSize:13.5, fontWeight:600, cursor:"pointer",
            transition:"all 0.15s",
          }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || complaint?.status !== "OPEN"}
            style={{
              flex:1, padding:"10px", border:"none",
              borderRadius:9,
              background: complaint?.status === "OPEN" ? "#dc2626" : "#e5e9f0",
              color: complaint?.status === "OPEN" ? "#fff" : "#94a3b8",
              fontSize:13.5, fontWeight:700, cursor: complaint?.status === "OPEN" ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              transition:"opacity 0.15s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? <span style={{
                  width:14, height:14, border:"2px solid rgba(255,255,255,0.4)",
                  borderTopColor:"#fff", borderRadius:"50%",
                  animation:"spin 0.7s linear infinite", display:"inline-block",
                }}/>
              : <Trash2 size={14} strokeWidth={2.5}/>
            }
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Row Action Menu (... dropdown) ─────────────────────────── */
function ActionMenu({ complaint, onDelete, onClose }) {
  const ref = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const canDelete = complaint.status === "OPEN";

  return (
    <div ref={ref} style={{
      position:"absolute", right:0, top:"100%",
      background:"#fff", border:"1px solid #e5e9f0",
      borderRadius:10, boxShadow:"0 8px 24px rgba(15,18,33,0.12)",
      zIndex:100, minWidth:160, overflow:"hidden",
      animation:"fadeDown 0.15s ease",
    }}>
      <button
        onClick={() => { onDelete(); onClose(); }}
        style={{
          width:"100%", padding:"10px 14px",
          display:"flex", alignItems:"center", gap:9,
          background:"none", border:"none",
          fontSize:13, fontWeight:600,
          color: canDelete ? "#dc2626" : "#94a3b8",
          cursor: canDelete ? "pointer" : "not-allowed",
          textAlign:"left",
          transition:"background 0.12s",
        }}
        onMouseEnter={e => canDelete && (e.currentTarget.style.background="#fee2e2")}
        onMouseLeave={e => (e.currentTarget.style.background="none")}
      >
        <Trash2 size={14} strokeWidth={2.2}/>
        {canDelete ? "Remove Complaint" : "Cannot Remove"}
      </button>

      {!canDelete && (
        <p style={{
          margin:0, padding:"6px 14px 10px",
          fontSize:11, color:"#94a3b8", lineHeight:1.4,
          borderTop:"1px solid #f0f3fa",
        }}>
          Only OPEN complaints can be removed.
        </p>
      )}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────── */
export default function Maintenance() {
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [photoFiles, setPhotoFiles]       = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [search, setSearch]               = useState("");
  const [toast, setToast]                 = useState({ msg:"", type:"success" });
  const [errors, setErrors]               = useState({});
  const [complaints, setComplaints]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [lightbox, setLightbox]           = useState(null);
  const [expandedRow, setExpandedRow]     = useState(null);

  // Delete state
  const [menuOpenId,      setMenuOpenId]      = useState(null); // which row's ... menu is open
  const [deleteTarget,    setDeleteTarget]    = useState(null); // complaint to delete
  const [deleteLoading,   setDeleteLoading]   = useState(false);

  const fileRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 2600);
  };

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/maintenance`, {
        headers: { ...getAuthHeaders() },
      });
      if (res.status === 401 || res.status === 403) { showToast("Session expired.", "error"); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComplaints(data.sort((a,b) => new Date(b.submittedDate) - new Date(a.submittedDate)));
    } catch {
      showToast("Could not load complaints.", "error");
    }
  };

  // ── DELETE handler ────────────────────────────────────────────
  // Calls DELETE /api/maintenance/{id}
  // Only allowed for OPEN complaints — enforced both here and in backend
  const handleDelete = async () => {
    if (!deleteTarget || deleteTarget.status !== "OPEN") return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/maintenance/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error(await res.text());
      // Remove from local state instantly — no refetch needed
      setComplaints(prev => prev.filter(c => c.id !== deleteTarget.id));
      showToast("Complaint removed successfully.");
    } catch (err) {
      showToast(err.message || "Failed to remove complaint.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;
    const combined = [...photoFiles, ...newFiles].slice(0, 5);
    setPhotoFiles(combined);
    photoPreviews.forEach(u => URL.revokeObjectURL(u));
    setPhotoPreviews(combined.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removePhoto = (i) => {
    URL.revokeObjectURL(photoPreviews[i]);
    setPhotoFiles(p => p.filter((_,idx) => idx !== i));
    setPhotoPreviews(p => p.filter((_,idx) => idx !== i));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())                  e.title       = "Please enter a complaint title.";
    if (form.category === "Select Category") e.category    = "Please select a category.";
    if (!form.description.trim())            e.description = "Please describe the problem.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("issue",         form.title.trim());
      fd.append("category",      form.category);
      fd.append("location",      form.location === "Select Area" ? "Not specified" : form.location);
      fd.append("description",   form.description.trim());
      fd.append("priorityLevel", form.priority);
      photoFiles.forEach(f => fd.append("images", f));

      const res = await fetch(`${API_BASE}/api/maintenance`, {
        method:"POST", headers:{ ...getAuthHeaders() }, body:fd,
      });
      if (res.status === 401 || res.status === 403) { showToast("Session expired.", "error"); return; }
      if (!res.ok) { const m = await res.text(); throw new Error(m); }

      showToast("Complaint submitted ✓");
      setForm(EMPTY_FORM);
      photoPreviews.forEach(u => URL.revokeObjectURL(u));
      setPhotoFiles([]);
      setPhotoPreviews([]);
      await fetchComplaints();
    } catch (err) {
      showToast(err.message || "Error submitting complaint.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter(h =>
    h.issue?.toLowerCase().includes(search.toLowerCase()) ||
    h.category?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    open:       complaints.filter(c => c.status === "OPEN").length,
    inProgress: complaints.filter(c => c.status === "IN PROGRESS").length,
    resolved:   complaints.filter(c => c.status === "RESOLVED").length,
  };

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)}/>}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteModal
          complaint={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      <div className={styles.page}>

        {/* ── Header ───────────────────────────────────────────── */}
        <div className={styles["page-header"]}>
          <h1 className={styles["page-title"]}>Maintenance Requests</h1>
          <p className={styles["page-sub"]}>Submit and track maintenance issues for your apartment.</p>
        </div>

        <div className={styles["main-grid"]}>

          {/* ─────────── FORM CARD ─────────── */}
          <div className={styles.card}>
            <h3 className={styles["card-heading"]}>
              <span className={styles["section-icon"]}><ClipboardList size={15} strokeWidth={2.2}/></span>
              New Complaint
            </h3>

            <div className={styles.field}>
              <label className={styles.label}>Complaint Title</label>
              <input
                className={`${styles.input} ${errors.title ? styles["input-error"] : ""}`}
                placeholder="e.g. Leaky Faucet"
                value={form.title}
                onChange={e => setForm({...form, title:e.target.value})}
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            <div className={styles["field-row"]}>
              <div className={styles.field} style={{marginBottom:0}}>
                <label className={styles.label}>Category</label>
                <div className={styles["select-wrap"]}>
                  <select
                    className={`${styles.select} ${errors.category ? styles["input-error"] : ""}`}
                    value={form.category}
                    onChange={e => setForm({...form, category:e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={13} className={styles["select-arrow"]}/>
                </div>
                {errors.category && <span className={styles.error}>{errors.category}</span>}
              </div>

              <div className={styles.field} style={{marginBottom:0}}>
                <label className={styles.label}>Location / Area</label>
                <div className={styles["select-wrap"]}>
                  <select
                    className={styles.select}
                    value={form.location}
                    onChange={e => setForm({...form, location:e.target.value})}
                  >
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <ChevronDown size={13} className={styles["select-arrow"]}/>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={`${styles.textarea} ${errors.description ? styles["input-error"] : ""}`}
                rows={4}
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={e => setForm({...form, description:e.target.value})}
              />
              {errors.description && <span className={styles.error}>{errors.description}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Priority</label>
              <div className={styles["priority-group"]}>
                {PRIORITIES.map(p => {
                  const m      = PRIORITY_META[p];
                  const active = form.priority === p;
                  return (
                    <button key={p} type="button"
                      className={`${styles["priority-btn"]} ${active ? styles["priority-active"] : ""}`}
                      style={active ? { borderColor:m.border, color:m.color, background:m.bg } : {}}
                      onClick={() => setForm({...form, priority:p})}
                    >
                      <span style={{
                        display:"inline-block", width:7, height:7, borderRadius:"50%",
                        background: active ? m.color : "#c8cfe0",
                        marginRight:6, flexShrink:0, transition:"background 0.15s",
                      }}/>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Photos
                <span style={{
                  fontWeight:500, fontSize:10.5, color:"#9099b5",
                  marginLeft:6, textTransform:"none", letterSpacing:0,
                }}>
                  {photoPreviews.length}/5
                </span>
              </label>

              {photoPreviews.length > 0 && (
                <div className={styles["photo-previews"]} style={{marginBottom:10}}>
                  {photoPreviews.map((src,i) => (
                    <div key={i} className={styles["photo-thumb"]}>
                      <img src={src} alt="" onClick={() => setLightbox(src)} style={{cursor:"zoom-in"}}/>
                      <button className={styles["photo-remove"]} onClick={() => removePhoto(i)} type="button">×</button>
                    </div>
                  ))}
                </div>
              )}

              {photoPreviews.length < 5 && (
                <div className={styles.dropzone} onClick={() => fileRef.current.click()}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key==="Enter" && fileRef.current.click()}>
                  <CameraPlus size={28}/>
                  <span style={{fontSize:12.5, fontWeight:500}}>
                    {photoPreviews.length === 0 ? "Click to upload photos" : "Add more photos"}
                  </span>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" multiple
                style={{display:"none"}} onChange={handlePhotoChange}/>
            </div>

            <div className={styles["form-actions"]}>
              <button className={styles["submit-btn"]} onClick={handleSubmit} disabled={loading}>
                <Send size={14} strokeWidth={2.5}/>
                {loading ? "Submitting…" : "Submit Complaint"}
              </button>
            </div>
          </div>

          {/* ─────────── RECENT CARD ─────────── */}
          <div className={styles.card}>
            <h3 className={styles["card-heading"]}>
              <span className={styles["section-icon"]}><Wrench size={14} strokeWidth={2.2}/></span>
              Recent Reports
            </h3>

            <div className={styles["recent-list"]}>
              {complaints.length === 0 ? (
                <div style={{textAlign:"center", padding:"32px 0", color:"#9099b5"}}>
                  <Wrench size={28} strokeWidth={1.5} style={{marginBottom:8, opacity:0.25}}/>
                  <p style={{margin:0, fontSize:13}}>No complaints yet.</p>
                </div>
              ) : complaints.slice(0,3).map(r => {
                const meta = STATUS_META[r.status] || STATUS_META["OPEN"];
                return (
                  <div key={r.id} className={styles["recent-item"]}>
                    <div className={styles["recent-top"]}>
                      <span className={`${styles["status-pill"]} ${styles[meta.cls]}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className={styles["recent-time"]}>{r.submittedDate}</span>
                    </div>
                    <p className={styles["recent-title"]}>{r.issue}</p>
                    <p className={styles["recent-meta"]}>{r.category} • {r.location}</p>

                    {r.images?.length > 0 && (
                      <div style={{display:"flex", gap:6, marginTop:8, flexWrap:"wrap"}}>
                        {r.images.slice(0,4).map((img,i) => (
                          <img key={i}
                            src={`${API_BASE}${img.imagePath}`}
                            alt=""
                            onClick={() => setLightbox(`${API_BASE}${img.imagePath}`)}
                            onError={e => e.target.style.display="none"}
                            style={{
                              width:44, height:44, objectFit:"cover",
                              borderRadius:6, cursor:"zoom-in",
                              border:"1.5px solid #e8ecf4",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {complaints.length > 0 && (
              <div style={{
                display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                gap:8, marginTop:18, paddingTop:18, borderTop:"1px solid #f0f3fa",
              }}>
                {[
                  { label:"Open",        count:counts.open,       color:"#dc2626", bg:"#fee2e2" },
                  { label:"In Progress", count:counts.inProgress, color:"#d97706", bg:"#fef3c7" },
                  { label:"Resolved",    count:counts.resolved,   color:"#16a34a", bg:"#dcfce7" },
                ].map(s => (
                  <div key={s.label} style={{
                    textAlign:"center", padding:"10px 6px",
                    borderRadius:10, background:s.bg,
                  }}>
                    <div style={{fontSize:20, fontWeight:700, color:s.color, lineHeight:1}}>{s.count}</div>
                    <div style={{fontSize:10, fontWeight:600, color:s.color, marginTop:4, opacity:0.75}}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─────────── HISTORY TABLE ─────────── */}
        <div className={styles.card}>
          <div className={styles["history-header"]}>
            <h3 className={styles["card-heading"]} style={{margin:0, borderBottom:"none", paddingBottom:0}}>
              Maintenance History
            </h3>
            <div className={styles["search-wrap"]}>
              <Search size={13}/>
              <input
                className={styles["search-input"]}
                placeholder="Search by title or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Resolved</th>
                <th>Photos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{
                    textAlign:"center", padding:"40px 0",
                    color:"#9099b5", fontSize:13,
                  }}>
                    {search ? `No results for "${search}"` : "No maintenance records yet."}
                  </td>
                </tr>
              )}

              {filtered.map(h => {
                const meta     = STATUS_META[h.status] || STATUS_META["OPEN"];
                const pm       = PRIORITY_META[h.priorityLevel];
                const expanded = expandedRow === h.id;
                const menuOpen = menuOpenId === h.id;

                return (
                  <>
                    <tr key={h.id}>
                      <td className={styles["td-title"]}>{h.issue}</td>
                      <td className={styles["td-cat"]}>{h.category}</td>

                      <td>
                        {pm ? (
                          <span style={{
                            fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
                            background:pm.bg, color:pm.color, border:`1px solid ${pm.border}`,
                          }}>
                            {h.priorityLevel}
                          </span>
                        ) : <span style={{color:"#c8cfe0"}}>—</span>}
                      </td>

                      <td>
                        <span className={`${styles["status-pill"]} ${styles[meta.cls]}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>

                      <td className={styles["td-date"]}>{h.submittedDate}</td>
                      <td className={styles["td-date"]}>{h.resolvedDate || "—"}</td>

                      <td>
                        {h.images?.length > 0 ? (
                          <button
                            onClick={() => setExpandedRow(expanded ? null : h.id)}
                            style={{
                              display:"inline-flex", alignItems:"center", gap:5,
                              fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20,
                              background:"#eef1fe", color:"#4f6ef7",
                              border:"1px solid #c7d4fd", cursor:"pointer",
                              transition:"all 0.15s",
                            }}
                          >
                            <Image size={11}/> {h.images.length}
                          </button>
                        ) : (
                          <span style={{color:"#c8cfe0", fontSize:12}}>—</span>
                        )}
                      </td>

                      {/* ── ... menu button ── */}
                      <td style={{ position:"relative" }}>
                        <button
                          className={styles["more-btn"]}
                          aria-label="More options"
                          onClick={() => setMenuOpenId(menuOpen ? null : h.id)}
                          style={{
                            background: menuOpen ? "#f0f3fa" : "none",
                            borderRadius: 6,
                          }}
                        >
                          <MoreHorizontal size={15}/>
                        </button>

                        {/* Dropdown menu */}
                        {menuOpen && (
                          <ActionMenu
                            complaint={h}
                            onDelete={() => setDeleteTarget(h)}
                            onClose={() => setMenuOpenId(null)}
                          />
                        )}
                      </td>
                    </tr>

                    {expanded && h.images?.length > 0 && (
                      <tr key={`${h.id}-imgs`}>
                        <td colSpan={8} style={{
                          background:"#f8f9fd", padding:"14px 0",
                          borderBottom:"1px solid #e8ecf4",
                        }}>
                          <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                            {h.images.map((img,i) => (
                              <img key={i}
                                src={`${API_BASE}${img.imagePath}`}
                                alt={`photo-${i+1}`}
                                onClick={() => setLightbox(`${API_BASE}${img.imagePath}`)}
                                onError={e => e.target.style.display="none"}
                                onMouseEnter={e => e.target.style.transform="scale(1.04)"}
                                onMouseLeave={e => e.target.style.transform="scale(1)"}
                                style={{
                                  width:76, height:76, objectFit:"cover",
                                  borderRadius:10, cursor:"zoom-in",
                                  border:"1.5px solid #e8ecf4",
                                  boxShadow:"0 2px 8px rgba(15,18,33,0.08)",
                                  transition:"transform 0.15s",
                                }}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────── */}
      <div
        className={`${styles.toast} ${toast.msg ? styles["toast-show"] : ""}`}
        style={toast.type === "error" ? {background:"#dc2626"} : {}}
      >
        {toast.msg}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}