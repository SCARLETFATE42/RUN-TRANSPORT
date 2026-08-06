export type View = "book" | "trips" | "schedule" | "profile" | "drivers";
export type BookStep = "idle" | "selecting" | "confirming" | "active";
export type VehicleType = "shuttle" | "sedan" | "van";

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
