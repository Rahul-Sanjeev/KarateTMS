import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

const SCORE_ACTIONS = [
  { label: '+1 YUKO', value: 1, color: 'bg-zinc-700 hover:bg-zinc-600', type: 'score' },
  { label: '+2 WAZA-ARI', value: 2, color: 'bg-blue-900 hover:bg-blue-800', type: 'score' },
  { label: '+3 IPPON', value: 3, color: 'bg-crimson hover:bg-crimson-dark', autoEnd: true, type: 'score' },
  { label: '-1 Point', value: -1, color: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700', type: 'score' },
  { label: '+ C1', value: 1, color: 'bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-300', type: 'c1' },
  { label: '+ C2', value: 1, color: 'bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-300', type: 'c2' },
];

function advanceBracket(matches, finishedMatch, winnerObj, loserObj, dispatch, addToast, state) {
  const allMatches = [...matches];
  const idx = allMatches.findIndex(m => m.id === finishedMatch.id);
  allMatches[idx] = finishedMatch;

  const { round, slot, categoryId, isThirdPlace } = finishedMatch;

  if (!isThirdPlace) {
    // Find next round match
    const nextRound = round + 1;
    const nextSlot = Math.floor(slot / 2);
    const nextMatchIdx = allMatches.findIndex(
      m => m.categoryId === categoryId && m.round === nextRound && m.slot === nextSlot && !m.isThirdPlace
    );

    if (nextMatchIdx >= 0) {
      const nm = { ...allMatches[nextMatchIdx] };
      if (slot % 2 === 0) nm.fighter1 = winnerObj;
      else nm.fighter2 = winnerObj;
      allMatches[nextMatchIdx] = nm;
    }

    // Check if this is a semifinal → put losers in 3rd place
    const maxRound = Math.max(...allMatches.filter(m => m.categoryId === categoryId && !m.isThirdPlace).map(m => m.round));
    if (round === maxRound - 1) {
      const thirdIdx = allMatches.findIndex(m => m.categoryId === categoryId && m.isThirdPlace);
      if (thirdIdx >= 0) {
        const tm = { ...allMatches[thirdIdx] };
        if (slot % 2 === 0) tm.fighter1 = loserObj;
        else tm.fighter2 = loserObj;
        allMatches[thirdIdx] = tm;
      }
    }
  }

  // Points
  const pts = state.tournamentInfo.points;
  const maxRound = Math.max(...allMatches.filter(m => m.categoryId === categoryId && !m.isThirdPlace).map(m => m.round));
  const isFinal = round === maxRound && !isThirdPlace;
  const is3rd = isThirdPlace;

  let winPts = pts.win || 1;
  let winnerMedal = null;
  let loserMedal = null;

  if (isFinal) {
    winPts = pts.first || 5;
    winnerMedal = 'gold';
    loserMedal = 'silver';
  } else if (is3rd) {
    winPts = pts.third || 1;
    winnerMedal = 'bronze';
  }

  // Update clubs
  const clubs = [...state.clubs];
  const updateClub = (clubId, deltaPts, medal) => {
    const ci = clubs.findIndex(c => c.id === clubId);
    if (ci < 0) return;
    clubs[ci] = {
      ...clubs[ci],
      points: (clubs[ci].points || 0) + deltaPts,
      gold: (clubs[ci].gold || 0) + (medal === 'gold' ? 1 : 0),
      silver: (clubs[ci].silver || 0) + (medal === 'silver' ? 1 : 0),
      bronze: (clubs[ci].bronze || 0) + (medal === 'bronze' ? 1 : 0),
    };
  };

  if (winnerObj?.clubId) updateClub(winnerObj.clubId, winPts, winnerMedal);
  if (loserObj?.clubId && isFinal) updateClub(loserObj.clubId, pts.second || 3, loserMedal);

  dispatch({ type: 'SET_MATCHES', payload: allMatches });
  clubs.forEach(c => dispatch({ type: 'UPDATE_CLUB', payload: c }));

  addToast(
    isFinal ? `🥇 ${winnerObj?.name} wins! ${winnerObj?.clubName} +${winPts} pts`
    : is3rd ? `🥉 ${winnerObj?.name} takes Bronze! +${winPts} pt`
    : `✓ ${winnerObj?.name} advances! +${winPts} pt`
  );
}

export default function MatchConsole() {
  const { state, dispatch, addToast } = useApp();
  const { matches, categories, currentUser } = state;

  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [filterCatId, setFilterCatId] = useState('');
  const [history, setHistory] = useState([]);
  const [manualWinnerModal, setManualWinnerModal] = useState(false);
  const timerRef = useRef(null);

  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  const catMatches = matches.filter(m => !filterCatId || m.categoryId === filterCatId).sort((a, b) => {
    const order = { live: 0, pending: 1, done: 2 };
    return (order[a.status] ?? 1) - (order[b.status] ?? 1);
  });

  const handleSelectMatch = (m) => {
    if (m.status === 'done') return;
    setSelectedMatchId(m.id);
    setHistory([]);
  };

  const handleScore = (fighter, action) => {
    if (!selectedMatch || selectedMatch.status === 'done') return;
    const fKey = fighter === 1 ? 'f1' : 'f2';
    
    let newMatchObj = { ...selectedMatch, status: 'live' };
    let actualValue = action.value;
    
    if (action.type === 'score') {
      const currentScore = selectedMatch.scores?.[fKey] || 0;
      
      const newScore = Math.max(0, currentScore + action.value);
      newMatchObj.scores = { ...selectedMatch.scores, [fKey]: newScore };
    } else if (action.type === 'c1') {
      const c1Key = `c1_${fKey}`;
      const newC1 = (selectedMatch.penalties?.[c1Key] || 0) + 1;
      newMatchObj.penalties = { ...selectedMatch.penalties, [c1Key]: newC1 };
      actualValue = '+1 C1';
    } else if (action.type === 'c2') {
      const c2Key = `c2_${fKey}`;
      const newC2 = (selectedMatch.penalties?.[c2Key] || 0) + 1;
      newMatchObj.penalties = { ...selectedMatch.penalties, [c2Key]: newC2 };
      actualValue = '+1 C2';
    }

    const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fighterName = fighter === 1 ? selectedMatch.fighter1?.name : selectedMatch.fighter2?.name;
    const historyEntry = { timestamp, action: action.label, fighter: fighterName, value: actualValue, type: action.type, fKey };

    setHistory(h => [historyEntry, ...h]);

    if (action.autoEnd) {
      // Ippon — auto-end
      const winnerObj = fighter === 1 ? selectedMatch.fighter1 : selectedMatch.fighter2;
      const loserObj = fighter === 1 ? selectedMatch.fighter2 : selectedMatch.fighter1;
      const finished = { ...newMatchObj, winner: winnerObj?.id, winnerObj, status: 'done' };
      advanceBracket(matches, finished, winnerObj, loserObj, dispatch, addToast, state);
      setSelectedMatchId(null);
    } else {
      dispatch({ type: 'UPDATE_MATCH', payload: newMatchObj });
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || !selectedMatch) return;
    const last = history[0];
    let newMatchObj = { ...selectedMatch };
    
    if (last.type === 'score') {
      const newScore = Math.max(0, (selectedMatch.scores?.[last.fKey] || 0) - last.value);
      newMatchObj.scores = { ...selectedMatch.scores, [last.fKey]: newScore };
    } else if (last.type === 'c1') {
      const c1Key = `c1_${last.fKey}`;
      const newC1 = Math.max(0, (selectedMatch.penalties?.[c1Key] || 0) - 1);
      newMatchObj.penalties = { ...selectedMatch.penalties, [c1Key]: newC1 };
    } else if (last.type === 'c2') {
      const c2Key = `c2_${last.fKey}`;
      const newC2 = Math.max(0, (selectedMatch.penalties?.[c2Key] || 0) - 1);
      newMatchObj.penalties = { ...selectedMatch.penalties, [c2Key]: newC2 };
    }
    
    dispatch({ type: 'UPDATE_MATCH', payload: newMatchObj });
    setHistory(h => h.slice(1));
  };

  const handleEndMatch = () => {
    if (!selectedMatch) return;
    const s = selectedMatch.scores || { f1: 0, f2: 0 };
    if (s.f1 !== s.f2) {
      const winner = s.f1 > s.f2 ? 1 : 2;
      const winnerObj = winner === 1 ? selectedMatch.fighter1 : selectedMatch.fighter2;
      const loserObj = winner === 1 ? selectedMatch.fighter2 : selectedMatch.fighter1;
      const finished = { ...selectedMatch, winner: winnerObj?.id, winnerObj, status: 'done' };
      advanceBracket(matches, finished, winnerObj, loserObj, dispatch, addToast, state);
      setSelectedMatchId(null);
    } else {
      setManualWinnerModal(true);
    }
  };

  const handleManualWinner = (fighter) => {
    const winnerObj = fighter === 1 ? selectedMatch.fighter1 : selectedMatch.fighter2;
    const loserObj = fighter === 1 ? selectedMatch.fighter2 : selectedMatch.fighter1;
    const finished = { ...selectedMatch, winner: winnerObj?.id, winnerObj, status: 'done' };
    advanceBracket(matches, finished, winnerObj, loserObj, dispatch, addToast, state);
    setManualWinnerModal(false);
    setSelectedMatchId(null);
  };

  const handleToggleSenshu = (fighterNum) => {
    if (!selectedMatch || selectedMatch.status === 'done') return;
    const fKey = `f${fighterNum}`;
    const newSenshu = selectedMatch.senshu === fKey ? null : fKey;
    dispatch({ type: 'UPDATE_MATCH', payload: { ...selectedMatch, senshu: newSenshu } });
  };

  const getRoundLabel = (m) => {
    const catMatches2 = matches.filter(x => x.categoryId === m.categoryId && !x.isThirdPlace);
    const maxRound = catMatches2.length > 0 ? Math.max(...catMatches2.map(x => x.round)) : 1;
    if (m.isThirdPlace) return '3rd Place';
    if (m.round === maxRound) return 'Final';
    if (m.round === maxRound - 1) return 'Semifinal';
    if (m.round === maxRound - 2) return 'Quarterfinal';
    return `Round ${m.round}`;
  };

  const groupedByCategory = catMatches.reduce((acc, m) => {
    const cat = categories.find(c => c.id === m.categoryId);
    const key = cat?.name || 'Unknown';
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Match Console</h1>
        <p className="text-zinc-500 text-sm mt-1">Select a match to begin scoring</p>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-72 shrink-0">
          <div className="mb-3">
            <select id="match-cat-filter" className="select-field text-sm" value={filterCatId} onChange={e => setFilterCatId(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
            {Object.entries(groupedByCategory).map(([catName, ms]) => (
              <div key={catName}>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">{catName}</div>
                <div className="space-y-1">
                  {ms.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMatch(m)}
                      disabled={m.status === 'done'}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all
                        ${selectedMatchId === m.id ? 'bg-crimson/20 border-crimson/50 text-white' : ''}
                        ${m.status === 'done' ? 'opacity-40 cursor-default border-zinc-800 bg-zinc-900' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-800'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-zinc-400">{getRoundLabel(m)}</span>
                        <StatusDot status={m.status} />
                      </div>
                      <div className="text-white font-medium truncate">{m.fighter1?.name || 'TBD'}</div>
                      <div className="text-zinc-500 text-[10px]">vs</div>
                      <div className="text-white font-medium truncate">{m.fighter2?.name || 'TBD'}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {catMatches.length === 0 && (
              <p className="text-zinc-600 text-xs text-center py-4">No matches available</p>
            )}
          </div>
        </div>

        {/* Scoring Console */}
        <div className="flex-1 min-w-0">
          {!selectedMatch ? (
            <div className="card text-center py-20">
              <div className="text-5xl mb-4">⚔️</div>
              <p className="text-zinc-400 font-medium">Select a match from the sidebar</p>
              <p className="text-zinc-600 text-sm mt-1">Click any pending match to start scoring</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Match header */}
              <div className="card flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">{categories.find(c => c.id === selectedMatch.categoryId)?.name}</div>
                  <div className="text-lg font-bold text-white">{getRoundLabel(selectedMatch)}</div>
                </div>
                <div className="flex gap-2">
                  {history.length > 0 && (
                    <button onClick={handleUndo} className="btn-secondary text-sm">↩ Undo Last</button>
                  )}
                  <button id="end-match-btn" onClick={handleEndMatch} className="btn-primary">End Match</button>
                </div>
              </div>

              {/* Fighters */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(f => {
                  const isAka = f === 1;
                  const fighter = isAka ? selectedMatch.fighter1 : selectedMatch.fighter2;
                  const score = isAka ? selectedMatch.scores?.f1 : selectedMatch.scores?.f2;
                  const c1 = selectedMatch.penalties?.[`c1_f${f}`] || 0;
                  const c2 = selectedMatch.penalties?.[`c2_f${f}`] || 0;
                  const hasSenshu = selectedMatch.senshu === `f${f}`;
                  const sideColor = isAka ? 'text-crimson' : 'text-blue-500';
                  const sideBg = isAka ? 'bg-crimson' : 'bg-blue-600';
                  const borderColor = isAka ? 'border-t-crimson' : 'border-t-blue-600';

                  return (
                    <div key={f} className={`card flex flex-col items-center gap-4 border-t-4 ${borderColor}`}>
                      {/* Fighter info */}
                      <div className="text-center relative w-full">
                        <button
                          onClick={() => handleToggleSenshu(f)}
                          className={`absolute top-0 right-2 w-7 h-7 rounded-full border-2 font-bold text-[8px] flex items-center justify-center transition-all shadow-lg
                            ${hasSenshu ? 'bg-yellow-400 border-yellow-200 text-black shadow-yellow-500/50' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'}`}
                          title="Toggle Senshu"
                        >
                          SEN
                        </button>
                        <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${sideColor}`}>
                          {isAka ? 'Aka (Red)' : 'Ao (Blue)'}
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-2 ${sideBg}`}>
                          {fighter?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'}
                        </div>
                        <div className="font-bold text-white">{fighter?.name || 'TBD'}</div>
                        <div className="text-xs text-zinc-500">{fighter?.clubName}</div>
                      </div>

                      {/* Score */}
                      <div className="text-6xl font-black text-white">{score ?? 0}</div>
                      
                      <div className="flex gap-4 mb-2">
                        <div className="text-xs font-bold text-amber-500">C1: {c1}</div>
                        <div className="text-xs font-bold text-amber-500">C2: {c2}</div>
                      </div>

                      {/* Buttons */}
                      <div className="w-full grid grid-cols-1 gap-2">
                        {SCORE_ACTIONS.map(action => (
                          <button
                            key={action.label}
                            onClick={() => handleScore(f, action)}
                            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${action.color} ${!action.color.includes('text-') ? 'text-white' : ''}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Score History */}
              {history.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-3">Score History</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                    {history.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="font-mono text-zinc-600">{h.timestamp}</span>
                        <span className={`font-semibold ${h.value > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{h.action}</span>
                        <span className="text-zinc-300">→ {h.fighter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Winner Modal */}
      {manualWinnerModal && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative card max-w-sm w-full shadow-2xl animate-fade-in text-center">
            <h3 className="text-lg font-bold text-white mb-2">Scores are tied!</h3>
            <p className="text-zinc-400 text-sm mb-5">Select the winner manually:</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleManualWinner(1)}
                className="w-full py-3 bg-crimson hover:bg-crimson-dark border border-red-800 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xs uppercase tracking-wider opacity-80">Aka</span>
                <span>{selectedMatch.fighter1?.name || 'TBD'}</span>
              </button>
              <button
                onClick={() => handleManualWinner(2)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 border border-blue-800 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xs uppercase tracking-wider opacity-80">Ao</span>
                <span>{selectedMatch.fighter2?.name || 'TBD'}</span>
              </button>
              <button onClick={() => setManualWinnerModal(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  if (status === 'live') return <span className="badge-crimson pulse-crimson">Live</span>;
  if (status === 'done') return <span className="badge-gray">Done</span>;
  return <span className="text-[10px] text-zinc-500">Pending</span>;
}
