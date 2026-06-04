import React, { useState, useEffect, useRef } from 'react';
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

const TAB_ICONS = {
  Dashboard: '📊',
  Categories: '🏷️',
  Brackets: '🏆',
  'Match Console': '⚔️',
  'Club Standings': '🥇',
  Settings: '⚙️',
  Timer: '⏱️',
  'My Participants': '👥',
  Home: '🏠',
};

export default function Navbar({ activeTab, setActiveTab }) {
  const { state, dispatch } = useApp();
  const { currentUser } = state;
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef(null);

  const role = currentUser?.role ?? 'public';
  const tabs = ROLE_TABS[role] ?? ROLE_TABS.public;

  // Close drawer on tab change
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [mobileOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    setActiveTab('Timer');
    setMobileOpen(false);
  };

  const handleTabClick = (tab) => {
    if (tab !== 'Timer' && !currentUser) {
      setActiveTab('Login');
    } else {
      setActiveTab(tab);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="no-print sticky top-0 z-[100] bg-black/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 justify-between">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Hamburger - mobile only */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all active:scale-95"
                aria-label="Toggle menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {mobileOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>

              <button 
                onClick={() => setActiveTab('Home')} 
                className="flex items-center gap-3 hover:opacity-80 transition-all duration-200"
              >
                <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                  <KarateLogo />
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="font-black text-white text-base tracking-tighter uppercase italic">Karate<span className="text-crimson">TMS</span></span>
                  <span className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase">The Digital Dojo</span>
                </div>
              </button>
              
              <div className="h-8 w-px bg-zinc-800/50 hidden md:block" />

              {/* Navigation Tabs - Desktop */}
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
                        onClick={() => handleTabClick(tab)}
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

            {/* Right: User Section */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-zinc-800/50">
                  <div className="hidden sm:flex flex-col items-end mr-1">
                    <span className="text-xs font-bold text-white leading-none mb-1">{currentUser.name || currentUser.username}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase border ${ROLE_COLORS[role]}`}>
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                  {/* Mobile: small role badge */}
                  <span className={`sm:hidden text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase border ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
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
                  className="bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-xl active:scale-95"
                >
                  Access Portal
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] no-print">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          />
          
          {/* Drawer */}
          <div
            ref={drawerRef}
            className="absolute top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-zinc-950 border-r border-zinc-800 shadow-2xl flex flex-col"
            style={{ animation: 'slideInLeft 0.25s ease-out' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                  <KarateLogo />
                </div>
                <span className="font-black text-white text-sm tracking-tighter uppercase italic">
                  Karate<span className="text-crimson">TMS</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* User Info (if logged in) */}
            {currentUser && (
              <div className="px-5 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
                <p className="text-sm font-bold text-white mb-1">{currentUser.name || currentUser.username}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-widest uppercase border ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                  {currentUser.clubName && (
                    <span className="text-[10px] text-zinc-500 font-semibold">{currentUser.clubName}</span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              {/* Home */}
              <MobileNavItem
                label="Home"
                icon={TAB_ICONS.Home}
                active={activeTab === 'Home'}
                onClick={() => handleTabClick('Home')}
              />

              {/* Role tabs */}
              {tabs.map(tab => (
                <MobileNavItem
                  key={tab}
                  label={tab}
                  icon={TAB_ICONS[tab]}
                  active={activeTab === tab}
                  onClick={() => handleTabClick(tab)}
                />
              ))}

              {/* Timer always available if not in tabs */}
              {!tabs.includes('Timer') && (
                <MobileNavItem
                  label="Timer"
                  icon={TAB_ICONS.Timer}
                  active={activeTab === 'Timer'}
                  onClick={() => handleTabClick('Timer')}
                  isPublic
                />
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-4 border-t border-zinc-800/50">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-crimson hover:border-crimson/40 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { setActiveTab('Login'); setMobileOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
                >
                  Access Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations for drawer */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

function MobileNavItem({ label, icon, active, onClick, isPublic }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 text-left
        ${active
          ? 'bg-zinc-800 text-white border border-zinc-700 shadow-lg'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70'
        }`}
    >
      <span className="text-base w-6 text-center shrink-0">{icon}</span>
      <span className="text-sm font-bold uppercase tracking-wider flex-1">{label}</span>
      {active && (
        <span className="w-2 h-2 rounded-full bg-crimson shadow-[0_0_8px_rgba(196,30,58,0.8)]" />
      )}
      {isPublic && !active && (
        <span className="text-[10px] text-crimson animate-pulse">●</span>
      )}
    </button>
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
