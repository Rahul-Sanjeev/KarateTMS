import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { state, dispatch } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      {state.toasts.map(toast => (
        <div
          key={toast.id}
          className={`animate-fade-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-md min-w-[220px] max-w-[360px]
            ${toast.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-200'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-800 text-amber-200'
              : 'bg-zinc-900/95 border-zinc-700 text-white'
            }`}
        >
          <span className="text-lg">
            {toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : '✓'}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            className="text-zinc-500 hover:text-white transition-colors ml-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
