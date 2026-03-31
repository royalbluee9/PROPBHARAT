import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/MapView";
import axios from "axios";
import { ArrowLeft, Heart, Share2, Phone, MessageCircle, BedDouble, Bath, Maximize2, MapPin, CheckCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AMENITY_ICONS = { gym: "🏋️", pool: "🏊", parking: "🚗", security: "🛡️", lift: "🛗", garden: "🌿", club: "🎱", power: "⚡" };

export default function PropertyDetail() {
  const { prop_id } = useParams();
  const navigate = useNavigate();
  const { user, setShowAuthModal, getHeaders } = useAuth();
  const [prop, setProp] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    fetchProp();
    window.scrollTo(0, 0);
  }, [prop_id]);

  const fetchProp = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/properties/${prop_id}`);
      setProp(res.data);
      // Check favorites
      const favs = JSON.parse(localStorage.getItem("pb_favorites") || "[]");
      setIsFav(favs.includes(prop_id));
      // Fetch similar
      const simRes = await axios.get(`${API}/properties`, { params: { city: res.data.city, type: res.data.type, limit: 4 } });
      setSimilar((simRes.data.properties || []).filter(p => p.prop_id !== prop_id).slice(0, 3));
    } catch { navigate("/"); }
    setLoading(false);
  };

  const toggleFav = async () => {
    const favs = JSON.parse(localStorage.getItem("pb_favorites") || "[]");
    const newFavs = isFav ? favs.filter(f => f !== prop_id) : [...favs, prop_id];
    localStorage.setItem("pb_favorites", JSON.stringify(newFavs));
    setIsFav(!isFav);
    if (user) {
      try {
        if (isFav) await axios.delete(`${API}/favorites/${prop_id}`, { headers: getHeaders() });
        else await axios.post(`${API}/favorites`, { prop_id }, { headers: getHeaders() });
      } catch { /* ignore */ }
    }
  };

  const handleContact = () => {
    if (!user) { setShowAuthModal(true); return; }
    setShowContact(true);
  };

  const fmt = (price, rent) => {
    const v = price ?? rent;
    if (!v) return "Price on Request";
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
    return `₹${v.toLocaleString("en-IN")}`;
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏘️</div>
        <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 18, color: "#888" }}>Loading property…</div>
      </div>
    </div>
  );
  if (!prop) return null;

  const hasImages = prop.images && prop.images.length > 0;
  const accent = prop.cat === "buy" ? "#C84B31" : prop.cat === "rent" ? "#1B4F72" : "#1D6A43";

  return (
    <div style={{ fontFamily: "'Noto Sans',sans-serif", background: "#F5F0E8", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Yeseva+One&display=swap" rel="stylesheet" />

      {/* Sticky header */}
      <div style={{ background: "#FFFDF8", borderBottom: "1px solid #EDE5D5", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14, fontFamily: "inherit" }} data-testid="back-btn">
            <ArrowLeft size={18} /> Back
          </button>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prop.title}</div>
          <button onClick={toggleFav} style={{ background: isFav ? "#FFF0EC" : "#F5F0E8", border: "1.5px solid #DDD5C5", padding: "7px 12px", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }} data-testid="fav-btn">
            <Heart size={16} fill={isFav ? "#C84B31" : "none"} color={isFav ? "#C84B31" : "#888"} />
            {isFav ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
          {/* Left column */}
          <div>
            {/* Image Gallery */}
            <div style={{ borderRadius: 20, overflow: "hidden", background: hasImages ? "#000" : `linear-gradient(135deg,${prop.cat === "buy" ? "#FFF0E8,#FDEBD8" : prop.cat === "rent" ? "#E8F0FF,#D8E8FD" : "#E8FFF0,#D8FDE8"})`, height: 380, position: "relative", marginBottom: 20 }}>
              {hasImages ? (
                <>
                  <img src={prop.images[imgIdx]} alt={prop.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} data-testid="property-hero-image" />
                  {prop.images.length > 1 && (
                    <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                      {prop.images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          style={{ width: i === imgIdx ? 24 : 8, height: 8, borderRadius: 4, background: i === imgIdx ? "#fff" : "rgba(255,255,255,.5)", border: "none", cursor: "pointer", transition: "all .2s" }} />
                      ))}
                    </div>
                  )}
                  {prop.images.length > 1 && (
                    <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: "100%", display: "flex", justifyContent: "space-between", padding: "0 12px", pointerEvents: "none" }}>
                      <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} style={{ pointerEvents: "all", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.5)", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>←</button>
                      <button onClick={() => setImgIdx(i => Math.min(prop.images.length - 1, i + 1))} style={{ pointerEvents: "all", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,.5)", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>→</button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100 }}>
                  {prop.img || "🏠"}
                </div>
              )}
              {/* Badges */}
              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 6 }}>
                {prop.featured && <span style={{ background: "#C84B31", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>⭐ Featured</span>}
                {prop.verified && <span style={{ background: "rgba(27,106,67,.9)", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✓ Verified</span>}
              </div>
            </div>

            {/* Thumbnail strip */}
            {hasImages && prop.images.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
                {prop.images.map((url, i) => (
                  <img key={i} src={url} alt="" onClick={() => setImgIdx(i)}
                    style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 10, cursor: "pointer", border: `2px solid ${i === imgIdx ? accent : "transparent"}`, flexShrink: 0 }} />
                ))}
              </div>
            )}

            {/* Title & Location */}
            <div style={{ background: "#FFFDF8", borderRadius: 20, padding: "24px", border: "1px solid #EDE5D5", marginBottom: 16 }}>
              <h1 style={{ fontFamily: "'Yeseva One',serif", fontSize: 26, color: "#1C1C1C", marginBottom: 8, lineHeight: 1.25 }}>{prop.title}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 14, marginBottom: 16 }}>
                <MapPin size={15} /> {prop.locality}, {prop.city}
              </div>

              {/* Key stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
                {prop.bhk && <StatBox icon="🛏️" label="Bedrooms" value={`${prop.bhk} BHK`} />}
                {prop.bath && <StatBox icon="🚿" label="Bathrooms" value={`${prop.bath} Bath`} />}
                <StatBox icon="📐" label="Area" value={`${(prop.area || 0).toLocaleString("en-IN")} sq.ft`} />
                <StatBox icon={prop.status === "ready" ? "✅" : "🏗️"} label="Status" value={prop.status === "ready" ? "Ready to Move" : "Under Construction"} />
              </div>
            </div>

            {/* Description */}
            {prop.description && (
              <div style={{ background: "#FFFDF8", borderRadius: 20, padding: "24px", border: "1px solid #EDE5D5", marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: "#1C1C1C" }}>About this Property</h3>
                <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7 }}>{prop.description}</p>
              </div>
            )}

            {/* Amenities */}
            {prop.amenities && prop.amenities.length > 0 && (
              <div style={{ background: "#FFFDF8", borderRadius: 20, padding: "24px", border: "1px solid #EDE5D5", marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: "#1C1C1C" }}>Amenities</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
                  {prop.amenities.map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F5F0E8", borderRadius: 10, padding: "10px 14px" }}>
                      <span style={{ fontSize: 18 }}>{AMENITY_ICONS[a] || "✓"}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#555", textTransform: "capitalize" }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {prop.lat && prop.lng && (
              <div style={{ background: "#FFFDF8", borderRadius: 20, padding: "24px", border: "1px solid #EDE5D5", marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: "#1C1C1C" }}>Location</h3>
                <MapView properties={[prop]} />
              </div>
            )}
          </div>

          {/* Right sidebar - sticky */}
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ background: "#FFFDF8", borderRadius: 20, padding: "24px", border: "1px solid #EDE5D5", marginBottom: 16 }}>
              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: accent, fontFamily: "'Yeseva One',serif" }}>{fmt(prop.price, prop.rent)}</div>
                {prop.rent && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>per month</div>}
                {prop.area && <div style={{ fontSize: 13, color: "#888" }}>
                  {prop.price ? `₹${Math.round(prop.price / prop.area).toLocaleString("en-IN")}/sq.ft` : ""}
                </div>}
              </div>

              {/* Owner info */}
              <div style={{ background: "#F5F0E8", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#999", fontWeight: 700, letterSpacing: .8, marginBottom: 6 }}>LISTED BY</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1C1C1C" }}>👤 {prop.owner}</div>
                <span style={{ fontSize: 12, color: prop.role === "owner" ? "#1D6A43" : "#1B4F72", fontWeight: 600 }}>
                  {prop.role === "owner" ? "Property Owner" : "Verified Agent"}
                </span>
              </div>

              {showContact ? (
                <div>
                  <div style={{ background: "#E8FFF0", borderRadius: 12, padding: "12px 16px", marginBottom: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Mobile Number</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1D6A43" }}>+91 {prop.owner_phone}</div>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <a href={`https://wa.me/91${prop.owner_phone}?text=Hi, I'm interested in: ${prop.title}`} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", padding: "12px", borderRadius: 11, textDecoration: "none", fontWeight: 600, fontSize: 14 }} data-testid="detail-whatsapp-btn">
                      💬 WhatsApp
                    </a>
                    <a href={`tel:+91${prop.owner_phone}`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `linear-gradient(135deg,${accent},${accent}CC)`, color: "#fff", padding: "12px", borderRadius: 11, textDecoration: "none", fontWeight: 600, fontSize: 14 }} data-testid="detail-call-btn">
                      📞 Call Now
                    </a>
                  </div>
                </div>
              ) : (
                <button onClick={handleContact}
                  style={{ width: "100%", background: `linear-gradient(135deg,${accent},${accent}CC)`, color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} data-testid="reveal-contact-btn">
                  {user ? "Reveal Contact Details" : "Login to Contact Owner"}
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div style={{ background: "#FFFDF8", borderRadius: 20, padding: "20px 24px", border: "1px solid #EDE5D5" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 12 }}>PROPERTY DETAILS</div>
              {[
                ["Category", (prop.cat || "").toUpperCase()],
                ["Type", (prop.type || "").charAt(0).toUpperCase() + (prop.type || "").slice(1)],
                ["City", prop.city],
                ["Posted", `${prop.posted || 0} days ago`],
              ].map(([k, v]) => v && (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F5F0E8", fontSize: 13 }}>
                  <span style={{ color: "#888" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#333" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h3 style={{ fontFamily: "'Yeseva One',serif", fontSize: 22, color: "#1C1C1C", marginBottom: 20 }}>Similar Properties in {prop.city}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {similar.map(p => (
                <div key={p.prop_id} onClick={() => navigate(`/property/${p.prop_id}`)}
                  style={{ background: "#FFFDF8", borderRadius: 16, overflow: "hidden", border: "1px solid #EDE5D5", cursor: "pointer", transition: "transform .2s, box-shadow .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ height: 140, background: "linear-gradient(135deg,#FFF0E8,#FDEBD8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
                    {(p.images && p.images[0]) ? <img src={p.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : (p.img || "🏠")}
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1C", marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>📍 {p.locality}, {p.city}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: p.cat === "buy" ? "#C84B31" : "#1B4F72" }}>
                      {fmt(p.price, p.rent)}{p.rent ? "/mo" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div style={{ background: "#F5F0E8", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: .5, marginBottom: 2 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C" }}>{value}</div>
    </div>
  );
}
