import type { Trip, VehicleType } from "../types";

export const TRIPS: Trip[] = [
  { id: "t1", date: "Today", time: "08:15 AM", from: "Main Dormitory", to: "Academic Block A", vehicle: "Campus Shuttle", driver: "Mr. Adeniyi", status: "completed", fare: "Free", duration: "6 min" },
  { id: "t2", date: "Today", time: "02:30 PM", from: "Sports Complex", to: "Main Gate", vehicle: "School Sedan", driver: "Mr. Balogun", status: "scheduled", fare: "₦500", duration: "9 min" },
  { id: "t3", date: "Yesterday", time: "05:45 PM", from: "Library Block", to: "Female Hostel", vehicle: "Campus Shuttle", driver: "Mr. Adeniyi", status: "completed", fare: "Free", duration: "4 min" },
  { id: "t4", date: "Yesterday", time: "11:00 AM", from: "Main Gate", to: "Hospital (Off-campus)", vehicle: "School Van", driver: "Mr. Okonkwo", status: "completed", fare: "₦1,200", duration: "18 min" },
  { id: "t5", date: "Mon, Jul 28", time: "07:50 AM", from: "Male Hostel", to: "Chapel & Assembly", vehicle: "Campus Shuttle", driver: "Mr. Adeniyi", status: "completed", fare: "Free", duration: "3 min" },
];

export const VEHICLES = [
  { id: "shuttle" as VehicleType, name: "Campus Shuttle", desc: "Free · Shared · 3–5 min", icon: "🚌", badge: "Popular", capacity: "20 seats", note: "Next in 3 min" },
  { id: "sedan" as VehicleType, name: "School Sedan", desc: "₦400–₦800 · Private · On demand", icon: "🚗", badge: null, capacity: "4 seats", note: "2 nearby" },
  { id: "van" as VehicleType, name: "School Van", desc: "₦800–₦1,500 · Group · On demand", icon: "🚐", badge: "Off-campus", capacity: "8 seats", note: "1 nearby" },
];

export const LOCATIONS = [
  "Main Dormitory (Block A)", "Main Dormitory (Block B)", "Female Hostel",
  "Male Hostel", "Academic Block A", "Academic Block B", "Science Lab Complex",
  "Library Block", "Chapel & Assembly Hall", "Sports Complex",
  "School Clinic", "Main Gate / Visitor Entrance", "Admin Block",
  "Dining Hall", "Staff Quarters",
];

export const NIGERIAN_BANKS = [
  "Zenith Bank", "Access Bank", "GTBank", "UBA", "First Bank", "OPay", "PalmPay", "Kuda Bank", "Moniepoint"
];
