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
  CAMPUS_LOCATIONS,
  RUN_CAMPUS_CENTER,
  calculateDistanceMeters,
  formatDistance,
  generateCampusRoute,
  getLocationCoordinates,
  getNearestCampusLocation,
} from "../data/campusLocations";
import { getCurrentRole, getProfile } from "../data/profileStore";
import type {
  DriverTrackingSnapshot,
  RideTrackingPhase,
} from "../types";

interface GoogleCampusMapProps {
  step: "idle" | "selecting" | "active" | "payment";
  pickup?: string;
  dropoff?: string;
  driverName?: string;
  vehicleType?: string;
  etaMinutes?: number;
  tripStartedAt?: number;
  onDestinationReached?: () => void;
  onTrackingUpdate?: (tracking: DriverTrackingSnapshot | null) => void;
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
const PICKUP_DWELL_SECONDS = 5;
const MIN_APPROACH_SECONDS = 30;
const MAX_APPROACH_SECONDS = 90;
const ESTIMATED_APPROACH_SPEED_MPS = 4.5;

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

function getDriverStartPosition(
  identity: string,
  pickupPosition: Coordinates,
): Coordinates {
  const candidates = Object.values(CAMPUS_LOCATIONS).filter(
    (location) =>
      calculateDistanceMeters(
        location.lat,
        location.lng,
        pickupPosition.lat,
        pickupPosition.lng,
      ) >= 80,
  );
  if (candidates.length === 0) return RUN_CAMPUS_CENTER;

  const hash = Array.from(identity || "driver").reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  const start = candidates[hash % candidates.length];
  return { lat: start.lat, lng: start.lng };
}

export default function GoogleCampusMap({
  step,
  pickup = "",
  dropoff = "",
  driverName = "",
  vehicleType = "",
  etaMinutes = 4,
  tripStartedAt,
  onDestinationReached,
  onTrackingUpdate,
  driverId = "",
}: GoogleCampusMapProps) {
  const [currentRole, setCurrentRole] = useState<
    "student" | "driver" | "authority"
  >("student");
  const [riderName, setRiderName] = useState("Rider");
  const [hasTriggeredArrival, setHasTriggeredArrival] = useState(false);
  const [viewerPosition, setViewerPosition] = useState<Coordinates | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [clock, setClock] = useState(() => Date.now());
  const [trackingStartedAt, setTrackingStartedAt] = useState(() => Date.now());

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
  const driverStartPosition = useMemo(
    () => getDriverStartPosition(driverId || driverName, pickupCoords),
    [driverId, driverName, pickupCoords],
  );
  const approachWaypoints = useMemo(
    () =>
      hasRoute
        ? generateCampusRoute(driverStartPosition, pickupCoords, 60)
        : [],
    [driverStartPosition, hasRoute, pickupCoords],
  );
  const tripWaypoints = useMemo(
    () =>
      hasRoute ? generateCampusRoute(pickupCoords, dropoffCoords, 80) : [],
    [dropoffCoords, hasRoute, pickupCoords],
  );
  const approachDistanceMeters = hasRoute
    ? calculateDistanceMeters(
        driverStartPosition.lat,
        driverStartPosition.lng,
        pickupCoords.lat,
        pickupCoords.lng,
      )
    : 0;
  const approachDurationSeconds = clamp(
    Math.round(approachDistanceMeters / ESTIMATED_APPROACH_SPEED_MPS),
    MIN_APPROACH_SECONDS,
    MAX_APPROACH_SECONDS,
  );
  const tripDurationSeconds = Math.max(60, Math.round(etaMinutes * 60));
  const totalTrackingSeconds =
    approachDurationSeconds + PICKUP_DWELL_SECONDS + tripDurationSeconds;
  const elapsedSeconds =
    step === "active"
      ? Math.max(0, (clock - (tripStartedAt ?? trackingStartedAt)) / 1000)
      : 0;
  const ridePhase: RideTrackingPhase =
    elapsedSeconds < approachDurationSeconds
      ? "approaching_pickup"
      : elapsedSeconds < approachDurationSeconds + PICKUP_DWELL_SECONDS
        ? "at_pickup"
        : elapsedSeconds < totalTrackingSeconds
          ? "in_transit"
          : "arrived";
  const legProgress =
    ridePhase === "approaching_pickup"
      ? clamp((elapsedSeconds / approachDurationSeconds) * 100, 0, 100)
      : ridePhase === "at_pickup"
        ? 100
        : ridePhase === "in_transit"
          ? clamp(
              ((elapsedSeconds -
                approachDurationSeconds -
                PICKUP_DWELL_SECONDS) /
                tripDurationSeconds) *
                100,
              0,
              100,
            )
          : 100;
  const activeWaypoints =
    ridePhase === "approaching_pickup" || ridePhase === "at_pickup"
      ? approachWaypoints
      : tripWaypoints;
  const currentWaypointIndex = activeWaypoints.length
    ? Math.min(
        activeWaypoints.length - 1,
        Math.floor((legProgress / 100) * (activeWaypoints.length - 1)),
      )
    : 0;
  const simulatedDriverPosition =
    step !== "active"
      ? pickupCoords
      : ridePhase === "at_pickup"
        ? pickupCoords
        : ridePhase === "arrived"
          ? dropoffCoords
          : activeWaypoints[currentWaypointIndex] ?? pickupCoords;
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
    activeWaypoints[
      Math.min(currentWaypointIndex + 2, activeWaypoints.length - 1)
    ] ??
    (ridePhase === "approaching_pickup" ? pickupCoords : dropoffCoords);
  const heading = getBearing(driverPosition, nextWaypoint);
  const pickupPoint = getMapPoint(pickupCoords);
  const dropoffPoint = getMapPoint(dropoffCoords);
  const driverPoint = getMapPoint(driverPosition);
  const riderPoint = getMapPoint(riderPosition);
  const targetCoords =
    ridePhase === "approaching_pickup" || ridePhase === "at_pickup"
      ? pickupCoords
      : dropoffCoords;
  const targetLabel =
    ridePhase === "approaching_pickup" || ridePhase === "at_pickup"
      ? pickup
      : dropoff;
  const remainingDistanceMeters = hasRoute
    ? ridePhase === "at_pickup" || ridePhase === "arrived"
      ? 0
      : calculateDistanceMeters(
          driverPosition.lat,
          driverPosition.lng,
          targetCoords.lat,
          targetCoords.lng,
        )
    : 0;
  const remainingSeconds =
    ridePhase === "approaching_pickup"
      ? Math.max(0, Math.ceil(approachDurationSeconds - elapsedSeconds))
      : ridePhase === "in_transit"
        ? Math.max(
            0,
            Math.ceil(
              totalTrackingSeconds - elapsedSeconds,
            ),
          )
        : 0;
  const overallProgress = clamp(
    (elapsedSeconds / totalTrackingSeconds) * 100,
    0,
    100,
  );
  const speedKmh =
    step === "active" &&
    remainingSeconds > 0 &&
    ridePhase !== "at_pickup" &&
    ridePhase !== "arrived"
      ? clamp(
          Math.round((remainingDistanceMeters / remainingSeconds) * 3.6),
          8,
          32,
        )
      : 0;
  const etaLabel =
    ridePhase === "at_pickup"
      ? "At pickup"
      : ridePhase === "arrived"
        ? "Arrived"
        : `${Math.max(1, Math.ceil(remainingSeconds / 60))} min`;
  const driverLabel =
    currentRole === "driver" ? "You" : firstName(driverName, "Driver");
  const riderLabel =
    currentRole === "student" ? "You" : firstName(riderName, "Rider");
  const nearestLocation = getNearestCampusLocation(driverPosition);
  const driverLocationLabel =
    nearestLocation.distanceMeters <= 35
      ? nearestLocation.location.name
      : `Near ${nearestLocation.location.name}`;
  const phaseTitle =
    ridePhase === "approaching_pickup"
      ? "Driver approaching pickup"
      : ridePhase === "at_pickup"
        ? "Driver at pickup"
        : ridePhase === "in_transit"
          ? "Trip in progress"
          : "Destination reached";
  const instruction =
    ridePhase === "at_pickup"
      ? `Waiting at ${pickup}`
      : ridePhase === "arrived"
        ? `Arrived at ${dropoff}`
        : legProgress >= 88
          ? `${ridePhase === "approaching_pickup" ? "Pickup" : "Destination"} ahead: ${targetLabel}`
          : legProgress >= 56
            ? `Keep right toward ${targetLabel}`
            : legProgress >= 20
              ? `Continue toward ${targetLabel}`
              : `Head toward ${targetLabel}`;
  const instructionDistance =
    remainingDistanceMeters > 0
      ? Math.max(
          20,
          Math.round((remainingDistanceMeters * 0.22) / 10) * 10,
        )
      : 0;
  const showRiderMarker =
    step !== "active" || ridePhase === "approaching_pickup";

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
      destination: `${targetCoords.lat},${targetCoords.lng}`,
      travelmode: "driving",
      dir_action: "navigate",
    });
    return `https://www.google.com/maps/dir/?${params}`;
  }, [driverPosition, hasRoute, targetCoords]);

  useEffect(() => {
    const profile = getProfile();
    setCurrentRole(getCurrentRole());
    setRiderName(profile.name || "Rider");
  }, []);

  useEffect(() => {
    if (step === "active" && hasRoute) {
      setTrackingStartedAt(tripStartedAt ?? Date.now());
      setClock(Date.now());
      setHasTriggeredArrival(false);
      return;
    }
    if (step === "idle") {
      setHasTriggeredArrival(false);
    }
  }, [dropoff, hasRoute, pickup, step, tripStartedAt]);

  useEffect(() => {
    if (step !== "active" || !hasRoute) return;
    const interval = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [hasRoute, step]);

  useEffect(() => {
    if (
      ridePhase !== "arrived" ||
      hasTriggeredArrival ||
      step !== "active" ||
      !onDestinationReached
    ) {
      return;
    }
    setHasTriggeredArrival(true);
    const timeout = window.setTimeout(onDestinationReached, 1200);
    return () => window.clearTimeout(timeout);
  }, [hasTriggeredArrival, onDestinationReached, ridePhase, step]);

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

  useEffect(() => {
    if (step !== "active" || !hasRoute) {
      onTrackingUpdate?.(null);
      return;
    }

    onTrackingUpdate?.({
      phase: ridePhase,
      latitude: driverPosition.lat,
      longitude: driverPosition.lng,
      locationLabel: driverLocationLabel,
      targetLabel,
      remainingDistanceMeters,
      etaSeconds: remainingSeconds,
      overallProgress,
      positionSource: usesDeviceDriverPosition ? "device" : "estimated",
      updatedAt: clock,
    });
  }, [
    clock,
    driverLocationLabel,
    driverPosition.lat,
    driverPosition.lng,
    hasRoute,
    onTrackingUpdate,
    overallProgress,
    remainingDistanceMeters,
    remainingSeconds,
    ridePhase,
    step,
    targetLabel,
    usesDeviceDriverPosition,
  ]);

  const approachRoutePoints = approachWaypoints
    .map((point) => {
      const { x, y } = getMapPoint(point);
      return `${x},${y}`;
    })
    .join(" ");
  const tripRoutePoints = tripWaypoints
    .map((point) => {
      const { x, y } = getMapPoint(point);
      return `${x},${y}`;
    })
    .join(" ");
  const travelledPoints = activeWaypoints
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
            {step === "active" && (
              <>
                <polyline
                  points={approachRoutePoints}
                  fill="none"
                  stroke="white"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={approachRoutePoints}
                  fill="none"
                  stroke={
                    ridePhase === "approaching_pickup"
                      ? "#f59e0b"
                      : "#94a3b8"
                  }
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
            <polyline
              points={tripRoutePoints}
              fill="none"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={tripRoutePoints}
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

        {hasPickup && showRiderMarker && (
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
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white text-white shadow-xl"
                style={{
                  background:
                    ridePhase === "approaching_pickup"
                      ? "#f59e0b"
                      : ridePhase === "arrived"
                        ? "#16a34a"
                        : "#1677ff",
                }}
              >
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
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
                style={{
                  background:
                    ridePhase === "approaching_pickup"
                      ? "#f59e0b"
                      : ridePhase === "arrived"
                        ? "#16a34a"
                        : "#1677ff",
                }}
              >
                <Navigation className="h-6 w-6" fill="currentColor" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-blue-600">
                  {instructionDistance > 0
                    ? `In ${formatDistance(instructionDistance)}`
                    : phaseTitle}
                </div>
                <div className="truncate text-sm font-extrabold text-gray-950 sm:text-base">
                  {instruction}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-gray-500">
                  {driverLocationLabel} · {phaseTitle}
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
            {usesDeviceDriverPosition ? (
              <LocateFixed className="h-3.5 w-3.5 text-emerald-600" />
            ) : gpsStatus === "requesting" ? (
              <Radio className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            ) : (
              <Radio className="h-3.5 w-3.5 text-blue-600" />
            )}
            {usesDeviceDriverPosition
              ? "Driver GPS live"
              : gpsStatus === "requesting"
                ? "Locating"
                : step === "active"
                  ? "Driver route live"
                  : gpsStatus === "live"
                    ? "Your GPS live"
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

      {step === "active" && hasRoute && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-14 z-40 flex justify-center">
          <div className="pointer-events-auto grid w-full max-w-xl grid-cols-3 divide-x divide-gray-100 rounded-lg bg-white p-3 shadow-xl">
            <div className="flex items-center justify-center gap-2 px-2">
              <RouteIcon className="hidden h-4 w-4 text-emerald-600 sm:block" />
              <div className="min-w-0 text-center sm:text-left">
                <div className="text-[9px] font-bold uppercase text-gray-400">
                  {ridePhase === "approaching_pickup" ? "Pickup ETA" : "ETA"}
                </div>
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
                {currentRole === "driver"
                  ? `Pickup: ${pickup}`
                  : `${vehicleType} · ${driverLocationLabel}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {ridePhase === "arrived" && step === "active" && (
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
