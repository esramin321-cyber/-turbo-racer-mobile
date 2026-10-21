/**
 * Turbo Racer Mobile - Game Over Modal
 * Displays race statistics, new high score badges, and quick restart actions.
 */

import React from 'react';
import { RotateCcw, Home, Trophy, Gauge, Flame, DollarSign } from 'lucide-react';
import { GameStats } from '../types/game';
import { sound } from '../services/sound';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome
}) => {
  const isNewRecord = stats.score >= stats.bestScore && stats.score > 0;

  const handleRestart = () => {
    sound.playClick();
    onRestart();
  };

  const handleHome = () => {
    sound.playClick();
    onHome();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-rose-500 mb-1">
          CRASHED OUT
        </div>

        <h2 className="text-3xl font-black italic tracking-wide text-white mb-2">
          GAME OVER
        </h2>

        {isNewRecord && (
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>NEW BEST RECORD!</span>
          </div>
        )}

        {/* Primary Score */}
        <div className="my-2">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider">FINAL SCORE</div>
          <div className="text-4xl font-black text-amber-400 tabular-nums">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full my-4">
          <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <span>Distance</span>
            </div>
            <div className="text-lg font-bold text-slate-100 tabular-nums">
              {stats.distance.toLocaleString()} m
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Gauge className="w-3 h-3 text-sky-400" />
              <span>Top Speed</span>
            </div>
            <div className="text-lg font-bold text-slate-100 tabular-nums">
              {stats.topSpeed} km/h
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Near Misses</span>
            </div>
            <div className="text-lg font-bold text-slate-100 tabular-nums">
              {stats.nearMissCount}
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>Coins Collected</span>
            </div>
            <div className="text-lg font-bold text-slate-100 tabular-nums">
              ${stats.coinsCollected}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={handleRestart}
            className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RACE AGAIN</span>
          </button>

          <button
            onClick={handleHome}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
