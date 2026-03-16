import { useState, useRef, useEffect } from "react";
import styles from "./Maintenance.module.css";
import {
  Wrench,
  Send,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Phone,
  Search,
  MoreHorizontal,
  ChevronDown,
  X,
} from "lucide-react";

const CameraPlus = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
    <line x1="12" y1="11" x2="12" y2="15"/>
    <line x1="10" y1="13" x2="14" y2="13"/>
  </svg>
);

const CATEGORIES = ["Select Category", "Plumbing", "Electrical", "HVAC / AC", "Appliances", "Structural", "Other"];
const LOCATIONS  = ["Select Area", "Kitchen", "Bedroom", "Bathroom", "Living Room", "Entrance", "Balcony", "Common Area"];
const PRIORITIES = ["Low", "Medium", "Urgent"];

const STATUS_META = {
  "IN PROGRESS": { icon: <Clock3 size={10} strokeWidth={2.5} />, cls: "sp", label: "In Progress" },
  "RESOLVED": { icon: <CheckCircle2 size={10} strokeWidth={2.5} />, cls: "sr", label: "Resolved" },
  "OPEN": { icon: <AlertCircle size={10} strokeWidth={2.5} />, cls: "so", label: "Open" },
};

export default function Maintenance() {

  const [form, setForm] = useState({
    title: "",
    category: "Select Category",
    location: "Select Area",
    description: "",
    priority: "Low"
  });

  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState({});
  const [complaints, setComplaints] = useState([]);

  const fileRef = useRef();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/maintenance");
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error("Error loading complaints", err);
    }
  };

  const handlePhotoChange = (e) => {
    const previews = Array.from(e.target.files || []).map(f => URL.createObjectURL(f));
    setPhotos(p => [...p, ...previews].slice(0, 5));
    e.target.value = "";
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Please enter a complaint title.";
    if (form.category === "Select Category") e.category = "Please select a category.";
    if (!form.description.trim()) e.description = "Please describe the problem.";
    return e;
  };

  const handleSubmit = async () => {

    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});

    try {

      const formData = new FormData();

      formData.append("issue", form.title);
      formData.append("category", form.category);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("priorityLevel", form.priority);

      const files = fileRef.current.files;

      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      await fetch("http://localhost:8080/api/maintenance", {
        method: "POST",
        body: formData
      });

      showToast("Complaint submitted ✓");

      setForm({
        title: "",
        category: "Select Category",
        location: "Select Area",
        description: "",
        priority: "Low"
      });

      setPhotos([]);

      fetchComplaints();

    } catch (err) {
      console.error(err);
      showToast("Error submitting complaint");
    }
  };

  const filtered = complaints.filter(h =>
    h.issue?.toLowerCase().includes(search.toLowerCase()) ||
    h.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={styles.page}>

        <div className={styles["page-header"]}>
          <h1 className={styles["page-title"]}>Raise a Maintenance Complaint</h1>
          <p className={styles["page-sub"]}>Report maintenance issues in your apartment.</p>
        </div>

        <div className={styles["main-grid"]}>

          {/* FORM */}
          <div className={styles.card}>
            <h3 className={styles["card-heading"]}>
              <span className={styles["section-icon"]}><ClipboardList size={15} strokeWidth={2.5} /></span>
              Complaint Details
            </h3>

            <div className={styles.field}>
              <label className={styles.label}>Complaint Title</label>
              <input
                className={`${styles.input} ${errors.title ? styles["input-error"] : ""}`}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            <div className={styles["field-row"]}>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <div className={styles["select-wrap"]}>
                  <select
                    className={styles.select}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className={styles["select-arrow"]} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Location</label>
                <div className={styles["select-wrap"]}>
                  <select
                    className={styles.select}
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  >
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <ChevronDown size={14} className={styles["select-arrow"]} />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Detailed Description</label>
              <textarea
                className={styles.textarea}
                rows={5}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Upload Photos</label>
              <div className={styles.dropzone} onClick={() => fileRef.current.click()}>
                <CameraPlus size={34} />
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
            </div>

            <div className={styles["form-actions"]}>
              <button className={styles["submit-btn"]} onClick={handleSubmit}>
                <Send size={15} strokeWidth={2.5} /> Submit Complaint
              </button>
            </div>
          </div>

          {/* RECENT REPORTS */}
          <div className={styles.card}>
            <h3 className={styles["card-heading"]}>
              <Wrench size={15} /> My Recent Reports
            </h3>

            <div className={styles["recent-list"]}>
              {complaints.slice(0,3).map((r,i)=>{

                const meta = STATUS_META[r.status] || STATUS_META["OPEN"];

                return(
                  <div key={r.id} className={styles["recent-item"]}>
                    <div className={styles["recent-top"]}>
                      <span className={`${styles["status-pill"]} ${styles[meta.cls]}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className={styles["recent-time"]}>{r.submittedDate}</span>
                    </div>

                    <p className={styles["recent-title"]}>{r.issue}</p>
                    <p className={styles["recent-meta"]}>{r.category} • {r.location}</p>
                  </div>
                )

              })}
            </div>
          </div>

        </div>

        {/* HISTORY */}
        <div className={styles.card}>

          <div className={styles["history-header"]}>
            <h3 className={styles["card-heading"]}>Maintenance History</h3>

            <div className={styles["search-wrap"]}>
              <Search size={13}/>
              <input
                className={styles["search-input"]}
                placeholder="Search complaints..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
              />
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {filtered.map(h=>{

                const meta = STATUS_META[h.status] || STATUS_META["OPEN"];

                return(
                  <tr key={h.id}>
                    <td className={styles["td-title"]}>{h.issue}</td>
                    <td className={styles["td-cat"]}>{h.category}</td>

                    <td>
                      <span className={`${styles["status-pill"]} ${styles[meta.cls]}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>

                    <td className={styles["td-date"]}>{h.submittedDate}</td>

                    <td className={styles["td-date"]}>
                      {h.resolvedDate ? h.resolvedDate : "Pending"}
                    </td>

                    <td>
                      <button className={styles["more-btn"]}>
                        <MoreHorizontal size={16}/>
                      </button>
                    </td>

                  </tr>
                )

              })}

            </tbody>

          </table>

        </div>

      </div>

      <div className={`${styles.toast} ${toast ? styles["toast-show"] : ""}`}>
        {toast}
      </div>
    </>
  );
}