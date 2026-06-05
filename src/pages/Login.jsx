import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const ADMIN = {
  id: "admin",
  role: "admin",
  username: "admin",
  name: "Rahul Sanjeev",
};

export default function Login({ setActiveTab }) {
  const { state, dispatch, addToast } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Force lowercase on username and strip empty spaces from both
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      if (cleanUsername === "admin" && cleanPassword === "Rahul@1997") {
        dispatch({ type: "LOGIN", payload: ADMIN });
        addToast("Welcome back, Rahul Sanjeev!");
        setLoading(false);
        return;
      }

      // Check stored users
      const user = state.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (user) {
        dispatch({ type: "LOGIN", payload: user });
        addToast(`Welcome, ${user.name}!`);
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo card */}
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

        <div className="card shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-xs"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-800/50 text-red-400 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

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
