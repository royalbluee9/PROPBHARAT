import { useEffect, useRef, useState } from "react";

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function MapView({ properties }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loaded, setLoaded] = useState(!!window.google);

  useEffect(() => {
    if (window.google) { setLoaded(true); return; }
    if (document.getElementById("pb-gmaps-script")) return;
    const script = document.createElement("script");
    script.id = "pb-gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: INDIA_CENTER, zoom: 5,
        styles: [
          { featureType: "all", elementType: "geometry", stylers: [{ color: "#f5f0e8" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d8e8" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        ]
      });
    }
    // Clear old markers
    if (mapInstance.current._markers) {
      mapInstance.current._markers.forEach(m => m.setMap(null));
    }
    mapInstance.current._markers = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasMarkers = false;

    properties.forEach(p => {
      if (!p.lat || !p.lng) return;
      hasMarkers = true;
      const price = p.price ? `₹${(p.price / 100000).toFixed(1)}L` : p.rent ? `₹${(p.rent / 1000).toFixed(0)}K/mo` : "";
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstance.current,
        title: p.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: p.cat === "buy" ? "#C84B31" : p.cat === "rent" ? "#1B4F72" : "#1D6A43",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        }
      });

      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:'Noto Sans',sans-serif;padding:6px;max-width:200px">
          <div style="font-weight:700;font-size:13px;color:#1C1C1C;margin-bottom:4px">${p.title}</div>
          <div style="font-size:11px;color:#888">📍 ${p.locality}, ${p.city}</div>
          ${price ? `<div style="font-size:14px;font-weight:800;color:#C84B31;margin-top:6px">${price}</div>` : ""}
        </div>`
      });
      marker.addListener("click", () => info.open(mapInstance.current, marker));
      mapInstance.current._markers.push(marker);
      bounds.extend({ lat: p.lat, lng: p.lng });
    });

    if (hasMarkers) mapInstance.current.fitBounds(bounds);
    else mapInstance.current.setCenter(INDIA_CENTER);
  }, [loaded, properties]);

  if (!MAPS_KEY) return (
    <div style={{ height: 450, background: "#F5F0E8", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #DDD5C5" }}>
      <div style={{ textAlign: "center", color: "#888" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Map view unavailable</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Google Maps API key not configured</div>
      </div>
    </div>
  );

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}>
      {!loaded && (
        <div style={{ height: 450, background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#888" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
            <div>Loading map…</div>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: 450, display: loaded ? "block" : "none" }} data-testid="google-map" />
    </div>
  );
}
