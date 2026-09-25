import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/mytrips";
import {
  getTrips,
  subscribeToTrips,
  type RecordedTrip,
} from "../data/tripStore";
import Navbar from "./navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Trips | RUN Transport" },
    {
      name: "description",
      content: "Review your RUN Transport campus ride history.",
    },
  ];
}

function formatTripDate(timestamp: number) {
  const tripDate = new Date(timestamp);
  const today = new Date();
  const tripDay = new Date(
    tripDate.getFullYear(),
    tripDate.getMonth(),
    tripDate.getDate(),
  );
  const currentDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dayDifference = Math.round(
    (currentDay.getTime() - tripDay.getTime()) / 86_400_000,
  );

  if (dayDifference === 0) return "Today";
  if (dayDifference === 1) return "Yesterday";
  return tripDate.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year:
      tripDate.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function formatTripTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(trip: RecordedTrip, now: number) {
  const endTime = trip.endedAt ?? now;
  const elapsedMinutes = Math.max(
    1,
    Math.round((endTime - trip.startedAt) / 60_000),
  );
  return `${elapsedMinutes} min`;
}

function formatFare(fareNaira: number) {
  return fareNaira === 0 ? "Free" : `₦${fareNaira.toLocaleString("en-NG")}`;
}

function getStatusLabel(status: RecordedTrip["status"]) {
  if (status === "active") return "● Active";
  if (status === "cancelled") return "× Cancelled";
  return "✓ Done";
}

export default function MyTrips() {
  const [trips, setTrips] = useState<RecordedTrip[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const refreshTrips = () => setTrips(getTrips());
    refreshTrips();
    return subscribeToTrips(refreshTrips);
  }, []);

  useEffect(() => {
    if (!trips.some((trip) => trip.status === "active")) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [trips]);

  const stats = useMemo(() => {
    const completedTrips = trips.filter((trip) => trip.status === "completed");
    const currentDate = new Date();
    const thisMonth = completedTrips.filter((trip) => {
      const date = new Date(trip.endedAt ?? trip.startedAt);
      return (
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    });
    const creditsSpent = completedTrips.reduce(
      (total, trip) => total + trip.fareNaira,
      0,
    );

    return [
      { label: "Total Rides", value: completedTrips.length.toString(), icon: "🚗" },
      { label: "This Month", value: thisMonth.length.toString(), icon: "📅" },
      {
        label: "Credits Spent",
        value: `₦${creditsSpent.toLocaleString("en-NG")}`,
        icon: "💰",
      },
    ];
  }, [trips]);

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
            <div className="mb-6">
              <h1 className="text-xl font-semibold mb-1 text-white">
                My Trips
              </h1>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Your ride history at Redeemer&apos;s University
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {stats.map((stat) => (
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

            <div className="space-y-3">
              {trips.length === 0 ? (
                <div
                  className="p-8 rounded-xl text-center"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="text-2xl mb-2">🚗</div>
                  <p className="text-sm text-white">No trips yet</p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Rides you start will appear here automatically.
                  </p>
                </div>
              ) : (
                trips.map((trip) => (
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
                          {trip.pickup}
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
                            {trip.dropoff}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium status-${trip.status}`}
                      >
                        {getStatusLabel(trip.status)}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-4 text-xs"
                      style={{ color: "var(--color-subtle)" }}
                    >
                      <span>
                        {formatTripDate(trip.startedAt)} · {formatTripTime(trip.startedAt)}
                      </span>
                      <span>·</span>
                      <span>{trip.vehicle}</span>
                      <span>·</span>
                      <span>{formatDuration(trip, now)}</span>
                      <span
                        className="ml-auto font-medium"
                        style={{
                          color:
                            trip.fareNaira === 0
                              ? "var(--color-green)"
                              : "var(--color-amber)",
                        }}
                      >
                        {formatFare(trip.fareNaira)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
