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
      className={`flex-1 bg-black text-white flex flex-col font-sans ${isFullscreen ? "fixed inset-0 z-[9999]" : ""}`}
    >
      {/* Top controls */}
      <div className="no-print w-full relative z-[100] flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800 shadow-xl">
        <div className="flex gap-2 flex-wrap items-center">
          {[
            { key: "senior", label: `Senior ${formatTime(durations.senior)}` },
            { key: "junior", label: `Junior ${formatTime(durations.junior)}` },
            {
              key: "veteran",
              label: `Veteran ${formatTime(durations.veteran)}`,
            },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                setAgeGroup(key);
              }}
              className={`px-3 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border
                ${ageGroup === key ? "bg-white text-black border-white shadow-lg" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="flex-1 flex justify-center px-4">
          <input
            value={matchLabel}
            onChange={(e) => setMatchLabel(e.target.value)}
            placeholder="Match label..."
            className="bg-transparent border-b border-zinc-700 text-white text-center text-sm w-full max-w-xs focus:outline-none focus:border-crimson placeholder-zinc-600 py-1 transition-colors"
          />
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="px-3 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-white transition-all border border-zinc-700 shadow-sm"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* AKA (Red) Side */}
        <div className="flex-1 bg-crimson relative p-4 md:p-[4vh] flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center justify-between h-full py-[2vh] z-10 pr-[5%] md:pr-[15%] xl:pr-[25%] relative">
            <div className="w-full text-center flex flex-col items-center gap-[1vh]">
              <div className="relative inline-block w-full max-w-[80%] mx-auto">
                <input
                  value={f1Name}
                  onChange={(e) => setF1Name(e.target.value)}
                  className="bg-transparent text-[6vh] md:text-[8vh] font-black text-white text-center w-full focus:outline-none uppercase tracking-widest drop-shadow-xl placeholder-white/50 leading-none"
                  placeholder="AKA"
                />
                <button
                  onClick={() => { setF1Senshu(!f1Senshu); setF2Senshu(false); }}
                  className={`absolute -right-8 top-1/2 -translate-y-1/2 w-[4vh] h-[4vh] rounded-full border-2 font-bold text-[1.2vh] flex items-center justify-center transition-all shadow-lg cursor-pointer
                    ${f1Senshu ? 'bg-yellow-400 border-yellow-200 text-black shadow-yellow-500/50 scale-110' : 'bg-black/30 border-white/20 text-white/40 hover:bg-black/50 hover:text-white/80'}`}
                  title="Toggle Senshu"
                >
                  SEN
                </button>
              </div>
              
              <div className="text-[18vh] md:text-[28vh] xl:text-[35vh] font-black leading-none text-white drop-shadow-2xl tabular-nums">
                {f1Score}
              </div>
              
              <div className="flex justify-center gap-[4vh]">
                <div className="flex flex-col items-center">
                  <span className="text-white/70 text-[1.5vh] font-bold tracking-widest uppercase">C1</span>
                  <span className="text-[4vh] font-black text-amber-300 drop-shadow-md leading-none">{f1C1}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-white/70 text-[1.5vh] font-bold tracking-widest uppercase">C2</span>
                  <span className="text-[4vh] font-black text-amber-300 drop-shadow-md leading-none">{f1C2}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-[1vh] w-full mt-auto">
              <div className="flex gap-[1.5vh] justify-center w-full">
                {[
                  { v: 1, l: "YUKO" },
                  { v: 2, l: "WAZA-ARI" },
                  { v: 3, l: "IPPON" },
                ].map(({v, l}) => (
                  <button key={l} onClick={() => scoreF1(v)} className="w-[8vh] h-[8vh] md:w-[12vh] md:h-[12vh] rounded-2xl bg-white/20 hover:bg-white/30 border border-white/50 text-white flex flex-col items-center justify-center gap-[0.5vh] backdrop-blur-sm transition-all drop-shadow-lg">
                    <span className="text-[3vh] md:text-[4.5vh] font-black leading-none">+{v}</span>
                    <span className="text-[1vh] md:text-[1.2vh] font-bold uppercase tracking-widest opacity-80 leading-none">{l}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-[1vh] justify-center w-full">
                <button onClick={() => setF1C1(c => c + 1)} className="flex-1 py-[1vh] rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-100 font-bold tracking-widest uppercase text-[1.2vh] md:text-[1.5vh] backdrop-blur-sm transition-all border border-amber-500/50 max-w-[15vh]">
                  + C1
                </button>
                <button onClick={() => setF1C2(c => c + 1)} className="flex-1 py-[1vh] rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-100 font-bold tracking-widest uppercase text-[1.2vh] md:text-[1.5vh] backdrop-blur-sm transition-all border border-amber-500/50 max-w-[15vh]">
                  + C2
                </button>
              </div>
              <div className="flex gap-[1vh] justify-center w-full">
                <button onClick={() => scoreF1(-1)} className="flex-1 py-[0.8vh] rounded-xl bg-black/30 hover:bg-black/50 text-white/60 hover:text-white font-bold tracking-widest uppercase text-[1vh] md:text-[1.2vh] backdrop-blur-sm transition-all border border-black/20 max-w-[15vh]">
                  -1 Point
                </button>
                <button onClick={() => { setF1C1(Math.max(0, f1C1 - 1)); setF1C2(Math.max(0, f1C2 - 1)); }} className="flex-1 py-[0.8vh] rounded-xl bg-black/30 hover:bg-black/50 text-white/60 hover:text-white font-bold tracking-widest uppercase text-[1vh] md:text-[1.2vh] backdrop-blur-sm transition-all border border-black/20 max-w-[15vh]">
                  - Penalty
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AO (Blue) Side */}
        <div className="flex-1 bg-blue-600 relative p-4 md:p-[4vh] flex flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-black/20 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center justify-between h-full py-[2vh] z-10 pl-[5%] md:pl-[15%] xl:pl-[25%] relative">
            <div className="w-full text-center flex flex-col items-center gap-[1vh]">
              <div className="relative inline-block w-full max-w-[80%] mx-auto">
                <input
                  value={f2Name}
                  onChange={(e) => setF2Name(e.target.value)}
                  className="bg-transparent text-[6vh] md:text-[8vh] font-black text-white text-center w-full focus:outline-none uppercase tracking-widest drop-shadow-xl placeholder-white/50 leading-none"
                  placeholder="AO"
                />
                <button
                  onClick={() => { setF2Senshu(!f2Senshu); setF1Senshu(false); }}
                  className={`absolute -left-8 top-1/2 -translate-y-1/2 w-[4vh] h-[4vh] rounded-full border-2 font-bold text-[1.2vh] flex items-center justify-center transition-all shadow-lg cursor-pointer
                    ${f2Senshu ? 'bg-yellow-400 border-yellow-200 text-black shadow-yellow-500/50 scale-110' : 'bg-black/30 border-white/20 text-white/40 hover:bg-black/50 hover:text-white/80'}`}
                  title="Toggle Senshu"
                >
                  SEN
                </button>
              </div>
              
              <div className="text-[18vh] md:text-[28vh] xl:text-[35vh] font-black leading-none text-white drop-shadow-2xl tabular-nums">
                {f2Score}
              </div>
              
              <div className="flex justify-center gap-[4vh]">
                <div className="flex flex-col items-center">
                  <span className="text-white/70 text-[1.5vh] font-bold tracking-widest uppercase">C1</span>
                  <span className="text-[4vh] font-black text-amber-300 drop-shadow-md leading-none">{f2C1}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-white/70 text-[1.5vh] font-bold tracking-widest uppercase">C2</span>
                  <span className="text-[4vh] font-black text-amber-300 drop-shadow-md leading-none">{f2C2}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-[1vh] w-full mt-auto">
              <div className="flex gap-[1.5vh] justify-center w-full">
                {[
                  { v: 1, l: "YUKO" },
                  { v: 2, l: "WAZA-ARI" },
                  { v: 3, l: "IPPON" },
                ].map(({v, l}) => (
                  <button key={l} onClick={() => scoreF2(v)} className="w-[8vh] h-[8vh] md:w-[12vh] md:h-[12vh] rounded-2xl bg-white/20 hover:bg-white/30 border border-white/50 text-white flex flex-col items-center justify-center gap-[0.5vh] backdrop-blur-sm transition-all drop-shadow-lg">
                    <span className="text-[3vh] md:text-[4.5vh] font-black leading-none">+{v}</span>
                    <span className="text-[1vh] md:text-[1.2vh] font-bold uppercase tracking-widest opacity-80 leading-none">{l}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-[1vh] justify-center w-full">
                <button onClick={() => setF2C1(c => c + 1)} className="flex-1 py-[1vh] rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-100 font-bold tracking-widest uppercase text-[1.2vh] md:text-[1.5vh] backdrop-blur-sm transition-all border border-amber-500/50 max-w-[15vh]">
                  + C1
                </button>
                <button onClick={() => setF2C2(c => c + 1)} className="flex-1 py-[1vh] rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-100 font-bold tracking-widest uppercase text-[1.2vh] md:text-[1.5vh] backdrop-blur-sm transition-all border border-amber-500/50 max-w-[15vh]">
                  + C2
                </button>
              </div>
              <div className="flex gap-[1vh] justify-center w-full">
                <button onClick={() => scoreF2(-1)} className="flex-1 py-[0.8vh] rounded-xl bg-black/30 hover:bg-black/50 text-white/60 hover:text-white font-bold tracking-widest uppercase text-[1vh] md:text-[1.2vh] backdrop-blur-sm transition-all border border-black/20 max-w-[15vh]">
                  -1 Point
                </button>
                <button onClick={() => { setF2C1(Math.max(0, f2C1 - 1)); setF2C2(Math.max(0, f2C2 - 1)); }} className="flex-1 py-[0.8vh] rounded-xl bg-black/30 hover:bg-black/50 text-white/60 hover:text-white font-bold tracking-widest uppercase text-[1vh] md:text-[1.2vh] backdrop-blur-sm transition-all border border-black/20 max-w-[15vh]">
                  - Penalty
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Clock Console overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
          <div className="bg-black/80 backdrop-blur-xl p-[3vh] rounded-[3vh] border-4 border-zinc-800 shadow-2xl flex flex-col items-center">
            {matchLabel && (
              <div className="text-zinc-400 font-bold uppercase tracking-widest text-[1.5vh] mb-[1vh] text-center max-w-[30vh] truncate">
                {matchLabel}
              </div>
            )}

            <div
              className={`font-black tabular-nums transition-colors select-none text-[12vh] md:text-[18vh] leading-none mb-[2vh]
                ${isDanger ? "text-red-500 animate-pulse" : "text-white"}
                ${buzzed ? "scale-110 text-red-500" : "scale-100"} transition-transform duration-150`}
              style={{ textShadow: "0 10px 30px rgba(0,0,0,0.8)" }}
            >
              {formatTime(timeLeft)}
            </div>

            {/* Controls */}
            <div className="flex gap-[2vh] w-full">
              <button
                onClick={() => setRunning((r) => !r)}
                className={`flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest text-[2vh] transition-all shadow-xl ${running ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-emerald-500 hover:bg-emerald-400 text-black"}`}
              >
                {running ? "PAUSE" : "START"}
              </button>
              <button
                onClick={handleReset}
                className="w-[8vh] rounded-[2vh] font-black text-[3vh] bg-zinc-800 hover:bg-zinc-700 text-white transition-all shadow-xl flex items-center justify-center"
                title="Reset Time"
              >
                ↺
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setF1Score(0);
              setF2Score(0);
              setF1C1(0);
              setF1C2(0);
              setF2C1(0);
              setF2C2(0);
              setF1Senshu(false);
              setF2Senshu(false);
            }}
            className="mt-[2vh] px-[2vh] py-[1vh] bg-black/60 backdrop-blur-md rounded-full text-[1.2vh] font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors border border-zinc-800 shadow-lg"
          >
            Reset Scores & Penalties
          </button>
        </div>
      </div>
    </div>
  );
}
