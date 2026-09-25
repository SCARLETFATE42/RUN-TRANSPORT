export type View = "book" | "trips" | "schedule" | "profile" | "drivers";
export type BookStep = "idle" | "selecting" | "confirming" | "active";
export type VehicleType = "shuttle" | "sedan" | "van";

export type RideTrackingPhase =
  | "approaching_pickup"
  | "at_pickup"
  | "in_transit"
  | "arrived";

export interface DriverTrackingSnapshot {
  phase: RideTrackingPhase;
  latitude: number;
  longitude: number;
  locationLabel: string;
  targetLabel: string;
  remainingDistanceMeters: number;
  etaSeconds: number;
  overallProgress: number;
  positionSource: "device" | "estimated";
  updatedAt: number;
}

export interface Trip {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  vehicle: string;
  driver: string;
  status: "completed" | "scheduled" | "active";
  fare: string;
  duration: string;
}
