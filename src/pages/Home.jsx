import React from 'react';
import { useApp } from '../context/AppContext';

export default function Home({ setActiveTab }) {
  const { state } = useApp();
  const info = state.tournamentInfo;
  const { currentUser } = state;

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col relative overflow-hidden bg-[#050505] font-sans selection:bg-crimson/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[800px] h-[800px] bg-crimson/5 rounded-full blur-[120px] absolute -top-[200px] opacity-60 mix-blend-screen" />
        <div className="w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] absolute -bottom-[100px] opacity-50 mix-blend-screen" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 z-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="mb-10 text-crimson animate-fade-in-up">
            <KarateSVG />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tighter text-center leading-tight mb-6 animate-fade-in-up" style={{animationDelay: '100ms'}}>
            {info.name || 'KARATE TOURNAMENT'}
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 text-sm md:text-base text-zinc-400 mb-16 font-medium tracking-wide uppercase animate-fade-in-up" style={{animationDelay: '200ms'}}>
            {info.city && <span className="flex items-center gap-2"><MapPinIcon /> {info.city}</span>}
            {info.city && info.date && <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-800" />}
            {info.date && <span className="flex items-center gap-2"><CalendarIcon /> {new Date(info.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
          </div>

          <div className="grid sm:grid-cols-3 gap-6 w-full animate-fade-in-up" style={{animationDelay: '300ms'}}>
            <button
              onClick={() => setActiveTab('Timer')}
              className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 text-zinc-300 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <TimerIcon />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide mb-2">Match Timer</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Launch the official live projection scoreboard.</p>
            </button>

            <button
              onClick={() => setActiveTab('Club Standings')}
              className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 text-zinc-300 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <TrophyIcon />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide mb-2">Live Standings</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">View real-time medal counts and ranks.</p>
            </button>

            {!currentUser ? (
              <button
                onClick={() => setActiveTab('Login')}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-crimson/[0.03] border border-crimson/20 hover:border-crimson/50 hover:bg-crimson/[0.08] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-crimson/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 rounded-full bg-crimson/10 flex items-center justify-center mb-6 text-crimson group-hover:scale-110 transition-all duration-300">
                  <UserIcon />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide mb-2">Staff Portal</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Login for Coaches, Referees, and Admins.</p>
              </button>
            ) : (
              <button
                onClick={() => {
                  const fallback = { manager: 'Categories', coach: 'My Participants', scorer: 'Match Console', admin: 'Dashboard' };
                  setActiveTab(fallback[currentUser.role] || 'Dashboard');
                }}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-all duration-300">
                  <UserIcon />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide mb-2">My Dashboard</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Return to your management tools.</p>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-8 text-center z-10 mt-auto flex flex-col gap-2">
        <p className="text-xs font-medium tracking-widest text-zinc-600 uppercase">
          {info.organizer ? `Organized by ${info.organizer}` : 'Official Tournament Management System'}
        </p>
        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
          © {new Date().getFullYear()} All rights reserved • Voxelyn Dynamics / Rahul Sanjeev
        </p>
      </div>
    </div>
  );
}

// Minimal SVGs
function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M10 2h4"/>
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function KarateSVG() {
  return (
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(196,30,58,0.5)]">
      <circle cx="20" cy="6" r="4" fill="currentColor" />
      <rect x="16" y="12" width="8" height="12" rx="2" fill="currentColor" />
      <path d="M16 18 L6 22 M24 18 L34 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 24 L14 36 M22 24 L26 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 30 L20 28 L26 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
