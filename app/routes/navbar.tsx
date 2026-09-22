import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  getProfile,
  setCurrentRole,
  type UserProfile,
} from "../data/profileStore";

interface NavbarProps {
  onReplaySplash?: () => void;
}

export default function Navbar({ onReplaySplash }: NavbarProps = {}) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [showRoleMenu, setShowRoleMenu] = useState(false);

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

  const currentRole = profile.role || "student";

  const handleQuickSwitchRole = (newRole: "student" | "driver" | "authority") => {
    setCurrentRole(newRole);
    refreshProfile();
    setShowRoleMenu(false);
    if (newRole === "authority") {
      navigate("/fleet-reviews");
    } else if (newRole === "driver") {
      navigate("/drivers");
    } else {
      navigate("/home");
    }
  };

  // Dynamically tailor navItems based on role while ensuring School Authority can still access ride booking!
  const getNavItems = () => {
    const baseItems = [
      { label: "Book a Ride", icon: "🚀", path: "/home", badge: currentRole === "authority" ? "Transit" : undefined },
      { label: "My Trips", icon: "🗂️", path: "/mytrips" },
      { label: "Schedule", icon: "📅", path: "/schedule" },
      { label: "My Profile", icon: "👤", path: "/profile" },
    ];

    if (currentRole === "authority") {
      return [
        { label: "Fleet Reviews", icon: "📋", path: "/fleet-reviews", badge: "Approvals" },
        ...baseItems,
        { label: "Become a Driver", icon: "🧑‍✈️", path: "/drivers" },
      ];
    }

    if (currentRole === "driver") {
      return [
        { label: "Driver Console", icon: "🧑‍✈️", path: "/drivers", badge: "Active" },
        { label: "Live Campus Map", icon: "🗺️", path: "/home" },
        { label: "My Trips", icon: "🗂️", path: "/mytrips" },
        { label: "My Profile", icon: "👤", path: "/profile" },
      ];
    }

    // Default student view
    return [
      { label: "Book a Ride", icon: "🚀", path: "/home" },
      { label: "My Trips", icon: "🗂️", path: "/mytrips" },
      { label: "Schedule", icon: "📅", path: "/schedule" },
      { label: "My Profile", icon: "👤", path: "/profile" },
      { label: "Become a Driver", icon: "🧑‍✈️", path: "/drivers" },
      { label: "Fleet Reviews", icon: "📋", path: "/fleet-reviews" },
    ];
  };

  const navItems = getNavItems();

  const roleMeta = {
    student: { label: "Student Commuter", icon: "🎓", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    driver: { label: "Campus Driver", icon: "🧑‍✈️", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    authority: { label: "School Authority", icon: "🏛️", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  }[currentRole] || { label: "Student", icon: "🎓", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" };

  return (
    <aside
      className="flex flex-col w-64 shrink-0 border-r"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo & Header */}
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
            RUN Transport
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            Redeemer's University
          </div>
        </div>
      </div>

      {/* Role Badge & Switcher */}
      <div className="px-4 pt-3 pb-1 relative">
        <div
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all hover:opacity-90 ${roleMeta.bg} ${roleMeta.border}`}
        >
          <div className="flex items-center gap-2">
            <span>{roleMeta.icon}</span>
            <span className={`font-bold ${roleMeta.color}`}>{roleMeta.label}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Switch ▾</span>
        </div>

        {/* Quick Role Switch Popover */}
        {showRoleMenu && (
          <div className="absolute left-4 right-4 top-12 z-50 p-2 rounded-2xl bg-black/95 border border-white/20 shadow-2xl space-y-1 animate-fadeIn">
            <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
              Change Active Role
            </div>
            {[
              { id: "student", label: "Student Commuter", icon: "🎓", desc: "Book rides & live GPS" },
              { id: "driver", label: "Campus Driver", icon: "🧑‍✈️", desc: "Pickup radar & earnings" },
              { id: "authority", label: "School Authority", icon: "🏛️", desc: "Approvals & ride booking" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => handleQuickSwitchRole(r.id as any)}
                className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center gap-2.5 cursor-pointer ${
                  currentRole === r.id
                    ? "bg-blue-600 text-white font-bold"
                    : "hover:bg-white/10 text-gray-300"
                }`}
              >
                <span className="text-base">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold leading-tight">{r.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{r.desc}</div>
                </div>
                {currentRole === r.id && <span className="text-xs">✓</span>}
              </button>
            ))}
            <div className="pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  setShowRoleMenu(false);
                  navigate("/select-role");
                }}
                className="w-full py-1.5 text-center text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                Full Role Selection Screen →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Card with Custom Avatar Photo */}
      <div
        onClick={() => navigate("/profile")}
        className="mx-4 mt-2 mb-2 p-3 rounded-xl cursor-pointer hover:border-blue-500/30 transition-all border"
        style={{
          background: "rgba(29,78,216,0.08)",
          borderColor: "rgba(29,78,216,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Custom Avatar Image or Initials Fallback */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-md overflow-hidden border border-white/10"
            style={{
              background: profile.avatarGradient,
              color: "#fff",
            }}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.avatarInitials || "TF"
            )}
          </div>

          <div className="min-w-0 flex-1">
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

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {item.badge}
              </span>
            )}
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