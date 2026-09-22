import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/roleselection";
import RUNLogo from "./runlogo";
import { setCurrentRole, getProfile } from "../data/profileStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Select Role | RUN Transport" },
    {
      name: "description",
      content: "Choose your role as a student, driver, or school authority on the Redeemer's University transport network.",
    },
  ];
}

type RoleType = "student" | "driver" | "authority";

export default function RoleSelection() {
  const navigate = useNavigate();
  const profile = getProfile();
  const [selectedRole, setSelectedRole] = useState<RoleType>(profile.role || "student");

  const handleSelectRole = (role: RoleType, targetPath?: string) => {
    setCurrentRole(role);
    setSelectedRole(role);

    if (targetPath) {
      navigate(targetPath);
      return;
    }

    if (role === "student") {
      navigate("/home");
    } else if (role === "driver") {
      navigate("/drivers");
    } else if (role === "authority") {
      navigate("/fleet-reviews");
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden select-none"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      {/* Decorative ambient background glows */}
      <div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-screen filter blur-[120px] opacity-25 pointer-events-none"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-screen filter blur-[120px] opacity-25 pointer-events-none"
        style={{ background: "var(--color-green)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-screen filter blur-[140px] opacity-15 pointer-events-none"
        style={{ background: "var(--color-amber)" }}
      />

      <div className="z-10 w-full max-w-5xl my-8">
        {/* Header Branding */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4">
            <RUNLogo size={78} showText={true} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Redeemer's University Mobility Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Choose Your Campus Role
          </h1>
          <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: "var(--color-muted)" }}>
            Welcome, <span className="text-white font-semibold">{profile.name}</span>! Select how you will be navigating or managing the RUN Transport network. You can switch roles anytime from your navigation bar.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ── Option 1: Student ── */}
          <div
            onClick={() => setSelectedRole("student")}
            className={`glass rounded-2xl p-6 relative flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
              selectedRole === "student"
                ? "ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20 bg-blue-950/20"
                : "hover:border-white/20"
            }`}
            style={{ border: `1px solid ${selectedRole === "student" ? "var(--color-primary)" : "var(--color-border)"}` }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  🎓
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  Commuter
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Student</h2>
              <p className="text-xs leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>
                Book rides across campus hostels, lecture rooms, clinic, and cafeterias with real-time GPS tracking.
              </p>

              <div className="space-y-2.5 pt-2 border-t border-white/10 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Book campus shuttles, sedans & vans</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Live Google Maps driver tracking & ETA</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Automatic Paystack payment on arrival</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Hostel exeat and clinic emergency transit</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole("student");
              }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-md bg-blue-600 hover:bg-blue-500 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue as Student</span>
              <span>→</span>
            </button>
          </div>

          {/* ── Option 2: Driver ── */}
          <div
            onClick={() => setSelectedRole("driver")}
            className={`glass rounded-2xl p-6 relative flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
              selectedRole === "driver"
                ? "ring-2 ring-amber-500 shadow-2xl shadow-amber-500/20 bg-amber-950/20"
                : "hover:border-white/20"
            }`}
            style={{ border: `1px solid ${selectedRole === "driver" ? "var(--color-amber)" : "var(--color-border)"}` }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-amber-500/20 border border-amber-500/30 text-amber-400">
                  🧑‍✈️
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  Fleet Driver
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Campus Driver</h2>
              <p className="text-xs leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>
                Accept student ride requests, broadcast real-time location on the map, and receive automated trip payouts.
              </p>

              <div className="space-y-2.5 pt-2 border-t border-white/10 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Live Student Pickup Radar on campus map</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Real-time distance to student & navigation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Direct Paystack & bank account payouts</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Vehicle registration & license review status</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole("driver");
              }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all shadow-md bg-amber-400 hover:bg-amber-300 cursor-pointer flex items-center justify-center gap-2 font-bold"
            >
              <span>Continue as Driver</span>
              <span>→</span>
            </button>
          </div>

          {/* ── Option 3: School Authority ── */}
          <div
            onClick={() => setSelectedRole("authority")}
            className={`glass rounded-2xl p-6 relative flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
              selectedRole === "authority"
                ? "ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 bg-emerald-950/20"
                : "hover:border-white/20"
            }`}
            style={{ border: `1px solid ${selectedRole === "authority" ? "var(--color-green)" : "var(--color-border)"}` }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  🏛️
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Official Authority
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">School Authority</h2>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--color-muted)" }}>
                Verify, approve or reject drivers, enforce campus safety standards, and inspect vehicle fleet records.
              </p>

              {/* Special highlight banner: Authorities can still book rides */}
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
                <span className="text-sm">⭐</span>
                <span>
                  <strong>Full Transit Access:</strong> Authorities retain full access to the student ride booking feature anytime!
                </span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/10 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Review & approve/reject driver applications</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Inspect driver background & vehicle clearance</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Full access to Book a Ride & live tracking</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Campus Marshall emergency alert monitoring</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole("authority", "/fleet-reviews");
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md bg-emerald-600 hover:bg-emerald-500 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Approve Drivers (Fleet Portal)</span>
                <span>📋</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole("authority", "/home");
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-emerald-300 transition-all border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Access Ride Booking Feature</span>
                <span>🚀</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs" style={{ color: "var(--color-subtle)" }}>
          Need to switch later? Use the role badge at the top of your navigation bar anytime.
        </div>
      </div>
    </div>
  );
}
