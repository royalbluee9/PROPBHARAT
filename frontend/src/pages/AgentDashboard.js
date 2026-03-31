import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Plus, Trash2, Edit3, ArrowLeft, Home, FileText, BarChart2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Surat", "Lucknow", "Nagpur", "Noida", "Gurugram", "Thane"];
const AMENITIES_LIST = ["gym", "pool", "parking", "security", "lift", "garden", "club", "power"];

export default function AgentDashboard() {
  const { user, loading, getHeaders } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("listings");
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [form, setForm] = useState({ title: "", locality: "", city: "", type: "apartment", bhk: "", bath: "", area: "", price: "", rent: "", status: "ready", cat: "buy", amenities: [], img: "🏠", description: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/"); return; }
    if (user.role === "admin") { navigate("/admin"); return; }
    fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [propsRes, leadsRes] = await Promise.all([
        axios.get(`${API}/agent/properties`, { headers: getHeaders() }),
        axios.get(`${API}/agent/leads`, { headers: getHeaders() })
      ]);
      setProperties(propsRes.data);
      setLeads(leadsRes.data);
    } catch { /* ignore */ }
    setDataLoading(false);
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const resetForm = () => { setForm({ title: "", locality: "", city: "", type: "apartment", bhk: "", bath: "", area: "", price: "", rent: "", status: "ready", cat: "buy", amenities: [], img: "🏠", description: "" }); setEditProp(null); };

  const openEdit = (p) => {
    setForm({ title: p.title, locality: p.locality, city: p.city, type: p.type, bhk: p.bhk || "", bath: p.bath || "", area: p.area, price: p.price || "", rent: p.rent || "", status: p.status, cat: p.cat, amenities: p.amenities || [], img: p.img || "🏠", description: p.description || "" });
    setEditProp(p);
    setShowForm(true);
  };

  const saveProperty = async () => {
    if (!form.title || !form.city || !form.area) { setMsg("Please fill Title, City, and Area."); return; }
    setSaving(true);
    const body = { ...form, bhk: form.bhk ? parseInt(form.bhk) : null, bath: form.bath ? parseInt(form.bath) : null, area: parseInt(form.area), price: form.price ? parseInt(form.price) : null, rent: form.rent ? parseInt(form.rent) : null };
    try {
      if (editProp) {
        await axios.put(`${API}/agent/properties/${editProp.prop_id}`, body, { headers: getHeaders() });
        setMsg("Property updated successfully!");
      } else {
        await axios.post(`${API}/properties`, body, { headers: getHeaders() });
        setMsg("Property added successfully!");
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (e) {
      setMsg(e.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProperty = async (prop_id) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await axios.delete(`${API}/agent/properties/${prop_id}`, { headers: getHeaders() });
      setProperties(p => p.filter(x => x.prop_id !== prop_id));
    } catch { alert("Delete failed."); }
  };

  const fmtPrice = (p) => {
    if (!p) return "—";
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)}Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  const toggleAmenity = (a) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  };

  if (!user) return null;

  return (
    <div style={{ fontFamily: "'Noto Sans',sans-serif", background: "#F5F0E8", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Yeseva+One&display=swap" rel="stylesheet" />
      {/* Header */}
      <div style={{ background: "#FFFDF8", borderBottom: "1px solid #EDE5D5", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14, fontFamily: "inherit" }}>
            <ArrowLeft size={18} /> Back to Listings
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 20, color: "#1C1C1C" }}>🏘️ Agent Dashboard</div>
          <div style={{ fontSize: 13, color: "#888" }}>Welcome, {user.name}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
          {[["My Listings", properties.length, "#C84B31", "🏠"], ["Total Leads", leads.length, "#1B4F72", "📋"], ["Verified", properties.filter(p => p.verified).length, "#1D6A43", "✓"]].map(([l, v, c, ic]) => (
            <div key={l} style={{ background: "#FFFDF8", borderRadius: 16, padding: "20px 24px", border: "1px solid #EDE5D5" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: c, fontFamily: "'Yeseva One',serif" }}>{v}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{ic} {l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#FFFDF8", padding: 4, borderRadius: 12, border: "1px solid #EDE5D5", width: "fit-content", marginBottom: 24 }}>
          {[["listings", "My Listings", Home], ["leads", "Leads", FileText]].map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)} data-testid={`agent-tab-${k}`}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: tab === k ? "#1C1C1C" : "transparent", color: tab === k ? "#fff" : "#555", transition: "all .15s" }}>
              <Icon size={15} /> {l}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ background: "#F0FFF4", border: "1px solid #86EFAC", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#166534", marginBottom: 16 }}>
            ✅ {msg}
          </div>
        )}

        {/* Listings Tab */}
        {tab === "listings" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1C" }}>My Properties ({properties.length})</div>
              <button onClick={() => { resetForm(); setShowForm(true); }} data-testid="add-property-btn"
                style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#C84B31,#8B1A08)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
                <Plus size={16} /> Add Property
              </button>
            </div>

            {dataLoading ? <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading…</div> : (
              properties.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#FFFDF8", borderRadius: 20, border: "1px dashed #DDD5C5" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#888", marginBottom: 8 }}>No listings yet</div>
                  <button onClick={() => { resetForm(); setShowForm(true); }}
                    style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {properties.map(p => (
                    <div key={p.prop_id} style={{ background: "#FFFDF8", borderRadius: 16, padding: "18px 20px", border: "1px solid #EDE5D5", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 36 }}>{p.img || "🏠"}</div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1C1C1C" }}>{p.title}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>📍 {p.locality}, {p.city} · {p.type}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                          <span style={{ background: p.cat === "buy" ? "#FFF0EC" : p.cat === "rent" ? "#E8F0FF" : "#E8FFF0", color: p.cat === "buy" ? "#C84B31" : p.cat === "rent" ? "#1B4F72" : "#1D6A43", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{p.cat.toUpperCase()}</span>
                          {p.verified && <span style={{ background: "#E8FFF0", color: "#1D6A43", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>✓ Verified</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#C84B31" }}>{fmtPrice(p.price || p.rent)}{p.rent ? "/mo" : ""}</div>
                        <div style={{ fontSize: 12, color: "#BBB" }}>{(p.area || 0).toLocaleString("en-IN")} sq.ft</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(p)} style={{ background: "#F5F0E8", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555" }} data-testid={`edit-prop-${p.prop_id}`}>
                          <Edit3 size={14} /> Edit
                        </button>
                        <button onClick={() => deleteProperty(p.prop_id)} style={{ background: "#FFF0EC", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#C84B31" }} data-testid={`delete-prop-${p.prop_id}`}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Leads Tab */}
        {tab === "leads" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1C", marginBottom: 20 }}>All Leads ({leads.length})</div>
            {leads.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, background: "#FFFDF8", borderRadius: 20, border: "1px dashed #DDD5C5" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ color: "#888" }}>No leads yet.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {leads.map(l => (
                  <div key={l.lead_id} style={{ background: "#FFFDF8", borderRadius: 14, padding: "16px 20px", border: "1px solid #EDE5D5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1C" }}>{l.name}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>📱 +91 {l.phone} · 📍 {l.city}{l.locality ? `, ${l.locality}` : ""}</div>
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{l.lead_type?.toUpperCase()} · {l.prop_type} · {l.beds && `${l.beds} BHK`}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ background: l.lead_type === "buy" ? "#FFF0EC" : l.lead_type === "rent" ? "#E8F0FF" : "#E8FFF0", color: l.lead_type === "buy" ? "#C84B31" : l.lead_type === "rent" ? "#1B4F72" : "#1D6A43", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{(l.lead_type || "").toUpperCase()}</span>
                        <div style={{ fontSize: 11, color: "#BBB", marginTop: 6 }}>{new Date(l.created_at).toLocaleDateString("en-IN")}</div>
                      </div>
                    </div>
                    {l.desc && <div style={{ fontSize: 13, color: "#888", marginTop: 8, paddingTop: 8, borderTop: "1px solid #EDE5D5" }}>{l.desc}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Property Form Modal */}
      {showForm && (
        <div className="pb-modal-bg" onClick={() => setShowForm(false)}>
          <div className="pb-modal" style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", padding: "24px 28px", position: "relative" }}>
              <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>✕</button>
              <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 22, color: "#FFF8F0" }}>{editProp ? "Edit Property" : "Add New Property"}</div>
            </div>
            <div style={{ padding: "24px 28px", display: "grid", gap: 14 }}>
              <input className="pb-input" placeholder="Property Title *" value={form.title} onChange={e => upd("title", e.target.value)} data-testid="prop-title" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select className="pb-input pb-select" value={form.city} onChange={e => upd("city", e.target.value)} data-testid="prop-city">
                  <option value="">Select City *</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="pb-input" placeholder="Locality *" value={form.locality} onChange={e => upd("locality", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <select className="pb-input pb-select" value={form.type} onChange={e => upd("type", e.target.value)}>
                  {["apartment","villa","plot","office","shop","penthouse"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="pb-input pb-select" value={form.cat} onChange={e => upd("cat", e.target.value)}>
                  {["buy","rent","sell"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="pb-input pb-select" value={form.status} onChange={e => upd("status", e.target.value)}>
                  {["ready","uc","new_launch"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                <input className="pb-input" placeholder="BHK" type="number" value={form.bhk} onChange={e => upd("bhk", e.target.value)} />
                <input className="pb-input" placeholder="Baths" type="number" value={form.bath} onChange={e => upd("bath", e.target.value)} />
                <input className="pb-input" placeholder="Area (sq.ft)*" type="number" value={form.area} onChange={e => upd("area", e.target.value)} data-testid="prop-area" />
                <input className="pb-input" placeholder="Image emoji" value={form.img} onChange={e => upd("img", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input className="pb-input" placeholder="Price (₹)" type="number" value={form.price} onChange={e => upd("price", e.target.value)} />
                <input className="pb-input" placeholder="Rent/mo (₹)" type="number" value={form.rent} onChange={e => upd("rent", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 8 }}>AMENITIES</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {AMENITIES_LIST.map(a => (
                    <button key={a} onClick={() => toggleAmenity(a)} style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${form.amenities.includes(a) ? "#C84B31" : "#DDD5C5"}`, background: form.amenities.includes(a) ? "#C84B31" : "#FEFCF7", color: form.amenities.includes(a) ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>{a}</button>
                  ))}
                </div>
              </div>
              <textarea className="pb-input" rows={3} placeholder="Description (optional)" value={form.description} onChange={e => upd("description", e.target.value)} style={{ resize: "vertical" }} />
              <button onClick={saveProperty} disabled={saving}
                style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", color: "#fff", border: "none", padding: "14px", borderRadius: 11, fontSize: 15, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? .7 : 1 }} data-testid="save-property-btn">
                {saving ? "Saving…" : editProp ? "Update Property" : "Add Property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
