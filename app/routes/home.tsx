import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import Navbar from "./navbar";
import MainContent from "./maincontent";
import BookRide from "./bookride";
import FlutterwaveCheckout from "../components/FlutterwaveCheckout";
import { LOCATIONS, getVehiclePrice } from "../data/mockData";
import { getApplications } from "../data/driverStore";
import {
  cancelTrip,
  completeTrip,
  createTrip,
  getActiveTrip,
  subscribeToTrips,
} from "../data/tripStore";
import type { DriverTrackingSnapshot } from "../types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RUN Transport | Campus Mobility" },
    {
      name: "description",
      content: "Book and track campus rides with real-time Google Maps and automated Paystack checkout.",
    },
  ];
}

export default function Home() {
  const [step, setStep] = useState<"idle" | "selecting" | "active" | "payment">("idle");
  const [eta, setEta] = useState(4);
  const [progress, setProgress] = useState(30);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupFocus, setPickupFocus] = useState(false);
  const [dropoffFocus, setDropoffFocus] = useState(false);
  const [vehicle, setVehicle] = useState("School Sedan");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [activeTripStartedAt, setActiveTripStartedAt] = useState<number>();
  const [driverTracking, setDriverTracking] =
    useState<DriverTrackingSnapshot | null>(null);
  const activeTripIdRef = useRef<string | null>(null);
  const paymentConfirmedRef = useRef(false);

  // Get approved drivers from fleet review store
  const approvedDrivers = getApplications().filter((d) => d.status === "approved");
  const activeDriver =
    approvedDrivers.find((d) => d.id === selectedDriver) || approvedDrivers[0];
  const fareNaira = activeDriver ? getVehiclePrice(activeDriver.vehicleType) : 200;

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

  useEffect(() => {
    const syncActiveTrip = () => {
      const activeTrip = getActiveTrip();
      if (!activeTrip) return;

      activeTripIdRef.current = activeTrip.id;
      setActiveTripStartedAt(activeTrip.startedAt);
      setPickup(activeTrip.pickup);
      setDropoff(activeTrip.dropoff);
      setVehicle(activeTrip.vehicle);
      setSelectedDriver(activeTrip.driverApplicationId ?? null);
      setEta(activeTrip.estimatedDurationMinutes);
      setProgress(5);
      setStep("active");
    };

    syncActiveTrip();
    return subscribeToTrips(syncActiveTrip);
  }, []);

  const startBooking = () => setStep("selecting");

  const confirmRide = () => {
    if (activeTripIdRef.current) return;

    const staleActiveTrip = getActiveTrip();
    if (staleActiveTrip) cancelTrip(staleActiveTrip.id);

    const trip = createTrip({
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      driverName: activeDriver?.fullName || "Assigned driver",
      driverApplicationId: activeDriver?.id,
      vehicle: activeDriver?.vehicleType || vehicle,
      fareNaira,
      estimatedDurationMinutes: eta,
    });
    activeTripIdRef.current = trip.id;
    setActiveTripStartedAt(trip.startedAt);
    paymentConfirmedRef.current = false;
    setStep("active");
    setEta(4);
    setProgress(5);
  };

  const resetRide = () => {
    activeTripIdRef.current = null;
    paymentConfirmedRef.current = false;
    setShowPaystackModal(false);
    setActiveTripStartedAt(undefined);
    setDriverTracking(null);
    setStep("idle");
    setProgress(15);
    setSelectedDriver(null);
  };

  const cancelRide = () => {
    if (activeTripIdRef.current) cancelTrip(activeTripIdRef.current);
    resetRide();
  };

  const completeUnverifiedRide = () => {
    if (activeTripIdRef.current) {
      completeTrip(activeTripIdRef.current, { status: "unverified" });
    }
    resetRide();
  };

  const goToPayment = () => {
    setShowPaystackModal(true);
    setStep("payment");
  };

  // Triggered automatically by GoogleCampusMap when the vehicle arrives at destination
  const handleDestinationReached = () => {
    setShowPaystackModal(true);
    setStep("payment");
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
        step={step === "payment" ? "active" : step}
        eta={eta}
        pickup={pickup}
        dropoff={dropoff}
        driverName={activeDriver?.fullName || "Mr. Balogun"}
        driverId={activeDriver?.id}
        vehicleType={activeDriver?.vehicleType || vehicle}
        tripStartedAt={activeTripStartedAt}
        onDestinationReached={handleDestinationReached}
        onTrackingUpdate={setDriverTracking}
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
        cancelRide={cancelRide}
        completeRide={completeUnverifiedRide}
        approvedDrivers={approvedDrivers}
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
        goToPayment={goToPayment}
        driverTracking={driverTracking}
      />

      {/* Flutterwave Checkout Modal — automatically triggered on arrival */}
      <FlutterwaveCheckout
        isOpen={showPaystackModal}
        onClose={() => {
          if (paymentConfirmedRef.current) {
            resetRide();
            return;
          }
          setShowPaystackModal(false);
        }}
        amountNaira={fareNaira}
        driverName={activeDriver?.fullName || "Sunday Balogun"}
        driverVehicle={activeDriver?.vehicleType || "School Sedan"}
        driverBank={activeDriver?.bankName || "GTBank"}
        driverAccount={activeDriver?.accountNumber || "0123984712"}
        pickupLocation={pickup}
        dropoffLocation={dropoff}
        onPaymentSuccess={(reference, amount) => {
          if (activeTripIdRef.current) {
            completeTrip(activeTripIdRef.current, {
              status: "paid",
              reference,
              fareNaira: amount,
            });
          }
          paymentConfirmedRef.current = true;
        }}
      />
    </div>
  );
}
