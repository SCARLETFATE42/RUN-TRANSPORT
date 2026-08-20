import { useState, useEffect } from "react";
import { LOCATIONS } from "../data/mockData";
import type { Route } from "./+types/scheduleride";
import Navbar from "./navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Schedule Ride | RideCampus" },
    {
      name: "description",
      content: "Book a ride in advance with RideCampus.",
    },
  ];
}

interface ScheduledRide {
  id: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  reason: string;
  approval: string;
  createdAt: number;
}

const STORAGE_KEY = "runcampus_scheduled_rides";

function loadSchedules(): ScheduledRide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSchedules(rides: ScheduledRide[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function getStatusLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "⏰ Today";
  if (diff === 1) return "📅 Tomorrow";
  if (diff > 1) return `📅 In ${diff} days`;
  return "⏳ Past";
}

export default function ScheduleRide() {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [time, setTime] = useState("14:30");
  const [pickup, setPickup] = useState(LOCATIONS[0]);
  const [dropoff, setDropoff] = useState(LOCATIONS[1]);
  const [reason, setReason] = useState("");
  const [approval, setApproval] = useState("No, on-campus only");
  const [schedules, setSchedules] = useState<ScheduledRide[]>([]);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSchedules(loadSchedules());
  }, []);

  function handleSubmit() {
    setError("");

    if (!date || !time) {
      setError("Please fill in the date and time.");
      return;
    }
    if (pickup === dropoff) {
      setError("Pickup and drop-off must be different.");
      return;
    }

    const newRide: ScheduledRide = {
      id: `sr_${Date.now()}`,
      date,
      time,
      pickup,
      dropoff,
      reason,
      approval,
      createdAt: Date.now(),
    };

    const updated = [newRide, ...schedules];
    setSchedules(updated);
    saveSchedules(updated);

    // Reset form
    setDate(today);
    setTime("14:30");
    setPickup(LOCATIONS[0]);
    setDropoff(LOCATIONS[1]);
    setReason("");
    setApproval("No, on-campus only");

    // Show toast
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  function handleCancel(id: string) {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      <Navbar />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-primary)",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          ✅ Ride scheduled successfully!
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1 text-white">
              Schedule a Ride
            </h1>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Book in advance for appointments and trips
            </p>
          </div>

          {/* Form */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                Date
              </label>
              <input
                type="date"
                id="schedule-date"
                className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                Time
              </label>
              <input
                type="time"
                id="schedule-time"
                className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                Pickup
              </label>
              <select
                id="schedule-pickup"
                className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                Drop-off
              </label>
              <select
                id="schedule-dropoff"
                className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                Reason (optional)
              </label>
              <input
                id="schedule-reason"
                className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
                placeholder="e.g. Medical appointment, exeat"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-muted)" }}
              >
                Requires parent approval?
              </label>
              <div className="flex gap-3">
                {["Yes, off-campus", "No, on-campus only"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <input
                      type="radio"
                      name="approval"
                      value={opt}
                      checked={approval === opt}
                      onChange={() => setApproval(opt)}
                      style={{ accentColor: "var(--color-primary)" }}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs" style={{ color: "#f87171" }}>
                ⚠️ {error}
              </p>
            )}

            <button
              id="schedule-submit"
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white"
              onClick={handleSubmit}
            >
              Schedule Ride
            </button>
          </div>

          {/* Upcoming scheduled */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold mb-3 text-white">
              Upcoming{" "}
              {schedules.length > 0 && (
                <span
                  className="ml-1 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {schedules.length}
                </span>
              )}
            </h2>

            {schedules.length === 0 ? (
              <div
                className="p-6 rounded-xl text-center"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="text-2xl mb-2">📅</p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  No upcoming rides scheduled yet.
                  <br />
                  Fill in the form above to book one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((ride) => (
                  <div
                    key={ride.id}
                    className="p-4 rounded-xl"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid rgba(251,191,36,0.2)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {ride.pickup} → {ride.dropoff}
                        </div>
                        <div
                          className="text-xs mt-1"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {formatDate(ride.date)} · {formatTime(ride.time)}
                          {ride.reason && ` · ${ride.reason}`}
                        </div>
                        {ride.approval === "Yes, off-campus" && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: "#fbbf24" }}
                          >
                            ⚠️ Requires parent approval
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs px-2.5 py-1 rounded-full status-scheduled">
                          {getStatusLabel(ride.date)}
                        </span>
                        <button
                          onClick={() => handleCancel(ride.id)}
                          className="text-xs"
                          style={{
                            color: "var(--color-muted)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          title="Cancel this schedule"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
