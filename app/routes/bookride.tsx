import type { Route } from "./+types/home";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "FlowFund" },
    { name: "description", content: "Track your spending with FlowFund." },
  ];
}

interface BookRideProps {
  step: "idle" | "selecting" | "active";
  setStep: React.Dispatch<
    React.SetStateAction<"idle" | "selecting" | "active">
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
}

type Step = "idle" | "selecting" | "active";

const VEHICLES = [
  { id: "bus", icon: "🚌", name: "Campus Bus", desc: "Shared shuttle", note: "₦150 · 8 seats", badge: null },
  { id: "car", icon: "🚗", name: "Private Car", desc: "Solo ride", note: "₦400 · 4 seats", badge: "Fast" },
  { id: "van", icon: "🚐", name: "Mini Van", desc: "Group ride", note: "₦250 · 6 seats", badge: null },
];

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
}: BookRideProps) {
  // const [view, setView] = useState("book");
  return (
    <>
      {/* Booking Panel */}
         <div
            className="flex h-screen overflow-hidden"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: "var(--color-bg)",
            }}
          >
            {/* <Navbar view={view} setView={setView} /> */}
        
        <div className="absolute bottom-0 left-40  top-52 right-0 z-10">
          {step === 'idle' && (
            <div className="slide-up p-5">
              <div className="max-w-lg mx-auto glass rounded-2xl p-5" style={{ border: '1px solid var(--color-border)' }}>
                <h2 className="text-base font-semibold mb-4 text-white">Where are you going?</h2>
                <div className="space-y-2.5 mb-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
                    <input
                      className="input-field w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white"
                      placeholder="Pickup location"
                      value={pickup}
                      onChange={e => setPickup(e.target.value)}
                      onFocus={() => setPickupFocus(true)}
                      onBlur={() => setTimeout(() => setPickupFocus(false), 150)}
                    />
                    {pickupFocus && filteredPickup.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-y-auto z-30" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', maxHeight: '220px' }}>
                        {filteredPickup.map(loc => (
                          <button key={loc} className="w-full px-4 py-2.5 text-sm text-left transition-colors text-white" onMouseDown={() => setPickup(loc)}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(29,78,216,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            📍 {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--color-amber)' }} />
                    </div>
                    <input
                      className="input-field w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white"
                      placeholder="Drop-off location"
                      value={dropoff}
                      onChange={e => setDropoff(e.target.value)}
                      onFocus={() => setDropoffFocus(true)}
                      onBlur={() => setTimeout(() => setDropoffFocus(false), 150)}
                    />
                    {dropoffFocus && filteredDropoff.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-30" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                        {filteredDropoff.slice(0, 5).map(loc => (
                          <button key={loc} className="w-full px-4 py-2.5 text-sm text-left transition-colors text-white" onMouseDown={() => setDropoff(loc)}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(29,78,216,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
                  {['Main Gate', 'Library Block', 'Dining Hall', 'School Clinic', 'Engineering Hostel', 'Engineering Faculty'].map(loc => (
                    <button key={loc} onClick={() => setDropoff(loc)} className="text-xs px-3 py-1.5 rounded-full transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(29,78,216,0.4)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)' }}
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

          {step === 'selecting' && (
            <div className="slide-up p-5">
              <div className="max-w-2xl mx-auto glass rounded-2xl p-5" style={{ border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-white">Choose your ride</h2>
                  <button onClick={() => setStep('idle')} className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--color-muted)', background: 'rgba(255,255,255,0.05)' }}>← Back</button>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--color-subtle)' }}>{pickup} → {dropoff}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {VEHICLES.map(v => (
                    <button
                      key={v.id}
                      className={`vehicle-card p-3 rounded-xl text-left ${vehicle === v.id ? 'selected' : ''}`}
                      style={{ background: vehicle === v.id ? 'rgba(29,78,216,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${vehicle === v.id ? 'var(--color-primary)' : 'var(--color-border)'}` }}
                      onClick={() => setVehicle(v.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{v.icon}</span>
                        {v.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--color-amber)', fontSize: '10px' }}>{v.badge}</span>
                        )}
                      </div>
                      <div className="text-xs font-semibold mb-1 text-white">{v.name}</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{v.desc}</div>
                      <div className="text-xs mt-2" style={{ color: 'var(--color-subtle)' }}>{v.note}</div>
                    </button>
                  ))}
                </div>

                <button className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white" onClick={confirmRide}>
                  Confirm {VEHICLES.find(v => v.id === vehicle)?.name}
                </button>
              </div>
            </div>
          )}

          {step === 'active' && (
            <div className="slide-up p-5">
              <div className="max-w-2xl mx-auto glass rounded-2xl p-5" style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-green)', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
                    <span className="text-sm font-semibold text-white">Ride Active</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>ETA {eta} min</span>
                </div>

                {/* Progress */}
                <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--color-border)' }}>
                  <div className="h-full rounded-full progress-bar" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: 'rgba(29,78,216,0.15)', border: '1px solid rgba(29,78,216,0.25)' }}>
                    🧑✈️
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Mr. Adeniyi K.</div>
                    <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {VEHICLES.find(v => v.id === vehicle)?.icon} {VEHICLES.find(v => v.id === vehicle)?.name} · RUN-007
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {'★★★★★'.split('').map((s, i) => (
                        <span key={i} style={{ color: 'var(--color-amber)', fontSize: '11px' }}>{s}</span>
                      ))}
                      <span className="text-xs ml-1" style={{ color: 'var(--color-subtle)' }}>4.9</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)' }}>📞</button>
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)' }}>💬</button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span style={{ color: 'var(--color-primary)' }}>●</span> {pickup} → <span style={{ color: 'var(--color-amber)' }}>■</span> {dropoff}
                  </div>
                  <button onClick={endRide} className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-red)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
