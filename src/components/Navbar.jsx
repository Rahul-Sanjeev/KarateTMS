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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const role = currentUser?.role ?? 'public';
  const tabs = ROLE_TABS[role] ?? ROLE_TABS.public;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    setActiveTab('Timer');
    setIsMenuOpen(false);
  };

  const handleTabClick = (tab) => {
    if (tab !== 'Timer' && !currentUser) {
      setActiveTab('Login');
    } else {
      setActiveTab(tab);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="no-print sticky top-0 z-[100] bg-black/95 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="content-container">
        <div className="flex items-center justify-between gap-[var(--gap-fluid)] py-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-[var(--gap-fluid)]">
            <button 
              onClick={() => { setActiveTab('Home'); setIsMenuOpen(false); }} 
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-300"
            >
              <div className="bg-zinc-900 p-2 rounded-[var(--radius-fluid)] border border-zinc-800">
                <KarateLogo size="1.75rem" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="font-black text-white text-[1.1rem] tracking-tighter uppercase italic">Karate<span className="text-crimson">TMS</span></span>
                <span className="hidden xs:block text-[0.6rem] text-zinc-500 font-bold tracking-[0.2em] uppercase">Tournament Mgr</span>
              </div>
            </button>
            
            <div className="h-8 w-px bg-zinc-800/50 hidden lg:block" />

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-1">
              {activeTab !== 'Timer' ? (
                <>
                  {!tabs.includes('Timer') && (
                    <NavTab label="Timer" active={activeTab === 'Timer'} onClick={() => handleTabClick('Timer')} isPublic />
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
                <div className="flex items-center gap-4 text-[0.65rem] font-black uppercase tracking-[0.15em]">
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

          {/* Right Section */}
          <div className="flex items-center gap-3 md:gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/50">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-[0.75rem] font-bold text-white leading-none mb-1">{currentUser.name || currentUser.username}</span>
                  <span className={`text-[0.6rem] px-2 py-0.5 rounded font-black tracking-widest uppercase border ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-[var(--radius-fluid)] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-crimson transition-all shadow-inner"
                  title="Sign Out"
                >
                  <svg width="1.2rem" height="1.2rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('Login')}
                className="bg-white text-black hover:bg-zinc-200 text-[0.65rem] font-black uppercase tracking-widest px-6 py-3 rounded-[var(--radius-fluid)] transition-all shadow-xl active:scale-95 whitespace-nowrap"
              >
                Access
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? (
                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-black/98 backdrop-blur-2xl border-b border-zinc-800 animate-fade-in shadow-2xl">
          <div className="px-6 py-8 flex flex-col gap-3">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Navigation</p>
            {activeTab !== 'Timer' ? (
              <>
                {!tabs.includes('Timer') && (
                  <NavTabMobile label="Timer" active={activeTab === 'Timer'} onClick={() => handleTabClick('Timer')} isPublic />
                )}
                {tabs.map(tab => (
                  <NavTabMobile
                    key={tab}
                    label={tab}
                    active={activeTab === tab}
                    onClick={() => handleTabClick(tab)}
                  />
                ))}
              </>
            ) : (
              <button 
                onClick={() => { setActiveTab('Home'); setIsMenuOpen(false); }}
                className="flex items-center justify-between px-6 py-4 rounded-[var(--radius-fluid)] bg-crimson text-white font-bold uppercase text-[0.7rem] tracking-widest shadow-lg shadow-crimson/20"
              >
                Exit Timer Mode
                <svg width="1.2rem" height="1.2rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
              </button>
            )}

            {currentUser && (
              <div className="mt-6 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[0.8rem] font-bold text-white">{currentUser.name || currentUser.username}</span>
                  <span className="text-[0.6rem] text-zinc-500 font-bold uppercase tracking-widest">{ROLE_LABELS[role]}</span>
                </div>
                <button onClick={handleLogout} className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-crimson">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavTab({ label, active, onClick, isPublic }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-wider rounded-[var(--radius-fluid)] transition-all duration-300 whitespace-nowrap cursor-pointer z-20
        ${active
          ? 'text-white bg-zinc-900 border border-zinc-800 shadow-xl'
          : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
        }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-[1.25rem] left-1/2 -translate-x-1/2 w-[2rem] h-[3px] bg-crimson rounded-full shadow-[0_0_20px_rgba(196,30,58,0.6)]" />
      )}
      {isPublic && (
        <span className="ml-2 text-[0.6rem] text-crimson animate-pulse">●</span>
      )}
    </button>
  );
}

function NavTabMobile({ label, active, onClick, isPublic }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-6 py-4 rounded-[var(--radius-fluid)] font-bold uppercase text-[0.75rem] tracking-[0.15em] transition-all
        ${active 
          ? 'bg-zinc-900 text-white border border-zinc-800 shadow-lg' 
          : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
    >
      <span className="flex items-center gap-2">
        {label}
        {isPublic && <span className="text-crimson animate-pulse">●</span>}
      </span>
      {active && <div className="w-2 h-2 bg-crimson rounded-full" />}
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
