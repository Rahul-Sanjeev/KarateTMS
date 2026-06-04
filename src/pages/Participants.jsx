import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/storage';
import CategorySelector from '../components/CategorySelector';

const BELT_RANKS = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'];
const BELT_COLORS = {
  White: 'bg-zinc-100 text-zinc-900 border border-zinc-300',
  Yellow: 'bg-yellow-400 text-yellow-900',
  Orange: 'bg-orange-500 text-white',
  Green: 'bg-green-600 text-white',
  Blue: 'bg-blue-600 text-white',
  Brown: 'bg-amber-800 text-white',
  Black: 'bg-zinc-900 text-white border border-zinc-500',
};

export default function Participants() {
  const { state, dispatch, addToast } = useApp();
  const { categories, participants, currentUser, clubs } = state;

  const isAdmin = currentUser?.role === 'admin';
  const isCoach = currentUser?.role === 'coach';

  // Admin sees all clubs; coach sees own club only
  const [clubFilter, setClubFilter] = useState('all');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formErr, setFormErr] = useState('');

  const [form, setForm] = useState({ name: '', dob: '', beltRank: 'White', weight: '', categoryId: '' });

  const openCats = categories.filter(c => c.status === 'open');
  const selectedCat = categories.find(c => c.id === selectedCatId);
  const isLocked = selectedCat?.status === 'locked';

  // Filter participants
  const visibleParticipants = participants.filter(p => {
    if (selectedCatId && p.categoryId !== selectedCatId) return false;
    if (isCoach && p.clubId !== currentUser.clubId) return false;
    if (isAdmin && clubFilter !== 'all' && p.clubId !== clubFilter) return false;
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.categoryId) { setFormErr('Select a category.'); return; }
    if (!form.name.trim()) { setFormErr('Name is required.'); return; }

    const targetCat = categories.find(c => c.id === form.categoryId);

    // Duplicate check within same category
    const dupCheck = editP
      ? participants.find(p => p.categoryId === form.categoryId && p.name.toLowerCase() === form.name.toLowerCase() && p.id !== editP.id)
      : participants.find(p => p.categoryId === form.categoryId && p.name.toLowerCase() === form.name.toLowerCase());

    if (dupCheck) { setFormErr('A participant with this name already exists in this category.'); return; }

    if (editP) {
      dispatch({
        type: 'UPDATE_PARTICIPANT',
        payload: {
          ...editP,
          name: form.name,
          dob: form.dob,
          beltRank: form.beltRank,
          weight: form.weight,
          categoryId: form.categoryId,
          gender: targetCat?.gender || editP.gender,
        },
      });
      addToast('Participant updated.');
      setEditP(null);
    } else {
      const clubId = isAdmin ? (clubFilter !== 'all' ? clubFilter : clubs[0]?.id) : currentUser.clubId;
      const clubName = isAdmin ? (clubs.find(c => c.id === clubId)?.name || '') : currentUser.clubName;
      dispatch({
        type: 'ADD_PARTICIPANT',
        payload: {
          id: generateId(),
          categoryId: form.categoryId,
          gender: targetCat?.gender || 'Men',
          clubId,
          clubName,
          name: form.name,
          dob: form.dob,
          beltRank: form.beltRank,
          weight: form.weight,
        },
      });
      addToast('Participant added.');
    }
    setForm({ name: '', dob: '', beltRank: 'White', weight: '', categoryId: '' });
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setEditP(p);
    setForm({
      name: p.name,
      dob: p.dob,
      beltRank: p.beltRank,
      weight: p.weight || '',
      categoryId: p.categoryId,
    });
    setShowForm(true);
  };

  const handleDelete = (p) => {
    dispatch({ type: 'DELETE_PARTICIPANT', payload: p.id });
    addToast('Participant removed.');
    setDeleteConfirm(null);
  };

  const totalOwn = isCoach ? participants.filter(p => p.clubId === currentUser.clubId).length : participants.length;

  const eligibleCats = isAdmin ? categories : categories.filter(c => c.status === 'open');
  const showAddBtn = (isAdmin || isCoach) && eligibleCats.length > 0;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div>
          {isCoach ? (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Welcome, {currentUser.name}
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                <span className="badge-green mr-2">{currentUser.clubName}</span>
                {totalOwn} participant{totalOwn !== 1 ? 's' : ''} registered
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-white">All Participants</h1>
              <p className="text-zinc-500 text-sm mt-1">{participants.length} total across all clubs</p>
            </>
          )}
        </div>
        {showAddBtn && !showForm && (
          <button
            id="add-participant-btn"
            onClick={() => {
              const defaultCatId = selectedCatId && eligibleCats.some(c => c.id === selectedCatId)
                ? selectedCatId
                : (eligibleCats[0]?.id || '');
              setShowForm(true);
              setEditP(null);
              setForm({ name: '', dob: '', beltRank: 'White', weight: '', categoryId: defaultCatId });
            }}
            className="btn-primary w-full sm:w-auto"
          >
            + Add Participant
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="w-full sm:flex-1 sm:min-w-[240px] sm:max-w-md">
          <label className="label">Category Filter</label>
          <CategorySelector
            categories={categories}
            selectedId={selectedCatId}
            onChange={id => { setSelectedCatId(id); setShowForm(false); setEditP(null); }}
            allowAll={true}
            placeholder="Search categories..."
          />
        </div>
        {isAdmin && (
          <div className="w-full sm:flex-1 sm:min-w-[160px] sm:max-w-xs">
            <label className="label">Club</label>
            <select id="club-filter" className="select-field w-full text-sm h-[42px]" value={clubFilter} onChange={e => setClubFilter(e.target.value)}>
              <option value="all">All Clubs</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Locked notice */}
      {isLocked && !isAdmin && (
        <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-800/40 text-amber-400 text-sm rounded-lg px-4 py-3 mb-5">
          🔒 Registration for this category is closed.
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-6 border-crimson/20 animate-fade-in">
          <h2 className="section-title mb-4">{editP ? 'Edit Participant' : 'Add Participant'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input id="p-name" required className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. John Doe" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Category</label>
              <CategorySelector
                categories={categories}
                selectedId={form.categoryId}
                onChange={id => setForm(p => ({ ...p, categoryId: id }))}
                onlyOpen={!isAdmin}
                placeholder="Search categories to assign..."
              />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input id="p-dob" type="date" className="input-field" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
            </div>
            <div>
              <label className="label">Belt Rank</label>
              <select id="p-belt" className="select-field" value={form.beltRank} onChange={e => setForm(p => ({ ...p, beltRank: e.target.value }))}>
                {BELT_RANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Weight (kg, optional)</label>
              <input id="p-weight" type="number" step="0.1" className="input-field" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 74.5" />
            </div>
            {isAdmin && clubs.length > 0 && (
              <div>
                <label className="label">Assign to Club</label>
                <select className="select-field" value={clubFilter === 'all' ? clubs[0]?.id : clubFilter} onChange={e => setClubFilter(e.target.value)}>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {formErr && <p className="text-red-400 text-xs sm:col-span-2 lg:col-span-4">{formErr}</p>}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4 mt-2">
              <button type="submit" id="p-submit" className="btn-primary">{editP ? 'Save Changes' : 'Add Participant'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditP(null); }} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Participant List */}
      {visibleParticipants.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-zinc-400 font-medium">No participants{selectedCatId ? ' in this category' : ''}</p>
          {!selectedCatId && <p className="text-zinc-600 text-sm mt-1">Select a category above to filter</p>}
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Athlete</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Club</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">DOB</th>
                <th className="text-left px-4 py-3">Belt</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Weight</th>
                {(isAdmin || isCoach) && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {visibleParticipants.map(p => {
                const cat = categories.find(c => c.id === p.categoryId);
                const isCatLocked = cat?.status === 'locked';
                const pCanEdit = isAdmin || (!isCatLocked && isCoach);

                return (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {p.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-zinc-400 text-xs">{p.clubName}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {cat ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white font-medium text-xs">{cat.name}</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] px-1 rounded font-bold ${
                              cat.gender === 'Men' ? 'bg-blue-950/80 text-blue-400' : 'bg-rose-950/80 text-rose-400'
                            }`}>
                              {cat.gender}
                            </span>
                            <span className="text-[9px] text-zinc-500">
                              {cat.ageGroup} {cat.weightClass ? `• ${cat.weightClass}` : ''}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-zinc-500 text-xs">{p.dob || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${BELT_COLORS[p.beltRank] || 'bg-zinc-700 text-zinc-300'}`}>
                        {p.beltRank}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-zinc-500 text-xs">{p.weight ? `${p.weight} kg` : '—'}</td>
                    {pCanEdit ? (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => handleEdit(p)} className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 transition-colors">Edit</button>
                          <button onClick={() => setDeleteConfirm(p)} className="btn-danger py-1 px-2 text-xs">Del</button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-zinc-500 font-semibold flex items-center justify-end gap-1">
                          🔒 Registration Closed
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative card max-w-sm w-full shadow-2xl animate-fade-in text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Remove Participant?</h3>
            <p className="text-zinc-400 text-sm mb-5">
              Remove <strong className="text-white">{deleteConfirm.name}</strong> from the tournament?
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
