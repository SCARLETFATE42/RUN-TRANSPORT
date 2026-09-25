import { getProfile } from "./profileStore";

export type TripStatus = "active" | "completed" | "cancelled";
export type TripPaymentStatus = "pending" | "paid" | "unverified";

export interface RecordedTrip {
  id: string;
  pickup: string;
  dropoff: string;
  driverName: string;
  driverApplicationId?: string;
  scheduledRideId?: string;
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
  | "scheduledRideId"
  | "vehicle"
  | "fareNaira"
  | "estimatedDurationMinutes"
>;

export interface TripStats {
  totalRides: number;
  ridesThisMonth: number;
  creditsSpent: number;
}

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
    (trip.driverApplicationId === undefined ||
      typeof trip.driverApplicationId === "string") &&
    (trip.scheduledRideId === undefined ||
      typeof trip.scheduledRideId === "string") &&
    (trip.status === "active" ||
      trip.status === "completed" ||
      trip.status === "cancelled") &&
    (trip.paymentStatus === "pending" ||
      trip.paymentStatus === "paid" ||
      trip.paymentStatus === "unverified") &&
    (trip.paymentReference === undefined ||
      typeof trip.paymentReference === "string") &&
    typeof trip.startedAt === "number" &&
    Number.isFinite(trip.startedAt) &&
    (trip.endedAt === undefined ||
      (typeof trip.endedAt === "number" && Number.isFinite(trip.endedAt)))
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

export function getTripStats(
  trips: RecordedTrip[],
  currentTimestamp = Date.now(),
): TripStats {
  const currentDate = new Date(currentTimestamp);
  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getTime();
  const nextMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1,
  ).getTime();
  const completedTrips = trips.filter((trip) => trip.status === "completed");

  return {
    totalRides: completedTrips.length,
    ridesThisMonth: completedTrips.filter((trip) => {
      const completedAt = trip.endedAt ?? trip.startedAt;
      return completedAt >= monthStart && completedAt < nextMonthStart;
    }).length,
    creditsSpent: completedTrips
      .filter((trip) => trip.paymentStatus === "paid")
      .reduce((total, trip) => total + trip.fareNaira, 0),
  };
}

export function createTrip(input: CreateTripInput): RecordedTrip {
  if (input.scheduledRideId) {
    const existingTrip = getTrips().find(
      (trip) => trip.scheduledRideId === input.scheduledRideId,
    );
    if (existingTrip) return existingTrip;
  }

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
