/**
 * Turbo Racer Mobile - Main Application Entry
 * Full-viewport Game Shell for mobile Android phones & desktop testing.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { CarColor, GameState, GameStats, InputState } from './types/game';
import { GAME_CONSTANTS } from './game/constants';
import { sound } from './services/sound';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import { Smartphone, RotateCw } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedColor, setSelectedColor] = useState<CarColor>('crimson');
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [showAndroidGuide, setShowAndroidGuide] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    speed: GAME_CONSTANTS.CRUISE_SPEED,
    nitro: 60,
    shieldActive: false,
    shieldTimeRemaining: 0,
    multiplier: 1,
    nearMissCount: 0,
    coinsCollected: 0,
    topSpeed: GAME_CONSTANTS.CRUISE_SPEED,
    bestScore: 0,
    bestDistance: 0
  });

  // Track orientation change (Landscape vs Portrait)
  useEffect(() => {
    const handleOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      if (engineRef.current) {
        engineRef.current.handleResize();
      }
    };

    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  // Initialize GameEngine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStatsUpdate: (updatedStats) => {
        setStats(updatedStats);
      },
      onGameOver: (finalStats) => {
        setStats(finalStats);
        setGameState('GAME_OVER');
      }
    });

    engine.setCarColor(selectedColor);
    engineRef.current = engine;

    // Auto-pause if app loses focus (e.g. phone call, switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden && gameState === 'PLAYING') {
        engine.pause();
        setGameState('PAUSED');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  // Sync selected car color with engine
  const handleSelectColor = (color: CarColor) => {
    setSelectedColor(color);
    if (engineRef.current) {
      engineRef.current.setCarColor(color);
    }
  };

  // Toggle Mute Audio
  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Toggle Fullscreen on Android
  const handleToggleFullscreen = useCallback(() => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Input state handler for TouchControls & Keyboard
  const handleInputChange = useCallback((inputs: Partial<InputState>) => {
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.setInputs(inputs);
    }
  }, [gameState]);

  // Start Race from Title
  const handleStartRace = () => {
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.setCarColor(selectedColor);
      engineRef.current.start();
    }
  };

  // Pause Race
  const handlePause = () => {
    if (gameState === 'PLAYING' && engineRef.current) {
      engineRef.current.pause();
      setGameState('PAUSED');
    }
  };

  // Resume Race
  const handleResume = () => {
    if (gameState === 'PAUSED' && engineRef.current) {
      setGameState('PLAYING');
      engineRef.current.resume();
    }
  };

  // Restart Race (Immediate reset)
  const handleRestart = () => {
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.setCarColor(selectedColor);
      engineRef.current.start();
    }
  };

  // Return to Title Menu
  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setGameState('START');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 60fps Isolated HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
      />

      {/* In-Game HUD: Only rendered during active gameplay */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            stats={stats}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            onOpenGuide={() => setShowAndroidGuide(true)}
            onToggleFullscreen={handleToggleFullscreen}
          />
          <TouchControls
            onInputChange={handleInputChange}
            isPortrait={isPortrait}
          />
        </>
      )}

      {/* Landscape recommendation toast when in portrait and playing */}
      {isPortrait && gameState === 'PLAYING' && (
        <div className="pointer-events-none fixed top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] font-medium text-slate-300 backdrop-blur-xs shadow-md">
          <RotateCw className="w-3 h-3 text-sky-400 animate-spin" />
          <span>Rotate landscape for wide view</span>
        </div>
      )}

      {/* Title Screen & Garage */}
      {gameState === 'START' && (
        <TitleScreen
          onStartRace={handleStartRace}
          selectedColor={selectedColor}
          onSelectColor={handleSelectColor}
          bestScore={stats.bestScore}
          bestDistance={stats.bestDistance}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenGuide={() => setShowAndroidGuide(true)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenGuide={() => setShowAndroidGuide(true)}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Android Testing & Google Play Publication Guide Modal */}
      {showAndroidGuide && (
        <AndroidGuideModal onClose={() => setShowAndroidGuide(false)} />
      )}
    </div>
  );
}
