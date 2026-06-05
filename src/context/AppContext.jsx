import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { saveData, loadData } from "../utils/storage";
import { isSupabaseConfigured } from "../utils/supabase";
import { fetchAllData, syncAction } from "../utils/supabaseService";

const AppContext = createContext(null);

const DEFAULT_TOURNAMENT_INFO = {
  name: "Karate Championship 2025",
  city: "",
  date: "",
  organizer: "",
  durations: { senior: 180, junior: 120, veteran: 120 },
  points: { first: 5, second: 3, third: 1, win: 1 },
};

/**
 * Initializes state from LocalStorage to keep the UI fast on first load.
 */
function buildInitialState() {
  return {
    users: loadData("users", []),
    categories: loadData("categories", []),
    participants: loadData("participants", []),
    matches: loadData("matches", []),
    clubs: loadData("clubs", []),
    tournamentInfo: loadData("tournamentInfo", DEFAULT_TOURNAMENT_INFO),
    currentUser: loadData("currentUser", null),
    toasts: [],
  };
}

/**
 * Global application reducer managing domain data persistence.
 */
function reducer(state, action) {
  switch (action.type) {
    // Auth Handlers
    case "LOGIN":
      saveData("currentUser", action.payload);
      return { ...state, currentUser: action.payload };
    case "LOGOUT":
      saveData("currentUser", null);
      return { ...state, currentUser: null };

    // Users Management
    case "ADD_USER": {
      const users = [...state.users, action.payload];
      saveData("users", users);
      return { ...state, users };
    }
    case "UPDATE_USER": {
      const users = state.users.map((u) =>
        u.id === action.payload.id ? { ...u, ...action.payload } : u,
      );
      saveData("users", users);
      return { ...state, users };
    }
    case "DELETE_USER": {
      const users = state.users.filter((u) => u.id !== action.payload);
      saveData("users", users);
      return { ...state, users };
    }

    // Categories Management
    case "ADD_CATEGORY": {
      const categories = [...state.categories, action.payload];
      saveData("categories", categories);
      return { ...state, categories };
    }
    case "UPDATE_CATEGORY": {
      const categories = state.categories.map((c) =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c,
      );
      saveData("categories", categories);
      return { ...state, categories };
    }
    case "DELETE_CATEGORY": {
      const categories = state.categories.filter(
        (c) => c.id !== action.payload,
      );
      saveData("categories", categories);
      return { ...state, categories };
    }

    // Participants Management
    case "ADD_PARTICIPANT": {
      const participants = [...state.participants, action.payload];
      saveData("participants", participants);
      return { ...state, participants };
    }
    case "UPDATE_PARTICIPANT": {
      const participants = state.participants.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p,
      );
      saveData("participants", participants);
      return { ...state, participants };
    }
    case "DELETE_PARTICIPANT": {
      const participants = state.participants.filter(
        (p) => p.id !== action.payload,
      );
      saveData("participants", participants);
      return { ...state, participants };
    }

    // Bracket Matches
    case "SET_MATCHES": {
      const matches = action.payload;
      saveData("matches", matches);
      return { ...state, matches };
    }
    case "UPDATE_MATCH": {
      const matches = state.matches.map((m) =>
        m.id === action.payload.id ? { ...m, ...action.payload } : m,
      );
      saveData("matches", matches);
      return { ...state, matches };
    }

    // Dojo/Club Point Management
    case "ADD_CLUB": {
      const clubs = [...state.clubs, action.payload];
      saveData("clubs", clubs);
      return { ...state, clubs };
    }
    case "UPDATE_CLUB": {
      const clubs = state.clubs.map((c) =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c,
      );
      saveData("clubs", clubs);
      return { ...state, clubs };
    }
    case "DELETE_CLUB": {
      const clubs = state.clubs.filter((c) => c.id !== action.payload);
      saveData("clubs", clubs);
      return { ...state, clubs };
    }

    // Metadata Configurations
    case "UPDATE_TOURNAMENT_INFO": {
      const tournamentInfo = { ...state.tournamentInfo, ...action.payload };
      saveData("tournamentInfo", tournamentInfo);
      return { ...state, tournamentInfo };
    }

    // Structural Resets
    case "RESET_MATCH_DATA": {
      const matches = [];
      const categories = state.categories.map((c) => ({
        ...c,
        status: "open",
      }));
      const clubs = state.clubs.map((c) => ({
        ...c,
        points: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
      }));
      saveData("matches", matches);
      saveData("categories", categories);
      saveData("clubs", clubs);
      return { ...state, matches, categories, clubs };
    }

    // File Import Aggregation
    case "IMPORT_DATA": {
      const d = action.payload;
      if (d.users) saveData("users", d.users);
      if (d.categories) saveData("categories", d.categories);
      if (d.participants) saveData("participants", d.participants);
      if (d.matches) saveData("matches", d.matches);
      if (d.clubs) saveData("clubs", d.clubs);
      if (d.tournamentInfo) saveData("tournamentInfo", d.tournamentInfo);
      return {
        ...state,
        users: d.users ?? state.users,
        categories: d.categories ?? state.categories,
        participants: d.participants ?? state.participants,
        matches: d.matches ?? state.matches,
        clubs: d.clubs ?? state.clubs,
        tournamentInfo: d.tournamentInfo ?? state.tournamentInfo,
      };
    }

    // Supabase Roster Sync
    case "HYDRATE": {
      const d = action.payload;
      saveData("users", d.users || []);
      saveData("categories", d.categories || []);
      saveData("participants", d.participants || []);
      saveData("matches", d.matches || []);
      saveData("clubs", d.clubs || []);
      if (d.tournamentInfo) saveData("tournamentInfo", d.tournamentInfo);
      return {
        ...state,
        users: d.users || [],
        categories: d.categories || [],
        participants: d.participants || [],
        matches: d.matches || [],
        clubs: d.clubs || [],
        tournamentInfo: d.tournamentInfo || state.tournamentInfo,
      };
    }

    // Notification Engine
    case "ADD_TOAST": {
      const toast = { id: Date.now(), ...action.payload };
      return { ...state, toasts: [...state.toasts, toast] };
    }
    case "REMOVE_TOAST": {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState);
  const [cloudLoading, setCloudLoading] = useState(isSupabaseConfigured());
  const stateRef = useRef(state);

  // Keep references synced across macro-tasks
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle toast scheduling cleanly
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    dispatch({ type: "ADD_TOAST", payload: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: id }), 3500);
  }, []);

  // Fetch data trees from Supabase on application mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    fetchAllData()
      .then((data) => {
        if (data) {
          dispatch({ type: "HYDRATE", payload: data });
        }
        setCloudLoading(false);
      })
      .catch((err) => {
        setCloudLoading(false);
        console.error(
          "CRITICAL NETWORK ERROR: App initialization fetch blocked by browser client.",
          err,
        );

        // Notify the developer explicitly in the dev console if a network block occurs
        if (err?.message?.includes("fetch") || err instanceof TypeError) {
          addToast(
            "Cloud Database Sync Blocked. Operating in offline LocalStorage mode.",
            "warning",
          );
        }
      });
  }, [addToast]);

  // Intercept dispatches to update Supabase clusters
  const syncDispatch = useCallback(
    (action) => {
      const prevState = stateRef.current;
      dispatch(action);

      // Skip cloud execution for administrative UI and local storage actions
      const skipSync = [
        "LOGIN",
        "LOGOUT",
        "ADD_TOAST",
        "REMOVE_TOAST",
        "HYDRATE",
      ];
      if (skipSync.includes(action.type)) return;

      // Fire-and-forget background state replication
      syncAction(action, prevState).catch((err) => {
        console.error(
          "Cloud synchronization pipeline exception encountered:",
          err,
        );
        addToast(
          "Cloud synchronization interrupted. Modifications preserved locally.",
          "warning",
        );
      });
    },
    [addToast],
  );

  return (
    <AppContext.Provider
      value={{ state, dispatch: syncDispatch, addToast, cloudLoading }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx)
    throw new Error(
      "useApp must be used within an active AppProvider structure",
    );
  return ctx;
}
