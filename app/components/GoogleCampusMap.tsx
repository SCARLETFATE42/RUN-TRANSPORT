import { useState, useEffect, useRef, type MouseEvent } from "react";
import {
  CAMPUS_LOCATIONS,
  getLocationCoordinates,
  calculateDistanceMeters,
  formatDistance,
  generateCampusRoute,
} from "../data/campusLocations";
import { getCurrentRole } from "../data/profileStore";

interface GoogleCampusMapProps {
  step: "idle" | "selecting" | "active" | "payment";
  pickup?: string;
  dropoff?: string;
  driverName?: string;
  vehicleType?: string;
  etaMinutes?: number;
  onDestinationReached?: () => void;
  driverId?: string;
}

export default function GoogleCampusMap({
  step,
  pickup = "",
  dropoff = "",
  driverName = "",
  vehicleType = "",
  etaMinutes = 4,
  onDestinationReached,
}: GoogleCampusMapProps) {
  const currentRole = getCurrentRole();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Route & coordinates
  const pickupCoords = getLocationCoordinates(pickup || "");
  const dropoffCoords = getLocationCoordinates(dropoff || "");

  // Simulated vehicle progress (0→100)
  const [progress, setProgress] = useState(15);
  const [isNavigating, setIsNavigating] = useState(step === "active");
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState(1);
  const [hasTriggeredArrival, setHasTriggeredArrival] = useState(false);

  const waypoints = generateCampusRoute(pickupCoords, dropoffCoords, 30);
  const currentWaypointIndex = Math.min(
    waypoints.length - 1,
    Math.floor((progress / 100) * (waypoints.length - 1))
  );
  const currentDriverPos = waypoints[currentWaypointIndex] || pickupCoords;

  const totalDistanceMeters = calculateDistanceMeters(
    pickupCoords.lat, pickupCoords.lng,
    dropoffCoords.lat, dropoffCoords.lng
  );
  const remainingDistanceMeters = Math.max(
    0, Math.round(totalDistanceMeters * (1 - progress / 100))
  );
  const remainingSeconds = Math.max(
    0, Math.round(((100 - progress) / 100) * (etaMinutes * 60))
  );
  const simulatedSpeedKmh = progress > 0 && progress < 100 ? 28 : 0;

  // Sync on step change
  useEffect(() => {
    if (step === "active") {
      setIsNavigating(true);
      setProgress(5);
      setHasTriggeredArrival(false);
    } else if (step === "idle") {
      setIsNavigating(false);
      setProgress(15);
      setHasTriggeredArrival(false);
    }
  }, [step]);

  // Vehicle ticker
  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return Math.min(100, prev + 0.5 * simSpeedMultiplier);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isNavigating, simSpeedMultiplier]);

  // Arrival trigger
  useEffect(() => {
    if (progress >= 100 && !hasTriggeredArrival && isNavigating) {
      setHasTriggeredArrival(true);
      setIsNavigating(false);
      if (onDestinationReached) {
        const t = setTimeout(() => onDestinationReached(), 1200);
        return () => clearTimeout(t);
      }
    }
  }, [progress, hasTriggeredArrival, isNavigating, onDestinationReached]);

  const handleFastForward = () => {
    setIsNavigating(true);
    setProgress(98);
  };

  // Map bounds matching campus GPS range
  const mapBounds = {
    minLat: 7.7285, maxLat: 7.7405,
    minLng: 4.4295, maxLng: 4.4445,
  };

  const getXY = (lat: number, lng: number) => ({
    x: ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100,
    y: ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100,
  });

  const toPos = (lat: number, lng: number) => {
    const { x, y } = getXY(lat, lng);
    return {
      left: `${Math.min(94, Math.max(6, x))}%`,
      top:  `${Math.min(94, Math.max(6, y))}%`,
    };
  };

  const pickupPos  = toPos(pickupCoords.lat,       pickupCoords.lng);
  const dropoffPos = toPos(dropoffCoords.lat,       dropoffCoords.lng);
  const driverPos  = toPos(currentDriverPos.lat, currentDriverPos.lng);

  // Build SVG polyline points for the route
  const routePoints = waypoints.map((w) => {
    const { x, y } = getXY(w.lat, w.lng);
    return `${Math.min(94, Math.max(6, x))}% ${Math.min(94, Math.max(6, y))}%`;
  });

  // Pan handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };
  const handleMouseUp = () => setIsDragging(false);
  const resetView = () => { setPanOffset({ x: 0, y: 0 }); setZoomLevel(1); };

  const vehicleIcon = vehicleType.includes("Van") ? "🚐"
    : vehicleType.includes("Bus") || vehicleType.includes("Shuttle") ? "🚌"
    : "🚗";

  const etaLabel = remainingSeconds > 0
    ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`
    : "Arrived";

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: "#e8e0d8" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── REALISTIC MAP TILE LAYER ── */}
      <div
        className="absolute inset-0 transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      >
        {/* Google Maps-style light tile background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              url("https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/4.4372,7.7337,14,0/1200x800?access_token=pk.placeholder")
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Fallback realistic road grid pattern (Google Maps light style) */}
        <div className="absolute inset-0" style={{
          background: "#f2ede6",
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

        {/* Terrain color blocks — simulates Google Maps colour blocks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Green park/campus zone */}
          <div className="absolute" style={{
            left: "10%", top: "15%", width: "75%", height: "70%",
            background: "rgba(197, 225, 165, 0.45)",
            borderRadius: "12px",
          }} />
          {/* Main road horizontal */}
          <div className="absolute" style={{
            left: 0, right: 0, top: "30%", height: "18px",
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }} />
          {/* Main road horizontal 2 */}
          <div className="absolute" style={{
            left: 0, right: 0, top: "62%", height: "14px",
            background: "rgba(255,255,255,0.80)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }} />
          {/* Main road vertical */}
          <div className="absolute" style={{
            left: "28%", top: 0, bottom: 0, width: "14px",
            background: "rgba(255,255,255,0.80)",
            boxShadow: "1px 0 3px rgba(0,0,0,0.12)",
          }} />
          {/* Main road vertical 2 */}
          <div className="absolute" style={{
            left: "63%", top: 0, bottom: 0, width: "18px",
            background: "rgba(255,255,255,0.85)",
            boxShadow: "1px 0 3px rgba(0,0,0,0.15)",
          }} />
          {/* Secondary roads */}
          <div className="absolute" style={{
            left: 0, right: 0, top: "48%", height: "9px",
            background: "rgba(255,255,255,0.65)",
          }} />
          <div className="absolute" style={{
            left: "46%", top: 0, bottom: 0, width: "9px",
            background: "rgba(255,255,255,0.65)",
          }} />
          {/* Building blocks */}
          {[
            { l:"12%", t:"18%", w:"12%", h:"10%" },
            { l:"40%", t:"35%", w:"16%", h:"12%" },
            { l:"68%", t:"20%", w:"14%", h:"9%" },
            { l:"14%", t:"65%", w:"10%", h:"14%" },
            { l:"72%", t:"66%", w:"13%", h:"10%" },
            { l:"52%", t:"68%", w:"9%",  h:"12%" },
            { l:"30%", t:"38%", w:"6%",  h:"8%" },
          ].map((b, i) => (
            <div key={i} className="absolute rounded-sm" style={{
              left: b.l, top: b.t, width: b.w, height: b.h,
              background: "rgba(215,208,196,0.75)",
              border: "1px solid rgba(180,172,160,0.5)",
            }} />
          ))}
          {/* Water feature */}
          <div className="absolute rounded-full" style={{
            left: "76%", top: "42%", width: "10%", height: "8%",
            background: "rgba(148, 202, 237, 0.45)",
            border: "1px solid rgba(100,170,220,0.4)",
          }} />
          {/* Road labels (campus landmarks) */}
          {Object.entries(CAMPUS_LOCATIONS).slice(0, 8).map(([key, loc]) => {
            const pos = toPos(loc.lat, loc.lng);
            return (
              <div
                key={loc.id}
                className="absolute pointer-events-none"
                style={{ left: pos.left, top: pos.top, transform: "translate(-50%,-50%)" }}
              >
                {loc.popular && (
                  <div className="px-1.5 py-0.5 rounded text-[8px] font-medium whitespace-nowrap"
                    style={{
                      background: "rgba(255,255,255,0.82)",
                      color: "#333",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                      fontFamily: "system-ui, sans-serif",
                    }}>
                    {loc.name.length > 18 ? loc.name.slice(0, 17) + "…" : loc.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── SVG ROUTE POLYLINE (Bolt-style thick white line with blue) ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.25)" />
            </filter>
          </defs>

          {/* Route shadow (depth) */}
          {waypoints.length > 1 && (
            <polyline
              points={waypoints.map((w) => {
                const { x, y } = getXY(w.lat, w.lng);
                return `${Math.min(94, Math.max(6, x))},${Math.min(94, Math.max(6, y))}`;
              }).join(" ")}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Bolt-style route: thick white casing */}
          {waypoints.length > 1 && (
            <polyline
              points={waypoints.map((w) => {
                const { x, y } = getXY(w.lat, w.lng);
                return `${Math.min(94, Math.max(6, x))},${Math.min(94, Math.max(6, y))}`;
              }).join(" ")}
              stroke="white"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Inner blue route line */}
          {waypoints.length > 1 && (
            <polyline
              points={waypoints.map((w) => {
                const { x, y } = getXY(w.lat, w.lng);
                return `${Math.min(94, Math.max(6, x))},${Math.min(94, Math.max(6, y))}`;
              }).join(" ")}
              stroke="#1967D2"
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Travelled portion (greyed out / faded) */}
          {step === "active" && progress > 0 && (
            <polyline
              points={waypoints.slice(0, currentWaypointIndex + 1).map((w) => {
                const { x, y } = getXY(w.lat, w.lng);
                return `${Math.min(94, Math.max(6, x))},${Math.min(94, Math.max(6, y))}`;
              }).join(" ")}
              stroke="rgba(150,150,160,0.7)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* ── PICKUP PIN (Bolt green dot with ring) ── */}
        <div
          className="absolute z-20"
          style={{ left: pickupPos.left, top: pickupPos.top, transform: "translate(-50%,-100%)" }}
        >
          <div className="flex flex-col items-center">
            {/* Pill label */}
            <div className="mb-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shadow-md"
              style={{
                background: "white",
                color: "#1a1a1a",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
              📍 {pickup || "Pickup"}
            </div>
            {/* Bolt-style green pickup dot */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-9 h-9 rounded-full animate-ping"
                style={{ background: "rgba(29, 191, 113, 0.25)" }} />
              <div className="w-5 h-5 rounded-full border-3 border-white shadow-lg"
                style={{
                  background: "#1DBF71",
                  boxShadow: "0 2px 12px rgba(29,191,113,0.5), 0 0 0 3px white",
                }} />
            </div>
            {/* Stem */}
            <div className="w-0.5 h-3" style={{ background: "#1DBF71", opacity: 0.6 }} />
          </div>
        </div>

        {/* ── DESTINATION PIN (Bolt black square) ── */}
        <div
          className="absolute z-20"
          style={{ left: dropoffPos.left, top: dropoffPos.top, transform: "translate(-50%,-100%)" }}
        >
          <div className="flex flex-col items-center">
            {/* Label */}
            <div className="mb-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shadow-md"
              style={{
                background: "#1a1a1a",
                color: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
              🏁 {dropoff || "Destination"}
            </div>
            {/* Black square destination pin */}
            <div className="w-5 h-5 rounded-md shadow-lg"
              style={{
                background: "#1a1a1a",
                boxShadow: "0 2px 12px rgba(0,0,0,0.35), 0 0 0 3px white",
              }} />
            {/* Stem */}
            <div className="w-0.5 h-3 bg-gray-800" style={{ opacity: 0.6 }} />
          </div>
        </div>

        {/* ── DRIVER / CAR MARKER (Bolt-style white pill with icon) ── */}
        <div
          className="absolute z-30 transition-all duration-500 ease-linear"
          style={{ left: driverPos.left, top: driverPos.top, transform: "translate(-50%,-50%)" }}
        >
          <div className="relative flex items-center justify-center">
            {/* Soft glow ring */}
            <div className="absolute w-14 h-14 rounded-full animate-pulse"
              style={{ background: "rgba(25, 103, 210, 0.12)" }} />
            {/* White pill badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: "white",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1)",
              }}>
              <span className="text-lg leading-none">{vehicleIcon}</span>
              {driverName && (
                <span className="text-[11px] font-bold text-gray-900 whitespace-nowrap"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                  {driverName.split(" ")[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOLT-STYLE TOP STRIP: GPS LIVE + SPEED ── */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: GPS badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl pointer-events-auto"
          style={{
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
              RUN Transport
              <span className="text-[9px] px-1 py-0.5 rounded font-mono bg-blue-50 text-blue-600">LIVE</span>
            </div>
            <div className="text-[9px] text-gray-500">
              {step === "active" ? `En route → ${dropoff}` : "Redeemer's University"}
            </div>
          </div>
        </div>

        {/* Right: Speed pill (active only) */}
        {step === "active" && (
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="px-3 py-2 rounded-xl text-center"
              style={{
                background: "white",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
              <div className="text-[9px] text-gray-400 uppercase tracking-wide">Speed</div>
              <div className="text-sm font-extrabold text-gray-900">{simulatedSpeedKmh}<span className="text-[9px] font-normal ml-0.5">km/h</span></div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOLT-STYLE BOTTOM ETA BAR (active only) ── */}
      {step === "active" && (
        <div className="absolute bottom-16 left-3 right-3 z-40 pointer-events-none">
          <div className="flex items-stretch gap-2 p-3 rounded-2xl"
            style={{
              background: "white",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
            {/* ETA */}
            <div className="flex-1 text-center border-r border-gray-100 pr-3">
              <div className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">ETA</div>
              <div className="text-xl font-extrabold text-gray-900">{etaLabel}</div>
            </div>
            {/* Distance */}
            <div className="flex-1 text-center border-r border-gray-100 px-3">
              <div className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Distance</div>
              <div className="text-xl font-extrabold text-gray-900">{formatDistance(remainingDistanceMeters)}</div>
            </div>
            {/* Driver */}
            <div className="flex-1 text-center pl-3">
              <div className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Driver</div>
              <div className="text-sm font-bold text-gray-900 truncate">{driverName || "—"}</div>
              <div className="text-[9px] text-gray-400 truncate">{vehicleType || ""}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAP CONTROLS (Zoom + Reset) ── */}
      <div className="absolute bottom-6 right-3 z-40 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 text-lg font-bold cursor-pointer transition-all hover:bg-gray-50"
          style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 text-lg font-bold cursor-pointer transition-all hover:bg-gray-50"
          style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm cursor-pointer transition-all hover:bg-gray-50"
          style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          title="Re-centre"
        >
          🎯
        </button>
      </div>

      {/* ── FAST-FORWARD & SPEED CONTROLS ── */}
      {step === "active" && (
        <div className="absolute bottom-6 left-3 z-40 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleFastForward}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition-all hover:opacity-90 flex items-center gap-1.5"
            style={{
              background: "#1967D2",
              boxShadow: "0 2px 8px rgba(25,103,210,0.4)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            ⚡ Simulate Arrival
          </button>
          <button
            onClick={() => setSimSpeedMultiplier((p) => (p === 1 ? 4 : 1))}
            className="px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all hover:bg-gray-50"
            style={{
              background: "white",
              color: "#555",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {simSpeedMultiplier}×
          </button>
        </div>
      )}

      {/* ── DRIVER RADAR PANEL (driver view) ── */}
      {currentRole === "driver" && (
        <div className="absolute top-16 left-3 z-40 max-w-xs p-4 rounded-2xl pointer-events-auto"
          style={{
            background: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
              📡 Dispatch Radar
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-semibold border border-green-100">
              Active
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 truncate">Student: Temi Fashola</div>
          <div className="text-xs text-gray-500 mt-1">
            Pickup: <span className="text-blue-600 font-medium">{pickup}</span>
          </div>
          <div className="text-xs text-gray-500">
            Dropoff: <span className="text-gray-800 font-medium">{dropoff}</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">Distance left</span>
            <span className="font-bold text-gray-900">{formatDistance(remainingDistanceMeters)}</span>
          </div>
        </div>
      )}

      {/* ── ARRIVAL OVERLAY ── */}
      {progress >= 100 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
          <div className="max-w-sm w-full p-6 rounded-3xl text-center"
            style={{
              background: "white",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
              style={{ background: "#e8f5f0" }}>
              🏁
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">You've Arrived!</h2>
            <p className="text-sm text-gray-500 mb-5">
              Destination reached: <strong className="text-gray-900">{dropoff}</strong>
            </p>
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl mb-5 text-sm text-green-700 font-medium"
              style={{ background: "#f0faf5", border: "1px solid #c6ead9" }}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              Redirecting to Paystack payment…
            </div>
            <button
              onClick={() => { if (onDestinationReached) onDestinationReached(); }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:opacity-90"
              style={{ background: "#1DBF71", boxShadow: "0 4px 16px rgba(29,191,113,0.3)" }}
            >
              Proceed to Payment →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
