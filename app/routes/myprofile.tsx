import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/myprofile";
import Navbar from "./navbar";
import NigerianPaymentModal from "../components/NigerianPaymentModal";
import { getProfile, type UserProfile } from "../data/profileStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile | RideCampus" },
    {
      name: "description",
      content: "Manage your RideCampus student profile and ride credits.",
    },
  ];
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const refreshProfile = () => {
    setProfile(getProfile());
  };

  useEffect(() => {
    refreshProfile();
    const handleUpdate = () => refreshProfile();
    window.addEventListener("profile-updated", handleUpdate);
    return () => window.removeEventListener("profile-updated", handleUpdate);
  }, []);

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
        <div className="max-w-xl mx-auto space-y-4">
          {/* Header with Customize Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1 text-white">
                My Profile
              </h1>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Redeemer's University Student Identity & Wallet
              </p>
            </div>

            <Link
              to="/customize-profile"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 ring-1 ring-white/20"
            >
              <span>✏️</span>
              <span>Customize Profile</span>
            </Link>
          </div>

          {/* Avatar section */}
          <div
            className="flex items-center gap-4 p-5 rounded-2xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg"
              style={{
                background: profile.avatarGradient,
                color: "#fff",
              }}
            >
              {profile.avatarInitials || "TF"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold text-white truncate">
                {profile.name}
              </div>
              <div
                className="text-xs truncate"
                style={{ color: "var(--color-muted)" }}
              >
                {profile.department} · Student ID: {profile.studentId} · {profile.level}
              </div>
              {profile.bio && (
                <div className="text-xs text-gray-300 italic mt-1 bg-black/20 px-2 py-0.5 rounded-md border border-white/5 inline-block">
                  "{profile.bio}"
                </div>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "var(--color-green)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  {profile.status}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--color-muted)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  📞 {profile.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-3">
            {[
              {
                label: `Guardian Contact (${profile.guardianRelationship})`,
                value: `${profile.guardianName} · ${profile.guardianPhone}`,
                icon: "👪",
              },
              {
                label: "Hostel / Hall of Residence",
                value: `${profile.hostel} · ${profile.roomNumber}`,
                icon: "🏠",
              },
              {
                label: "Preferred Campus Transit & Needs",
                value: `${profile.preferredVehicle || "Campus Shuttle"}${profile.specialRequirements ? ` · (${profile.specialRequirements})` : ""}`,
                icon: "🚗",
              },
              {
                label: "Permitted Off-campus",
                value: profile.permittedOffCampus,
                icon: "🗺️",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span className="text-xl w-8 text-center">{row.icon}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-subtle)" }}
                  >
                    {row.label}
                  </div>
                  <div className="text-sm font-medium text-white truncate">
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Credits Balance & Top-Up */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-medium text-gray-400 block">
                  Ride Credits Balance
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-amber)" }}
                >
                  ₦{profile.balance.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>💳</span>
                <span>Top Up Wallet</span>
              </button>
            </div>

            <div
              className="h-1.5 rounded-full overflow-hidden mb-3"
              style={{ background: "var(--color-border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, (profile.balance / 5000) * 100))}%`,
                  background: "var(--color-amber)",
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Instant Nigerian Banking: Transfer, Cards, USSD & OPay</span>
              <span className="text-emerald-400 font-medium">Secured by NIBSS ✓</span>
            </div>
          </div>

          {/* Settings & Customization list */}
          <div className="space-y-1 pt-1">
            {[
              { label: "Customize Profile & Themes", sub: "Edit initials, color gradient, hostel & contacts", icon: "🎨", path: "/customize-profile" },
              { label: "Notification & SMS Alerts", sub: profile.preferences.smsNotifications ? "Enabled" : "Disabled", icon: "🔔" },
              { label: "Night Ride Safety Settings", sub: profile.preferences.nightRideAlert ? "Campus Marshall Active" : "Off", icon: "🛡️" },
              { label: "Guardian Trip Sharing", sub: profile.preferences.autoShareGuardian ? "Live ETA SMS Active" : "Off", icon: "📱" },
              { label: "Fleet Applications Portal", sub: "Admin Review & Approvals", icon: "🧑‍✈️", path: "/fleet-reviews" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => item.path ? navigate(item.path) : navigate("/customize-profile")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left transition-all cursor-pointer border border-transparent hover:border-white/5"
                style={{
                  color: "var(--color-muted)",
                  background: "rgba(255,255,255,0.02)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255,255,255,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255,255,255,0.02)")
                }
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <div>
                    <div className="text-white text-xs font-medium">{item.label}</div>
                    <div className="text-[11px] text-gray-500">{item.sub}</div>
                  </div>
                </div>
                <span style={{ color: "var(--color-subtle)" }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nigerian Payment Gateway Modal */}
      <NigerianPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        defaultAmount="2500"
        onSuccess={() => {
          refreshProfile();
        }}
      />
    </div>
  );
}
