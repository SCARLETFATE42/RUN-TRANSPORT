import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import type { Route } from "./+types/AuthScreen";
import RUNLogo from "./runlogo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RideCampus" },
    {
      name: "description",
      content: "Sign in or create your RideCampus account.",
    },
  ];
}

export default function AuthScreen() {
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  const navigate = useNavigate();

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  navigate("/home");
};

const handleGoogleLogin = async () => {
  navigate("/home");
};

  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-20"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-20"
        style={{ background: "var(--color-amber)" }}
      />

      <div
        className="glass z-10 w-full max-w-md p-8 m-4 rounded-3xl"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <div className="flex flex-col items-center mb-8">
          {/* Your logo */}
          <div className="mb-4">
            <RUNLogo size={82} showText={true} />
          </div>
          <h1 className="text-[22px] font-bold text-white mb-2">
            {authView === "login"
              ? "Welcome back"
              : "Create an account"}
          </h1>
              
          <p
            className="text-sm text-center"
            style={{ color: "var(--color-muted)" }}
          >
            {authView === "login"
              ? "Sign in to access your RideCampus account."
              : "Join the Redeemer's University transport network."}
          </p>
        </div>

        <div className="space-y-4">
          {/* Google */}
          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition-all hover:opacity-90"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            {/* Google G logo SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </button>

          {/* Apple */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition-all hover:opacity-90"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            {/* Apple logo SVG */}
            <svg width="20" height="20" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.3-57-155.5-127C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.8 0 134.2 2.6 198.4 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            Continue with Apple
          </button>

          <div className="flex items-center gap-3 my-6">
            <div
              className="h-px flex-1"
              style={{ background: "var(--color-border)" }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--color-subtle)" }}
            >
              OR
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "var(--color-border)" }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authView === "signup" && (
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--color-muted)" }}
                >
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  className="input-field w-full px-4 py-3 rounded-xl text-sm text-white"
                  placeholder="e.g. Temi Fashola"
                />
              </div>
            )}

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                Email Address
              </label>

              <input
                type="email"
                required
                className="input-field w-full px-4 py-3 rounded-xl text-sm text-white"
                placeholder="student@run.edu.ng"
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-muted)" }}
              >
                Password
              </label>

              <input
                type="password"
                required
                className="input-field w-full px-4 py-3 rounded-xl text-sm text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white mt-2"
            >
              {authView === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
        </div>

        <div
          className="mt-6 text-center text-sm"
          style={{ color: "var(--color-muted)" }}
        >
          {authView === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthView("signup")}
                className="font-medium hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthView("login")}
                className="font-medium hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <NavLink
            to="/"
            className="text-sm hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            ← Back to Home
          </NavLink>
        </div>
      </div>
    </div>
  );
}