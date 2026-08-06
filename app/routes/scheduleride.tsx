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

export default function ScheduleRide() {
  return (
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
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1 text-white">
            Schedule a Ride
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Book in advance for appointments and trips
          </p>
        </div>

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
              className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
              defaultValue="2026-08-05"
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
              className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
              defaultValue="14:30"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Pickup
            </label>
            <select className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600">
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
            <select className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600">
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
              className="input-field w-full px-4 py-3 rounded-xl text-sm text-blue-600"
              placeholder="e.g. Medical appointment, exeat"
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
                    style={{ accentColor: "var(--color-primary)" }}
                  />{" "}
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white">
            Schedule Ride
          </button>
        </div>

        {/* Upcoming scheduled */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold mb-3 text-white">
            Upcoming
          </h2>
          <div
            className="p-4 rounded-xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">
                  Sports Complex → Main Gate
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  Today · 2:30 PM · School Sedan
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full status-scheduled">
                ⏰ Today
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
