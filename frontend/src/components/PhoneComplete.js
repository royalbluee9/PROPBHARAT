import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Phone, X } from "lucide-react";

export default function PhoneComplete() {
  const { showPhoneModal, setShowPhoneModal, completeProfile, user } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showPhoneModal) return null;

  const handleSubmit = async () => {
    setError("");
    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Enter a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }
    setLoading(true);
    try {
      await completeProfile(cleaned);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to save phone number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-modal-bg">
      <div className="pb-modal" style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ background: "linear-gradient(135deg,#1B4F72,#0A2640)", padding: "26px 28px 22px", position: "relative" }}>
          <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 22, color: "#FFF8F0", marginBottom: 4 }}>
            Complete Your Profile
          </div>
          <div style={{ color: "rgba(255,248,240,.7)", fontSize: 13 }}>
            Add your mobile number to contact property owners and post leads.
          </div>
        </div>
        <div style={{ padding: "28px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 52 }}>📱</div>
            <div style={{ fontSize: 15, color: "#555", marginTop: 8 }}>
              Hi <strong style={{ color: "#1C1C1C" }}>{user?.name}</strong>! Please add your mobile number to unlock all features.
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: .8, display: "block", marginBottom: 8 }}>
              MOBILE NUMBER *
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 14, fontWeight: 600 }}>+91</div>
              <input className="pb-input" style={{ paddingLeft: 48 }} placeholder="98765 43210" type="tel" maxLength={10}
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} data-testid="phone-input" />
            </div>
          </div>

          {error && (
            <div style={{ background: "#FFF0EC", border: "1px solid #F5B8A8", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#C84B31", marginBottom: 16 }} data-testid="phone-error">
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ background: "linear-gradient(135deg,#C84B31,#8B1A08)", color: "#fff", border: "none", padding: "14px", borderRadius: 11, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", width: "100%", opacity: loading ? .7 : 1 }} data-testid="phone-submit-btn">
            {loading ? "Saving…" : "Save & Continue"}
          </button>

          <button onClick={() => setShowPhoneModal(false)}
            style={{ display: "block", width: "100%", marginTop: 12, background: "transparent", border: "1.5px solid #DDD5C5", color: "#888", padding: "11px", borderRadius: 11, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} data-testid="phone-skip-btn">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
