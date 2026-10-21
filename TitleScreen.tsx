/**
 * Turbo Racer Mobile - Title Screen & Garage
 * Atmospheric game shell with bespoke vector title lockup, car color customizer, and high score display.
 */

import React from 'react';
import { Play, Volume2, VolumeX, Smartphone, Trophy, Flame } from 'lucide-react';
import { CarColor } from '../types/game';
import { GAME_CONSTANTS } from '../game/constants';
import { sound } from '../services/sound';

interface TitleScreenProps {
  onStartRace: () => void;
  selectedColor: CarColor;
  onSelectColor: (color: CarColor) => void;
  bestScore: number;
  bestDistance: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGuide: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartRace,
  selectedColor,
  onSelectColor,
  bestScore,
  bestDistance,
  isMuted,
  onToggleMute,
  onOpenGuide
}) => {
  const currentCar = GAME_CONSTANTS.CAR_COLORS[selectedColor];

  const handleStart = () => {
    sound.playClick();
    onStartRace();
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between items-center p-6 bg-slate-950/92 backdrop-blur-md select-none overflow-y-auto">
      {/* Top Bar: Records & Sound */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span className="tabular-nums font-bold">{bestScore.toLocaleString()} PTS</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="tabular-nums">{bestDistance.toLocaleString()} m RECORD</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Android Setup</span>
          </button>

          <button
            onClick={onToggleMute}
            aria-label="Toggle Mute"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-lg w-full">
        <div className="relative mb-2">
          {/* Bespoke Vector Racing Title */}
          <svg className="w-72 sm:w-96 h-24 overflow-visible" viewBox="0 0 380 95">
            <defs>
              <linearGradient id="turboGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <linearGradient id="racerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            {/* Speed streak accents */}
            <path d="M 10 22 L 70 22" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <path d="M 25 30 L 60 30" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 320 22 L 370 22" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

            {/* Main Text Lockup */}
            <text
              x="190"
              y="50"
              textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontWeight="900"
              fontSize="44"
              fontStyle="italic"
              letterSpacing="2"
              fill="url(#turboGrad)"
            >
              TURBO RACER
            </text>
            <text
              x="190"
              y="82"
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontWeight="700"
              fontSize="16"
              letterSpacing="7"
              fill="url(#racerGrad)"
            >
              MOBILE EDITION
            </text>
          </svg>
        </div>

        {/* Dynamic Car Preview Graphic */}
        <div className="my-5 flex flex-col items-center">
          <div className="relative w-36 h-44 flex items-center justify-center bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 shadow-inner">
            <svg viewBox="0 0 80 120" className="w-24 h-36 drop-shadow-xl overflow-visible">
              {/* Shadow */}
              <ellipse cx="40" cy="65" rx="26" ry="46" fill="rgba(0,0,0,0.5)" />

              {/* Wheels */}
              <rect x="8" y="24" width="7" height="18" rx="2" fill="#0f172a" />
              <rect x="65" y="24" width="7" height="18" rx="2" fill="#0f172a" />
              <rect x="8" y="78" width="7" height="18" rx="2" fill="#0f172a" />
              <rect x="65" y="78" width="7" height="18" rx="2" fill="#0f172a" />

              {/* Chassis */}
              <path
                d="M 28 14 Q 40 8 52 14 L 62 38 L 62 96 Q 62 106 52 106 L 28 106 Q 18 106 18 96 L 18 38 Z"
                fill={currentCar.primary}
              />
              <path
                d="M 20 40 L 26 40 L 26 94 L 20 94 Z"
                fill={currentCar.secondary}
              />
              <path
                d="M 54 40 L 60 40 L 60 94 L 54 94 Z"
                fill={currentCar.secondary}
              />

              {/* Racing Stripes */}
              <rect x="36" y="14" width="3" height="92" fill={currentCar.highlight} />
              <rect x="41" y="14" width="3" height="92" fill={currentCar.highlight} />

              {/* Windshield */}
              <path d="M 26 34 L 54 34 L 52 64 L 28 64 Z" fill="#0f172a" />
              <path d="M 27 36 L 53 36 L 50 48 L 30 48 Z" fill="#38bdf8" />
              <path d="M 29 38 L 34 38 L 32 60 L 28 60 Z" fill="rgba(255,255,255,0.4)" />

              {/* Spoiler */}
              <rect x="18" y="100" width="44" height="6" rx="2" fill="#1e293b" />
              <rect x="20" y="99" width="40" height="2" fill={currentCar.primary} />

              {/* Headlights */}
              <rect x="24" y="14" width="7" height="3" rx="1" fill="#fef08a" />
              <rect x="49" y="14" width="7" height="3" rx="1" fill="#fef08a" />
            </svg>
          </div>

          {/* Color Selector */}
          <div className="flex items-center gap-2.5 mt-3">
            {(Object.keys(GAME_CONSTANTS.CAR_COLORS) as CarColor[]).map((col) => {
              const spec = GAME_CONSTANTS.CAR_COLORS[col];
              const isSelected = selectedColor === col;
              return (
                <button
                  key={col}
                  onClick={() => {
                    sound.playClick();
                    onSelectColor(col);
                  }}
                  title={spec.name}
                  className={`w-7 h-7 rounded-full transition-all ${
                    isSelected
                      ? 'scale-125 ring-2 ring-white shadow-lg'
                      : 'opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: spec.primary }}
                />
              );
            })}
          </div>
          <span className="text-xs font-semibold text-slate-400 mt-1">{currentCar.name}</span>
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={handleStart}
          className="group w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-lg tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>START RACE</span>
        </button>

        {/* Flat single-line control hints */}
        <div className="text-xs text-slate-400 mt-4">
          <span>Touch buttons or A/D Steer</span>
          <span aria-hidden="true" className="mx-2 text-slate-600">·</span>
          <span>W/S Gas/Brake</span>
          <span aria-hidden="true" className="mx-2 text-slate-600">·</span>
          <span>Space Nitro</span>
        </div>
      </div>

      {/* Bottom Footer Information */}
      <div className="w-full max-w-2xl flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-3">
        <span>Designed for Android Phones</span>
        <span className="flex items-center gap-1 text-sky-400 font-medium">
          <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
          Landscape & Portrait Ready
        </span>
      </div>
    </div>
  );
};
