/**
 * Turbo Racer Mobile - Ergonomic Mobile Touch Controls
 * Low-latency, touch-safe controls designed for Android smartphones (Landscape & Portrait).
 */

import React, { useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Flame, Gauge, OctagonAlert } from 'lucide-react';
import { InputState } from '../types/game';
import { sound } from '../services/sound';

interface TouchControlsProps {
  onInputChange: (inputs: Partial<InputState>) => void;
  isPortrait: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputChange,
  isPortrait
}) => {
  // Bind Keyboard controls for desktop/Chromebook testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          onInputChange({ steerLeft: true });
          break;
        case 'ArrowRight':
        case 'KeyD':
          onInputChange({ steerRight: true });
          break;
        case 'ArrowUp':
        case 'KeyW':
          onInputChange({ accelerate: true });
          break;
        case 'ArrowDown':
        case 'KeyS':
          onInputChange({ brake: true });
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          onInputChange({ nitro: true });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          onInputChange({ steerLeft: false });
          break;
        case 'ArrowRight':
        case 'KeyD':
          onInputChange({ steerRight: false });
          break;
        case 'ArrowUp':
        case 'KeyW':
          onInputChange({ accelerate: false });
          break;
        case 'ArrowDown':
        case 'KeyS':
          onInputChange({ brake: false });
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          onInputChange({ nitro: false });
          break;
      }
    };

    const handleBlur = () => {
      onInputChange({
        steerLeft: false,
        steerRight: false,
        accelerate: false,
        brake: false,
        nitro: false
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onInputChange]);

  // Touch handlers that strictly prevent default gestures
  const bindTouch = useCallback(
    (key: keyof InputState) => ({
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onInputChange({ [key]: true });
        sound.triggerHaptic(12);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onInputChange({ [key]: false });
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onInputChange({ [key]: false });
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        onInputChange({ [key]: true });
      },
      onMouseUp: (e: React.MouseEvent) => {
        e.preventDefault();
        onInputChange({ [key]: false });
      },
      onMouseLeave: (e: React.MouseEvent) => {
        e.preventDefault();
        onInputChange({ [key]: false });
      }
    }),
    [onInputChange]
  );

  if (isPortrait) {
    // Portrait layout: bottom split controls
    return (
      <div className="pointer-events-auto fixed bottom-3 left-0 right-0 z-30 px-3">
        <div className="flex items-end justify-between max-w-md mx-auto">
          {/* Steering zone */}
          <div className="flex items-center gap-2">
            <button
              {...bindTouch('steerLeft')}
              aria-label="Steer Left"
              className="w-16 h-16 rounded-2xl bg-slate-900/85 active:bg-sky-600/80 border border-slate-700/60 active:border-sky-400 text-slate-100 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-8 h-8 pointer-events-none" />
            </button>
            <button
              {...bindTouch('steerRight')}
              aria-label="Steer Right"
              className="w-16 h-16 rounded-2xl bg-slate-900/85 active:bg-sky-600/80 border border-slate-700/60 active:border-sky-400 text-slate-100 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <ArrowRight className="w-8 h-8 pointer-events-none" />
            </button>
          </div>

          {/* Drive & Turbo zone */}
          <div className="flex items-center gap-2">
            <button
              {...bindTouch('nitro')}
              aria-label="Nitro Boost"
              className="w-14 h-14 rounded-2xl bg-amber-500/85 active:bg-amber-400 border border-amber-300/60 text-slate-950 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Flame className="w-6 h-6 pointer-events-none fill-current" />
              <span className="text-[10px] font-bold tracking-tight pointer-events-none">NITRO</span>
            </button>
            <button
              {...bindTouch('brake')}
              aria-label="Brake"
              className="w-14 h-16 rounded-2xl bg-rose-900/85 active:bg-rose-600 border border-rose-700/60 text-rose-100 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <OctagonAlert className="w-6 h-6 pointer-events-none" />
              <span className="text-[10px] font-bold tracking-tight pointer-events-none">BRAKE</span>
            </button>
            <button
              {...bindTouch('accelerate')}
              aria-label="Accelerate"
              className="w-16 h-16 rounded-2xl bg-emerald-600/90 active:bg-emerald-500 border border-emerald-400/60 text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Gauge className="w-7 h-7 pointer-events-none" />
              <span className="text-[10px] font-black tracking-tight pointer-events-none">GAS</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landscape layout (ideal for Android phone dual-thumb grip)
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* Left Hand: Steering Thumb Pad */}
      <div className="pointer-events-auto absolute bottom-6 left-6 flex items-center gap-3">
        <button
          {...bindTouch('steerLeft')}
          aria-label="Steer Left"
          className="w-20 h-20 rounded-2xl bg-slate-900/80 active:bg-sky-600/90 border-2 border-slate-700/80 active:border-sky-400 text-slate-100 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all backdrop-blur-xs"
        >
          <ArrowLeft className="w-9 h-9 pointer-events-none" />
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider pointer-events-none">LEFT</span>
        </button>
        <button
          {...bindTouch('steerRight')}
          aria-label="Steer Right"
          className="w-20 h-20 rounded-2xl bg-slate-900/80 active:bg-sky-600/90 border-2 border-slate-700/80 active:border-sky-400 text-slate-100 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all backdrop-blur-xs"
        >
          <ArrowRight className="w-9 h-9 pointer-events-none" />
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider pointer-events-none">RIGHT</span>
        </button>
      </div>

      {/* Right Hand: Pedals & Nitro Boost */}
      <div className="pointer-events-auto absolute bottom-6 right-6 flex items-end gap-3">
        {/* Nitro Boost Button */}
        <button
          {...bindTouch('nitro')}
          aria-label="Nitro Boost"
          className="w-16 h-18 rounded-2xl bg-amber-500/85 active:bg-amber-400 border-2 border-amber-300 text-slate-950 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all"
        >
          <Flame className="w-7 h-7 pointer-events-none fill-current animate-pulse" />
          <span className="text-[10px] font-black tracking-wider pointer-events-none">BOOST</span>
        </button>

        {/* Brake Pedal */}
        <button
          {...bindTouch('brake')}
          aria-label="Brake"
          className="w-16 h-20 rounded-2xl bg-rose-950/85 active:bg-rose-700 border-2 border-rose-600/70 text-rose-200 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all"
        >
          <OctagonAlert className="w-7 h-7 pointer-events-none" />
          <span className="text-[10px] font-bold tracking-wider pointer-events-none">BRAKE</span>
        </button>

        {/* Gas / Acceleration Pedal */}
        <button
          {...bindTouch('accelerate')}
          aria-label="Accelerate"
          className="w-20 h-22 rounded-2xl bg-emerald-600/90 active:bg-emerald-500 border-2 border-emerald-400 text-white flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all"
        >
          <Gauge className="w-9 h-9 pointer-events-none" />
          <span className="text-xs font-black tracking-widest pointer-events-none">ACCEL</span>
        </button>
      </div>
    </div>
  );
};
