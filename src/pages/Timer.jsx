import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

const DEFAULT_DURATIONS = { senior: 180, junior: 120, veteran: 120 };

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Timer({ setActiveTab }) {
  const { state } = useApp();
  const durations = state.tournamentInfo?.durations || DEFAULT_DURATIONS;

  const [ageGroup, setAgeGroup] = useState("senior");
  const [timeLeft, setTimeLeft] = useState(durations[ageGroup]);
  const [running, setRunning] = useState(false);
  const [matchLabel, setMatchLabel] = useState("");
  const [f1Name, setF1Name] = useState("AKA");
  const [f2Name, setF2Name] = useState("AO");
  const [f1Score, setF1Score] = useState(0);
  const [f2Score, setF2Score] = useState(0);
  const [f1C1, setF1C1] = useState(0);
  const [f1C2, setF1C2] = useState(0);
  const [f2C1, setF2C1] = useState(0);
  const [f2C2, setF2C2] = useState(0);
  const [f1Senshu, setF1Senshu] = useState(false);
  const [f2Senshu, setF2Senshu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buzzed, setBuzzed] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const duration = durations[ageGroup] || DEFAULT_DURATIONS[ageGroup];

  useEffect(() => {
    setTimeLeft(duration);
    setRunning(false);
  }, [ageGroup, duration]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setBuzzed(true);
            setTimeout(() => setBuzzed(false), 2000);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleReset = () => {
    setRunning(false);
    setTimeLeft(duration);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const scoreF1 = (v) => {
    setF1Score(s => {
      return Math.max(0, s + v);
    });
  };

  const scoreF2 = (v) => {
    setF2Score(s => {
      return Math.max(0, s + v);
    });
  };
  const pct = timeLeft / duration;
  const isDanger = timeLeft === 0;

  return (
    <div
      ref={containerRef}
      className={`flex-1 bg-[#121212] text-white flex flex-col overflow-hidden ${isFullscreen ? "fixed inset-0 z-[9999]" : ""}`}
    >
      {/* Mat-Ready Console Overlay */}
      <div className="flex-1 flex relative">
        
        {/* AKA Side (Red) */}
        <div className="flex-1 bg-[#C41E3A] relative flex flex-col items-center justify-center border-r-2 border-black/20">
          <div className="absolute top-8 left-8 flex flex-col">
             <input
                value={f1Name}
                onChange={(e) => setF1Name(e.target.value)}
                className="bg-transparent text-[3vw] font-black text-white/90 focus:outline-none uppercase tracking-widest leading-none text-left"
                placeholder="AKA"
              />
              <div className={`mt-2 w-fit px-3 py-1 rounded font-black text-[0.8rem] tracking-widest uppercase transition-all
                ${f1Senshu ? 'bg-yellow-400 text-black' : 'bg-black/20 text-white/20'}`}
                onClick={() => { setF1Senshu(!f1Senshu); setF2Senshu(false); }}
              >
                Senshu
              </div>
          </div>

          <div className="text-[35vh] font-black leading-none text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] tabular-nums select-none">
            {f1Score}
          </div>

          {/* AKA Penalties */}
          <div className="absolute bottom-12 flex gap-12">
            <div className="flex flex-col items-center">
              <span className="text-white/40 text-[0.7rem] font-black tracking-widest uppercase mb-2">Category 1</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-4 h-8 rounded-sm border border-white/20 transition-all ${f1C1 >= i ? 'bg-amber-400 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/20'}`} />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white/40 text-[0.7rem] font-black tracking-widest uppercase mb-2">Category 2</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-4 h-8 rounded-sm border border-white/20 transition-all ${f1C2 >= i ? 'bg-amber-400 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/20'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Score Controls (Invisible but active) */}
          <div className="absolute inset-y-0 left-0 w-1/4 flex flex-col">
            <button onClick={() => scoreF1(1)} className="flex-1 opacity-0 hover:opacity-5 transition-opacity bg-white" />
            <button onClick={() => scoreF1(-1)} className="flex-1 opacity-0 hover:opacity-5 transition-opacity bg-black" />
          </div>
        </div>

        {/* AO Side (Blue) */}
        <div className="flex-1 bg-[#0047AB] relative flex flex-col items-center justify-center border-l-2 border-black/20">
          <div className="absolute top-8 right-8 flex flex-col items-end">
             <input
                value={f2Name}
                onChange={(e) => setF2Name(e.target.value)}
                className="bg-transparent text-[3vw] font-black text-white/90 focus:outline-none uppercase tracking-widest leading-none text-right"
                placeholder="AO"
              />
              <div className={`mt-2 w-fit px-3 py-1 rounded font-black text-[0.8rem] tracking-widest uppercase transition-all
                ${f2Senshu ? 'bg-yellow-400 text-black' : 'bg-black/20 text-white/20'}`}
                onClick={() => { setF2Senshu(!f2Senshu); setF1Senshu(false); }}
              >
                Senshu
              </div>
          </div>

          <div className="text-[35vh] font-black leading-none text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] tabular-nums select-none">
            {f2Score}
          </div>

          {/* AO Penalties */}
          <div className="absolute bottom-12 flex gap-12">
            <div className="flex flex-col items-center">
              <span className="text-white/40 text-[0.7rem] font-black tracking-widest uppercase mb-2">Category 1</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-4 h-8 rounded-sm border border-white/20 transition-all ${f2C1 >= i ? 'bg-amber-400 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/20'}`} />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white/40 text-[0.7rem] font-black tracking-widest uppercase mb-2">Category 2</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-4 h-8 rounded-sm border border-white/20 transition-all ${f2C2 >= i ? 'bg-amber-400 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/20'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Score Controls (Invisible but active) */}
          <div className="absolute inset-y-0 right-0 w-1/4 flex flex-col">
            <button onClick={() => scoreF2(1)} className="flex-1 opacity-0 hover:opacity-5 transition-opacity bg-white" />
            <button onClick={() => scoreF2(-1)} className="flex-1 opacity-0 hover:opacity-5 transition-opacity bg-black" />
          </div>
        </div>

        {/* Center Clock Console (Deep Charcoal) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-[#121212] border-4 border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] px-16 py-10 rounded-[3rem] flex flex-col items-center min-w-[40vw]">
            <div className="mb-4 flex flex-col items-center">
               <span className="text-zinc-600 font-black text-[0.6rem] uppercase tracking-[0.5em] mb-2">Official Timekeeper</span>
               {matchLabel && <span className="text-white font-bold uppercase tracking-widest text-[0.8rem] opacity-40">{matchLabel}</span>}
            </div>

            <div className={`font-mono font-black tabular-nums tracking-tighter transition-all duration-300 select-none
              ${isDanger ? "text-crimson animate-pulse" : "text-white"}
              ${buzzed ? "scale-110 text-crimson" : "scale-100"}
              text-[20vh] md:text-[25vh] leading-none mb-10`}
            >
              {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4 w-full no-print">
              <button
                onClick={() => setRunning((r) => !r)}
                className={`flex-1 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[1.2rem] transition-all
                  ${running ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-white text-black hover:bg-zinc-200"}`}
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={handleReset}
                className="w-20 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white flex items-center justify-center text-[1.5rem] transition-all"
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Toolbar (Only shown when not in full mat view or on hover) */}
      <div className="no-print h-16 bg-[#121212] border-t border-zinc-800 flex items-center justify-between px-8 z-[101]">
        <div className="flex gap-4">
           {['senior', 'junior', 'veteran'].map(group => (
             <button
                key={group}
                onClick={() => setAgeGroup(group)}
                className={`text-[0.6rem] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all
                  ${ageGroup === group ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
                {group}
             </button>
           ))}
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => scoreF1(1)} className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 hover:text-white">+Aka</button>
          <button onClick={() => scoreF2(1)} className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 hover:text-white">+Ao</button>
          <div className="w-px h-4 bg-zinc-800" />
          <button onClick={() => setF1C1(c => c + 1)} className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-600 hover:text-amber-500">Aka Pen</button>
          <button onClick={() => setF2C1(c => c + 1)} className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-600 hover:text-amber-500">Ao Pen</button>
          <div className="w-px h-4 bg-zinc-800" />
          <button onClick={toggleFullscreen} className="text-[0.6rem] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-all">
            {isFullscreen ? "Exit Full View" : "Mat View"}
          </button>
        </div>
      </div>
    </div>
  );
}
