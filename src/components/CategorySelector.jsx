import React, { useState, useEffect, useRef } from 'react';

export default function CategorySelector({
  categories,
  selectedId,
  onChange,
  placeholder = 'Search categories...',
  allowAll = false,
  onlyOpen = false,
  isOptionDisabled = null, // function: (cat) => boolean
  error = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCat = categories.find(c => c.id === selectedId);

  // Filter categories based on search input
  const filteredCats = categories.filter(c => {
    if (onlyOpen && c.status !== 'open') return false;
    
    const searchLower = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(searchLower) ||
      c.gender.toLowerCase().includes(searchLower) ||
      c.ageGroup.toLowerCase().includes(searchLower) ||
      (c.weightClass && c.weightClass.toLowerCase().includes(searchLower)) ||
      (c.beltLevel && c.beltLevel.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-zinc-900 border text-left rounded-lg px-3 py-2.5 text-sm transition-all flex items-center justify-between hover:border-zinc-500 ${
          error ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-700'
        }`}
      >
        <div className="flex-1 min-w-0">
          {selectedCat ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {selectedCat.name}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                selectedCat.gender === 'Men' ? 'bg-blue-900/40 text-blue-400 border border-blue-800/30' : 'bg-rose-900/40 text-rose-400 border border-rose-800/30'
              }`}>
                {selectedCat.gender}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium shrink-0">
                {selectedCat.ageGroup}
              </span>
              {selectedCat.weightClass && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium shrink-0">
                  {selectedCat.weightClass}
                </span>
              )}
              {selectedCat.beltLevel && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium shrink-0">
                  {selectedCat.beltLevel}
                </span>
              )}
              {selectedCat.status === 'locked' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-400 border border-amber-800/30 font-semibold shrink-0">
                  🔒 Locked
                </span>
              )}
            </div>
          ) : (
            <span className="text-zinc-500">{allowAll ? 'All Categories' : 'Select a Category'}</span>
          )}
        </div>
        <span className="text-zinc-500 shrink-0 ml-2 text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden max-h-72 flex flex-col animate-fade-in">
          <div className="p-2 border-b border-zinc-900 bg-zinc-900/30">
            <input
              type="text"
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-crimson"
              placeholder={placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-900/40">
            {allowAll && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left px-3 py-2.5 text-xs hover:bg-zinc-900 transition-colors font-medium ${
                  !selectedId ? 'text-crimson bg-crimson/5' : 'text-zinc-400'
                }`}
              >
                All Categories
              </button>
            )}
            {filteredCats.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">No categories found</div>
            ) : (
              filteredCats.map(c => {
                const disabled = isOptionDisabled ? isOptionDisabled(c) : false;
                const isSelected = selectedId === c.id;

                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(c.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3 py-2.5 transition-colors flex flex-col gap-1.5 ${
                      disabled
                        ? 'opacity-40 cursor-not-allowed bg-zinc-950'
                        : isSelected
                        ? 'bg-crimson/10 text-white border-l-2 border-crimson'
                        : 'text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-white">{c.name}</span>
                      {c.status === 'locked' ? (
                        <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5 shrink-0 bg-amber-950/40 border border-amber-900/30 px-1 py-0.5 rounded">
                          🔒 Locked
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded">
                          Open
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[8px] px-1 rounded font-extrabold ${
                        c.gender === 'Men' ? 'bg-blue-950/80 text-blue-400' : 'bg-rose-950/80 text-rose-400'
                      }`}>
                        {c.gender.toUpperCase()}
                      </span>
                      <span className="text-[8px] px-1 rounded bg-zinc-800 text-zinc-400">
                        {c.ageGroup}
                      </span>
                      {c.weightClass && (
                        <span className="text-[8px] px-1 rounded bg-zinc-800 text-zinc-400">
                          {c.weightClass}
                        </span>
                      )}
                      {c.beltLevel && (
                        <span className="text-[8px] px-1 rounded bg-zinc-800 text-zinc-400">
                          {c.beltLevel}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
