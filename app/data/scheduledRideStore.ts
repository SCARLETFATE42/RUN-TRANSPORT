import { getApplications, type DriverApplication } from "./driverStore";
import { getVehiclePrice } from "./mockData";
import { getProfile } from "./profileStore";
import {
  createTrip,
  getActiveTrip,
  getTrips,
  type RecordedTrip,
} from "./tripStore";

export interface ScheduledRide {
  id: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  reason: string;
  approval: string;
  createdAt: number;
}

export type CreateScheduledRideInput = Omit<ScheduledRide, "id" | "createdAt">;

export interface ActivatedScheduledRide {
  schedule: ScheduledRide;
  trip: RecordedTrip;
}

const STORAGE_PREFIX = "run_transport_scheduled_rides_v2:";
const LEGACY_STORAGE_KEY = "runcampus_scheduled_rides";
const SCHEDULES_UPDATED_EVENT = "run-transport-schedules-updated";
const MAX_STORED_SCHEDULES = 100;

function getStorageKey() {
  const profile = getProfile();
  const identity =
    profile.supabaseUserId || profile.email || profile.studentId || "guest";
  return `${STORAGE_PREFIX}${encodeURIComponent(identity.trim().toLowerCase())}`;
}

function isScheduledRide(value: unknown): value is ScheduledRide {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const ride = value as Partial<ScheduledRide>;
  return (
    typeof ride.id === "string" &&
    typeof ride.date === "string" &&
    typeof ride.time === "string" &&
    typeof ride.pickup === "string" &&
    typeof ride.dropoff === "string" &&
    typeof ride.reason === "string" &&
    typeof ride.approval === "string" &&
    typeof ride.createdAt === "number" &&
    Number.isFinite(ride.createdAt) &&
    getScheduledRideTimestamp(ride.date, ride.time) !== null
  );
}

function parseSchedules(raw: string | null): ScheduledRide[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isScheduledRide);
  } catch {
    return [];
  }
}

function sortSchedules(rides: ScheduledRide[]) {
  return [...rides].sort((a, b) => {
    const aTime = getScheduledRideTimestamp(a.date, a.time) ?? Infinity;
    const bTime = getScheduledRideTimestamp(b.date, b.time) ?? Infinity;
    return aTime - bTime || a.createdAt - b.createdAt;
  });
}

function notifySchedulesUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SCHEDULES_UPDATED_EVENT));
}

function saveScheduledRides(rides: ScheduledRide[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(sortSchedules(rides).slice(0, MAX_STORED_SCHEDULES)),
    );
    notifySchedulesUpdated();
  } catch (error) {
    console.error("Failed to save scheduled rides:", error);
  }
}

function createScheduleId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `sr_${crypto.randomUUID()}`;
  }
  return `sr_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

function getVehicleCategory(vehicleType: string) {
  const label = vehicleType.toLowerCase();
  if (label.includes("shuttle")) return "shuttle";
  if (label.includes("sedan")) return "sedan";
  if (label.includes("van")) return "van";
  return label;
}

function getScheduledDriver(): DriverApplication | null {
  const approvedDrivers = getApplications().filter(
    (driver) => driver.status === "approved",
  );
  if (approvedDrivers.length === 0) return null;

  const preferredVehicle = getProfile().preferredVehicle;
  if (!preferredVehicle) return approvedDrivers[0];

  const preferredCategory = getVehicleCategory(preferredVehicle);
  return (
    approvedDrivers.find(
      (driver) => getVehicleCategory(driver.vehicleType) === preferredCategory,
    ) ?? approvedDrivers[0]
  );
}

export function getScheduledRideTimestamp(date: string, time: string) {
  const dateParts = date.split("-").map(Number);
  const timeParts = time.split(":").map(Number);
  if (dateParts.length !== 3 || timeParts.length !== 2) return null;

  const [year, month, day] = dateParts;
  const [hour, minute] = timeParts;
  if (
    ![year, month, day, hour, minute].every(Number.isInteger) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const scheduledDate = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    scheduledDate.getFullYear() !== year ||
    scheduledDate.getMonth() !== month - 1 ||
    scheduledDate.getDate() !== day ||
    scheduledDate.getHours() !== hour ||
    scheduledDate.getMinutes() !== minute
  ) {
    return null;
  }

  return scheduledDate.getTime();
}

export function getScheduledRides(): ScheduledRide[] {
  if (typeof window === "undefined") return [];

  try {
    const storageKey = getStorageKey();
    const scopedSchedules = localStorage.getItem(storageKey);
    if (scopedSchedules !== null) {
      return sortSchedules(parseSchedules(scopedSchedules));
    }

    const legacySchedules = parseSchedules(
      localStorage.getItem(LEGACY_STORAGE_KEY),
    );
    if (legacySchedules.length === 0) return [];

    localStorage.setItem(storageKey, JSON.stringify(sortSchedules(legacySchedules)));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return sortSchedules(legacySchedules);
  } catch (error) {
    console.error("Failed to load scheduled rides:", error);
    return [];
  }
}

export function createScheduledRide(
  input: CreateScheduledRideInput,
): ScheduledRide {
  const schedule: ScheduledRide = {
    ...input,
    id: createScheduleId(),
    createdAt: Date.now(),
  };

  saveScheduledRides([...getScheduledRides(), schedule]);
  return schedule;
}

export function cancelScheduledRide(id: string) {
  const schedules = getScheduledRides();
  const updated = schedules.filter((schedule) => schedule.id !== id);
  if (updated.length === schedules.length) return false;

  saveScheduledRides(updated);
  return true;
}

export function activateDueScheduledRides(
  currentTimestamp = Date.now(),
): ActivatedScheduledRide[] {
  if (typeof window === "undefined") return [];

  let schedules = getScheduledRides();
  const bookedScheduleIds = new Set(
    getTrips()
      .map((trip) => trip.scheduledRideId)
      .filter((id): id is string => Boolean(id)),
  );
  const unbookedSchedules = schedules.filter(
    (schedule) => !bookedScheduleIds.has(schedule.id),
  );

  if (unbookedSchedules.length !== schedules.length) {
    schedules = unbookedSchedules;
    saveScheduledRides(schedules);
  }

  if (getActiveTrip()) return [];

  const dueSchedule = schedules.find((schedule) => {
    const scheduledFor = getScheduledRideTimestamp(
      schedule.date,
      schedule.time,
    );
    return scheduledFor !== null && scheduledFor <= currentTimestamp;
  });
  if (!dueSchedule) return [];

  const driver = getScheduledDriver();
  if (!driver) return [];

  const trip = createTrip({
    pickup: dueSchedule.pickup,
    dropoff: dueSchedule.dropoff,
    driverName: driver.fullName,
    driverApplicationId: driver.id,
    scheduledRideId: dueSchedule.id,
    vehicle: driver.vehicleType,
    fareNaira: getVehiclePrice(driver.vehicleType),
    estimatedDurationMinutes: 4,
  });

  saveScheduledRides(
    schedules.filter((schedule) => schedule.id !== dueSchedule.id),
  );
  return [{ schedule: dueSchedule, trip }];
}

export function subscribeToScheduledRides(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  let storageKey = getStorageKey();
  const handleScheduleUpdate = () => onChange();
  const handleProfileUpdate = () => {
    storageKey = getStorageKey();
    onChange();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === LEGACY_STORAGE_KEY) {
      onChange();
    }
  };

  window.addEventListener(SCHEDULES_UPDATED_EVENT, handleScheduleUpdate);
  window.addEventListener("profile-updated", handleProfileUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(SCHEDULES_UPDATED_EVENT, handleScheduleUpdate);
    window.removeEventListener("profile-updated", handleProfileUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}
