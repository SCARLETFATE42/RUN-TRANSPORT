import { getProfile } from "./profileStore";

export type TripStatus = "active" | "completed" | "cancelled";
export type TripPaymentStatus = "pending" | "paid" | "unverified";

export interface RecordedTrip {
  id: string;
  pickup: string;
  dropoff: string;
  driverName: string;
  driverApplicationId?: string;
  vehicle: string;
  fareNaira: number;
  estimatedDurationMinutes: number;
  status: TripStatus;
  paymentStatus: TripPaymentStatus;
  paymentReference?: string;
  startedAt: number;
  endedAt?: number;
}

export type CreateTripInput = Pick<
  RecordedTrip,
  | "pickup"
  | "dropoff"
  | "driverName"
  | "driverApplicationId"
  | "vehicle"
  | "fareNaira"
  | "estimatedDurationMinutes"
>;

const STORAGE_PREFIX = "run_transport_trips_v1:";
const TRIPS_UPDATED_EVENT = "run-transport-trips-updated";
const MAX_STORED_TRIPS = 200;

function getStorageKey() {
  const profile = getProfile();
  const identity =
    profile.supabaseUserId || profile.email || profile.studentId || "guest";
  return `${STORAGE_PREFIX}${encodeURIComponent(identity.trim().toLowerCase())}`;
}

function isRecordedTrip(value: unknown): value is RecordedTrip {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const trip = value as Partial<RecordedTrip>;
  return (
    typeof trip.id === "string" &&
    typeof trip.pickup === "string" &&
    typeof trip.dropoff === "string" &&
    typeof trip.driverName === "string" &&
    typeof trip.vehicle === "string" &&
    typeof trip.fareNaira === "number" &&
    Number.isFinite(trip.fareNaira) &&
    typeof trip.estimatedDurationMinutes === "number" &&
    Number.isFinite(trip.estimatedDurationMinutes) &&
    (trip.status === "active" ||
      trip.status === "completed" ||
      trip.status === "cancelled") &&
    (trip.paymentStatus === "pending" ||
      trip.paymentStatus === "paid" ||
      trip.paymentStatus === "unverified") &&
    typeof trip.startedAt === "number" &&
    Number.isFinite(trip.startedAt)
  );
}

function notifyTripsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TRIPS_UPDATED_EVENT));
}

function saveTrips(trips: RecordedTrip[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(trips.slice(0, MAX_STORED_TRIPS)),
    );
    notifyTripsUpdated();
  } catch (error) {
    console.error("Failed to save trip history:", error);
  }
}

function createTripId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `trip_${crypto.randomUUID()}`;
  }
  return `trip_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

export function getTrips(): RecordedTrip[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRecordedTrip)
      .sort((a, b) => b.startedAt - a.startedAt);
  } catch {
    return [];
  }
}

export function getActiveTrip() {
  return getTrips().find((trip) => trip.status === "active") ?? null;
}

export function createTrip(input: CreateTripInput): RecordedTrip {
  const trip: RecordedTrip = {
    ...input,
    id: createTripId(),
    fareNaira: Math.max(0, input.fareNaira),
    estimatedDurationMinutes: Math.max(1, input.estimatedDurationMinutes),
    status: "active",
    paymentStatus: "pending",
    startedAt: Date.now(),
  };

  saveTrips([trip, ...getTrips()]);
  return trip;
}

export function completeTrip(
  id: string,
  payment: {
    status: Extract<TripPaymentStatus, "paid" | "unverified">;
    reference?: string;
    fareNaira?: number;
  },
) {
  const endedAt = Date.now();
  let completedTrip: RecordedTrip | null = null;
  const updated = getTrips().map((trip) => {
    if (trip.id !== id) return trip;
    completedTrip = {
      ...trip,
      fareNaira:
        typeof payment.fareNaira === "number" &&
        Number.isFinite(payment.fareNaira)
          ? Math.max(0, payment.fareNaira)
          : trip.fareNaira,
      status: "completed",
      paymentStatus: payment.status,
      paymentReference: payment.reference || trip.paymentReference,
      endedAt,
    };
    return completedTrip;
  });

  if (completedTrip) saveTrips(updated);
  return completedTrip;
}

export function cancelTrip(id: string) {
  let cancelledTrip: RecordedTrip | null = null;
  const updated = getTrips().map((trip) => {
    if (trip.id !== id) return trip;
    cancelledTrip = {
      ...trip,
      status: "cancelled",
      endedAt: Date.now(),
    };
    return cancelledTrip;
  });

  if (cancelledTrip) saveTrips(updated);
  return cancelledTrip;
}

export function subscribeToTrips(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  let storageKey = getStorageKey();
  const handleTripUpdate = () => onChange();
  const handleProfileUpdate = () => {
    storageKey = getStorageKey();
    onChange();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) onChange();
  };

  window.addEventListener(TRIPS_UPDATED_EVENT, handleTripUpdate);
  window.addEventListener("profile-updated", handleProfileUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(TRIPS_UPDATED_EVENT, handleTripUpdate);
    window.removeEventListener("profile-updated", handleProfileUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}
