import { supabase, isSupabaseConfigured } from './supabase';

// ─── Key Mapping (camelCase ↔ snake_case) ────────────────────────

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toDb(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [camelToSnake(key), value])
  );
}

function fromDb(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [snakeToCamel(key), value])
  );
}

// ─── Generic Helpers ─────────────────────────────────────────────

async function fetchAll(table) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data.map(fromDb);
}

async function upsertRow(table, row) {
  const { error } = await supabase.from(table).upsert(toDb(row));
  if (error) throw error;
}

async function upsertMany(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows.map(toDb));
  if (error) throw error;
}

async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

// ─── Fetch Everything (initial load) ─────────────────────────────

export async function fetchAllData() {
  if (!isSupabaseConfigured()) return null;

  try {
    const [users, categories, participants, matches, clubs, tournamentInfoArr] =
      await Promise.all([
        fetchAll('users'),
        fetchAll('categories'),
        fetchAll('participants'),
        fetchAll('matches'),
        fetchAll('clubs'),
        fetchAll('tournament_info'),
      ]);

    const tournamentInfo = tournamentInfoArr?.[0] || null;
    if (tournamentInfo) delete tournamentInfo.id; // remove singleton id

    return { users, categories, participants, matches, clubs, tournamentInfo };
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return null;
  }
}

// ─── Sync Actions to Supabase ────────────────────────────────────

export async function syncAction(action, prevState) {
  if (!isSupabaseConfigured()) return;

  try {
    switch (action.type) {
      // Users
      case 'ADD_USER':
      case 'UPDATE_USER':
        await upsertRow('users', action.payload);
        break;
      case 'DELETE_USER':
        await deleteRow('users', action.payload);
        break;

      // Categories
      case 'ADD_CATEGORY':
      case 'UPDATE_CATEGORY':
        await upsertRow('categories', action.payload);
        break;
      case 'DELETE_CATEGORY':
        await deleteRow('categories', action.payload);
        break;

      // Participants
      case 'ADD_PARTICIPANT':
      case 'UPDATE_PARTICIPANT':
        await upsertRow('participants', action.payload);
        break;
      case 'DELETE_PARTICIPANT':
        await deleteRow('participants', action.payload);
        break;

      // Matches - full array replace
      case 'SET_MATCHES': {
        const oldIds = new Set(prevState.matches.map((m) => m.id));
        const newIds = new Set(action.payload.map((m) => m.id));
        const deletedIds = [...oldIds].filter((id) => !newIds.has(id));
        // Delete removed matches
        for (const id of deletedIds) {
          await deleteRow('matches', id);
        }
        // Upsert all current matches
        if (action.payload.length > 0) {
          await upsertMany('matches', action.payload);
        }
        break;
      }

      case 'UPDATE_MATCH':
        await upsertRow('matches', action.payload);
        break;

      // Clubs
      case 'ADD_CLUB':
      case 'UPDATE_CLUB':
        await upsertRow('clubs', action.payload);
        break;
      case 'DELETE_CLUB':
        await deleteRow('clubs', action.payload);
        break;

      // Tournament Info
      case 'UPDATE_TOURNAMENT_INFO': {
        const merged = { ...prevState.tournamentInfo, ...action.payload, id: 'default' };
        await upsertRow('tournament_info', merged);
        break;
      }

      // Reset match data
      case 'RESET_MATCH_DATA': {
        await supabase.from('matches').delete().neq('id', '');
        const resetCats = prevState.categories.map((c) => ({ ...c, status: 'open' }));
        const resetClubs = prevState.clubs.map((c) => ({
          ...c, points: 0, gold: 0, silver: 0, bronze: 0,
        }));
        if (resetCats.length) await upsertMany('categories', resetCats);
        if (resetClubs.length) await upsertMany('clubs', resetClubs);
        break;
      }

      // Import
      case 'IMPORT_DATA': {
        const d = action.payload;
        // Clear all tables
        const tables = ['matches', 'participants', 'categories', 'users', 'clubs'];
        for (const t of tables) {
          await supabase.from(t).delete().neq('id', '');
        }
        // Re-insert
        if (d.users?.length) await upsertMany('users', d.users);
        if (d.clubs?.length) await upsertMany('clubs', d.clubs);
        if (d.categories?.length) await upsertMany('categories', d.categories);
        if (d.participants?.length) await upsertMany('participants', d.participants);
        if (d.matches?.length) await upsertMany('matches', d.matches);
        if (d.tournamentInfo) {
          await upsertRow('tournament_info', { ...d.tournamentInfo, id: 'default' });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Supabase sync error [${action.type}]:`, err);
    throw err; // Re-throw so caller can show toast
  }
}
