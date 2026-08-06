import { NavLink } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FlowFund" },
    {
      name: "description",
      content: "Track your spending with FlowFund.",
    },
  ];
}

const navItems = [
  { label: "Book a Ride", icon: "🚀", path: "/home" },
  { label: "My Trips", icon: "🗂️", path: "/mytrips" },
  { label: "Schedule", icon: "📅", path: "/schedule" },
  { label: "My Profile", icon: "👤", path: "/profile" },
  { label: "Become a Driver", icon: "🧑‍✈️", path: "/drivers" },
];

export default function Navbar() {
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
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "#ffffff" }}
        >
         <img src="/RUN-Logo.png" alt="" />
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
        className="mx-4 mt-4 mb-2 p-3 rounded-xl"
        style={{
          background: "rgba(29,78,216,0.08)",
          border: "1px solid rgba(29,78,216,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), #60a5fa)",
              color: "#fff",
            }}
          >
            TF
          </div>

          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-white">
              Temi Fashola
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-muted)" }}
            >
              Computer Science · #RUN-2847
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
            ₦2,400
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
  {navItems.map((item) => (
    <NavLink
  key={item.path}
  to={item.path}
  className={({ isActive }) =>
    `nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
      isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5"
    }`
  }
>
  <span className="text-base">{item.icon}</span>
  <span>{item.label}</span>
</NavLink>
  ))}
</nav>

      {/* Emergency */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium"
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
          className="text-xs text-center mt-2"
          style={{ color: "var(--color-subtle)" }}
        >
          Contacts campus security
        </p>
      </div>
    </aside>
  );
}