import React from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard({ setActiveTab }) {
  const { state } = useApp();
  const { categories, participants, matches, clubs, users, tournamentInfo } = state;

  const locked = categories.filter(c => c.status === 'locked').length;
  const completed = categories.filter(c => c.status === 'completed').length;
  const pendingMatches = matches.filter(m => m.status === 'pending').length;
  const doneMatches = matches.filter(m => m.status === 'done').length;
  const managers = users.filter(u => u.role === 'manager').length;
  const coaches = users.filter(u => u.role === 'coach').length;
  const scorers = users.filter(u => u.role === 'scorer').length;

  const topClubs = [...clubs].sort((a, b) => b.points - a.points).slice(0, 5);

  const stats = [
    { label: 'Categories', value: categories.length, sub: `${locked} locked · ${completed} completed`, color: 'bg-blue-900/30 border-blue-800/40', icon: '🏷' },
    { label: 'Participants', value: participants.length, sub: `Across ${clubs.length} clubs`, color: 'bg-emerald-900/30 border-emerald-800/40', icon: '👥' },
    { label: 'Matches', value: matches.length, sub: `${doneMatches} done · ${pendingMatches} pending`, color: 'bg-amber-900/30 border-amber-800/40', icon: '⚔️' },
    { label: 'Accounts', value: managers + coaches + scorers, sub: `${managers} mgrs · ${coaches} coaches · ${scorers} scorers`, color: 'bg-crimson/20 border-crimson/30', icon: '👤' },
  ];
  return (
    <div className="animate-fade-in space-y-[var(--spacing-fluid)]">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-[var(--gap-fluid)]">
        <div>
          <h1 className="leading-tight">{tournamentInfo.name || 'Tournament Dashboard'}</h1>
          <p className="text-zinc-500 text-[0.9rem] mt-2 font-medium tracking-wide">
            {tournamentInfo.city && tournamentInfo.date
              ? `${tournamentInfo.city} • ${new Date(tournamentInfo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'Configure tournament details in Settings'}
          </p>
        </div>
        <div className="badge-crimson text-[0.65rem] px-4 py-1.5 rounded-full border bg-crimson/10 font-black tracking-widest uppercase italic">
          Admin Executive Panel
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-[var(--gap-fluid)]">
        {stats.map(s => (
          <div key={s.label} className={`card flex flex-col justify-between min-h-[8rem] ${s.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-[1.5rem] grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{s.icon}</span>
              <div className="text-[0.6rem] font-black text-zinc-400 uppercase tracking-widest">{s.label}</div>
            </div>
            <div>
              <div className="text-[2rem] font-black text-white leading-none mb-1">{s.value}</div>
              <div className="text-[0.65rem] text-zinc-500 font-bold uppercase tracking-[0.05em]">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-[var(--gap-fluid)] items-start">
        {/* Quick Actions */}
        <section className="card">
          <h2 className="text-[1.2rem] font-black text-white uppercase italic tracking-tighter mb-[var(--gap-fluid)] flex items-center gap-2">
            <span className="w-4 h-[2px] bg-crimson" />
            Strategic Operations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Manage Accounts', tab: 'Settings', icon: '👤', desc: 'Administrative user control' },
              { label: 'Categories', tab: 'Categories', icon: '🏷', desc: 'Protocol & division setup' },
              { label: 'Brackets', tab: 'Brackets', icon: '🏆', desc: 'Match tree visualization' },
              { label: 'Match Console', tab: 'Match Console', icon: '⚔️', desc: 'Real-time scoring interface' },
              { label: 'Club Standings', tab: 'Club Standings', icon: '📊', desc: 'Aggregate performance analytics' },
              { label: 'Live Timer', tab: 'Timer', icon: '⏱', desc: 'Projected scoreboard display' },
            ].map(a => (
              <button
                key={a.tab}
                onClick={() => setActiveTab(a.tab)}
                className="text-left p-4 rounded-[var(--radius-fluid)] border border-zinc-800 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-800 transition-all group flex gap-4 items-center"
              >
                <div className="text-[1.5rem] shrink-0 opacity-40 group-hover:opacity-100 transition-all">{a.icon}</div>
                <div>
                  <div className="text-[0.75rem] font-black text-white uppercase tracking-wider">{a.label}</div>
                  <div className="text-[0.6rem] text-zinc-600 font-bold uppercase tracking-tight group-hover:text-zinc-400 transition-colors">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Top Clubs */}
        <section className="card flex flex-col h-full">
          <h2 className="text-[1.2rem] font-black text-white uppercase italic tracking-tighter mb-[var(--gap-fluid)] flex items-center gap-2">
            <span className="w-4 h-[2px] bg-crimson" />
            Club Leaderboard
          </h2>
          {topClubs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 text-[0.8rem] font-bold uppercase tracking-widest py-12">
              <span className="text-[2rem] mb-2 opacity-20">📊</span>
              Awaiting data...
            </div>
          ) : (
            <div className="space-y-3">
              {topClubs.map((club, i) => (
                <div key={club.id} className="flex items-center gap-4 p-3 rounded-[var(--radius-fluid)] bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800 transition-all">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[0.75rem] font-black
                    ${i === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : i === 1 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/20' : i === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/20' : 'bg-zinc-900/50 text-zinc-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-[0.75rem] text-white font-black uppercase tracking-wide leading-none">{club.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-[0.6rem] font-black text-zinc-600">
                      {club.gold > 0 && <span className="text-yellow-500">🥇 {club.gold}</span>}
                      {club.silver > 0 && <span className="text-zinc-400">🥈 {club.silver}</span>}
                      {club.bronze > 0 && <span className="text-amber-600">🥉 {club.bronze}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[1rem] font-black text-white leading-none">{club.points}</div>
                    <div className="text-[0.5rem] font-black text-zinc-600 uppercase tracking-widest">PTS</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
