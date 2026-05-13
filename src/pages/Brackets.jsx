import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/storage';

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function generateBracket(categoryId, participants) {
  const shuffled = fisherYates(participants);
  const size = nextPow2(shuffled.length);
  const padded = [...shuffled];
  while (padded.length < size) padded.push(null); // BYE

  const matches = [];
  const totalRounds = Math.log2(size);

  // Round 1
  for (let i = 0; i < size / 2; i++) {
    const f1 = padded[i * 2];
    const f2 = padded[i * 2 + 1];
    const isBye = !f2;
    matches.push({
      id: generateId(),
      categoryId,
      round: 1,
      slot: i,
      fighter1: f1 ? { id: f1.id, name: f1.name, clubName: f1.clubName, clubId: f1.clubId, beltRank: f1.beltRank } : null,
      fighter2: f2 ? { id: f2.id, name: f2.name, clubName: f2.clubName, clubId: f2.clubId, beltRank: f2.beltRank } : null,
      winner: isBye ? f1?.id : null,
      winnerObj: isBye ? (f1 ? { id: f1.id, name: f1.name, clubName: f1.clubName, clubId: f1.clubId, beltRank: f1.beltRank } : null) : null,
      scores: { f1: 0, f2: 0 },
      status: isBye ? 'done' : 'pending',
      isBye,
    });
  }

  // Placeholder rounds
  for (let r = 2; r <= totalRounds; r++) {
    const slotsInRound = size / Math.pow(2, r);
    for (let i = 0; i < slotsInRound; i++) {
      matches.push({
        id: generateId(),
        categoryId,
        round: r,
        slot: i,
        fighter1: null,
        fighter2: null,
        winner: null,
        winnerObj: null,
        scores: { f1: 0, f2: 0 },
        status: 'pending',
        isBye: false,
      });
    }
  }

  // 3rd place match
  if (totalRounds >= 2) {
    matches.push({
      id: generateId(),
      categoryId,
      round: totalRounds,
      slot: 99, // special slot for 3rd place
      fighter1: null,
      fighter2: null,
      winner: null,
      winnerObj: null,
      scores: { f1: 0, f2: 0 },
      status: 'pending',
      isBye: false,
      isThirdPlace: true,
    });
  }

  // Auto-advance BYEs
  matches.forEach(m => {
    if (m.isBye && m.winnerObj) {
      const nextRoundMatch = matches.find(
        nm => nm.round === 2 && nm.slot === Math.floor(m.slot / 2) && !nm.isThirdPlace
      );
      if (nextRoundMatch) {
        if (m.slot % 2 === 0) nextRoundMatch.fighter1 = m.winnerObj;
        else nextRoundMatch.fighter2 = m.winnerObj;
      }
    }
  });

  return matches;
}

function getRoundLabel(round, totalRounds) {
  if (round === totalRounds) return 'Final';
  if (round === totalRounds - 1) return 'Semifinals';
  if (round === totalRounds - 2) return 'Quarterfinals';
  return `Round ${round}`;
}

export default function Brackets() {
  const { state, dispatch, addToast } = useApp();
  const { categories, participants, matches, currentUser, tournamentInfo } = state;

  const canGenerate = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const lockedCats = categories.filter(c => c.status === 'locked' || c.status === 'completed');

  const [selectedCatId, setSelectedCatId] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const selectedCat = categories.find(c => c.id === selectedCatId);
  const catMatches = matches.filter(m => m.categoryId === selectedCatId && !m.isThirdPlace).sort((a, b) => a.round - b.round || a.slot - b.slot);
  const thirdPlaceMatch = matches.find(m => m.categoryId === selectedCatId && m.isThirdPlace);
  const hasBracket = catMatches.length > 0;

  const totalRounds = hasBracket ? Math.max(...catMatches.map(m => m.round)) : 0;

  const handleGenerate = () => {
    if (!selectedCatId) return;
    const catParts = participants.filter(p => p.categoryId === selectedCatId);
    if (catParts.length < 2) { addToast('Need at least 2 participants to generate a bracket.', 'error'); return; }

    const existing = matches.filter(m => m.categoryId === selectedCatId);
    const newMatches = generateBracket(selectedCatId, catParts);
    const allOtherMatches = matches.filter(m => m.categoryId !== selectedCatId);
    dispatch({ type: 'SET_MATCHES', payload: [...allOtherMatches, ...newMatches] });
    addToast(`Bracket generated for "${selectedCat?.name}".`);
  };

  const handleReset = () => {
    const allOtherMatches = matches.filter(m => m.categoryId !== selectedCatId);
    dispatch({ type: 'SET_MATCHES', payload: allOtherMatches });
    addToast('Bracket reset.');
    setConfirmReset(false);
  };

  const handlePrintAll = () => window.print();
  const handlePrint = () => window.print();

  const rounds = [];
  for (let r = 1; r <= totalRounds; r++) {
    rounds.push({ round: r, matches: catMatches.filter(m => m.round === r) });
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Brackets</h1>
          <p className="text-zinc-500 text-sm mt-1">Single-elimination tournament brackets</p>
        </div>
        <div className="flex items-center gap-2 no-print flex-wrap">
          {hasBracket && (
            <>
              <button onClick={handlePrint} className="btn-secondary text-sm">🖨 Print Bracket</button>
              {canGenerate && (
                <button onClick={() => setConfirmReset(true)} className="btn-danger text-sm">Reset</button>
              )}
            </>
          )}
          {canGenerate && (
            <button onClick={handlePrintAll} className="btn-secondary text-sm">🖨 Print All</button>
          )}
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex gap-3 mb-6 flex-wrap no-print">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <label className="label">Select Category</label>
          <select id="bracket-cat-select" className="select-field" value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)}>
            <option value="">— Choose a category —</option>
            {lockedCats.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            {categories.filter(c => c.status === 'open').map(c => (
              <option key={c.id} value={c.id} disabled>{c.name} (open — lock first)</option>
            ))}
          </select>
        </div>
        {canGenerate && selectedCatId && (
          <div className="flex items-end">
            <button
              id="generate-bracket-btn"
              onClick={handleGenerate}
              disabled={selectedCat?.status === 'open'}
              title={selectedCat?.status === 'open' ? 'Lock the category first' : ''}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⚡ {hasBracket ? 'Regenerate' : 'Generate'} Bracket
            </button>
          </div>
        )}
      </div>

      {/* Print Header (hidden on screen) */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">{tournamentInfo.name}</h1>
        <p className="text-gray-600">{selectedCat?.name} · {tournamentInfo.city} · {tournamentInfo.date}</p>
      </div>

      {/* Bracket Display */}
      {!selectedCatId ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-zinc-400 font-medium">Select a category to view its bracket</p>
        </div>
      ) : !hasBracket ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-zinc-400 font-medium mb-2">No bracket generated yet</p>
          {selectedCat?.status === 'open' && <p className="text-zinc-600 text-sm">Lock the category first, then generate the bracket.</p>}
          {selectedCat?.status === 'locked' && canGenerate && <p className="text-zinc-600 text-sm">Click "Generate Bracket" above to create the draw.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-0 min-w-max print-bracket">
            {rounds.map(({ round, matches: rMatches }) => (
              <div key={round} className="flex flex-col">
                {/* Round header */}
                <div className="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest px-4 py-2 no-print">
                  {getRoundLabel(round, totalRounds)}
                </div>
                <div className="print:block hidden text-center text-xs font-bold text-gray-500 uppercase px-4 py-1">
                  {getRoundLabel(round, totalRounds)}
                </div>
                {/* Matches in this round */}
                <div className="flex flex-col" style={{ gap: `${Math.pow(2, round - 1) * 8}px` }}>
                  {rMatches.map((m, idx) => (
                    <BracketMatch key={m.id} match={m} isFirst={idx === 0} totalRounds={totalRounds} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 3rd Place Match */}
          {thirdPlaceMatch && (
            <div className="mt-8 no-print">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">3rd Place Match</div>
              <BracketMatch match={thirdPlaceMatch} totalRounds={totalRounds} />
            </div>
          )}
        </div>
      )}

      {/* Reset Confirm */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
          <div className="relative card max-w-sm w-full shadow-2xl animate-fade-in text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Reset Bracket?</h3>
            <p className="text-zinc-400 text-sm mb-5">This will delete all match data for this category. This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmReset(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleReset} className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BracketMatch({ match }) {
  const f1Won = match.winner && match.winner === match.fighter1?.id;
  const f2Won = match.winner && match.winner === match.fighter2?.id;

  return (
    <div className="w-52 mx-3 my-1">
      <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900 print:border-gray-300 print:bg-white shadow-sm">
        <Fighter fighter={match.fighter1} won={f1Won} lost={f2Won} score={match.scores?.f1} isBye={match.isBye} role="aka" />
        <div className="border-t border-zinc-700 print:border-gray-300" />
        <Fighter fighter={match.fighter2} won={f2Won} lost={f1Won} score={match.scores?.f2} isBye={match.isBye} isByeSlot={match.isBye} role="ao" />
      </div>
      {match.status === 'done' && !match.isBye && (
        <div className="text-center text-[10px] text-zinc-600 mt-0.5 font-medium tracking-wide">DONE</div>
      )}
    </div>
  );
}

function Fighter({ fighter, won, lost, score, isBye, isByeSlot, role }) {
  const isAka = role === 'aka';
  const colorClass = isAka ? 'bg-crimson' : 'bg-blue-600';

  if (isByeSlot) {
    return (
      <div className="px-3 py-2 flex items-center text-xs text-zinc-600 italic">
        <div className={`w-1.5 h-6 mr-2 rounded-sm ${colorClass} opacity-30`} />
        BYE
      </div>
    );
  }
  if (!fighter) {
    return (
      <div className="px-3 py-2 flex items-center text-xs text-zinc-600 italic">
        <div className={`w-1.5 h-6 mr-2 rounded-sm ${colorClass} opacity-30`} />
        TBD
      </div>
    );
  }
  return (
    <div className={`px-3 py-2 flex items-center gap-2 transition-colors
      ${won ? 'bg-emerald-900/10' : ''}
      ${lost ? 'opacity-40' : ''}
    `}>
      <div className={`w-1.5 h-8 shrink-0 rounded-sm ${colorClass}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium truncate ${won ? 'text-white font-bold' : 'text-zinc-300'}`}>
          {fighter.name}
        </div>
        <div className="text-[10px] text-zinc-500 truncate">{fighter.clubName}</div>
      </div>
      {score !== undefined && !isBye && (
        <span className={`text-sm font-bold shrink-0 ${won ? 'text-emerald-400' : 'text-zinc-500'}`}>{score}</span>
      )}
    </div>
  );
}
