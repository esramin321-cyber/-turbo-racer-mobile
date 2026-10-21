/**
 * Turbo Racer Mobile - Pause Modal
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { sound } from '../services/sound';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGuide: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
  onOpenGuide
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-2xl font-black italic tracking-wide text-white mb-4">
          RACE PAUSED
        </h2>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full h-12 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-98 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenGuide();
            }}
            className="w-full h-11 rounded-xl bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-slate-300 font-medium text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Android Tips</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full h-11 rounded-xl bg-slate-800/40 hover:bg-slate-800 active:scale-98 text-slate-400 font-medium text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
