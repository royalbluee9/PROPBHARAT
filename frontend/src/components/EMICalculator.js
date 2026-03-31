import { useState, useMemo } from "react";
import { X, Calculator } from "lucide-react";

export default function EMICalculator({ onClose }) {
  const [loan, setLoan] = useState("5000000");
  const [rate, setRate] = useState("8.5");
  const [tenure, setTenure] = useState("20");

  const calc = useMemo(() => {
    const P = parseFloat(loan) || 0;
    const r = (parseFloat(rate) || 0) / 12 / 100;
    const n = (parseFloat(tenure) || 0) * 12;
    if (!P || !r || !n) return null;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    return { emi, total, interest };
  }, [loan, rate, tenure]);

  const fmt = (v) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
    return `₹${Math.round(v).toLocaleString("en-IN")}`;
  };

  const pct = calc ? Math.round((calc.interest / calc.total) * 100) : 0;

  return (
    <div className="pb-modal-bg" onClick={onClose}>
      <div className="pb-modal" style={{ maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1B4F72,#0A2640)", padding: "26px 28px 22px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }} data-testid="emi-close-btn">
            <X size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Calculator size={28} color="#FFB89A" />
            <div>
              <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 22, color: "#FFF8F0" }}>EMI Calculator</div>
              <div style={{ color: "rgba(255,248,240,.7)", fontSize: 13 }}>Calculate your home loan EMI instantly</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* Loan Amount */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Loan Amount</label>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#C84B31" }}>{fmt(parseFloat(loan) || 0)}</span>
            </div>
            <input type="range" min="500000" max="50000000" step="100000" value={loan} onChange={e => setLoan(e.target.value)}
              style={{ width: "100%", accentColor: "#C84B31" }} data-testid="emi-loan-slider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#BBB", marginTop: 4 }}>
              <span>₹5L</span><span>₹5Cr</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Interest Rate (p.a.)</label>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1B4F72" }}>{parseFloat(rate) || 0}%</span>
            </div>
            <input type="range" min="6" max="15" step="0.1" value={rate} onChange={e => setRate(e.target.value)}
              style={{ width: "100%", accentColor: "#1B4F72" }} data-testid="emi-rate-slider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#BBB", marginTop: 4 }}>
              <span>6%</span><span>15%</span>
            </div>
          </div>

          {/* Tenure */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Loan Tenure</label>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1D6A43" }}>{parseFloat(tenure) || 0} Years</span>
            </div>
            <input type="range" min="1" max="30" step="1" value={tenure} onChange={e => setTenure(e.target.value)}
              style={{ width: "100%", accentColor: "#1D6A43" }} data-testid="emi-tenure-slider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#BBB", marginTop: 4 }}>
              <span>1 yr</span><span>30 yrs</span>
            </div>
          </div>

          {/* Results */}
          {calc && (
            <div style={{ background: "#F5F0E8", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 700, letterSpacing: .8 }}>MONTHLY EMI</div>
                <div style={{ fontFamily: "'Yeseva One',serif", fontSize: 36, color: "#C84B31", lineHeight: 1.1 }} data-testid="emi-result">{fmt(calc.emi)}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: .5 }}>PRINCIPAL</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1D6A43", marginTop: 4 }}>{fmt(parseFloat(loan))}</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: .5 }}>TOTAL INTEREST</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#C84B31", marginTop: 4 }}>{fmt(calc.interest)}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: .5 }}>TOTAL PAYMENT AMOUNT</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1B4F72", marginTop: 4 }}>{fmt(calc.total)}</div>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 6 }}>
                  <span>Principal {100 - pct}%</span><span>Interest {pct}%</span>
                </div>
                <div style={{ height: 8, background: "#EDE5D5", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${100 - pct}%`, background: "linear-gradient(90deg,#1D6A43,#2ECC71)", borderRadius: 4, float: "left" }} />
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#C84B31,#E74C3C)", borderRadius: 4, float: "left" }} />
                </div>
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, color: "#BBB", textAlign: "center" }}>
            * This is an approximate calculation. Actual EMI may vary based on bank policies and processing fees.
          </div>
        </div>
      </div>
    </div>
  );
}
