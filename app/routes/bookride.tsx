import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import type { DriverApplication } from "../data/driverStore";
import { formatFare, getVehiclePrice } from "../data/mockData";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Book a Ride | RUN Transport" },
    { name: "description", content: "Book a campus ride." },
  ];
}

interface BookRideProps {
  step: "idle" | "selecting" | "active" | "payment";
  setStep: React.Dispatch<
    React.SetStateAction<"idle" | "selecting" | "active" | "payment">
  >;
  pickup: string;
  setPickup: React.Dispatch<React.SetStateAction<string>>;
  dropoff: string;
  setDropoff: React.Dispatch<React.SetStateAction<string>>;
  pickupFocus: boolean;
  setPickupFocus: React.Dispatch<React.SetStateAction<boolean>>;
  dropoffFocus: boolean;
  setDropoffFocus: React.Dispatch<React.SetStateAction<boolean>>;
  filteredPickup: string[];
  filteredDropoff: string[];
  startBooking: () => void;
  vehicle: string;
  setVehicle: React.Dispatch<React.SetStateAction<string>>;
  confirmRide: () => void;
  eta: number;
  progress: number;
  endRide: () => void;
  approvedDrivers: DriverApplication[];
  selectedDriver: string | null;
  setSelectedDriver: React.Dispatch<React.SetStateAction<string | null>>;
  goToPayment: () => void;
}

const VEHICLE_ICONS: Record<string, string> = {
  "School Sedan": "🚗",
  "School Van": "🚐",
  "Campus Shuttle (Bus)": "🚌",
};

// Nigerian bank app deep-link URL schemes
const BANK_APPS: { name: string; icon: string; url: (acct: string, amount: string) => string }[] = [
  { name: "GTBank", icon: "🟩", url: (acct, amt) => `gtworld://transfer?account=${acct}&amount=${amt}` },
  { name: "Zenith Bank", icon: "🔴", url: (acct, amt) => `https://ibank.zenithbank.com/transfer?to=${acct}&amount=${amt}` },
  { name: "Access Bank", icon: "🔵", url: (acct, amt) => `https://mybank.accessbankplc.com/transfer?account=${acct}&amount=${amt}` },
  { name: "UBA", icon: "🔴", url: (acct, amt) => `https://ubagroup.com/transfer?account=${acct}&amount=${amt}` },
  { name: "First Bank", icon: "🟦", url: (acct, amt) => `https://ibank.firstbanknigeria.com/transfer?account=${acct}&amount=${amt}` },
  { name: "OPay", icon: "🟢", url: (acct, amt) => `opay://transfer?phone=${acct}&amount=${amt}` },
  { name: "PalmPay", icon: "🟩", url: (acct, amt) => `palmpay://transfer?account=${acct}&amount=${amt}` },
  { name: "Kuda Bank", icon: "🟣", url: (acct, amt) => `kudabank://transfer?account=${acct}&amount=${amt}` },
  { name: "Moniepoint", icon: "🔷", url: (acct, amt) => `moniepoint://transfer?account=${acct}&amount=${amt}` },
];

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Arriving now";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BookRide({
  step,
  setStep,
  pickup,
  setPickup,
  dropoff,
  setDropoff,
  pickupFocus,
  setPickupFocus,
  dropoffFocus,
  setDropoffFocus,
  filteredPickup,
  filteredDropoff,
  startBooking,
  vehicle,
  setVehicle,
  confirmRide,
  eta,
  progress,
  endRide,
  approvedDrivers,
  selectedDriver,
  setSelectedDriver,
  goToPayment,
}: BookRideProps) {
  const [showBankModal, setShowBankModal] = useState(false);

  // Countdown: seeded from `eta` (minutes) whenever a ride goes active.
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    if (step === "active") {
      const total = Math.max(eta, 0) * 60;
      setTotalSeconds(total);
      setRemainingSeconds(total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step !== "active") return;
    const id = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimeout(() => goToPayment(), 600);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  // Progress bar fills as the countdown ticks down — 0% when the ride
  // starts, 100% once remainingSeconds hits 0.
  const rideProgress =
    totalSeconds > 0
      ? Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)
      : progress; // fall back to the parent-supplied value if we have no countdown yet

  const activeDriver = approvedDrivers.find((d) => d.id === selectedDriver) || approvedDrivers[0];
  const fare = activeDriver ? formatFare(activeDriver.vehicleType) : formatFare("School Sedan");
  const fareAmount = activeDriver ? String(getVehiclePrice(activeDriver.vehicleType)) : "0";

  function handleBankPay(bankUrl: string) {
    window.open(bankUrl, "_blank");
  }

  return (
    <>
      <div
        className="flex h-screen overflow-hidden"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: "var(--color-bg)",
        }}
      >
        <div className={`absolute bottom-0 left-40 top-11 right-0 z-10 ${step === "idle" ? "top-52" : "top-10"}`}>

          {/* ── IDLE: Where are you going? ── */}
          {step === "idle" && (
            <div className="slide-up p-5">
              <div className="max-w-lg mx-auto glass rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
                <h2 className="text-base font-semibold mb-4 text-white">Where are you going?</h2>
                <div className="space-y-2.5 mb-4">
                  {/* Pickup */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: "var(--color-primary)" }} />
                    <input
                      className="input-field w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white"
                      placeholder="Pickup location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      onFocus={() => setPickupFocus(true)}
                      onBlur={() => setTimeout(() => setPickupFocus(false), 150)}
                    />
                    {pickupFocus && filteredPickup.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-y-auto z-30" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", maxHeight: "220px" }}>
                        {filteredPickup.map((loc) => (
                          <button
                            key={loc}
                            className="w-full px-4 py-2.5 text-sm text-left transition-colors text-white"
                            onMouseDown={() => setPickup(loc)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(29,78,216,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            📍 {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Drop-off */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-sm" style={{ background: "var(--color-amber)" }} />
                    </div>
                    <input
                      className="input-field w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white"
                      placeholder="Drop-off location"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      onFocus={() => setDropoffFocus(true)}
                      onBlur={() => setTimeout(() => setDropoffFocus(false), 150)}
                    />
                    {dropoffFocus && filteredDropoff.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-y-auto z-30" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", maxHeight: "220px" }}>
                        {filteredDropoff.map((loc) => (
                          <button
                            key={loc}
                            className="w-full px-4 py-2.5 text-sm text-left transition-colors text-white"
                            onMouseDown={() => setDropoff(loc)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(29,78,216,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            🏁 {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick locations */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {["Main Gate / Visitor Entrance", "Library Block", "Dining Hall", "School Clinic", "Engineering Hostel (Male)", "Auditorium"].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setDropoff(loc)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(29,78,216,0.4)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-muted)"; }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                <button
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  disabled={!pickup || !dropoff}
                  onClick={startBooking}
                >
                  See Available Rides →
                </button>
              </div>
            </div>
          )}

          {/* ── SELECTING: Available approved drivers ── */}
          {step === "selecting" && (
            <div className="slide-up p-5">
              <div className="max-w-2xl mx-auto glass rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-white">Available Drivers</h2>
                  <button onClick={() => setStep("idle")} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--color-muted)", background: "rgba(255,255,255,0.05)" }}>← Back</button>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--color-subtle)" }}>{pickup} → {dropoff}</p>

                {approvedDrivers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">🚫</p>
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>No approved drivers available right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                    {approvedDrivers.map((driver) => (
                      <button
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver.id)}
                        className="w-full text-left p-3 rounded-xl transition-all"
                        style={{
                          background: selectedDriver === driver.id ? "rgba(29,78,216,0.12)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${selectedDriver === driver.id ? "var(--color-primary)" : "var(--color-border)"}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: "rgba(29,78,216,0.15)", border: "1px solid rgba(29,78,216,0.25)" }}>
                            {VEHICLE_ICONS[driver.vehicleType] ?? "🚗"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">{driver.fullName}</div>
                            <div className="text-xs" style={{ color: "var(--color-muted)" }}>{driver.vehicleType} · {driver.licensePlate}</div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--color-subtle)" }}>{driver.preferredRoute}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{formatFare(driver.vehicleType)}</div>
                            <div className="text-xs" style={{ color: "var(--color-green)" }}>✓ Available</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  disabled={approvedDrivers.length === 0}
                  onClick={confirmRide}
                >
                  Confirm Ride {selectedDriver && approvedDrivers.find(d => d.id === selectedDriver) ? `with ${approvedDrivers.find(d => d.id === selectedDriver)!.fullName.split(" ")[0]}` : ""}
                </button>
              </div>
            </div>
          )}

          {/* ── ACTIVE: Ride in progress ── */}
          {step === "active" && (
            <div className="slide-up p-5">
              <div className="max-w-2xl mx-auto glass rounded-2xl p-5" style={{ border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-green)", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
                    <span className="text-sm font-semibold text-white">Ride Active</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>ETA {formatCountdown(remainingSeconds)}</span>
                </div>

                {/* Progress */}
                <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "var(--color-border)" }}>
                  <div className="h-full rounded-full progress-bar" style={{ width: `${rideProgress}%` }} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: "rgba(29,78,216,0.15)", border: "1px solid rgba(29,78,216,0.25)" }}>
                    {activeDriver ? (VEHICLE_ICONS[activeDriver.vehicleType] ?? "🚗") : "🧑‍✈️"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{activeDriver?.fullName ?? "Driver"}</div>
                    <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {activeDriver?.vehicleType} · {activeDriver?.licensePlate ?? "RUN-007"}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {"★★★★★".split("").map((s, i) => (
                        <span key={i} style={{ color: "var(--color-amber)", fontSize: "11px" }}>{s}</span>
                      ))}
                      <span className="text-xs ml-1" style={{ color: "var(--color-subtle)" }}>4.9</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-border)" }}>📞</button>
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-border)" }}>💬</button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex-1 text-xs" style={{ color: "var(--color-muted)" }}>
                    <span style={{ color: "var(--color-primary)" }}>●</span> {pickup} → <span style={{ color: "var(--color-amber)" }}>■</span> {dropoff}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPayment}
                      className="text-xs px-4 py-1.5 rounded-lg font-semibold transition-all"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "var(--color-green)" }}
                    >
                      💳 Pay {fare}
                    </button>
                    <button
                      onClick={endRide}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--color-red)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PAYMENT: Choose bank app ── */}
          {step === "payment" && (
            <div className="slide-up p-5">
              <div className="max-w-lg mx-auto glass rounded-2xl p-5" style={{ border: "1px solid rgba(34,197,94,0.3)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Pay Driver</h2>
                  <button onClick={() => setStep("active")} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--color-muted)", background: "rgba(255,255,255,0.05)" }}>← Back</button>
                </div>

                {activeDriver && (
                  <div className="p-3 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border)" }}>
                    <div className="text-xs mb-1" style={{ color: "var(--color-muted)" }}>Paying to</div>
                    <div className="text-sm font-semibold text-white">{activeDriver.accountName}</div>
                    <div className="text-xs" style={{ color: "var(--color-muted)" }}>{activeDriver.bankName} · {activeDriver.accountNumber}</div>
                    <div className="text-lg font-bold mt-2" style={{ color: "var(--color-green)" }}>{fare}</div>
                  </div>
                )}

                {/* Direct Flutterwave Checkout */}
                <button
                  onClick={goToPayment}
                  className="w-full py-3 mb-4 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #FF6A00, #FFB400)",
                    boxShadow: "0 4px 16px rgba(255,106,0,0.35)",
                    border: "1px solid rgba(255,106,0,0.3)",
                  }}
                >
                  <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-black">⚡</span>
                  <span>Pay with Flutterwave (Card, Transfer, USSD, OPay)</span>
                </button>

                <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>Or pay directly using your mobile bank app:</p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {BANK_APPS.map((bank) => (
                    <button
                      key={bank.name}
                      onClick={() => handleBankPay(bank.url(activeDriver?.accountNumber ?? "", fareAmount))}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; e.currentTarget.style.background = "rgba(34,197,94,0.06)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    >
                      <span className="text-xl">{bank.icon}</span>
                      <span className="text-xs text-center leading-tight" style={{ color: "var(--color-muted)" }}>{bank.name}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { endRide(); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-muted)" }}
                >
                  I've Paid — Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bank selection modal (legacy, kept for compatibility) */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="glass rounded-2xl p-6 max-w-sm w-full mx-4" style={{ border: "1px solid rgba(34,197,94,0.3)" }}>
            <h3 className="text-base font-semibold text-white mb-1">Choose your bank</h3>
            <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>You'll be redirected to your bank app to complete payment.</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {BANK_APPS.map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => { handleBankPay(bank.url(activeDriver?.accountNumber ?? "", fareAmount)); setShowBankModal(false); }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border)" }}
                >
                  <span className="text-xl">{bank.icon}</span>
                  <span className="text-xs text-center" style={{ color: "var(--color-muted)" }}>{bank.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowBankModal(false)} className="w-full py-2 rounded-xl text-sm" style={{ color: "var(--color-muted)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}