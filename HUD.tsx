/**
 * Turbo Racer Mobile - Low-Occlusion HUD Overlay
 * Clean perimeter clusters with tabular figures, nitro gauge, and audio controls.
 */

import React from 'react';
import { Pause, Volume2, VolumeX, Maximize2, HelpCircle } from 'lucide-react';
import { GameStats } from '../types/game';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenGuide: () => void;
  onToggleFullscreen: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onPause,
  onOpenGuide,
  onToggleFullscreen
}) => {
  // Speed percentage for visual gauge
  const speedRatio = Math.min(stats.speed / 240, 1);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 select-none">
      {/* Top Header Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Left Status: Score & Multiplier */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider">SCORE</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums tracking-tight drop-shadow-sm">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="text-sky-400 font-bold">{stats.multiplier}x MULTI</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-300 font-bold tabular-nums">${stats.coinsCollected}</span>
          </div>
        </div>

        {/* Center: Nitro Energy & Shield Active */}
        <div className="flex flex-col items-center gap-1 max-w-[180px] w-full pt-1">
          <div className="flex items-center justify-between w-full text-[10px] font-bold tracking-wider">
            <span className="text-sky-400">NITRO</span>
            <span className="text-slate-400 tabular-nums">{stats.nitro}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                stats.nitro > 40
                  ? 'bg-gradient-to-r from-sky-500 to-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${stats.nitro}%` }}
            />
          </div>

          {stats.shieldActive && (
            <div className="text-[11px] font-black text-emerald-400 tracking-widest animate-pulse mt-0.5">
              SHIELD ACTIVE ({stats.shieldTimeRemaining}s)
            </div>
          )}
        </div>

        {/* Right Status: Speedometer & Distance */}
        <div className="flex flex-col items-end gap-0.5">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider">SPEED</div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${
                stats.speed > 180 ? 'text-rose-400 animate-pulse' : 'text-slate-100'
              }`}
            >
              {stats.speed}
            </span>
            <span className="text-xs font-bold text-slate-400">km/h</span>
          </div>
          <div className="text-xs font-semibold text-slate-400 tabular-nums">
            {stats.distance.toLocaleString()} m
          </div>
        </div>
      </div>

      {/* Quick Action Utility Buttons (Top-Right or Floating Top Bar) */}
      <div className="pointer-events-auto absolute top-3 right-1/2 translate-x-1/2 flex items-center gap-2 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-slate-800/80">
        <button
          onClick={onPause}
          aria-label="Pause Race"
          className="p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
        >
          <Pause className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleMute}
          aria-label="Toggle Sound"
          className="p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenGuide}
          aria-label="Android & Controls Guide"
          className="p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          aria-label="Toggle Fullscreen"
          className="p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
