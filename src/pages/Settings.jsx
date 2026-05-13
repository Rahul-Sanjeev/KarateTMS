import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { generateId, exportAllData } from '../utils/storage';

const TABS = ['Managers', 'Coaches', 'Scorers', 'Tournament', 'Danger Zone'];

export default function Settings() {
  const { state, dispatch, addToast } = useApp();
  const [tab, setTab] = useState('Managers');

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Account management and tournament configuration</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-crimson text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Managers' && <ManagersTab />}
      {tab === 'Coaches' && <CoachesTab />}
      {tab === 'Scorers' && <ScorersTab />}
      {tab === 'Tournament' && <TournamentTab />}
      {tab === 'Danger Zone' && <DangerTab />}
    </div>
  );
}

// ─── Managers ────────────────────────────────────────────────────
function ManagersTab() {
  const { state, dispatch, addToast } = useApp();
  const managers = state.users.filter(u => u.role === 'manager');
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [resetId, setResetId] = useState(null);
  const [newPw, setNewPw] = useState('');
  const [err, setErr] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    setErr('');
    if (state.users.find(u => u.username === form.username)) {
      setErr('Username already taken.'); return;
    }
    dispatch({ type: 'ADD_USER', payload: { id: generateId(), role: 'manager', ...form } });
    addToast('Manager created.');
    setForm({ name: '', username: '', password: '' });
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_USER', payload: id });
    addToast('Manager deleted.');
  };

  const handleReset = (id) => {
    dispatch({ type: 'UPDATE_USER', payload: { id, password: newPw } });
    addToast('Password updated.');
    setResetId(null); setNewPw('');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* List */}
      <div className="card">
        <h2 className="section-title mb-4">Managers ({managers.length})</h2>
        {managers.length === 0
          ? <p className="text-zinc-600 text-sm">No managers yet.</p>
          : <div className="space-y-2">
              {managers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <Avatar name={u.name} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{u.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">@{u.username}</div>
                  </div>
                  {resetId === u.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        className="input-field py-1 px-2 text-xs w-28"
                        placeholder="New password"
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                      />
                      <button onClick={() => handleReset(u.id)} className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={() => setResetId(null)} className="text-xs text-zinc-500 hover:text-white px-1">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setResetId(u.id)} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2 py-1 rounded transition-colors">Reset PW</button>
                      <button onClick={() => handleDelete(u.id)} className="btn-danger py-1 px-2 text-xs">Del</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
        }
      </div>

      {/* Add Form */}
      <div className="card">
        <h2 className="section-title mb-4">Add Manager</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div><label className="label">Full Name</label><input id="mgr-name" required className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Username</label><input id="mgr-uname" required className="input-field font-mono" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></div>
          <div><label className="label">Password</label><input id="mgr-pw" required type="password" className="input-field" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" className="btn-primary mt-1">Add Manager</button>
        </form>
      </div>
    </div>
  );
}

// ─── Coaches ──────────────────────────────────────────────────────
function CoachesTab() {
  const { state, dispatch, addToast } = useApp();
  const coaches = state.users.filter(u => u.role === 'coach');
  const [form, setForm] = useState({ name: '', username: '', password: '', clubName: '' });
  const [err, setErr] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    setErr('');
    if (state.users.find(u => u.username === form.username)) {
      setErr('Username already taken.'); return;
    }
    // Find or create club
    let club = state.clubs.find(c => c.name.toLowerCase() === form.clubName.toLowerCase());
    if (!club) {
      club = { id: generateId(), name: form.clubName, points: 0, gold: 0, silver: 0, bronze: 0 };
      dispatch({ type: 'ADD_CLUB', payload: club });
    }
    dispatch({
      type: 'ADD_USER',
      payload: { id: generateId(), role: 'coach', name: form.name, username: form.username, password: form.password, clubId: club.id, clubName: club.name },
    });
    addToast('Coach created.');
    setForm({ name: '', username: '', password: '', clubName: '' });
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_USER', payload: id });
    addToast('Coach deleted. Club and participants are preserved.');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="section-title mb-4">Coaches ({coaches.length})</h2>
        {coaches.length === 0
          ? <p className="text-zinc-600 text-sm">No coaches yet.</p>
          : <div className="space-y-2">
              {coaches.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <Avatar name={u.name} color="bg-emerald-900" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{u.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">@{u.username}</div>
                    <span className="badge-green text-xs mt-0.5">{u.clubName}</span>
                  </div>
                  <button onClick={() => handleDelete(u.id)} className="btn-danger py-1 px-2 text-xs">Del</button>
                </div>
              ))}
            </div>
        }
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Add Coach</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div><label className="label">Full Name</label><input id="coach-name" required className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Username</label><input id="coach-uname" required className="input-field font-mono" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></div>
          <div><label className="label">Password</label><input id="coach-pw" required type="password" className="input-field" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
          <div>
            <label className="label">Club Name</label>
            <input id="coach-club" required className="input-field" value={form.clubName} onChange={e => setForm(p => ({ ...p, clubName: e.target.value }))} list="clubs-datalist" />
            <datalist id="clubs-datalist">{state.clubs.map(c => <option key={c.id} value={c.name} />)}</datalist>
            <p className="text-xs text-zinc-600 mt-1">Auto-creates club if it doesn't exist.</p>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" className="btn-primary mt-1">Add Coach</button>
        </form>
      </div>
    </div>
  );
}

// ─── Scorers ──────────────────────────────────────────────────────
function ScorersTab() {
  const { state, dispatch, addToast } = useApp();
  const scorers = state.users.filter(u => u.role === 'scorer');
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [resetId, setResetId] = useState(null);
  const [newPw, setNewPw] = useState('');
  const [err, setErr] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    setErr('');
    if (state.users.find(u => u.username === form.username)) {
      setErr('Username already taken.'); return;
    }
    dispatch({ type: 'ADD_USER', payload: { id: generateId(), role: 'scorer', ...form } });
    addToast('Scorer created.');
    setForm({ name: '', username: '', password: '' });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="section-title mb-4">Scorers ({scorers.length})</h2>
        {scorers.length === 0
          ? <p className="text-zinc-600 text-sm">No scorers yet.</p>
          : <div className="space-y-2">
              {scorers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <Avatar name={u.name} color="bg-amber-900" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{u.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">@{u.username}</div>
                  </div>
                  {resetId === u.id ? (
                    <div className="flex items-center gap-1">
                      <input className="input-field py-1 px-2 text-xs w-28" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} />
                      <button onClick={() => { dispatch({ type: 'UPDATE_USER', payload: { id: u.id, password: newPw } }); addToast('Password updated.'); setResetId(null); setNewPw(''); }} className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={() => setResetId(null)} className="text-xs text-zinc-500 hover:text-white px-1">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setResetId(u.id)} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2 py-1 rounded">Reset PW</button>
                      <button onClick={() => { dispatch({ type: 'DELETE_USER', payload: u.id }); addToast('Scorer deleted.'); }} className="btn-danger py-1 px-2 text-xs">Del</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
        }
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Add Scorer</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div><label className="label">Full Name</label><input id="scr-name" required className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Username</label><input id="scr-uname" required className="input-field font-mono" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></div>
          <div><label className="label">Password</label><input id="scr-pw" required type="password" className="input-field" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" className="btn-primary mt-1">Add Scorer</button>
        </form>
      </div>
    </div>
  );
}

// ─── Tournament Settings ──────────────────────────────────────────
function TournamentTab() {
  const { state, dispatch, addToast } = useApp();
  const info = state.tournamentInfo;

  const fmtSec = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const parseDur = (str) => {
    const parts = String(str).split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  };

  const [form, setForm] = useState({
    name: info.name || '',
    city: info.city || '',
    date: info.date || '',
    organizer: info.organizer || '',
    durations: { ...info.durations },
    points: { ...info.points },
  });

  const [durStr, setDurStr] = useState({
    senior: fmtSec(info.durations?.senior ?? 180),
    junior: fmtSec(info.durations?.junior ?? 120),
    veteran: fmtSec(info.durations?.veteran ?? 120),
  });

  const handleSave = (e) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_TOURNAMENT_INFO', payload: form });
    addToast('Tournament settings saved.');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={handleSave} className="card flex flex-col gap-4">
        <h2 className="section-title">Tournament Info</h2>
        <div><label className="label">Tournament Name</label><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div><label className="label">Host City</label><input className="input-field" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
        <div><label className="label">Date</label><input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
        <div><label className="label">Organizer Name</label><input className="input-field" value={form.organizer} onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))} /></div>

        <div className="divider" />
        <h3 className="text-sm font-semibold text-zinc-300">Match Durations</h3>
        {['senior', 'junior', 'veteran'].map(k => (
          <div key={k} className="flex items-center gap-3">
            <label className="label mb-0 w-20 capitalize">{k}</label>
            <input
              className="input-field w-24"
              value={durStr[k]}
              placeholder="3:00"
              onChange={e => setDurStr(p => ({ ...p, [k]: e.target.value }))}
              onBlur={e => {
                const secs = parseDur(e.target.value);
                setForm(p => ({ ...p, durations: { ...p.durations, [k]: secs } }));
                setDurStr(p => ({ ...p, [k]: fmtSec(secs) }));
              }}
            />
            <span className="text-xs text-zinc-600">min:sec</span>
          </div>
        ))}

        <div className="divider" />
        <h3 className="text-sm font-semibold text-zinc-300">Points per Placement</h3>
        <div className="grid grid-cols-2 gap-3">
          {[['first', '1st Place'], ['second', '2nd Place'], ['third', '3rd Place'], ['win', 'Per Win']].map(([k, lbl]) => (
            <div key={k}>
              <label className="label">{lbl}</label>
              <input type="number" min="0" className="input-field" value={form.points[k]} onChange={e => setForm(p => ({ ...p, points: { ...p.points, [k]: Number(e.target.value) } }))} />
            </div>
          ))}
        </div>

        <button type="submit" id="save-tournament" className="btn-primary mt-2">Save Settings</button>
      </form>

      <div className="card flex flex-col gap-4">
        <h2 className="section-title">Data Management</h2>
        <p className="text-sm text-zinc-500">Export a full backup of all tournament data, or import a previously exported file.</p>
        <button
          id="export-data"
          onClick={() => { exportAllData(state); addToast('Data exported.'); }}
          className="btn-secondary justify-center"
        >
          ↓ Export All Data (JSON)
        </button>
        <label className="btn-secondary justify-center cursor-pointer">
          ↑ Import from JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                try {
                  const data = JSON.parse(ev.target.result);
                  dispatch({ type: 'IMPORT_DATA', payload: data });
                  addToast('Data imported successfully.');
                } catch {
                  addToast('Invalid JSON file.', 'error');
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}

// ─── Danger Zone ──────────────────────────────────────────────────
function DangerTab() {
  const { dispatch, addToast } = useApp();
  const [confirmText, setConfirmText] = useState('');

  const handleReset = () => {
    if (confirmText !== 'RESET') return;
    dispatch({ type: 'RESET_MATCH_DATA' });
    addToast('All match data has been reset.', 'warning');
    setConfirmText('');
  };

  return (
    <div className="max-w-lg">
      <div className="card border-red-900/50">
        <h2 className="text-lg font-bold text-red-400 mb-2">⚠ Danger Zone</h2>
        <p className="text-sm text-zinc-400 mb-4">
          This will clear all <strong className="text-white">match results, scores, and club points</strong>. Categories, participants, and accounts are preserved. This action cannot be undone.
        </p>
        <label className="label">Type <span className="font-mono text-red-400">RESET</span> to confirm</label>
        <input
          id="reset-confirm"
          className="input-field mb-3 font-mono"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="RESET"
        />
        <button
          id="reset-match-data"
          onClick={handleReset}
          disabled={confirmText !== 'RESET'}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all bg-red-900/40 text-red-400 border border-red-800/50 hover:bg-red-900/60 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Reset All Match Data
        </button>
      </div>
    </div>
  );
}

// Shared Avatar
function Avatar({ name, color = 'bg-zinc-700' }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${color}`}>
      {initials}
    </div>
  );
}
