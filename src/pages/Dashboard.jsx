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
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{tournamentInfo.name || 'Tournament Dashboard'}</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {tournamentInfo.city && tournamentInfo.date
                ? `${tournamentInfo.city} · ${new Date(tournamentInfo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                : 'Configure tournament details in Settings'}
            </p>
          </div>
          <span className="badge-crimson text-xs px-3 py-1 rounded-full border bg-crimson/20 text-crimson border-crimson/30">Admin Panel</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`card border ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-xs font-semibold text-zinc-300 mb-1">{s.label}</div>
            <div className="text-xs text-zinc-500">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Accounts', tab: 'Settings', icon: '👤', desc: 'Add managers, coaches, scorers' },
              { label: 'Categories', tab: 'Categories', icon: '🏷', desc: 'Create & lock categories' },
              { label: 'Brackets', tab: 'Brackets', icon: '🏆', desc: 'Generate & view brackets' },
              { label: 'Match Console', tab: 'Match Console', icon: '⚔️', desc: 'Score live matches' },
              { label: 'Club Standings', tab: 'Club Standings', icon: '📊', desc: 'View rankings' },
              { label: 'Timer', tab: 'Timer', icon: '⏱', desc: 'Open public timer' },
            ].map(a => (
              <button
                key={a.tab}
                onClick={() => setActiveTab(a.tab)}
                className="text-left p-3 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800/50 hover:bg-zinc-800 transition-all group"
              >
                <div className="text-xl mb-1">{a.icon}</div>
                <div className="text-sm font-semibold text-white">{a.label}</div>
                <div className="text-xs text-zinc-500 group-hover:text-zinc-400">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Clubs */}
        <div className="card">
          <h2 className="section-title mb-4">Club Standings</h2>
          {topClubs.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-8">No club data yet</div>
          ) : (
            <div className="space-y-2">
              {topClubs.map((club, i) => (
                <div key={club.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-zinc-400/20 text-zinc-300' : i === 2 ? 'bg-amber-700/20 text-amber-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-white font-medium">{club.name}</span>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    {club.gold > 0 && <span className="text-yellow-400">🥇{club.gold}</span>}
                    {club.silver > 0 && <span className="text-zinc-300">🥈{club.silver}</span>}
                    {club.bronze > 0 && <span className="text-amber-500">🥉{club.bronze}</span>}
                  </div>
                  <span className="text-sm font-bold text-white">{club.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
