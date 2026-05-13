import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Participants from "./pages/Participants";
import Brackets from "./pages/Brackets";
import MatchConsole from "./pages/MatchConsole";
import ClubStandings from "./pages/ClubStandings";
import Timer from "./pages/Timer";
import Home from "./pages/Home";

// Role-based access control
const ROLE_ACCESS = {
  Dashboard: ["admin"],
  Settings: ["admin"],
  Categories: ["admin", "manager"],
  "My Participants": ["admin", "coach"],
  Brackets: ["admin", "manager", "coach", "scorer"],
  "Match Console": ["admin", "scorer"],
  "Club Standings": ["admin", "manager", "coach", "scorer"],
  Timer: null, // public
  Home: null, // public
};

function AppShell() {
  const { state, cloudLoading } = useApp();
  const { currentUser } = state;
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "Home",
  );

  // Save tab to localStorage
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // On login, switch to correct default tab ONLY if we were at Login or don't have a valid tab
  useEffect(() => {
    if (!currentUser) {
      // If we are on a protected tab but logged out, go Home
      const protectedTabs = [
        "Dashboard",
        "Settings",
        "Categories",
        "My Participants",
        "Brackets",
        "Match Console",
        "Club Standings",
      ];
      if (protectedTabs.includes(activeTab)) {
        setActiveTab("Home");
      }
    } else if (activeTab === "Login" || activeTab === "Home") {
      const defaultTabs = {
        admin: "Dashboard",
        manager: "Categories",
        coach: "My Participants",
        scorer: "Match Console",
      };
      setActiveTab(defaultTabs[currentUser.role] || "Dashboard");
    }
  }, [currentUser]);

  const guardedSetTab = (tab) => {
    if (tab === "Home" || tab === "Timer" || tab === "Login") {
      setActiveTab(tab);
      return;
    }
    const allowed = ROLE_ACCESS[tab];
    if (allowed === null) {
      setActiveTab(tab);
      return;
    }
    if (!currentUser) {
      setActiveTab("Login");
      return;
    }
    if (allowed && !allowed.includes(currentUser.role)) {
      // Redirect to their home
      const fallback = {
        manager: "Categories",
        coach: "My Participants",
        scorer: "Match Console",
        admin: "Dashboard",
      };
      setActiveTab(fallback[currentUser.role] || "Timer");
      return;
    }
    setActiveTab(tab);
  };

  const renderPage = () => {
    if (
      activeTab === "Login" ||
      (!currentUser && activeTab !== "Home" && activeTab !== "Timer")
    ) {
      return <Login setActiveTab={guardedSetTab} />;
    }

    // Auth guard for non-public tabs
    if (activeTab !== "Home" && activeTab !== "Timer") {
      const allowed = ROLE_ACCESS[activeTab];
      if (
        allowed !== null &&
        (!currentUser || (allowed && !allowed.includes(currentUser.role)))
      ) {
        return <Login setActiveTab={guardedSetTab} />;
      }
    }

    switch (activeTab) {
      case "Home":
        return <Home setActiveTab={guardedSetTab} />;
      case "Timer":
        return <Timer setActiveTab={guardedSetTab} />;
      case "Dashboard":
        return <Dashboard setActiveTab={guardedSetTab} />;
      case "Settings":
        return <Settings />;
      case "Categories":
        return <Categories setActiveTab={guardedSetTab} />;
      case "My Participants":
        return <Participants />;
      case "Brackets":
        return <Brackets />;
      case "Match Console":
        return <MatchConsole />;
      case "Club Standings":
        return <ClubStandings />;
      default:
        return <Login setActiveTab={guardedSetTab} />;
    }
  };

  // Timer gets its own dark full-screen layout
  const isTimer = activeTab === "Timer";

  if (cloudLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-zinc-700 border-t-crimson rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm font-medium">
            Loading from cloud…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar activeTab={activeTab} setActiveTab={guardedSetTab} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {renderPage()}
      </main>
      <footer className="no-print w-full py-4 flex justify-center opacity-30">
        <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
          Powered by Voxelyn Dynamics
        </p>
      </footer>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
