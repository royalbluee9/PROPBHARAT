import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0E8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "24px",
    }}>
      <div style={{
        background: "#FFFDF8",
        border: "1px solid #EDE5D5",
        borderRadius: "18px",
        padding: "48px 40px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        animation: "pb-fadeUp .5s ease both",
      }}>
        <div style={{
          fontSize: "72px",
          fontWeight: 700,
          color: "#C84B31",
          lineHeight: 1,
          marginBottom: "8px",
        }}>
          404
        </div>
        <h1 style={{
          fontSize: "22px",
          fontWeight: 700,
          color: "#1C1C1C",
          margin: "0 0 8px",
        }}>
          Page Not Found
        </h1>
        <p style={{
          fontSize: "15px",
          color: "#6B6B6B",
          margin: "0 0 32px",
          lineHeight: 1.5,
        }}>
          Looks like you've followed a broken link or entered a URL that doesn't exist on this site.
        </p>
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          <button
            onClick={() => navigate(-1)}
            className="pb-btn"
            style={{
              padding: "11px 22px",
              fontSize: "14px",
              background: "#FEFCF7",
              color: "#1C1C1C",
              border: "1.5px solid #DDD5C5",
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="pb-btn pb-btn-accent"
            style={{
              padding: "11px 22px",
              fontSize: "14px",
              background: "#C84B31",
            }}
          >
            <Home size={16} />
            Home
          </button>
          <button
            onClick={() => navigate("/?focus=search")}
            className="pb-btn"
            style={{
              padding: "11px 22px",
              fontSize: "14px",
              background: "#FEFCF7",
              color: "#1C1C1C",
              border: "1.5px solid #DDD5C5",
            }}
          >
            <Search size={16} />
            Search Properties
          </button>
        </div>
      </div>
    </div>
  );
}
