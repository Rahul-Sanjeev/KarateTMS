import React from 'react';
import { useApp } from '../context/AppContext';

const ROLE_COLORS = {
  admin: 'bg-crimson/20 text-crimson border-crimson/30',
  manager: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  coach: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
  scorer: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
};

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  coach: 'Coach',
  scorer: 'Scorer',
};

// Which tabs each role can see
const ROLE_TABS = {
  admin: ['Dashboard', 'Categories', 'Brackets', 'Match Console', 'Club Standings', 'Settings', 'Timer'],
  manager: ['Categories', 'Brackets', 'Club Standings', 'Timer'],
  coach: ['My Participants', 'Brackets', 'Club Standings', 'Timer'],
  scorer: ['Match Console', 'Brackets', 'Club Standings', 'Timer'],
  public: ['Timer'],
};

export default function Navbar({ activeTab, setActiveTab }) {
  const { state, dispatch } = useApp();
  const { currentUser } = state;

  const role = currentUser?.role ?? 'public';
  const tabs = ROLE_TABS[role] ?? ROLE_TABS.public;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    setActiveTab('Timer');
  };

  return (
    <nav className="no-print sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button onClick={() => setActiveTab('Home')} className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity relative z-10 bg-black/80 pr-2 md:pr-0">
            <KarateLogo />
            <div className="hidden sm:block">
              <span className="font-bold text-white text-sm tracking-tight">KarateTMS</span>
            </div>
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-thin px-2 relative z-0 flex-1 justify-start ml-2 md:ml-6 mask-fade-edges">
            {/* Always show Timer even if not logged in */}
            {!tabs.includes('Timer') && (
              <NavTab label="Timer" active={activeTab === 'Timer'} onClick={() => setActiveTab('Timer')} isPublic />
            )}
            {tabs.map(tab => (
              <NavTab
                key={tab}
                label={tab}
                active={activeTab === tab}
                onClick={() => {
                  if (tab !== 'Timer' && !currentUser) {
                    setActiveTab('Login');
                  } else {
                    setActiveTab(tab);
                  }
                }}
              />
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{currentUser.name || currentUser.username}</span>
                  <span className={`badge border text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('Login')}
                className="text-xs font-semibold bg-crimson hover:bg-crimson-dark text-white px-3 py-1.5 rounded-lg transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavTab({ label, active, onClick, isPublic }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap
        ${active
          ? 'text-white bg-zinc-800'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
        }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-crimson rounded-full" />
      )}
      {isPublic && (
        <span className="ml-1 text-[9px] text-crimson font-bold">●</span>
      )}
    </button>
  );
}

// Inline SVG karate silhouette logo
function KarateLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="6" r="4" fill="#C41E3A" />
      <rect x="16" y="12" width="8" height="12" rx="2" fill="#C41E3A" />
      <path d="M16 18 L6 22 M24 18 L34 14" stroke="#C41E3A" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 24 L14 36 M22 24 L26 36" stroke="#C41E3A" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 30 L20 28 L26 32" stroke="#C41E3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
