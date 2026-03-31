import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Mail, Lock, User, Chrome } from "lucide-react";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, loginWithEmail, registerWithEmail, loginWithGoogle, onAuthSuccess } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (mode === "register" && !form.name) { setError("Please enter your name."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(form.email, form.password);
      } else {
        await registerWithEmail(form.name, form.email, form.password);
      }
      onAuthSuccess();
    } catch (e) {
      setError(e.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-modal-bg" onClick={() => setShowAuthModal(false)}>
      <div className="pb-modal" style={{ maxWidth: 440, width: "100%" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", padding: "28px 28px 24px", position: "relative" }}>
          <button onClick={() => setShowAuthModal(false)}
            style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 8, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center" }} data-testid="auth-modal-close">
            <X size={18} />
          </button>
          <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 24, color: "#FFF8F0", marginBottom: 4 }}>
            🏘️ PropBharat
          </div>
          <div style={{ color: "rgba(255,248,240,.7)", fontSize: 13 }}>
            {mode === "login" ? "Welcome back! Sign in to continue." : "Create your free account today."}
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* Tab switch */}
          <div style={{ display: "flex", background: "#F5F0E8", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[["login", "Sign In"], ["register", "Register"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                  background: mode === m ? "#fff" : "transparent", color: mode === m ? "#C84B31" : "#888",
                  boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,.1)" : "none", transition: "all .15s" }} data-testid={`auth-tab-${m}`}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>FULL NAME *</label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#BBB" }} />
                  <input className="pb-input" style={{ paddingLeft: 36 }} placeholder="Rahul Sharma" value={form.name}
                    onChange={e => upd("name", e.target.value)} data-testid="auth-name-input" />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>EMAIL ADDRESS *</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#BBB" }} />
                <input className="pb-input" style={{ paddingLeft: 36 }} placeholder="rahul@example.com" type="email" value={form.email}
                  onChange={e => upd("email", e.target.value)} data-testid="auth-email-input" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 6 }}>PASSWORD *</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#BBB" }} />
                <input className="pb-input" style={{ paddingLeft: 36 }} placeholder="Min. 6 characters" type="password" value={form.password}
                  onChange={e => upd("password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} data-testid="auth-password-input" />
              </div>
            </div>

            {error && (
              <div style={{ background: "#FFF0EC", border: "1px solid #F5B8A8", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#C84B31" }} data-testid="auth-error">
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", color: "#fff", border: "none", padding: "14px", borderRadius: 11, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? .7 : 1, transition: "all .18s" }} data-testid="auth-submit-btn">
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#EDE5D5" }} />
              <span style={{ fontSize: 12, color: "#BBB", fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "#EDE5D5" }} />
            </div>

            <button onClick={loginWithGoogle}
              style={{ background: "#fff", border: "1.5px solid #DDD5C5", color: "#333", padding: "13px", borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .18s" }} data-testid="google-login-btn">
              <Chrome size={18} color="#4285F4" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
