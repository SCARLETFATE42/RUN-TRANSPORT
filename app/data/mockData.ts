import type { Trip, VehicleType } from "../types";

export const TRIPS: Trip[] = [
  { id: "t1", date: "Today", time: "08:15 AM", from: "Main Dormitory", to: "Academic Block A", vehicle: "Campus Shuttle", driver: "Mr. Adeniyi", status: "completed", fare: "Free", duration: "6 min" },
  { id: "t2", date: "Today", time: "02:30 PM", from: "Sports Complex", to: "Main Gate", vehicle: "School Sedan", driver: "Mr. Balogun", status: "scheduled", fare: "₦500", duration: "9 min" },
  { id: "t3", date: "Yesterday", time: "05:45 PM", from: "Library Block", to: "Female Hostel", vehicle: "Campus Shuttle", driver: "Mr. Adeniyi", status: "completed", fare: "Free", duration: "4 min" },
  { id: "t4", date: "Yesterday", time: "11:00 AM", from: "Main Gate", to: "Hospital (Off-campus)", vehicle: "School Van", driver: "Mr. Okonkwo", status: "completed", fare: "₦1,200", duration: "18 min" },
  { id: "t5", date: "Mon, Jul 28", time: "07:50 AM", from: "Male Hostel", to: "Chapel & Assembly", vehicle: "Campus Shuttle", driver: "Mr. Adeniyi", status: "completed", fare: "Free", duration: "3 min" },
];

// `price` (in ₦) is now the single source of truth for fares. Change it here
// and it flows through to every available-driver card and the active-ride
// payment screen automatically — no need to touch BookRide.tsx.
export const VEHICLES = [
  { id: "shuttle" as VehicleType, name: "Campus Shuttle", desc: "₦100 · Shared · 3–5 min", icon: "🚌", badge: "Popular", capacity: "20 seats", note: "Next in 3 min", price: 100 },
  { id: "sedan" as VehicleType, name: "School Sedan", desc: "₦200 · Private · On demand", icon: "🚗", badge: null, capacity: "4 seats", note: "2 nearby", price: 200 },
  { id: "van" as VehicleType, name: "School Van", desc: "₦200 · Group · On demand", icon: "🚐", badge: "Off-campus", capacity: "8 seats", note: "1 nearby", price: 200 },
];

export const LOCATIONS = [
  // Hostels
  "Main Hostel Prophet Moses",
  "Engineering Hostel (Male)",
  "Queen Esther Hall",
  "Numbers Hostel",
  "Engineering Hostel (Female)",
  "Postgraduate Quarters",
  "Prophet Moses Extension",
  // Cafeterias & Food
  "Manna Palace",
  "New Era",
  "Foodmart",
  // Academic & Facilities
  "Auditorium",
  "LR",
  "ICT LAB",
  "Library Block",
  "School Clinic",
  "Main Gate / Visitor Entrance",
  "Staff Quarters",
];

export const NIGERIAN_BANKS = [
  "Zenith Bank", "Access Bank", "GTBank", "UBA", "First Bank", "OPay", "PalmPay", "Kuda Bank", "Moniepoint"
];

/**
 * Matches a driver's `vehicleType` string (e.g. "Campus Shuttle (Bus)",
 * "School Sedan") to the corresponding entry in VEHICLES, regardless of
 * exact wording differences, and returns its numeric price in ₦.
 */
export function getVehiclePrice(vehicleType: string): number {
  const label = vehicleType.toLowerCase();
  const match = VEHICLES.find((v) => {
    if (v.id === "shuttle") return label.includes("shuttle");
    if (v.id === "sedan") return label.includes("sedan");
    if (v.id === "van") return label.includes("van");
    return false;
  });
  return match ? match.price : 0;
}

/** Display-ready fare string, e.g. "₦200" or "Free" when price is 0. */
export function formatFare(vehicleType: string): string {
  const price = getVehiclePrice(vehicleType);
  return price === 0 ? "Free" : `₦${price.toLocaleString()}`;
}