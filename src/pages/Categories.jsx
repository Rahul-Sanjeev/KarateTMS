import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/storage';

const BELT_RANKS = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'];
const BELT_COLORS = {
  White: 'bg-zinc-100 text-zinc-900',
  Yellow: 'bg-yellow-400 text-yellow-900',
  Orange: 'bg-orange-500 text-white',
  Green: 'bg-green-600 text-white',
  Blue: 'bg-blue-600 text-white',
  Brown: 'bg-amber-800 text-white',
  Black: 'bg-zinc-900 text-white border border-zinc-600',
};

export default function Categories({ setActiveTab }) {
  const { state, dispatch, addToast } = useApp();
  const { categories, participants, currentUser, clubs } = state;

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const [selectedCat, setSelectedCat] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [lockConfirm, setLockConfirm] = useState(null);
  const [unlockConfirm, setUnlockConfirm] = useState(null);

  const [form, setForm] = useState({
    name: '', gender: 'Men', ageGroup: 'Senior', weightClass: '', beltLevel: '',
  });
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) { setErr('Category name is required.'); return; }

    if (editCat) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...editCat, ...form } });
      addToast('Category updated.');
      setEditCat(null);
    } else {
      const newCat = {
        id: generateId(), ...form,
        status: 'open', createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_CATEGORY', payload: newCat });
      addToast('Category created.');
    }
    setForm({ name: '', gender: 'Men', ageGroup: 'Senior', weightClass: '', beltLevel: '' });
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, gender: cat.gender, ageGroup: cat.ageGroup, weightClass: cat.weightClass, beltLevel: cat.beltLevel || '' });
    setShowForm(true);
  };

  const handleDelete = (cat) => {
    const count = participants.filter(p => p.categoryId === cat.id).length;
    if (count > 0) { addToast('Cannot delete category with participants.', 'error'); return; }
    dispatch({ type: 'DELETE_CATEGORY', payload: cat.id });
    addToast('Category deleted.');
  };

  const handleLock = (cat) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...cat, status: 'locked' } });
    addToast(`"${cat.name}" locked. Bracket can now be generated.`);
    setLockConfirm(null);
  };

  const handleUnlock = (cat) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...cat, status: 'open' } });
    addToast(`"${cat.name}" unlocked. Registration is open again.`);
    setUnlockConfirm(null);
  };

  const catParticipants = selectedCat ? participants.filter(p => p.categoryId === selectedCat.id) : [];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-zinc-500 text-sm mt-1">{categories.length} categories defined</p>
        </div>
        {canEdit && !showForm && (
          <button id="add-category-btn" onClick={() => { setShowForm(true); setEditCat(null); setForm({ name: '', gender: 'Men', ageGroup: 'Senior', weightClass: '', beltLevel: '' }); }} className="btn-primary">
            + New Category
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && canEdit && (
        <div className="card mb-6 border-crimson/20 animate-fade-in">
          <h2 className="section-title mb-4">{editCat ? 'Edit Category' : 'Create Category'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label">Category Name</label>
              <input id="cat-name" required className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Men Kumite -75kg" />
            </div>
            <div>
              <label className="label">Gender</label>
              <div className="flex gap-2">
                {['Men', 'Women'].map(g => (
                  <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gender: g }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.gender === g ? (g === 'Men' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-rose-600 border-rose-500 text-white') : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Age Group</label>
              <select id="cat-age" className="select-field" value={form.ageGroup} onChange={e => setForm(p => ({ ...p, ageGroup: e.target.value }))}>
                <option>Junior</option><option>Senior</option><option>Veteran</option>
              </select>
            </div>
            <div>
              <label className="label">Weight Class</label>
              <input id="cat-weight" className="input-field" value={form.weightClass} onChange={e => setForm(p => ({ ...p, weightClass: e.target.value }))} placeholder="-60kg, +80kg, Open…" />
            </div>
            <div>
              <label className="label">Belt Level (optional)</label>
              <select id="cat-belt" className="select-field" value={form.beltLevel} onChange={e => setForm(p => ({ ...p, beltLevel: e.target.value }))}>
                <option value="">All Belts</option>
                {BELT_RANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            {err && <p className="text-red-400 text-xs sm:col-span-2 lg:col-span-3">{err}</p>}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <button type="submit" id="cat-submit" className="btn-primary">{editCat ? 'Save Changes' : 'Create Category'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditCat(null); }} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-6">
        {/* Category Grid */}
        <div className="flex-1 min-w-0">
          {categories.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-3">🏷</div>
              <p className="text-zinc-400 font-medium">No categories yet</p>
              <p className="text-zinc-600 text-sm mt-1">Click "New Category" to get started</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.map(cat => {
                const count = participants.filter(p => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCat(selectedCat?.id === cat.id ? null : cat)}
                    className={`card-hover cursor-pointer transition-all ${selectedCat?.id === cat.id ? 'border-crimson/50 bg-zinc-800' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                          {cat.status === 'locked' && <span title="Locked">🔒</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`badge ${cat.gender === 'Men' ? 'badge-blue' : 'badge-rose'}`}>{cat.gender}</span>
                          <span className="badge-gray">{cat.ageGroup}</span>
                          {cat.weightClass && <span className="badge-gray">{cat.weightClass}</span>}
                          {cat.beltLevel && <span className="badge-gray">{cat.beltLevel}</span>}
                        </div>
                      </div>
                      <StatusBadge status={cat.status} />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                      <span className="text-xs text-zinc-500">{count} participant{count !== 1 ? 's' : ''}</span>
                      {canEdit && (
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          {cat.status === 'open' && (
                            <>
                              <button onClick={() => handleEdit(cat)} className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500">Edit</button>
                              <button onClick={() => setLockConfirm(cat)} className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded border border-amber-800/50 hover:border-amber-600">Lock</button>
                            </>
                          )}
                          {cat.status === 'locked' && (
                            <button onClick={() => setUnlockConfirm(cat)} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-800/50 hover:border-blue-600">Unlock</button>
                          )}
                          {count === 0 && (
                            <button onClick={() => handleDelete(cat)} className="btn-danger py-1 px-2 text-xs">Del</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel */}
        {selectedCat && (
          <div className="w-72 shrink-0 animate-slide-in-right">
            <div className="card sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white text-sm">{selectedCat.name}</h2>
                <button onClick={() => setSelectedCat(null)} className="text-zinc-600 hover:text-white text-lg">✕</button>
              </div>

              {catParticipants.length === 0 ? (
                <p className="text-zinc-600 text-xs">No participants yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(
                    catParticipants.reduce((acc, p) => {
                      const key = p.clubName || 'Unknown Club';
                      (acc[key] = acc[key] || []).push(p);
                      return acc;
                    }, {})
                  ).map(([club, members]) => (
                    <div key={club}>
                      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{club}</div>
                      <div className="space-y-1">
                        {members.map(p => (
                          <div key={p.id} className="flex items-center gap-2 text-xs">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${BELT_COLORS[p.beltRank] || 'bg-zinc-700 text-zinc-300'}`}>{p.beltRank?.[0] || '?'}</span>
                            <span className="text-zinc-300">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lock Confirmation Modal */}
      {lockConfirm && (
        <Modal onClose={() => setLockConfirm(null)}>
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-lg font-bold text-white mb-2">Lock Category?</h3>
            <p className="text-zinc-400 text-sm mb-5">
              Locking <strong className="text-white">"{lockConfirm.name}"</strong> will close registration. Coaches cannot add or edit participants after this. The bracket can then be generated.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setLockConfirm(null)} className="btn-ghost">Cancel</button>
              <button id="confirm-lock" onClick={() => handleLock(lockConfirm)} className="btn-primary">Lock Category</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Unlock Confirmation Modal */}
      {unlockConfirm && (
        <Modal onClose={() => setUnlockConfirm(null)}>
          <div className="text-center">
            <div className="text-4xl mb-3">🔓</div>
            <h3 className="text-lg font-bold text-white mb-2">Unlock Category?</h3>
            <p className="text-zinc-400 text-sm mb-5">
              Unlocking <strong className="text-white">"{unlockConfirm.name}"</strong> will re-open registration. Coaches will be able to add or edit participants again. <br/><br/>Note: If a bracket was already generated, you may need to regenerate it after making participant changes.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setUnlockConfirm(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => handleUnlock(unlockConfirm)} className="btn-primary bg-blue-600 hover:bg-blue-500 border-blue-500 text-white">Unlock Category</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'open') return <span className="badge-green">Open</span>;
  if (status === 'locked') return <span className="badge-amber">Locked</span>;
  return <span className="badge-gray">Completed</span>;
}

export function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card max-w-md w-full shadow-2xl animate-fade-in">
        {children}
      </div>
    </div>
  );
}
