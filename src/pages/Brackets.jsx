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
  return (
    <div className="animate-fade-in flex flex-col gap-[var(--spacing-fluid)] min-h-0">
      {/* Lead the Mat Header */}
      <header className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
         <div className="flex items-center gap-4">
           <div className="h-[2px] w-12 bg-crimson" />
           <h1 className="text-[2.5rem] font-black uppercase italic tracking-tighter text-white">Lead the Mat</h1>
           <div className="h-[2px] w-12 bg-crimson" />
         </div>
         <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[0.7rem]">Official Tournament Visualization Protocol</p>
      </header>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4 no-print">
        <div className="flex gap-4 items-end flex-wrap flex-1">
          <div className="min-w-[250px] max-w-sm">
            <label className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 block">Division Selection</label>
            <select 
              id="bracket-cat-select" 
              className="w-full bg-[#121212] border-2 border-zinc-800 text-white rounded-xl px-4 py-3 text-[0.8rem] font-bold focus:outline-none focus:border-crimson transition-all appearance-none" 
              value={selectedCatId} 
              onChange={e => setSelectedCatId(e.target.value)}
            >
              <option value="">— Select Category —</option>
              {lockedCats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          {canGenerate && selectedCatId && (
            <button
              id="generate-bracket-btn"
              onClick={handleGenerate}
              disabled={selectedCat?.status === 'open'}
              className="bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded-xl font-black uppercase text-[0.7rem] tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-20"
            >
              {hasBracket ? 'Update Bracket' : 'Generate Draw'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasBracket && (
            <button onClick={handlePrint} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-6 py-3 rounded-xl border-2 border-zinc-800 text-[0.7rem] font-black uppercase tracking-widest transition-all">
              Print
            </button>
          )}
          {canGenerate && hasBracket && (
            <button onClick={() => setConfirmReset(true)} className="text-red-500/50 hover:text-red-500 text-[0.6rem] font-black uppercase tracking-widest px-4 py-2 transition-all">Reset</button>
          )}
        </div>
      </div>

      {/* Bracket Interface */}
      {!selectedCatId ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-30">
          <div className="text-[4rem] mb-4">🥋</div>
          <p className="text-[0.8rem] font-black uppercase tracking-[0.3em] text-zinc-600">Protocol Awaiting Selection</p>
        </div>
      ) : !hasBracket ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 border-4 border-dashed border-zinc-900 rounded-[3rem]">
          <div className="text-[4rem] mb-4">📋</div>
          <p className="text-[0.8rem] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">No Active Bracket Found</p>
          {selectedCat?.status === 'open' && <p className="text-zinc-700 text-[0.6rem] font-bold uppercase tracking-widest">Division must be locked before generating draw.</p>}
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-12 scrollbar-none">
          <div className="flex gap-[4vw] min-w-max p-8">
            {rounds.map(({ round, matches: rMatches }) => (
              <div key={round} className="flex flex-col gap-8">
                <div className="text-center">
                   <span className="text-zinc-700 font-black text-[0.6rem] uppercase tracking-[0.5em] mb-4 block">
                      {getRoundLabel(round, totalRounds)}
                   </span>
                </div>
                <div className="flex flex-col justify-around h-full" style={{ gap: `${Math.pow(2, round - 1) * 2}rem` }}>
                  {rMatches.map((m) => (
                    <BracketMatch key={m.id} match={m} round={round} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {thirdPlaceMatch && (
            <div className="mt-16 pt-16 border-t border-zinc-900 flex flex-col items-center">
              <span className="text-zinc-700 font-black text-[0.6rem] uppercase tracking-[0.5em] mb-6">Medal Protocol: Bronze Match</span>
              <BracketMatch match={thirdPlaceMatch} round={1} />
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#121212] border-4 border-zinc-800 p-10 rounded-[3rem] text-center shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <h3 className="text-[1.5rem] font-black text-white uppercase italic tracking-tighter mb-4">Purge Bracket Draw?</h3>
            <p className="text-zinc-500 text-[0.8rem] font-medium leading-relaxed mb-8">This will irreversibly delete all match scoring and participation assignments for this division.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleReset} className="bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-[0.7rem] tracking-[0.2em] transition-all">Confirm Purge</button>
              <button onClick={() => setConfirmReset(false)} className="text-zinc-600 hover:text-white py-2 font-bold uppercase text-[0.6rem] tracking-widest transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BracketMatch({ match, round }) {
  const f1Won = match.winner && match.winner === match.fighter1?.id;
  const f2Won = match.winner && match.winner === match.fighter2?.id;

  return (
    <div className="relative group">
      <div className="w-[18rem] bg-[#121212] border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all group-hover:border-zinc-600">
        <Fighter fighter={match.fighter1} won={f1Won} lost={f2Won} score={match.scores?.f1} isBye={match.isBye} role="aka" />
        <div className="h-px bg-zinc-800" />
        <Fighter fighter={match.fighter2} won={f2Won} lost={f1Won} score={match.scores?.f2} isBye={match.isBye} isByeSlot={match.isBye} role="ao" />
      </div>
      
      {/* SVG Style Connection Lines */}
      {match.round < 4 && (
         <div className="absolute top-1/2 -right-[4vw] w-[4vw] h-[2px] bg-zinc-800 z-0 hidden lg:block" />
      )}
    </div>
  );
}

function Fighter({ fighter, won, lost, score, isBye, isByeSlot, role }) {
  const isAka = role === 'aka';
  const colorClass = isAka ? 'bg-[#C41E3A]' : 'bg-[#0047AB]';

  if (isByeSlot) return (
    <div className="px-6 py-4 flex items-center gap-4 opacity-20">
      <div className={`w-1 h-6 rounded-full ${colorClass}`} />
      <span className="text-[0.7rem] font-black uppercase tracking-[0.3em]">BYE</span>
    </div>
  );
  
  if (!fighter) return (
    <div className="px-6 py-4 flex items-center gap-4 opacity-10">
      <div className={`w-1 h-6 rounded-full ${colorClass}`} />
      <span className="text-[0.7rem] font-black uppercase tracking-[0.3em]">TBD Protocol</span>
    </div>
  );

  return (
    <div className={`px-6 py-4 flex items-center gap-4 transition-all
      ${won ? 'bg-emerald-500/5' : ''}
      ${lost ? 'opacity-30' : ''}
    `}>
      <div className={`w-2 h-10 rounded-full ${colorClass} shadow-lg`} />
      <div className="flex-1 min-w-0">
        <div className={`text-[0.85rem] font-black uppercase tracking-tight truncate transition-all ${won ? 'text-white' : 'text-zinc-400'}`}>
          {fighter.name}
        </div>
        <div className="text-[0.5rem] font-black text-zinc-600 uppercase tracking-widest truncate">{fighter.clubName}</div>
      </div>
      {score !== undefined && !isBye && (
        <div className={`text-[1.2rem] font-black tabular-nums ${won ? 'text-emerald-500' : 'text-zinc-700'}`}>
          {score}
        </div>
      )}
    </div>
  );
}
