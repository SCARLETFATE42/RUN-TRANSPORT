import { useEffect, useState } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { activateDueScheduledRides } from "./data/scheduledRideStore";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Flutterwave inline checkout JS */}
        <script src="https://checkout.flutterwave.com/v3.js" async />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

interface ScheduledRideNotice {
  pickup: string;
  dropoff: string;
}

function ScheduledRideActivator() {
  const [notice, setNotice] = useState<ScheduledRideNotice | null>(null);

  useEffect(() => {
    const activateSchedules = () => {
      const activated = activateDueScheduledRides();
      const latest = activated.at(-1);
      if (!latest) return;

      setNotice({
        pickup: latest.schedule.pickup,
        dropoff: latest.schedule.dropoff,
      });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") activateSchedules();
    };

    activateSchedules();
    const interval = window.setInterval(activateSchedules, 1_000);
    window.addEventListener("focus", activateSchedules);
    window.addEventListener("profile-updated", activateSchedules);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", activateSchedules);
      window.removeEventListener("profile-updated", activateSchedules);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 8_000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (!notice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        width: "min(420px, calc(100vw - 40px))",
        padding: "14px 16px",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        background: "var(--color-surface)",
        color: "#fff",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 700 }}>
          Scheduled ride booked
        </div>
        <div
          style={{
            marginTop: "3px",
            overflow: "hidden",
            color: "var(--color-muted)",
            fontSize: "12px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {notice.pickup} to {notice.dropoff}
        </div>
      </div>
      <Link
        to="/home"
        onClick={() => setNotice(null)}
        style={{
          flexShrink: 0,
          color: "var(--color-primary)",
          fontSize: "12px",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        View ride
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <ScheduledRideActivator />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
