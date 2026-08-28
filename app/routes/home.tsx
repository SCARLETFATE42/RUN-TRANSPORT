import { useState } from "react";
import type { Route } from "./+types/home";
import Navbar from "./navbar";
import MainContent from "./maincontent";
import BookRide from "./bookride";
import { LOCATIONS } from "../data/mockData";
import { getApplications } from "../data/driverStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RUN Transport" },
    {
      name: "description",
      content: "Book a campus ride with RUN Transport.",
    },
  ];
}

export default function Home() {
  const [step, setStep] = useState<"idle" | "selecting" | "active" | "payment">("idle");
  const [eta, setEta] = useState(5);
  const [progress, setProgress] = useState(30);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupFocus, setPickupFocus] = useState(false);
  const [dropoffFocus, setDropoffFocus] = useState(false);
  const [vehicle, setVehicle] = useState("bus");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Get approved drivers from fleet review store
  const approvedDrivers = getApplications().filter((d) => d.status === "approved");

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
    setSelectedDriver(null);
  };

  const goToPayment = () => setStep("payment");

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
        step={step === "payment" ? "active" : step}
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
        approvedDrivers={approvedDrivers}
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
        goToPayment={goToPayment}
      />
    </div>
  );
}