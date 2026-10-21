/**
 * Turbo Racer Mobile - Game Type Definitions
 */

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type CarColor = 'crimson' | 'electric-blue' | 'cyber-yellow' | 'emerald-green' | 'neon-purple';

export interface Vehicle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // speed relative to road
  type: 'sedan' | 'sports' | 'van' | 'truck';
  color: string;
  lane: number;
  targetLane: number;
  isChangingLane: boolean;
  laneChangeTimer: number;
  turnSignal: 'left' | 'right' | null;
  turnSignalBlink: number;
}

export interface Pickup {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'nitro' | 'shield';
  collected: boolean;
  angle: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
}

export interface GameStats {
  score: number;
  distance: number; // in meters
  speed: number; // in km/h
  nitro: number; // 0 - 100%
  shieldActive: boolean;
  shieldTimeRemaining: number;
  multiplier: number;
  nearMissCount: number;
  coinsCollected: number;
  topSpeed: number;
  bestScore: number;
  bestDistance: number;
}

export interface InputState {
  steerLeft: boolean;
  steerRight: boolean;
  accelerate: boolean;
  brake: boolean;
  nitro: boolean;
}
