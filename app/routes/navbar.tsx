import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import { getProfile, type UserProfile } from "../data/profileStore";

const navItems = [
  { label: "Book a Ride", icon: "🚀", path: "/home" },
  { label: "My Trips", icon: "🗂️", path: "/mytrips" },
  { label: "Schedule", icon: "📅", path: "/schedule" },
  { label: "My Profile", icon: "👤", path: "/profile" },
  { label: "Become a Driver", icon: "🧑‍✈️", path: "/drivers" },
  { label: "Fleet Reviews", icon: "📋", path: "/fleet-reviews" },
];

interface NavbarProps {
  onReplaySplash?: () => void;
}

export default function Navbar({ onReplaySplash }: NavbarProps = {}) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getProfile());

  const refreshProfile = () => {
    setProfile(getProfile());
  };

  useEffect(() => {
    refreshProfile();
    const handleUpdate = () => refreshProfile();
    window.addEventListener("profile-updated", handleUpdate);
    return () => window.removeEventListener("profile-updated", handleUpdate);
  }, []);

  const handleReplaySplash = () => {
    if (onReplaySplash) {
      onReplaySplash();
    } else {
      navigate("/");
    }
  };

  return (
    <aside
      className="flex flex-col w-64 shrink-0 border-r"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: "#ffffff" }}
        >
          <img src="/RUN-Logo.png" alt="RUN Logo" className="w-full h-full object-contain" />
        </div>

        <div>
          <div className="font-semibold text-sm leading-tight text-white">
            RideCampus
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            Redeemer's University
          </div>
        </div>
      </div>

      {/* Student Card */}
      <div
        onClick={() => navigate("/profile")}
        className="mx-4 mt-4 mb-2 p-3 rounded-xl cursor-pointer hover:border-blue-500/30 transition-all"
        style={{
          background: "rgba(29,78,216,0.08)",
          border: "1px solid rgba(29,78,216,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-md"
            style={{
              background: profile.avatarGradient,
              color: "#fff",
            }}
          >
            {profile.avatarInitials || "TF"}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-white">
              {profile.name}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--color-muted)" }}
            >
              {profile.department} · #{profile.studentId}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between mt-3 pt-2"
          style={{
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            Ride credits
          </span>

          <span
            className="text-sm font-semibold"
            style={{ color: "var(--color-amber)" }}
          >
            ₦{profile.balance.toLocaleString()}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Emergency & Action footer */}
      <div
        className="p-4 border-t space-y-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          onClick={handleReplaySplash}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
        >
          <span>✨</span>
          <span>Replay Splash Screen</span>
        </button>
        <button
          onClick={() => alert("SOS Alert dispatched to Redeemer's University Security Marshall! Immediate response team notified.")}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--color-red)",
          }}
        >
          <span>🆘</span>
          Emergency Alert
        </button>
        <p
          className="text-xs text-center mt-1"
          style={{ color: "var(--color-subtle)" }}
        >
          Contacts campus security
        </p>
      </div>
    </aside>
  );
}