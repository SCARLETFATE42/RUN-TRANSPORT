import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import type { Route } from "./+types/authscreen";

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

          <h1 className="text-2xl font-bold text-white mb-2">
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
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition-all"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Continue with Google
          </button>

          {/* Apple */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition-all"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
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