import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const { handleGoogleSession } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) { navigate("/"); return; }

    const sessionId = match[1];
    handleGoogleSession(sessionId)
      .then(() => {
        window.history.replaceState({}, "", window.location.pathname);
        navigate("/");
      })
      .catch(() => navigate("/"));
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏘️</div>
        <div style={{ fontFamily: "'Yeseva One', serif", fontSize: 22, color: "#1C1C1C" }}>Signing you in…</div>
        <div style={{ marginTop: 16, width: 48, height: 4, background: "linear-gradient(135deg,#C84B31,#8B1A08)", borderRadius: 4, margin: "16px auto 0", animation: "pb-pulse 1s ease infinite alternate" }}></div>
        <style>{`@keyframes pb-pulse{from{opacity:.3}to{opacity:1}}`}</style>
      </div>
    </div>
  );
}
