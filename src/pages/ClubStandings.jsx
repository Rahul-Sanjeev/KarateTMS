import React from 'react';
import { useApp } from '../context/AppContext';

export default function ClubStandings() {
  const { state } = useApp();
  const { clubs, participants, tournamentInfo } = state;

  const sorted = [...clubs].sort((a, b) => b.points - a.points || b.gold - a.gold || b.silver - a.silver);

  const getClubParticipantCount = (clubId) =>
    participants.filter(p => p.clubId === clubId).length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Club Standings</h1>
          <p className="text-zinc-500 text-sm mt-1">{tournamentInfo.name} — Live Rankings</p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary no-print text-sm">🖨 Print Standings</button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">{tournamentInfo.name}</h1>
        <p className="text-gray-600">Club Standings · {tournamentInfo.city} · {tournamentInfo.date}</p>
      </div>

      {sorted.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-zinc-400 font-medium">No clubs registered yet</p>
          <p className="text-zinc-600 text-sm mt-1">Create coach accounts to register clubs</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {sorted.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
              {[1, 0, 2].map(idx => {
                const club = sorted[idx];
                if (!club) return <div key={idx} />;
                const place = idx + 1;
                const medals = ['🥇', '🥈', '🥉'];
                const heights = ['h-28', 'h-36', 'h-24'];
                const colors = [
                  'bg-zinc-800 border-zinc-600',
                  'bg-yellow-900/20 border-yellow-700/40',
                  'bg-zinc-800 border-zinc-700',
                ];
                // Reorder: 2nd, 1st, 3rd
                const displayOrder = [1, 0, 2];
                const displayPlace = displayOrder[idx] + 1;
                const c = sorted[displayOrder[idx]];
                if (!c) return <div key={idx} />;
                return (
                  <div key={idx} className={`flex flex-col items-center justify-end ${heights[idx]} rounded-xl border ${colors[idx]} p-3 transition-all`}>
                    <div className="text-2xl mb-1">{medals[displayOrder[idx]]}</div>
                    <div className="text-xs font-bold text-white text-center leading-tight">{c.name}</div>
                    <div className="text-sm font-black text-white mt-1">{c.points} pts</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 w-10">#</th>
                  <th className="text-left px-4 py-3">Club</th>
                  <th className="text-center px-3 py-3">🥇</th>
                  <th className="text-center px-3 py-3">🥈</th>
                  <th className="text-center px-3 py-3">🥉</th>
                  <th className="text-center px-3 py-3 hidden sm:table-cell">Athletes</th>
                  <th className="text-right px-4 py-3 font-bold text-white">Points</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((club, i) => (
                  <tr key={club.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${i === 0 ? 'bg-yellow-900/5' : ''}`}>
                    <td className="px-4 py-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-zinc-400/20 text-zinc-300' : i === 2 ? 'bg-amber-700/20 text-amber-500' : 'text-zinc-600'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                          {club.name[0]}
                        </div>
                        <span className="font-medium text-white">{club.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-yellow-400">{club.gold || 0}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-zinc-300">{club.silver || 0}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-amber-600">{club.bronze || 0}</td>
                    <td className="px-3 py-3 text-center text-zinc-500 text-xs hidden sm:table-cell">{getClubParticipantCount(club.id)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-black text-white">{club.points || 0}</span>
                      <span className="text-xs text-zinc-600 ml-1">pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
