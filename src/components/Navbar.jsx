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
    <nav className="no-print sticky top-0 z-[100] bg-black/95 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center h-16 justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('Home')} 
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-200"
            >
              <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                <KarateLogo />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="font-black text-white text-base tracking-tighter uppercase italic">Karate<span className="text-crimson">TMS</span></span>
                <span className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Tournament Mgr</span>
              </div>
            </button>
            
            <div className="h-8 w-px bg-zinc-800/50 hidden md:block" />

            {/* Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-1">
              {activeTab !== 'Timer' ? (
                <>
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
                </>
              ) : (
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.15em]">
                  <span className="text-crimson animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-crimson rounded-full" />
                    Live Timer
                  </span>
                  <button 
                    onClick={() => setActiveTab('Home')} 
                    className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800"
                  >
                    Exit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: User Section (Professional Trailer) */}
          <div className="flex items-center gap-4">
            {/* Mobile Nav Toggle / Tab Indicator for mobile could go here, but keeping it simple */}
            <div className="lg:hidden">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{activeTab}</span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/50">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-xs font-bold text-white leading-none mb-1">{currentUser.name || currentUser.username}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase border ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-crimson hover:border-crimson/50 transition-all shadow-inner"
                  title="Sign Out"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('Login')}
                className="bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-xl active:scale-95"
              >
                Access Portal
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
      className={`relative px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer z-20
        ${active
          ? 'text-white bg-zinc-900 border border-zinc-800 shadow-lg'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
        }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-8 h-1 bg-crimson rounded-full shadow-[0_0_15px_rgba(196,30,58,0.8)]" />
      )}
      {isPublic && (
        <span className="ml-2 text-[10px] text-crimson animate-pulse">●</span>
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
