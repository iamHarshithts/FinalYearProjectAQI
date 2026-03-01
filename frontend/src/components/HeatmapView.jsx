import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import { API_BASE_URL } from '../constants/config';

const AQI_SCALE = [
  { label: "Good",        max: 50,   color: "#00B050", bg: "#00B05015", text: "#004d20" },
  { label: "Satisfactory",max: 100,  color: "#92D050", bg: "#92D05015", text: "#3d6600" },
  { label: "Moderate",    max: 200,  color: "#e6b800", bg: "#e6b80015", text: "#7a6200" },
  { label: "Poor",        max: 300,  color: "#FF9900", bg: "#FF990015", text: "#b35c00" },
  { label: "Very Poor",   max: 400,  color: "#FF0000", bg: "#FF000015", text: "#990000" },
  { label: "Severe",      max: 9999, color: "#C00000", bg: "#C0000015", text: "#6b0000" },
];

const getLevel = (aqi) => AQI_SCALE.find((l) => aqi <= l.max) || AQI_SCALE[5];

const advice = (aqi) => {
  if (aqi <= 50)  return "Good air. Safe for all activities.";
  if (aqi <= 100) return "Satisfactory. Sensitive groups be cautious.";
  if (aqi <= 200) return "Moderate. Reduce prolonged outdoor exposure.";
  if (aqi <= 300) return "Poor. Wear a mask outdoors.";
  if (aqi <= 400) return "Very Poor. Stay indoors; close windows.";
  return "Severe! Health emergency — avoid going outside.";
};

const CITIES = [
  { id: 1,  name: "Delhi",             lat: 28.6139, lon: 77.2090 },
  { id: 2,  name: "Mumbai",            lat: 19.0760, lon: 72.8777 },
  { id: 3,  name: "Bengaluru",         lat: 12.9716, lon: 77.5946 },
  { id: 4,  name: "Chennai",           lat: 13.0827, lon: 80.2707 },
  { id: 5,  name: "Hyderabad",         lat: 17.3850, lon: 78.4867 },
  { id: 6,  name: "Kolkata",           lat: 22.5726, lon: 88.3639 },
  { id: 7,  name: "Pune",              lat: 18.5204, lon: 73.8567 },
  { id: 8,  name: "Ahmedabad",         lat: 23.0225, lon: 72.5714 },
  { id: 9,  name: "Jaipur",            lat: 26.9124, lon: 75.7873 },
  { id: 10, name: "Lucknow",           lat: 26.8467, lon: 80.9462 },
  { id: 11, name: "Chandigarh",        lat: 30.7333, lon: 76.7794 },
  { id: 12, name: "Amritsar",          lat: 31.6340, lon: 74.8723 },
  { id: 13, name: "Surat",             lat: 21.1702, lon: 72.8311 },
  { id: 14, name: "Kanpur",            lat: 26.4499, lon: 80.3319 },
  { id: 15, name: "Nagpur",            lat: 21.1458, lon: 79.0882 },
  { id: 16, name: "Bhopal",            lat: 23.2599, lon: 77.4126 },
  { id: 17, name: "Indore",            lat: 22.7196, lon: 75.8577 },
  { id: 18, name: "Visakhapatnam",     lat: 17.6868, lon: 83.2185 },
  { id: 19, name: "Patna",             lat: 25.5941, lon: 85.1376 },
  { id: 20, name: "Varanasi",          lat: 25.3176, lon: 82.9739 },
  { id: 21, name: "Agra",              lat: 27.1767, lon: 78.0081 },
  { id: 22, name: "Guwahati",          lat: 26.1445, lon: 91.7362 },
  { id: 23, name: "Bhubaneswar",       lat: 20.2961, lon: 85.8245 },
  { id: 24, name: "Kochi",             lat: 9.9312,  lon: 76.2673 },
  { id: 25, name: "Thiruvananthapuram",lat: 8.5241,  lon: 76.9366 },
  { id: 26, name: "Coimbatore",        lat: 11.0168, lon: 76.9558 },
  { id: 27, name: "Ranchi",            lat: 23.3441, lon: 85.3096 },
  { id: 28, name: "Goa",              lat: 15.2993, lon: 74.1240 },
  { id: 29, name: "Srinagar",          lat: 34.0837, lon: 74.7973 },
  { id: 30, name: "Dehradun",          lat: 30.3165, lon: 78.0322 },
];

const fetchAQI = async (lat, lon) => {
  const res = await fetch(`${API_BASE_URL}/predict?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const aqi = json.cpcb_aqi;  
  const lvl = getLevel(aqi);

  return {
    lat,
    lon,
    aqi,
    label:  lvl.label,
    color:  lvl.color,
    bg:     lvl.bg,
    text:   lvl.text,
    ml_aqi: json.ml_aqi,
    pm2_5:  json.pollutants?.pm2_5,
    pm10:   json.pollutants?.pm10,
    no2:    json.pollutants?.no2,
    so2:    json.pollutants?.so2,
    co:     json.pollutants?.co,
    o3:     json.pollutants?.o3,
    no:     json.pollutants?.no,
    nh3:    json.pollutants?.nh3,
  };
};

const ClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const DetailPanel = ({ data, name, onClose }) => {
  if (!data) return null;
  return (
    <div style={{
      position: "absolute", top: 12, right: 12, width: 260,
      zIndex: 1000, borderRadius: 18, overflow: "hidden",
      border: `2px solid ${data.color}`,
      boxShadow: `0 8px 32px ${data.color}44`,
      background: "white",
      animation: "slideIn .25s ease",
    }}>
      <div style={{ background: data.color, padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, margin: 0, fontWeight: 600 }}>{name}</p>
            <p style={{ color: "white", fontSize: 28, fontWeight: 900, margin: "4px 0 2px" }}>
              {data.aqi}
            </p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, margin: 0 }}>
              {data.label} • CPCB AQI
            </p>
            {data.ml_aqi && (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, margin: "3px 0 0" }}>
                ML Raw: {data.ml_aqi}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.25)", border: "none", borderRadius: "50%",
            width: 26, height: 26, color: "white", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900,
          }}>×</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "10px 12px 0" }}>
        {[`${data.lat.toFixed(4)}°N`, `${data.lon.toFixed(4)}°E`].map((v) => (
          <span key={v} style={{
            flex: 1, textAlign: "center", background: "#f8f9fa", borderRadius: 10,
            padding: "4px 0", fontSize: 10, fontFamily: "monospace", color: "#6b7280",
          }}>{v}</span>
        ))}
      </div>

      <div style={{ padding: "10px 12px" }}>
        {[
          ["PM2.5", data.pm2_5, "μg/m³", 250,   "#e74c3c"],
          ["PM10",  data.pm10,  "μg/m³", 430,   "#e67e22"],
          ["NO₂",  data.no2,   "μg/m³", 400,   "#9b59b6"],
          ["SO₂",  data.so2,   "μg/m³", 800,   "#f39c12"],
          ["CO",   data.co,    "μg/m³", 34000, "#1abc9c"],
          ["O₃",   data.o3,    "μg/m³", 180,   "#3498db"],
        ].map(([label, val, unit, max, bar]) => {
          const pct = Math.min(((val || 0) / max) * 100, 100);
          return (
            <div key={label} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#555" }}>{label}</span>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{(val || 0).toFixed(1)} {unit}</span>
              </div>
              <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: bar, borderRadius: 99, transition: "width .5s" }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        margin: "0 10px 10px", padding: "8px 10px", borderRadius: 10,
        background: data.bg, borderLeft: `3px solid ${data.color}`,
        fontSize: 11, lineHeight: 1.5, color: data.text,
      }}>
        {advice(data.aqi)}
      </div>
    </div>
  );
};

const HeatmapView = ({ lat, lon }) => {
  const [cities, setCities]         = useState([]);
  const [loaded, setLoaded]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [clickLoading, setClickLoading] = useState(false);
  const [clickResult, setClickResult]   = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const results = [];
      for (let i = 0; i < CITIES.length; i += 5) {
        const batch = CITIES.slice(i, i + 5);
        const settled = await Promise.allSettled(
          batch.map(async (city) => ({ city, data: await fetchAQI(city.lat, city.lon) }))
        );
        settled.forEach((r) => {
          if (r.status === "fulfilled") {
            results.push({ ...r.value.city, ...r.value.data });
            setLoaded((n) => n + 1);
          }
        });
        setCities([...results]);
        if (i + 5 < CITIES.length) await new Promise((r) => setTimeout(r, 300));
      }
      if (results.length === 0) setError("Could not reach backend. Is Backend running?");
      setLoading(false);
    };
    load();
  }, []);

  const handleClick = async (clickLat, clickLon) => {
    setSelected(null);
    setClickLoading(true);
    setClickResult(null);
    try {
      const data = await fetchAQI(clickLat, clickLon);
      setClickResult(data);
      setSelected({ data, name: `${clickLat.toFixed(3)}°N, ${clickLon.toFixed(3)}°E` });
    } catch {
      setClickResult(null);
    }
    setClickLoading(false);
  };

  const avg    = cities.length ? Math.round(cities.reduce((s, c) => s + c.aqi, 0) / cities.length) : null;
  const worst  = cities.length ? cities.reduce((a, b) => b.aqi > a.aqi ? b : a) : null;
  const best   = cities.length ? cities.reduce((a, b) => b.aqi < a.aqi ? b : a) : null;
  const avgLvl = avg != null ? getLevel(avg) : null;

  if (loading && cities.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 500, gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #dbeafe", borderTop: "4px solid #3b82f6", animation: "spin 1s linear infinite" }} />
        <p style={{ fontWeight: 700, color: "#475569" }}>Fetching AQI from ML model for {CITIES.length} cities…</p>
        <div style={{ width: 240, height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(loaded / CITIES.length) * 100}%`, background: "#3b82f6", transition: "width .3s", borderRadius: 99 }} />
        </div>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>{loaded} / {CITIES.length}</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ fontSize: 40 }}>⚠️</p>
        <p style={{ color: "#ef4444", fontWeight: 700 }}>{error}</p>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>Make sure your Backend backend is running at {API_BASE_URL}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); }  to { opacity:1; transform:none; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
      `}</style>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "National Avg",   value: avg ?? "–",                    sub: avgLvl?.label,  color: avgLvl?.color },
          { label: "Cities",         value: cities.length,                  sub: loading ? `${loaded}/${CITIES.length} loading…` : "ML Powered" },
          { label: "Most Polluted",  value: worst ? Math.round(worst.aqi) : "–", sub: worst?.name, color: worst ? getLevel(worst.aqi).color : undefined },
          { label: "Cleanest Air",   value: best  ? Math.round(best.aqi)  : "–", sub: best?.name,  color: best  ? getLevel(best.aqi).color  : undefined },
        ].map((s) => (
          <div key={s.label} style={{
            flex: "1 1 120px", background: "white", borderRadius: 16, padding: "12px 16px",
            border: `2px solid ${s.color || "#e5e7eb"}`,
            boxShadow: s.color ? `0 2px 12px ${s.color}22` : "0 1px 4px #0001",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: s.color || "#1f2937", margin: "4px 0 2px", lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 24px #0002" }}>
        <MapContainer center={[22.5, 82.0]} zoom={5} style={{ height: 540 }} zoomControl>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={handleClick} />

          {/* User location */}
          {lat && lon && (
            <CircleMarker
              center={[parseFloat(lat), parseFloat(lon)]}
              radius={9}
              pathOptions={{ color: "#1e40af", fillColor: "#3b82f6", fillOpacity: 1, weight: 2 }}
            >
              <Popup><b>Your Location</b></Popup>
            </CircleMarker>
          )}

          {/* City markers */}
          {cities.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lon]}
              radius={13}
              pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: 0.7, weight: 2 }}
              eventHandlers={{ click: () => setSelected({ data: c, name: c.name }) }}
            >
              <Popup>
                <div style={{ minWidth: 140 }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: c.color, margin: "0 0 2px" }}>{c.aqi}</p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 6px" }}>{c.label}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 6px" }}>
                    PM2.5: {c.pm2_5?.toFixed(1)} · PM10: {c.pm10?.toFixed(1)}
                  </p>
                  <button
                    onClick={() => setSelected({ data: c, name: c.name })}
                    style={{
                      width: "100%", padding: "6px 0", borderRadius: 8, border: "none",
                      background: c.color, color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer",
                    }}
                  >Details →</button>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Clicked location marker */}
          {clickResult && !clickLoading && (
            <CircleMarker
              center={[clickResult.lat, clickResult.lon]}
              radius={16}
              pathOptions={{
                color: clickResult.color, fillColor: clickResult.color,
                fillOpacity: 0.45, weight: 3, dashArray: "6 3",
              }}
              eventHandlers={{ click: () => setSelected({ data: clickResult, name: `${clickResult.lat.toFixed(3)}°N, ${clickResult.lon.toFixed(3)}°E` }) }}
            >
              <Popup>
                <p style={{ fontWeight: 700, color: clickResult.color }}>
                  AQI: {clickResult.aqi} — {clickResult.label}
                </p>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 16, left: 12, zIndex: 1000,
          background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: "10px 14px",
          boxShadow: "0 2px 16px #0002", backdropFilter: "blur(6px)",
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>CPCB AQI (ML Model)</p>
          {AQI_SCALE.map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#374151" }}>{l.label}</span>
              <span style={{ fontSize: 9, color: "#d1d5db", marginLeft: "auto", paddingLeft: 8 }}>
                ≤{l.max === 9999 ? "500+" : l.max}
              </span>
            </div>
          ))}
          <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 8, paddingTop: 6, borderTop: "1px solid #f0f0f0" }}>
            👆 Click map for AQI
          </p>
        </div>

        {/* Loading badge */}
        {loading && (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, background: "rgba(255,255,255,0.92)", borderRadius: 99,
            padding: "6px 16px", boxShadow: "0 2px 12px #0002",
            display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(6px)",
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #93c5fd", borderTop: "2px solid #2563eb", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              ML Model: {loaded}/{CITIES.length}…
            </span>
          </div>
        )}

        {/* Click loading badge */}
        {clickLoading && (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, background: "rgba(99,102,241,0.92)", borderRadius: 99,
            padding: "6px 16px", boxShadow: "0 2px 12px #6366f144",
            display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(6px)",
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid white", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>Fetching from ML Model…</span>
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            data={selected.data}
            name={selected.name}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* City grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
        {cities.map((c) => {
          const isActive = selected?.data === c;
          return (
            <div
              key={c.id}
              onClick={() => setSelected({ data: c, name: c.name })}
              style={{
                background: "white", borderRadius: 12, padding: "10px 12px", cursor: "pointer",
                border: `2px solid ${isActive ? c.color : "#f0f0f0"}`,
                boxShadow: isActive ? `0 4px 14px ${c.color}44` : "none",
                transition: "all .2s",
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 800, color: "#374151", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: c.color, margin: "0 0 2px", lineHeight: 1 }}>{c.aqi}</p>
              <span style={{
                display: "inline-block", fontSize: 9, fontWeight: 700, padding: "2px 7px",
                borderRadius: 99, background: `${c.color}22`, color: c.text, textTransform: "uppercase",
              }}>{c.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatmapView;