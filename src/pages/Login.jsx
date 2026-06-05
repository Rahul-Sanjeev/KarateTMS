import React, { useState } from "react";
import { useApp } from "../context/AppContext";

// Hardcoded administrator configuration [cite: 3]
const ADMIN = {
  id: "admin",
  role: "admin",
  username: "admin",
  name: "Rahul Sanjeev",
};

export default function Login({ setActiveTab }) {
  // Pull state, dispatch, and custom toast notifications from your AppContext [cite: 4]
  const { state, dispatch, addToast } = useApp();

  // Local state variables for form inputs and UI conditions [cite: 4, 5]
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  /**
   * Form Submission Handler
   * Sanitizes inputs and validates credentials against local memory or context state.
   */
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. SANITIZATION: Eliminate hidden whitespaces/tabs and force lowercase on the username
    // This helps mitigate aggressive browser autofill issues[cite: 16, 26].
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 2. DEBUGGING: Keep track of exactly what data React processes upon submission
    console.log("Submitting sanitized inputs:", {
      cleanUsername,
      cleanPassword,
    });

    setTimeout(() => {
      // 3. HARDCODED EVALUATION: Match credentials against the local system administrator [cite: 11]
      if (cleanUsername === "admin" && cleanPassword === "Rahul@1997") {
        dispatch({ type: "LOGIN", payload: ADMIN });
        addToast("Welcome back, Rahul Sanjeev!");
        setLoading(false);
        return;
      }

      // 4. DATABASE INTEGRITY CHECK:
      // If state.users failed to fetch from Supabase during initial load, state.users will be
      // undefined or empty, causing the app to throw a false "Invalid credentials" error.
      if (!state.users || state.users.length === 0) {
        setError(
          "Database Connection Error: The user roster could not be loaded from Supabase. Please check your network or ad-blockers.",
        );
        setLoading(false);
        return;
      }

      // 5. STATE EVALUATION: Match credentials against fetched state users [cite: 12]
      const user = state.users.find(
        (u) =>
          u.username?.toLowerCase() === cleanUsername &&
          u.password === cleanPassword,
      );

      if (user) {
        dispatch({ type: "LOGIN", payload: user });
        addToast(`Welcome, ${user.name}!`);
      } else {
        // Fallback error messaging if no validation criteria matches [cite: 9, 56]
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Top Header Card & Brand Identity [cite: 7] */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4 shadow-2xl">
            <KarateSVG />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            KarateTMS
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Tournament Management System
          </p>
        </div>

        {/* Authentication Form Card [cite: 7] */}
        <div className="card shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Username Input Field */}
            <div>
              <label htmlFor="login-username" className="label">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>

            {/* Password Input Field */}
            <div>
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-xs"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Alert Box [cite: 7] */}
            {error && (
              <div className="bg-red-950/50 border border-red-800/50 text-red-400 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button with Dynamic Loading State */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="btn-primary w-full justify-center py-2.5 mt-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="divider" />

          <div className="text-center text-xs text-zinc-600">
            Contact your administrator for login credentials.
          </div>
        </div>

        {/* Public Bypass Feature Access */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          Public Timer available without login →{" "}
          <button
            onClick={() => setActiveTab("Timer")}
            className="text-crimson hover:underline"
          >
            Open Timer
          </button>
        </p>
      </div>
    </div>
  );
}

/**
 * System Logo Render Asset [cite: 8]
 */
function KarateSVG() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="6" r="4" fill="#C41E3A" />
      <rect x="16" y="12" width="8" height="12" rx="2" fill="#C41E3A" />
      <path
        d="M16 18 L6 22 M24 18 L34 14"
        stroke="#C41E3A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 24 L14 36 M22 24 L26 36"
        stroke="#C41E3A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M14 30 L20 28 L26 32"
        stroke="#C41E3A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
