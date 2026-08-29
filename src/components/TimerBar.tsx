import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  BellRing, 
  Clock
} from 'lucide-react';
import { RUN_SHEET_SCHEDULE } from '../data/runSheetData';
import { soundFx } from '../utils/audioHelper';

interface TimerBarProps {
  onSelectBlock?: (blockId: string) => void;
}

export const TimerBar: React.FC<TimerBarProps> = ({ onSelectBlock }) => {
  const TOTAL_SESSION_SECONDS = 150 * 60;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);

  const blockStartTimes = RUN_SHEET_SCHEDULE.reduce<number[]>((acc, _, index) => {
    if (index === 0) return [0];
    const prevStart = acc[index - 1];
    const prevDuration = RUN_SHEET_SCHEDULE[index - 1].duration * 60;
    return [...acc, prevStart + prevDuration];
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= TOTAL_SESSION_SECONDS) {
            setIsRunning(false);
            if (soundEnabled) soundFx.playPensDown();
            return TOTAL_SESSION_SECONDS;
          }
          const next = prev + 1;

          const newIdx = blockStartTimes.findLastIndex((time) => next >= time);
          if (newIdx !== -1 && newIdx !== activeBlockIndex) {
            setActiveBlockIndex(newIdx);
            if (soundEnabled) soundFx.playLabAlert();
          }

          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, soundEnabled, activeBlockIndex, blockStartTimes, TOTAL_SESSION_SECONDS]);

  const formatHMS = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const jumpToBlock = (index: number) => {
    const targetSeconds = blockStartTimes[index];
    setElapsedSeconds(targetSeconds);
    setActiveBlockIndex(index);
    if (onSelectBlock) {
      onSelectBlock(RUN_SHEET_SCHEDULE[index].id);
    }
    if (soundEnabled) soundFx.playBeep(600, 0.1);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setActiveBlockIndex(0);
  };

  const triggerPensDownAlarm = () => {
    if (soundEnabled) {
      soundFx.playPensDown();
    }
    alert('PENS DOWN! 10-Minute Lab Limit Reached. Maximum 2 presentations per table.');
  };

  const currentBlock = RUN_SHEET_SCHEDULE[activeBlockIndex] || RUN_SHEET_SCHEDULE[0];
  const progressPercent = Math.min(100, (elapsedSeconds / TOTAL_SESSION_SECONDS) * 100);

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {currentBlock.blockCode} ({currentBlock.clock})
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  currentBlock.type === 'lab' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : currentBlock.type === 'break'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {currentBlock.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-sm">
                {currentBlock.description}
              </p>
            </div>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xl sm:text-2xl font-bold tracking-wider text-brand-400 shadow-inner">
            {formatHMS(elapsedSeconds)}
            <span className="text-xs text-slate-500 ml-1 font-normal">/ 02:30:00</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-wrap gap-y-2">
          <button
            onClick={() => {
              setIsRunning(!isRunning);
              if (soundEnabled) soundFx.playBeep(500, 0.1);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start Timer'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60"
            title="Reset Session Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="relative">
            <select
              value={activeBlockIndex}
              onChange={(e) => jumpToBlock(Number(e.target.value))}
              className="bg-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {RUN_SHEET_SCHEDULE.map((b, i) => (
                <option key={b.id} value={i}>
                  Jump: {b.blockCode} ({b.duration}m)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={triggerPensDownAlarm}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center space-x-1 transition-all"
            title="Announce Pens Down lab termination"
          >
            <BellRing className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Pens Down!</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-all ${
              soundEnabled 
                ? 'bg-slate-800 text-brand-400 border-slate-700' 
                : 'bg-slate-800 text-slate-500 border-slate-700 line-through'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Audio Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-800/80">
        <div 
          className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 h-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
