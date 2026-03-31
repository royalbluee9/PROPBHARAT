import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, X, Navigation, ChevronDown } from "lucide-react";
import { ALL_CITIES, POPULAR_CITIES } from "../data/cities";

const accent = "#C84B31";

// Group all cities by state (memoised once at module level)
const STATE_GROUPS = ALL_CITIES.reduce((acc, city) => {
  if (!acc[city.state]) acc[city.state] = [];
  acc[city.state].push(city.name);
  return acc;
}, {});

export default function CityPicker({ value, onChange, placeholder = "All India", dark = false }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [detecting, setDetecting] = useState(false);
  const wrapRef  = useRef();
  const inputRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else setQuery("");
  }, [open]);

  // Haversine nearest-city detector
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        let nearest = null;
        let minDist = Infinity;
        for (const city of ALL_CITIES) {
          const d = Math.pow(city.lat - latitude, 2) + Math.pow(city.lng - longitude, 2);
          if (d < minDist) { minDist = d; nearest = city; }
        }
        if (nearest) { onChange(nearest.name); setOpen(false); }
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 6000 }
    );
  }, [onChange]);

  const select = useCallback(name => {
    onChange(name);
    setOpen(false);
  }, [onChange]);

  const clear = useCallback(() => {
    onChange("");
    setOpen(false);
  }, [onChange]);

  // Filter results as user types
  const filteredGroups = query.length >= 1
    ? Object.entries(STATE_GROUPS).reduce((acc, [state, cities]) => {
        const q = query.toLowerCase();
        const matched = cities.filter(c =>
          c.toLowerCase().includes(q) || state.toLowerCase().includes(q)
        );
        if (matched.length) acc[state] = matched;
        return acc;
      }, {})
    : null;

  const totalFiltered = filteredGroups ? Object.values(filteredGroups).flat().length : 0;

  // --- trigger button styles
  const triggerBg   = dark ? "rgba(255,255,255,.08)" : "#FFFDF8";
  const triggerBdr  = dark ? "rgba(255,255,255,.15)" : "#DDD5C5";
  const triggerClr  = value ? (dark ? "#FFF8F0" : "#1C1C1C") : (dark ? "rgba(255,248,240,.5)" : "#888");

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(v => !v)}
        data-testid="city-picker-trigger"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: triggerBg, border: `1.5px solid ${triggerBdr}`,
          borderRadius: 12, padding: "12px 16px",
          cursor: "pointer", fontFamily: "inherit",
          fontSize: 14, color: triggerClr,
          whiteSpace: "nowrap", transition: "border-color .15s",
          minWidth: 160,
        }}
      >
        <MapPin size={15} color={value ? accent : (dark ? "rgba(255,248,240,.4)" : "#CCC")} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: value ? 600 : 400, flex: 1, textAlign: "left" }}>
          {value || placeholder}
        </span>
        <ChevronDown size={13} style={{ opacity: .5, flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          data-testid="city-picker-panel"
          style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0,
            width: 360, background: "#FFFDF8",
            border: "1.5px solid #EDE5D5", borderRadius: 18,
            boxShadow: "0 20px 60px rgba(0,0,0,.18)", zIndex: 600,
            overflow: "hidden",
            animation: "pb-drop-in .18s ease",
          }}
        >
          {/* Search bar */}
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #F0EAE0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#F5F0E8", borderRadius: 10, padding: "9px 13px" }}>
              <Search size={14} color="#BBB" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search city or state…"
                data-testid="city-search-input"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13.5, fontFamily: "inherit", color: "#1C1C1C" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#AAA", lineHeight: 1, padding: 0 }}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ maxHeight: 370, overflowY: "auto" }}>

            {/* Detect my location */}
            <div style={{ padding: "10px 14px 4px" }}>
              <button
                onClick={detectLocation}
                disabled={detecting}
                data-testid="detect-location-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 9, width: "100%",
                  background: "linear-gradient(135deg,#E8F0FF,#D8E8FD)",
                  border: "1px solid #B8D0F8", borderRadius: 10,
                  padding: "10px 14px", cursor: "pointer",
                  fontSize: 13, color: "#1B4F72", fontWeight: 600,
                  fontFamily: "inherit", opacity: detecting ? .65 : 1,
                  transition: "opacity .2s",
                }}
              >
                <Navigation size={14} />
                {detecting ? "Detecting your location…" : "Detect My Location"}
              </button>
            </div>

            {query ? (
              /* ── Filtered search results ── */
              totalFiltered === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#AAA", fontSize: 13 }}>
                  No cities found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(filteredGroups).map(([state, cities]) => (
                  <div key={state}>
                    <div style={{ padding: "10px 16px 3px", fontSize: 10, fontWeight: 800, color: accent, letterSpacing: 1.2, textTransform: "uppercase" }}>
                      {state}
                    </div>
                    {cities.map(city => (
                      <CityRow key={city} city={city} selected={value === city} onSelect={() => select(city)} />
                    ))}
                  </div>
                ))
              )
            ) : (
              /* ── Default: popular + clear + all by state ── */
              <>
                {/* Clear option */}
                {value && (
                  <div style={{ padding: "8px 14px 0" }}>
                    <button
                      onClick={clear}
                      style={{ display: "flex", alignItems: "center", gap: 7, background: "#FFF0EC", border: "1px solid #F5B8A8", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, color: "#C84B31", fontFamily: "inherit" }}>
                      <X size={12} /> Clear — show All India
                    </button>
                  </div>
                )}

                {/* Popular cities grid */}
                <div style={{ padding: "10px 14px 3px" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#AAA", letterSpacing: 1.2, marginBottom: 8 }}>POPULAR CITIES</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {POPULAR_CITIES.map(city => (
                      <button
                        key={city}
                        onClick={() => select(city)}
                        data-testid={`popular-city-${city.replace(/ /g, "-")}`}
                        style={{
                          textAlign: "left", padding: "8px 10px", borderRadius: 9,
                          border: `1.5px solid ${value === city ? accent : "transparent"}`,
                          background: value === city ? "#FFF0EC" : "transparent",
                          cursor: "pointer", fontSize: 13,
                          color: value === city ? accent : "#333",
                          fontWeight: value === city ? 700 : 400,
                          fontFamily: "inherit", transition: "all .12s",
                        }}
                        onMouseEnter={e => { if (value !== city) e.currentTarget.style.background = "#F5F0E8"; }}
                        onMouseLeave={e => { if (value !== city) e.currentTarget.style.background = "transparent"; }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ margin: "8px 14px", height: 1, background: "#EDE5D5" }} />

                {/* All cities by state */}
                <div style={{ padding: "0 0 8px" }}>
                  <div style={{ padding: "4px 16px 3px", fontSize: 10, fontWeight: 800, color: "#AAA", letterSpacing: 1.2 }}>ALL CITIES</div>
                  {Object.entries(STATE_GROUPS).map(([state, cities]) => (
                    <div key={state}>
                      <div style={{ padding: "8px 16px 3px", fontSize: 10.5, fontWeight: 700, color: "#AAA", letterSpacing: .8 }}>
                        {state}
                      </div>
                      {cities.map(city => (
                        <CityRow key={city} city={city} selected={value === city} onSelect={() => select(city)} />
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CityRow({ city, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "8px 16px", cursor: "pointer", fontSize: 13.5,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: selected ? accent : "#1C1C1C",
        fontWeight: selected ? 700 : 400,
        transition: "background .1s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#F5F0E8"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {city}
      {selected && <span style={{ fontSize: 12, color: accent }}>✓</span>}
    </div>
  );
}
