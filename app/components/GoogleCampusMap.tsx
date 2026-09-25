import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Car,
  CheckCircle2,
  ExternalLink,
  Flag,
  Gauge,
  LocateFixed,
  MapPin,
  Navigation,
  Radio,
  Route as RouteIcon,
  UserRound,
} from "lucide-react";
import {
  RUN_CAMPUS_CENTER,
  calculateDistanceMeters,
  formatDistance,
  generateCampusRoute,
  getLocationCoordinates,
} from "../data/campusLocations";
import { getCurrentRole, getProfile } from "../data/profileStore";

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

type Coordinates = { lat: number; lng: number };
type GpsStatus = "idle" | "requesting" | "live" | "unavailable";

const CAMPUS_BOUNDS = {
  minLat: 7.7285,
  maxLat: 7.7405,
  minLng: 4.4295,
  maxLng: 4.4445,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function getMapPoint({ lat, lng }: Coordinates) {
  return {
    x: clamp(
      ((lng - CAMPUS_BOUNDS.minLng) /
        (CAMPUS_BOUNDS.maxLng - CAMPUS_BOUNDS.minLng)) *
        100,
      4,
      96,
    ),
    y: clamp(
      ((CAMPUS_BOUNDS.maxLat - lat) /
        (CAMPUS_BOUNDS.maxLat - CAMPUS_BOUNDS.minLat)) *
        100,
      4,
      96,
    ),
  };
}

function isOnCampusMap({ lat, lng }: Coordinates) {
  return (
    lat >= CAMPUS_BOUNDS.minLat &&
    lat <= CAMPUS_BOUNDS.maxLat &&
    lng >= CAMPUS_BOUNDS.minLng &&
    lng <= CAMPUS_BOUNDS.maxLng
  );
}

function getBearing(from: Coordinates, to: Coordinates) {
  const startLat = (from.lat * Math.PI) / 180;
  const endLat = (to.lat * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(deltaLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function firstName(name: string, fallback: string) {
  return name.trim().split(/\s+/)[0] || fallback;
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
  const [currentRole, setCurrentRole] = useState<
    "student" | "driver" | "authority"
  >("student");
  const [riderName, setRiderName] = useState("Rider");
  const [progress, setProgress] = useState(0);
  const [hasTriggeredArrival, setHasTriggeredArrival] = useState(false);
  const [viewerPosition, setViewerPosition] = useState<Coordinates | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");

  const hasPickup = pickup.trim().length > 0;
  const hasDropoff = dropoff.trim().length > 0;
  const hasRoute = hasPickup && hasDropoff;
  const pickupCoords = useMemo(
    () => getLocationCoordinates(pickup),
    [pickup],
  );
  const dropoffCoords = useMemo(
    () => getLocationCoordinates(dropoff),
    [dropoff],
  );
  const waypoints = useMemo(
    () =>
      hasRoute ? generateCampusRoute(pickupCoords, dropoffCoords, 80) : [],
    [dropoffCoords, hasRoute, pickupCoords],
  );
  const currentWaypointIndex = waypoints.length
    ? Math.min(
        waypoints.length - 1,
        Math.floor((progress / 100) * (waypoints.length - 1)),
      )
    : 0;
  const simulatedDriverPosition =
    waypoints[currentWaypointIndex] ?? pickupCoords;
  const viewerIsOnCampus = viewerPosition
    ? isOnCampusMap(viewerPosition)
    : false;
  const usesDeviceDriverPosition =
    currentRole === "driver" && gpsStatus === "live" && viewerIsOnCampus;
  const driverPosition =
    usesDeviceDriverPosition && viewerPosition
      ? viewerPosition
      : simulatedDriverPosition;
  const riderPosition =
    currentRole === "student" && gpsStatus === "live" && viewerIsOnCampus
      ? viewerPosition ?? pickupCoords
      : pickupCoords;

  const nextWaypoint =
    waypoints[Math.min(currentWaypointIndex + 2, waypoints.length - 1)] ??
    dropoffCoords;
  const heading = getBearing(driverPosition, nextWaypoint);
  const pickupPoint = getMapPoint(pickupCoords);
  const dropoffPoint = getMapPoint(dropoffCoords);
  const driverPoint = getMapPoint(driverPosition);
  const riderPoint = getMapPoint(riderPosition);
  const totalDistanceMeters = hasRoute
    ? calculateDistanceMeters(
        pickupCoords.lat,
        pickupCoords.lng,
        dropoffCoords.lat,
        dropoffCoords.lng,
      )
    : 0;
  const remainingDistanceMeters = hasRoute
    ? usesDeviceDriverPosition
      ? calculateDistanceMeters(
          driverPosition.lat,
          driverPosition.lng,
          dropoffCoords.lat,
          dropoffCoords.lng,
        )
      : Math.max(0, Math.round(totalDistanceMeters * (1 - progress / 100)))
    : 0;
  const remainingSeconds = Math.max(
    0,
    Math.round(etaMinutes * 60 * (1 - progress / 100)),
  );
  const speedKmh =
    step === "active" && remainingSeconds > 0
      ? clamp(
          Math.round((remainingDistanceMeters / remainingSeconds) * 3.6),
          8,
          32,
        )
      : 0;
  const etaLabel =
    remainingSeconds > 0
      ? `${Math.max(1, Math.ceil(remainingSeconds / 60))} min`
      : "Arrived";
  const driverLabel =
    currentRole === "driver" ? "You" : firstName(driverName, "Driver");
  const riderLabel =
    currentRole === "student" ? "You" : firstName(riderName, "Rider");
  const instruction =
    progress >= 88
      ? `Destination ahead: ${dropoff}`
      : progress >= 56
        ? `Keep right toward ${dropoff}`
        : progress >= 20
          ? "Continue straight on the campus road"
          : `Head toward ${dropoff}`;
  const instructionDistance = Math.max(
    20,
    Math.round((remainingDistanceMeters * 0.22) / 10) * 10,
  );

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
    | string
    | undefined;
  const mapSource = useMemo(() => {
    if (mapsApiKey) {
      const params = new URLSearchParams({
        key: mapsApiKey,
        center: `${RUN_CAMPUS_CENTER.lat},${RUN_CAMPUS_CENTER.lng}`,
        zoom: "17",
        maptype: "roadmap",
      });
      return `https://www.google.com/maps/embed/v1/view?${params}`;
    }
    const query = encodeURIComponent(
      `${RUN_CAMPUS_CENTER.lat},${RUN_CAMPUS_CENTER.lng}`,
    );
    return `https://maps.google.com/maps?q=${query}&z=17&output=embed`;
  }, [mapsApiKey]);
  const navigationUrl = useMemo(() => {
    if (!hasRoute) return "https://www.google.com/maps";
    const params = new URLSearchParams({
      api: "1",
      origin: `${driverPosition.lat},${driverPosition.lng}`,
      destination: `${dropoffCoords.lat},${dropoffCoords.lng}`,
      travelmode: "driving",
      dir_action: "navigate",
    });
    return `https://www.google.com/maps/dir/?${params}`;
  }, [driverPosition, dropoffCoords, hasRoute]);

  useEffect(() => {
    const profile = getProfile();
    setCurrentRole(getCurrentRole());
    setRiderName(profile.name || "Rider");
  }, []);

  useEffect(() => {
    if (step === "active" && hasRoute) {
      setProgress(3);
      setHasTriggeredArrival(false);
      return;
    }
    if (step === "selecting" && hasRoute) {
      setProgress(0);
      return;
    }
    if (step === "idle") {
      setProgress(0);
      setHasTriggeredArrival(false);
    }
  }, [dropoff, hasRoute, pickup, step]);

  useEffect(() => {
    if (step !== "active" || !hasRoute || usesDeviceDriverPosition) return;
    const interval = window.setInterval(() => {
      setProgress((current) =>
        Math.min(100, current + 100 / (Math.max(etaMinutes, 1) * 60)),
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [etaMinutes, hasRoute, step, usesDeviceDriverPosition]);

  useEffect(() => {
    if (
      progress < 100 ||
      hasTriggeredArrival ||
      step !== "active" ||
      !onDestinationReached
    ) {
      return;
    }
    setHasTriggeredArrival(true);
    const timeout = window.setTimeout(onDestinationReached, 1200);
    return () => window.clearTimeout(timeout);
  }, [hasTriggeredArrival, onDestinationReached, progress, step]);

  useEffect(() => {
    if (!hasRoute || (step !== "selecting" && step !== "active")) {
      setGpsStatus("idle");
      setViewerPosition(null);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }
    setGpsStatus("requesting");
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setViewerPosition({ lat: coords.latitude, lng: coords.longitude });
        setGpsStatus("live");
      },
      () => setGpsStatus("unavailable"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [hasRoute, step]);

  const routePoints = waypoints
    .map((point) => {
      const { x, y } = getMapPoint(point);
      return `${x},${y}`;
    })
    .join(" ");
  const travelledPoints = waypoints
    .slice(0, currentWaypointIndex + 1)
    .map((point) => {
      const { x, y } = getMapPoint(point);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#e8ecef]">
      <div className="absolute inset-0">
        <iframe
          key={mapSource}
          title="Redeemer's University live Google map"
          src={mapSource}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
          style={{ filter: "saturate(0.9) contrast(0.96)" }}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        {hasRoute && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              points={routePoints}
              fill="none"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={routePoints}
              fill="none"
              stroke="#1677ff"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {step === "active" && travelledPoints && (
              <polyline
                points={travelledPoints}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        )}

        {hasPickup && (
          <div
            className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${riderPoint.x}%`, top: `${riderPoint.y}%` }}
          >
            <div className="mb-1 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-gray-900 shadow-md">
              {riderLabel}
            </div>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#1dbf73] text-white shadow-lg">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#1dbf73]/30" />
              <UserRound className="relative h-4 w-4" strokeWidth={2.5} />
            </div>
          </div>
        )}

        {hasDropoff && (
          <div
            className="absolute z-20 flex -translate-x-1/2 -translate-y-full flex-col items-center"
            style={{ left: `${dropoffPoint.x}%`, top: `${dropoffPoint.y}%` }}
          >
            <div className="mb-1 max-w-40 truncate rounded-lg bg-gray-950 px-2 py-1 text-[10px] font-bold text-white shadow-md">
              {dropoff}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-[3px] border-white bg-gray-950 text-white shadow-lg">
              <Flag className="h-3.5 w-3.5" fill="currentColor" />
            </div>
          </div>
        )}

        {hasRoute && (
          <div
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-1000 ease-linear"
            style={{ left: `${driverPoint.x}%`, top: `${driverPoint.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              <div className="mb-1 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-gray-900 shadow-md">
                {driverLabel}
              </div>
              <div className="absolute top-7 h-14 w-14 animate-pulse rounded-full bg-blue-500/15" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[#1677ff] text-white shadow-xl">
                <Navigation
                  className="h-5 w-5"
                  fill="currentColor"
                  style={{ transform: `rotate(${heading}deg)` }}
                />
              </div>
            </div>
          </div>
        )}

        {!hasRoute && hasPickup && (
          <div
            className="absolute z-20 -translate-x-1/2 translate-y-5 rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 shadow"
            style={{ left: `${pickupPoint.x}%`, top: `${pickupPoint.y}%` }}
          >
            Pickup
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-40 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto max-w-md rounded-lg bg-white shadow-lg">
          {step === "active" && hasRoute ? (
            <div className="flex min-h-20 items-center gap-3 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1677ff] text-white">
                <Navigation className="h-6 w-6" fill="currentColor" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-blue-600">
                  In {formatDistance(instructionDistance)}
                </div>
                <div className="truncate text-sm font-extrabold text-gray-950 sm:text-base">
                  {instruction}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-gray-500">
                  Following {driverLabel}'s live trip
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-white">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-950">RUN campus map</div>
                <div className="text-[10px] text-gray-500">
                  {hasRoute ? "Route ready" : "Choose pickup and destination"}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2 self-start">
          <div className="flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-[10px] font-bold text-gray-800 shadow-lg">
            {gpsStatus === "live" ? (
              <LocateFixed className="h-3.5 w-3.5 text-emerald-600" />
            ) : gpsStatus === "requesting" ? (
              <Radio className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            ) : (
              <Radio className="h-3.5 w-3.5 text-blue-600" />
            )}
            {gpsStatus === "live"
              ? "Device GPS live"
              : gpsStatus === "requesting"
                ? "Locating"
                : step === "active"
                  ? "Trip live"
                  : currentRole === "driver"
                    ? "Driver view"
                    : "Rider view"}
          </div>
          {hasRoute && (
            <a
              data-map-control
              href={navigationUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open turn-by-turn directions in Google Maps"
              title="Open in Google Maps"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-800 shadow-lg transition hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div
        data-map-control
        className="absolute right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-1.5"
      >
        <button
          type="button"
          onClick={() => setZoomLevel((value) => Math.min(2.4, value + 0.2))}
          aria-label="Zoom in"
          title="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-800 shadow-md transition hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((value) => Math.max(0.85, value - 0.2))}
          aria-label="Zoom out"
          title="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-800 shadow-md transition hover:bg-gray-50"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={resetView}
          aria-label={isFollowing ? "Recenter map" : "Follow driver"}
          title={isFollowing ? "Recenter map" : "Follow driver"}
          className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-md transition ${
            isFollowing
              ? "bg-[#1677ff] text-white"
              : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
        >
          {step === "active" && hasRoute ? (
            <Crosshair className="h-4 w-4" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </button>
      </div>

      {step === "active" && hasRoute && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-14 z-40 flex justify-center">
          <div className="pointer-events-auto grid w-full max-w-xl grid-cols-3 divide-x divide-gray-100 rounded-lg bg-white p-3 shadow-xl">
            <div className="flex items-center justify-center gap-2 px-2">
              <RouteIcon className="hidden h-4 w-4 text-emerald-600 sm:block" />
              <div className="min-w-0 text-center sm:text-left">
                <div className="text-[9px] font-bold uppercase text-gray-400">ETA</div>
                <div className="truncate text-sm font-extrabold text-gray-950 sm:text-base">{etaLabel}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 px-2">
              <LocateFixed className="hidden h-4 w-4 text-blue-600 sm:block" />
              <div className="min-w-0 text-center sm:text-left">
                <div className="text-[9px] font-bold uppercase text-gray-400">Left</div>
                <div className="truncate text-sm font-extrabold text-gray-950 sm:text-base">{formatDistance(remainingDistanceMeters)}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 px-2">
              <Gauge className="hidden h-4 w-4 text-gray-700 sm:block" />
              <div className="min-w-0 text-center sm:text-left">
                <div className="text-[9px] font-bold uppercase text-gray-400">Speed</div>
                <div className="truncate text-sm font-extrabold text-gray-950 sm:text-base">{speedKmh} km/h</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "active" && hasRoute && (
        <div className="pointer-events-none absolute bottom-24 left-3 z-40 hidden lg:block">
          <div className="flex items-center gap-2 rounded-lg bg-gray-950 px-3 py-2 text-white shadow-lg">
            {currentRole === "driver" ? (
              <Car className="h-4 w-4 text-blue-300" />
            ) : (
              <UserRound className="h-4 w-4 text-emerald-300" />
            )}
            <div>
              <div className="text-[9px] font-bold uppercase text-white/50">
                {currentRole === "driver" ? "Rider" : "Driver"}
              </div>
              <div className="max-w-40 truncate text-xs font-semibold">
                {currentRole === "driver" ? riderName : driverName || "Assigned driver"}
              </div>
              <div className="max-w-40 truncate text-[10px] text-white/60">
                {currentRole === "driver" ? `Pickup: ${pickup}` : vehicleType}
              </div>
            </div>
          </div>
        </div>
      )}

      {progress >= 100 && step === "active" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-950">You have arrived</h2>
            <p className="mt-1 text-sm text-gray-500">{dropoff}</p>
            <button
              type="button"
              onClick={onDestinationReached}
              className="mt-5 w-full rounded-lg bg-[#1dbf73] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#18a965]"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
