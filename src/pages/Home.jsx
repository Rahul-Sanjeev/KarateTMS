import React from 'react';
import { useApp } from '../context/AppContext';

export default function Home({ setActiveTab }) {
  const { state } = useApp();
  const info = state.tournamentInfo;
  const { currentUser } = state;

  return (
    <div className="min-h-0 flex flex-col relative overflow-hidden bg-[#050505] font-sans selection:bg-crimson/30 rounded-[var(--radius-fluid)]">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[50vw] h-[50vw] bg-crimson/5 rounded-full blur-[clamp(4rem,10vw,8rem)] absolute -top-[10%] opacity-60 mix-blend-screen" />
        <div className="w-[40vw] h-[40vw] bg-blue-600/5 rounded-full blur-[clamp(4rem,10vw,8rem)] absolute -bottom-[5%] opacity-50 mix-blend-screen" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-[var(--gap-fluid)] py-[var(--spacing-fluid)] z-10">
        <div className="w-full max-w-full flex flex-col items-center">
          
          <div className="mb-[var(--gap-fluid)] text-crimson animate-fade-in">
            <KarateSVG />
          </div>

          <h1 className="text-center leading-tight mb-[var(--gap-fluid)] animate-fade-in text-white/90">
            {info.name || 'KARATE TOURNAMENT'}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-x-[var(--gap-fluid)] gap-y-2 text-[0.9rem] text-zinc-500 mb-[var(--spacing-fluid)] font-medium tracking-[0.1em] uppercase animate-fade-in">
            {info.city && <span className="flex items-center gap-2"><MapPinIcon /> {info.city}</span>}
            {info.city && info.date && <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-800" />}
            {info.date && <span className="flex items-center gap-2"><CalendarIcon /> {new Date(info.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--gap-fluid)] w-full max-w-[1200px] animate-fade-in">
            <button
              onClick={() => setActiveTab('Timer')}
              className="group relative flex flex-col items-center text-center p-[var(--gap-fluid)] rounded-[var(--radius-fluid)] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                <TimerIcon />
              </div>
              <h3 className="text-[1rem] font-bold text-white tracking-wide mb-2 uppercase italic">Match Timer</h3>
              <p className="text-[0.8rem] text-zinc-500 leading-relaxed max-w-[20rem]">Launch the official live projection scoreboard.</p>
            </button>

            <button
              onClick={() => setActiveTab('Club Standings')}
              className="group relative flex flex-col items-center text-center p-[var(--gap-fluid)] rounded-[var(--radius-fluid)] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                <TrophyIcon />
              </div>
              <h3 className="text-[1rem] font-bold text-white tracking-wide mb-2 uppercase italic">Live Standings</h3>
              <p className="text-[0.8rem] text-zinc-500 leading-relaxed max-w-[20rem]">View real-time medal counts and ranks.</p>
            </button>

            {!currentUser ? (
              <button
                onClick={() => setActiveTab('Login')}
                className="group relative flex flex-col items-center text-center p-[var(--gap-fluid)] rounded-[var(--radius-fluid)] bg-crimson/[0.03] border border-crimson/20 hover:border-crimson/50 hover:bg-crimson/[0.08] transition-all duration-500 overflow-hidden sm:col-span-2 lg:col-span-1"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-crimson/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-12 h-12 rounded-full bg-crimson/10 flex items-center justify-center mb-6 text-crimson group-hover:scale-110 transition-all duration-500">
                  <UserIcon />
                </div>
                <h3 className="text-[1rem] font-bold text-white tracking-wide mb-2 uppercase italic">Staff Portal</h3>
                <p className="text-[0.8rem] text-zinc-500 leading-relaxed max-w-[20rem]">Login for Coaches, Referees, and Tournament Staff.</p>
              </button>
            ) : (
              <button
                onClick={() => {
                  const fallback = { manager: 'Categories', coach: 'My Participants', scorer: 'Match Console', admin: 'Dashboard' };
                  setActiveTab(fallback[currentUser.role] || 'Dashboard');
                }}
                className="group relative flex flex-col items-center text-center p-[var(--gap-fluid)] rounded-[var(--radius-fluid)] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden sm:col-span-2 lg:col-span-1"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-all duration-500">
                  <UserIcon />
                </div>
                <h3 className="text-[1rem] font-bold text-white tracking-wide mb-2 uppercase italic">My Dashboard</h3>
                <p className="text-[0.8rem] text-zinc-500 leading-relaxed max-w-[20rem]">Return to your specialized management tools.</p>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-[var(--gap-fluid)] text-center z-10 mt-auto flex flex-col gap-2">
        <p className="text-[0.65rem] font-bold tracking-[0.3em] text-zinc-700 uppercase">
          {info.organizer ? `Organized by ${info.organizer}` : 'Official Tournament Management System'}
        </p>
        <p className="text-[0.6rem] font-black text-zinc-800 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} • Powered by Antigravity Spatial Scaling
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
