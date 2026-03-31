import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Users, Home, FileText, ArrowLeft, Trash2, CheckCircle, XCircle, BarChart2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { user, loading, getHeaders } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState({ users: 0, properties: 0, leads: 0 });
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/"); return; }
    if (user.role !== "admin") { navigate("/"); return; }
    fetchAll();
  }, [user, loading]);

  const fetchAll = async () => {
    setDataLoading(true);
    try {
      const [statsRes, usersRes, propsRes, leadsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: getHeaders() }),
        axios.get(`${API}/admin/users`, { headers: getHeaders() }),
        axios.get(`${API}/admin/properties`, { headers: getHeaders() }),
        axios.get(`${API}/admin/leads`, { headers: getHeaders() }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProperties(propsRes.data);
      setLeads(leadsRes.data);
    } catch { /* ignore */ }
    setDataLoading(false);
  };

  const updateRole = async (userId, role) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/role`, { role }, { headers: getHeaders() });
      setUsers(u => u.map(x => x.user_id === userId ? { ...x, role } : x));
      showMsg(`Role updated to ${role}`);
    } catch { showMsg("Failed to update role."); }
  };

  const deleteProperty = async (propId) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await axios.delete(`${API}/admin/properties/${propId}`, { headers: getHeaders() });
      setProperties(p => p.filter(x => x.prop_id !== propId));
      showMsg("Property deleted.");
    } catch { showMsg("Delete failed."); }
  };

  const verifyProperty = async (propId, verified) => {
    try {
      await axios.put(`${API}/admin/properties/${propId}/verify`, { verified }, { headers: getHeaders() });
      setProperties(p => p.map(x => x.prop_id === propId ? { ...x, verified } : x));
      showMsg(verified ? "Property verified!" : "Verification removed.");
    } catch { showMsg("Failed."); }
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const fmtPrice = (p) => {
    if (!p) return "—";
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)}Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
    return `₹${p.toLocaleString("en-IN")}`;
  };

  const ROLE_COLORS = { admin: "#C84B31", agent: "#1B4F72", user: "#1D6A43" };

  if (!user) return null;

  return (
    <div style={{ fontFamily: "'Noto Sans',sans-serif", background: "#F5F0E8", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Yeseva+One&display=swap" rel="stylesheet" />
      {/* Header */}
      <div style={{ background: "#1C0A00", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "rgba(255,248,240,.6)", fontSize: 14, fontFamily: "inherit" }}>
            <ArrowLeft size={18} /> Back
          </button>
          <div style={{ flex: 1, fontFamily: "'Yeseva One',serif", fontSize: 20, color: "#FFF8F0" }}>🏘️ PropBharat Admin</div>
          <div style={{ fontSize: 13, color: "rgba(255,248,240,.5)" }}>Logged in as {user.name}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
          {[["Total Users", stats.users, "#C84B31", "👥"], ["Properties", stats.properties, "#1B4F72", "🏠"], ["Leads", stats.leads, "#1D6A43", "📋"]].map(([l, v, c, ic]) => (
            <div key={l} style={{ background: "#FFFDF8", borderRadius: 16, padding: "20px 24px", border: "1px solid #EDE5D5" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: c, fontFamily: "'Yeseva One',serif" }}>{v}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{ic} {l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#FFFDF8", padding: 4, borderRadius: 12, border: "1px solid #EDE5D5", width: "fit-content", marginBottom: 24 }}>
          {[["users", "Users", Users], ["properties", "Properties", Home], ["leads", "Leads", FileText]].map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)} data-testid={`admin-tab-${k}`}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: tab === k ? "#1C1C1C" : "transparent", color: tab === k ? "#fff" : "#555", transition: "all .15s" }}>
              <Icon size={15} /> {l}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ background: "#F0FFF4", border: "1px solid #86EFAC", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#166534", marginBottom: 16 }} data-testid="admin-msg">
            ✅ {msg}
          </div>
        )}

        {dataLoading ? <div style={{ textAlign: "center", padding: 48, color: "#888" }}>Loading…</div> : (
          <>
            {/* Users Tab */}
            {tab === "users" && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1C", marginBottom: 20 }}>All Users ({users.length})</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {users.map(u => (
                    <div key={u.user_id} style={{ background: "#FFFDF8", borderRadius: 14, padding: "16px 20px", border: "1px solid #EDE5D5", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      {u.picture ? <img src={u.picture} style={{ width: 40, height: 40, borderRadius: "50%" }} alt="" /> : <div style={{ width: 40, height: 40, background: "#F5F0E8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1C" }}>{u.name}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>{u.email} {u.phone && `· +91 ${u.phone}`}</div>
                        <div style={{ fontSize: 11, color: "#BBB" }}>{u.auth_type} · Joined {new Date(u.created_at).toLocaleDateString("en-IN")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ background: ROLE_COLORS[u.role] || "#888", color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>{u.role}</span>
                        <select value={u.role} onChange={e => updateRole(u.user_id, e.target.value)} data-testid={`role-select-${u.user_id}`}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #DDD5C5", background: "#FEFCF7", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
                          <option value="user">user</option>
                          <option value="agent">agent</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Properties Tab */}
            {tab === "properties" && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1C", marginBottom: 20 }}>All Properties ({properties.length})</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {properties.map(p => (
                    <div key={p.prop_id} style={{ background: "#FFFDF8", borderRadius: 14, padding: "16px 20px", border: "1px solid #EDE5D5", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 32 }}>{p.img || "🏠"}</div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1C" }}>{p.title}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>📍 {p.locality}, {p.city} · {p.type} · {p.cat?.toUpperCase()}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>Owner: {p.owner}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#C84B31" }}>{fmtPrice(p.price || p.rent)}</div>
                        {p.verified && <span style={{ background: "#E8FFF0", color: "#1D6A43", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>✓ Verified</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => verifyProperty(p.prop_id, !p.verified)} data-testid={`verify-${p.prop_id}`}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: p.verified ? "#FFF0EC" : "#E8FFF0", border: "none", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, color: p.verified ? "#C84B31" : "#1D6A43", fontFamily: "inherit" }}>
                          {p.verified ? <XCircle size={14} /> : <CheckCircle size={14} />} {p.verified ? "Unverify" : "Verify"}
                        </button>
                        <button onClick={() => deleteProperty(p.prop_id)} data-testid={`admin-delete-${p.prop_id}`}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFF0EC", border: "none", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#C84B31", fontFamily: "inherit" }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads Tab */}
            {tab === "leads" && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1C1C", marginBottom: 20 }}>All Leads ({leads.length})</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {leads.map(l => (
                    <div key={l.lead_id} style={{ background: "#FFFDF8", borderRadius: 14, padding: "16px 20px", border: "1px solid #EDE5D5" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1C1C" }}>{l.name}</div>
                          <div style={{ fontSize: 13, color: "#888" }}>📱 +91 {l.phone} · 📍 {l.city}{l.locality ? `, ${l.locality}` : ""}</div>
                          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{l.prop_type} · {l.beds && `${l.beds} BHK`}{l.price && ` · ₹${l.price}`}</div>
                          {l.user_email && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>User: {l.user_email}</div>}
                        </div>
                        <div>
                          <span style={{ background: l.lead_type === "buy" ? "#FFF0EC" : l.lead_type === "rent" ? "#E8F0FF" : "#E8FFF0", color: l.lead_type === "buy" ? "#C84B31" : l.lead_type === "rent" ? "#1B4F72" : "#1D6A43", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{(l.lead_type || "").toUpperCase()}</span>
                          <div style={{ fontSize: 11, color: "#BBB", marginTop: 6, textAlign: "right" }}>{new Date(l.created_at).toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                      {l.desc && <div style={{ fontSize: 13, color: "#888", marginTop: 8, paddingTop: 8, borderTop: "1px solid #EDE5D5" }}>{l.desc}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
