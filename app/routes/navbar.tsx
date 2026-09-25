import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  canUseAuthorityRole,
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
  const authorityAccess = canUseAuthorityRole(profile);

  const handleQuickSwitchRole = (newRole: "student" | "driver" | "authority") => {
    if (newRole === "authority" && !authorityAccess) {
      setShowRoleMenu(false);
      return;
    }

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
      className="flex w-16 shrink-0 flex-col border-r md:w-64"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo & Header */}
      <div
        className="flex items-center justify-center gap-3 border-b px-2 py-3 md:justify-start md:px-5 md:py-5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg md:h-10 md:w-10"
          style={{ background: "#ffffff" }}
        >
          <img src="/RUN-Logo.png" alt="RUN Logo" className="w-full h-full object-contain" />
        </div>

        <div className="hidden md:block">
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
      <div className="relative px-2 pb-1 pt-3 md:px-4">
        <div
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 text-xs transition-all hover:opacity-90 md:justify-between ${roleMeta.bg} ${roleMeta.border}`}
          title={roleMeta.label}
        >
          <div className="flex items-center gap-2">
            <span>{roleMeta.icon}</span>
            <span className={`hidden font-bold md:inline ${roleMeta.color}`}>{roleMeta.label}</span>
          </div>
          <span className="hidden text-[10px] text-gray-400 font-mono md:inline">Switch ▾</span>
        </div>

        {/* Quick Role Switch Popover */}
        {showRoleMenu && (
          <div className="animate-fadeIn absolute left-2 top-12 z-50 w-56 space-y-1 rounded-lg border border-white/20 bg-black/95 p-2 shadow-2xl md:left-4 md:right-4 md:w-auto">
            <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
              Change Active Role
            </div>
            {[
              { id: "student", label: "Student Commuter", icon: "🎓", desc: "Book rides & live GPS" },
              { id: "driver", label: "Campus Driver", icon: "🧑‍✈️", desc: "Pickup radar & earnings" },
              ...(authorityAccess
                ? [{ id: "authority", label: "School Authority", icon: "🏛️", desc: "Approvals & ride booking" }]
                : []),
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
            {!authorityAccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2">
                <div className="text-xs font-semibold text-emerald-300">
                  Are you a school authority?
                </div>
                <div className="mt-0.5 text-[10px] leading-4 text-gray-400">
                  Register as school authority during signup to unlock fleet review access.
                </div>
              </div>
            )}
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
        className="mx-2 mb-2 mt-2 cursor-pointer rounded-lg border p-2 transition-all hover:border-blue-500/30 md:mx-4 md:p-3"
        title="My Profile"
        style={{
          background: "rgba(29,78,216,0.08)",
          borderColor: "rgba(29,78,216,0.15)",
        }}
      >
        <div className="flex items-center justify-center gap-3 md:justify-start">
          {/* Custom Avatar Image or Initials Fallback */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-md overflow-hidden border border-white/10"
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

          <div className="hidden min-w-0 flex-1 md:block">
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
          className="mt-3 hidden items-center justify-between pt-2 md:flex"
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
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2 md:px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all md:justify-between md:px-3 ${
                isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </div>
            {item.badge && (
              <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 md:inline-flex">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Emergency & Action footer */}
      <div
        className="space-y-2 border-t p-2 md:p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          onClick={handleReplaySplash}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2 py-2.5 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/10 md:justify-start md:px-3"
          title="Replay Splash Screen"
        >
          <span>✨</span>
          <span className="hidden md:inline">Replay Splash Screen</span>
        </button>
        <button
          onClick={() => alert("SOS Alert dispatched to Redeemer's University Security Marshall! Immediate response team notified.")}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition-all md:justify-start md:px-3"
          title="Emergency Alert"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--color-red)",
          }}
        >
          <span>🆘</span>
          <span className="hidden md:inline">Emergency Alert</span>
        </button>
        <p
          className="mt-1 hidden text-center text-xs md:block"
          style={{ color: "var(--color-subtle)" }}
        >
          Contacts campus security
        </p>
      </div>
    </aside>
  );
}
