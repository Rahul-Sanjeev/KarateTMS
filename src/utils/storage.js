// localStorage utility functions

export function saveData(key, value) {
  try {
    localStorage.setItem(`tms_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function loadData(key, fallback = null) {
  try {
    const item = localStorage.getItem(`tms_${key}`);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error('Failed to load data:', e);
    return fallback;
  }
}

export function clearData(key) {
  try {
    localStorage.removeItem(`tms_${key}`);
  } catch (e) {
    console.error('Failed to clear data:', e);
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function exportAllData(state) {
  const data = {
    users: state.users,
    categories: state.categories,
    participants: state.participants,
    matches: state.matches,
    clubs: state.clubs,
    tournamentInfo: state.tournamentInfo,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `karate-tms-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
