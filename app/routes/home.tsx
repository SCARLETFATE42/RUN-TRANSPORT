import { useState } from "react";
import { data } from "react-router";
import type { Route } from "./+types/home";
import { createClient } from "~/utils/supabase.server";
import Navbar from "./navbar";
import MainContent from "./maincontent";
import BookRide from "./bookride";
import PaystackCheckout from "../components/PaystackCheckout";
import FlutterwaveCheckout from "../components/FlutterwaveCheckout";
import { LOCATIONS, getVehiclePrice } from "../data/mockData";
import { getApplications } from "../data/driverStore";

type SupabaseTodo = {
  id: string | number;
  name?: string | null;
  title?: string | null;
  task?: string | null;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createClient(request);
  const { data: todos, error } = await supabase.from("todos").select();

  if (error) {
    console.error("Unable to load Supabase todos:", error.message);
  }

  return data(
    { todos: (todos ?? []) as SupabaseTodo[] },
    { headers },
  );
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RUN Transport | Campus Mobility" },
    {
      name: "description",
      content: "Book and track campus rides with real-time Google Maps and automated Paystack checkout.",
    },
  ];
}

function SupabaseTodoList({ todos }: { todos: SupabaseTodo[] }) {
  if (todos.length === 0) return null;

  return (
    <section
      aria-label="Supabase todos"
      className="fixed right-4 top-4 z-40 w-72 rounded-2xl border bg-slate-950/90 p-4 text-white shadow-2xl backdrop-blur-md"
      style={{ borderColor: "rgba(255,255,255,0.12)" }}
    >
      <h2 className="mb-3 text-sm font-semibold">Supabase Todos</h2>
      <ul className="space-y-2 text-sm">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            {todo.name ?? todo.title ?? todo.task ?? `Todo ${todo.id}`}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [step, setStep] = useState<"idle" | "selecting" | "active" | "payment">("idle");
  const [eta, setEta] = useState(4);
  const [progress, setProgress] = useState(30);
  const [pickup, setPickup] = useState("Main Hostel Prophet Moses");
  const [dropoff, setDropoff] = useState("Library Block");
  const [pickupFocus, setPickupFocus] = useState(false);
  const [dropoffFocus, setDropoffFocus] = useState(false);
  const [vehicle, setVehicle] = useState("School Sedan");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showPaystackModal, setShowPaystackModal] = useState(false);

  // Get approved drivers from fleet review store
  const approvedDrivers = getApplications().filter((d) => d.status === "approved");
  const activeDriver =
    approvedDrivers.find((d) => d.id === selectedDriver) || approvedDrivers[0];

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
    setEta(4);
    setProgress(5);
  };

  const endRide = () => {
    setStep("idle");
    setProgress(15);
    setSelectedDriver(null);
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

  const fareNaira = activeDriver ? getVehiclePrice(activeDriver.vehicleType) : 200;
  const todos = loaderData.todos;

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
        pickup={pickup || "Main Hostel Prophet Moses"}
        dropoff={dropoff || "Library Block"}
        driverName={activeDriver?.fullName || "Mr. Balogun"}
        vehicleType={activeDriver?.vehicleType || vehicle}
        onDestinationReached={handleDestinationReached}
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

      <SupabaseTodoList todos={todos} />

      {/* Flutterwave Checkout Modal — automatically triggered on arrival */}
      <FlutterwaveCheckout
        isOpen={showPaystackModal}
        onClose={() => {
          setShowPaystackModal(false);
          endRide();
        }}
        amountNaira={fareNaira}
        driverName={activeDriver?.fullName || "Sunday Balogun"}
        driverVehicle={activeDriver?.vehicleType || "School Sedan"}
        driverBank={activeDriver?.bankName || "GTBank"}
        driverAccount={activeDriver?.accountNumber || "0123984712"}
        pickupLocation={pickup}
        dropoffLocation={dropoff}
        onPaymentSuccess={() => {
          setShowPaystackModal(false);
          endRide();
        }}
      />
    </div>
  );
}
