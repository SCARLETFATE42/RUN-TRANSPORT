import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/splashscreen";
import RUNLogo from "./runlogo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RideCampus" },
    {
      name: "description",
      content:
        "Smart, secure on-demand campus transit for Redeemer's University.",
    },
  ];
}

const STAGES = [
  {
    label: "Initializing RUN Campus GPS Grid",
    subtext: "Locating active shuttles at Main Gate, Senate & Hostels",
    progress: 25,
  },
  {
    label: "Connecting Dispatch Network",
    subtext: "Synchronizing student & staff real-time route schedule",
    progress: 55,
  },
  {
    label: "Securing Naira (₦) Wallet Services",
    subtext: "Verifying GTBank, Zenith & OPay instant top-up channels",
    progress: 85,
  },
  {
    label: "RUN Mobility Ready",
    subtext: "Welcome to Redeemer's University Transport Hub",
    progress: 100,
  },
];

export default function SplashScreen() {
  const navigate = useNavigate();

  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const stageRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }

        const next = Math.min(prev + 1.25, 100);

        if (next >= 85 && stageRef.current < 3) {
          stageRef.current = 3;
          setCurrentStage(3);
        } else if (next >= 55 && stageRef.current < 2) {
          stageRef.current = 2;
          setCurrentStage(2);
        } else if (next >= 25 && stageRef.current < 1) {
          stageRef.current = 1;
          setCurrentStage(1);
        }

        return next;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  // ONLY the top-right ENTER RUN MOBILITY button navigates.
  const handleEnter = () => {
    setIsFadingOut(true);

    setTimeout(() => {
      navigate("/AuthScreen");
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex min-h-screen flex-col justify-between overflow-hidden p-4 select-none transition-all duration-500 sm:p-6 md:p-10 ${
        isFadingOut
          ? "pointer-events-none scale-95 opacity-0"
          : "scale-100 opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #0f1c3f 0%, #070d19 70%, #03060c 100%)",
      }}
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(255, 255, 255, 0.1) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.1) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Blue Glow */}
        <div
          className="absolute -left-20 -top-20 h-56 w-56 rounded-full opacity-30 blur-[90px] transition-all duration-700 sm:h-80 sm:w-80 sm:blur-[120px] md:h-[500px] md:w-[500px] md:blur-[140px]"
          style={{ background: "#1d4ed8" }}
        />

        {/* Gold Glow */}
        <div
          className="absolute -right-20 top-1/2 h-52 w-52 rounded-full opacity-25 blur-[90px] transition-all duration-700 sm:h-72 sm:w-72 sm:blur-[110px] md:h-[450px] md:w-[450px] md:blur-[130px]"
          style={{ background: "#fbbf24" }}
        />

        {/* Bottom Glow */}
        <div
          className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full opacity-20 blur-[100px] transition-all duration-700 sm:h-96 sm:w-96 sm:blur-[130px] md:h-[600px] md:w-[600px] md:blur-[160px]"
          style={{ background: "#1e40af" }}
        />

        {/* Campus Route */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M -100 200 C 300 100, 500 600, 1200 400 S 1600 800, 2000 600"
            fill="none"
            stroke="url(#gradient-line)"
            strokeWidth="3"
            strokeDasharray="8 8"
          />

          <defs>
            <linearGradient
              id="gradient-line"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* =========================================================
          HEADER
      ========================================================== */}
      <header className="relative z-10 flex items-center justify-between gap-2">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2">
          {/* University Badge */}
          <div className="flex max-w-[62vw] items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-amber-400 backdrop-blur-md sm:max-w-full sm:gap-2 sm:px-3 sm:text-xs">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" />

            <span className="truncate">
              Redeemer's University, Ede
            </span>
          </div>

          {/* Live Dispatch */}
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md sm:flex">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>

            <span className="whitespace-nowrap">
              Live Dispatch Network
            </span>
          </div>
        </div>

        {/* ONLY NAVIGATION BUTTON */}
        <button
          onClick={handleEnter}
          className="group flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/40 px-2.5 py-2 text-[9px] font-semibold tracking-wider text-slate-300 backdrop-blur-md transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-white sm:gap-2 sm:px-4 sm:text-xs"
        >
          <span className="whitespace-nowrap">
            ENTER RUN MOBILITY
          </span>

          <svg
            className="h-3.5 w-3.5 shrink-0 text-amber-400 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </header>

      {/* =========================================================
          CENTER CONTENT
          LOGO + RUN MOBILITY + TELEMETRY
      ========================================================== */}
      <main className="relative z-10 flex flex-1 items-center justify-center py-6 sm:py-8 md:py-10">
        <div
          className="
            flex
            w-full
            max-w-7xl
            flex-col
            items-center
            justify-center
            gap-8
            sm:gap-10
            md:flex-row
            md:items-center
            md:gap-10
            lg:gap-14
            xl:gap-16
          "
        >
          {/* =====================================================
              LOGO SECTION
              HOVER EFFECTS ONLY — NO NAVIGATION
          ====================================================== */}
          <div className="group relative shrink-0">
            {/* Glowing pulse aura */}
            <div
              className="
                absolute
                -inset-5
                rounded-[2.5rem]
                bg-gradient-to-r
                from-blue-600
                via-amber-400
                to-indigo-600
                opacity-30
                blur-2xl
                transition-all
                duration-500
                group-hover:-inset-7
                group-hover:opacity-50
                sm:-inset-7
                sm:group-hover:-inset-9
              "
            />

            {/* Logo wrapper */}
            <div
              className="
                relative
                flex
                h-56
                w-56
                items-center
                justify-center
                overflow-hidden
                rounded-[2rem]
                border
                border-white/20
                bg-slate-950/35
                p-5
                shadow-2xl
                backdrop-blur-xl
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:border-amber-400/40
                group-hover:shadow-[0_0_45px_rgba(251,191,36,0.18)]
                sm:h-64
                sm:w-64
                sm:rounded-[2.25rem]
                sm:p-6
                md:h-64
                md:w-64
                lg:h-59
                lg:w-59
                lg:p-7
              "
            >
              {/* Corner accents */}
              <div
                className="
                  absolute
                  left-3
                  top-3
                  h-5
                  w-5
                  rounded-tl-md
                  border-l-2
                  border-t-2
                  border-amber-400/90
                  transition-all
                  duration-500
                  group-hover:h-6
                  group-hover:w-6
                "
              />

              <div
                className="
                  absolute
                  right-3
                  top-3
                  h-5
                  w-5
                  rounded-tr-md
                  border-r-2
                  border-t-2
                  border-amber-400/90
                  transition-all
                  duration-500
                  group-hover:h-6
                  group-hover:w-6
                "
              />

              <div
                className="
                  absolute
                  bottom-3
                  left-3
                  h-5
                  w-5
                  rounded-bl-md
                  border-b-2
                  border-l-2
                  border-amber-400/90
                  transition-all
                  duration-500
                  group-hover:h-6
                  group-hover:w-6
                "
              />

              <div
                className="
                  absolute
                  bottom-3
                  right-3
                  h-5
                  w-5
                  rounded-br-md
                  border-b-2
                  border-r-2
                  border-amber-400/90
                  transition-all
                  duration-500
                  group-hover:h-6
                  group-hover:w-6
                "
              />

              {/* RUN Logo */}
              <RUNLogo
                size={200}
                className="
                  h-full
                  w-full
                  object-contain
                  transition-all
                  duration-500
                  group-hover:scale-105
                  group-hover:drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]
                "
              />
            </div>

            {/* Active Shuttles */}
            <div
              className="
                absolute
                -bottom-5
                left-1/2
                flex
                -translate-x-1/2
                items-center
                gap-2
                whitespace-nowrap
                rounded-full
                border
                border-amber-400/40
                bg-slate-950/95
                px-3
                py-2
                text-[10px]
                font-semibold
                text-amber-300
                shadow-xl
                backdrop-blur-md
                transition-all
                duration-500
                group-hover:border-amber-400/60
                group-hover:shadow-[0_0_25px_rgba(251,191,36,0.15)]
                sm:px-4
                sm:text-[11px]
              "
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>

              14 Active Campus Shuttles
            </div>
          </div>

          {/* =====================================================
              RIGHT CONTENT
          ====================================================== */}
          <div className="flex w-full min-w-0 max-w-2xl flex-col items-center text-center md:items-start md:text-left">
            {/* Title */}
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl">
                RUN{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Mobility
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-slate-300 sm:text-base md:text-lg">
                Smart, secure on-demand campus transit for Redeemer's
                University students, faculty & staff.
              </p>
            </div>

            {/* =================================================
                TELEMETRY
            ================================================== */}
            <div
              className="
                mt-7
                grid
                w-full
                grid-cols-2
                gap-2
                sm:mt-8
                sm:gap-3
                md:grid-cols-2
                lg:grid-cols-4
              "
            >
              {/* Campus Fare */}
              <div className="glass rounded-2xl border border-white/10 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 sm:p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                  Campus Fare
                </div>

                <div className="mt-1 text-sm font-bold text-amber-400 sm:text-base">
                  From ₦200
                </div>
              </div>

              {/* Avg Pickup */}
              <div className="glass rounded-2xl border border-white/10 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 sm:p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                  Avg Pickup
                </div>

                <div className="mt-1 text-sm font-bold text-emerald-400 sm:text-base">
                  3.5 Mins
                </div>
              </div>

              {/* Top-up */}
              <div className="glass rounded-2xl border border-white/10 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 sm:p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                  Top-up Channels
                </div>

                <div className="mt-1 truncate text-sm font-bold text-blue-400 sm:text-base">
                  GTBank / OPay
                </div>
              </div>

              {/* Parent Toggle */}
              <div className="glass rounded-2xl border border-white/10 p-3 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 sm:p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                  Parent Toggle
                </div>

                <div className="mt-1 text-sm font-bold text-indigo-400 sm:text-base">
                  Enabled
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          BOTTOM PROGRESS
          NO LAUNCH BUTTON
      ========================================================== */}
      <div className="relative z-10 mx-auto w-full max-w-xl shrink-0 space-y-3 sm:space-y-4">
        {/* Stage */}
        <div className="flex items-center justify-between gap-3 text-[10px] text-slate-300 sm:text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                progress >= 100
                  ? "bg-amber-400"
                  : "animate-ping bg-amber-400"
              }`}
            />

            <span className="truncate font-semibold text-white">
              {STAGES[currentStage].label}
            </span>
          </div>

          <span className="shrink-0 font-mono font-bold text-amber-400">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-900/80 p-0.5 shadow-inner sm:h-2.5">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-blue-600 via-amber-400 to-yellow-300 transition-all duration-100"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-3 text-[9px] text-slate-400 sm:text-[11px]">
          <span className="truncate">
            {STAGES[currentStage].subtext}
          </span>

          <span className="hidden shrink-0 text-slate-500 md:inline">
            RUN Logistics v2.4
          </span>
        </div>
      </div>
    </div>
  );
}