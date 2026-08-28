import type { Route } from "./+types/mytrips";
import { TRIPS } from "../data/mockData";
import Navbar from "./navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FlowFund" },
    {
      name: "description",
      content: "Track your spending with FlowFund.",
    },
  ];
}

export default function MyTrips() {
  return (
    <>
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      <Navbar />

      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Your existing My Trips content stays here */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1 text-white">
            My Trips
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Your ride history at Redeemer's University
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Rides", value: "24", icon: "🚗" },
            { label: "This Month", value: "8", icon: "📅" },
            { label: "Credits Spent", value: "₦3,600", icon: "💰" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-lg font-semibold text-white">
                {stat.value}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trip list */}
        <div className="space-y-3">
          {TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="p-4 rounded-xl transition-all"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-white">
                    {trip.from}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className="w-px h-3"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    />
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {trip.to}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium status-${trip.status}`}
                >
                  {trip.status === "active"
                    ? "● Active"
                    : trip.status === "scheduled"
                    ? "⏰ Scheduled"
                    : "✓ Done"}
                </span>
              </div>

              <div
                className="flex items-center gap-4 text-xs"
                style={{ color: "var(--color-subtle)" }}
              >
                <span>
                  {trip.date} · {trip.time}
                </span>
                <span>·</span>
                <span>{trip.vehicle}</span>
                <span>·</span>
                <span>{trip.duration}</span>
                <span
                  className="ml-auto font-medium"
                  style={{
                    color:
                      trip.fare === "Free"
                        ? "var(--color-green)"
                        : "var(--color-amber)",
                  }}
                >
                  {trip.fare}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
    </>
  );
}