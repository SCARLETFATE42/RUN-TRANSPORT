import { useState } from "react";
import type { Route } from "./+types/home";
import Navbar from "./navbar";
import MainContent from "./maincontent";
import BookRide from "./bookride";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FlowFund" },
    {
      name: "description",
      content: "Welcome to React Router!",
    },
  ];
}

const LOCATIONS = [
  "Main Gate",
  "Library Block",
  "Dining Hall",
  "School Clinic",
  "Engineering Hostel",
  "Engineering Faculty",
  "Field",
  "Auditorium",
  "FBMS",
  "Law Faculty",
  "Container",
  "DP",
  "Numbers",
  "Foodmart",
  "Prophet Moses Extension",
];

export default function Home() {
  const [step, setStep] = useState<"idle" | "selecting" | "active">("idle");
  const [eta, setEta] = useState(5);
  const [progress, setProgress] = useState(30);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupFocus, setPickupFocus] = useState(false);
  const [dropoffFocus, setDropoffFocus] = useState(false);
  const [vehicle, setVehicle] = useState("bus");

  const filteredPickup = pickup
    ? LOCATIONS.filter((l) =>
        l.toLowerCase().includes(pickup.toLowerCase())
      )
    : LOCATIONS;

  const filteredDropoff = dropoff
    ? LOCATIONS.filter((l) =>
        l.toLowerCase().includes(dropoff.toLowerCase())
      )
    : LOCATIONS;

  const startBooking = () => setStep("selecting");

  const confirmRide = () => {
    setStep("active");
    setEta(8);
    setProgress(10);
  };

  const endRide = () => {
    setStep("idle");
    setPickup("");
    setDropoff("");
    setProgress(30);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      <Navbar />

      <MainContent
        step={step}
        eta={eta}
      />

      <BookRide
        step={step}
        setStep={setStep}
        pickup={pickup}
        setPickup={setPickup}
        dropoff={dropoff}
        setDropoff={setDropoff}
        pickupFocus={pickupFocus}
        setPickupFocus={setPickupFocus}
        dropoffFocus={dropoffFocus}
        setDropoffFocus={setDropoffFocus}
        filteredPickup={filteredPickup}
        filteredDropoff={filteredDropoff}
        startBooking={startBooking}
        vehicle={vehicle}
        setVehicle={setVehicle}
        confirmRide={confirmRide}
        eta={eta}
        progress={progress}
        endRide={endRide}
      />
    </div>
  );
}