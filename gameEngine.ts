/**
 * Turbo Racer Mobile - Game Engine
 * 60fps decoupled simulation loop, physics, AI traffic, collision detection, and scoring.
 */

import { CarColor, FloatingText, GameStats, InputState, Particle, Pickup, SkidMark, Vehicle } from '../types/game';
import { GAME_CONSTANTS } from './constants';
import { GameRenderer } from './renderer';
import { sound } from '../services/sound';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (finalStats: GameStats) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;
  private callbacks: GameEngineCallbacks;

  // Running state
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number = 0;

  // Player state
  private playerX: number = 0;
  private playerY: number = 0;
  private playerVx: number = 0;
  private speed: number = GAME_CONSTANTS.CRUISE_SPEED;
  private nitro: number = 60;
  private isBoosting: boolean = false;
  private shieldActive: boolean = false;
  private shieldTimeRemaining: number = 0;
  private carColor: CarColor = 'crimson';

  // World & Scrolling
  private roadOffset: number = 0;
  private distance: number = 0; // meters
  private score: number = 0;
  private multiplier: number = 1;
  private nearMissCount: number = 0;
  private coinsCollected: number = 0;
  private topSpeed: number = GAME_CONSTANTS.CRUISE_SPEED;
  private bestScore: number = 0;
  private bestDistance: number = 0;

  // Entities
  private vehicles: Vehicle[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private skidMarks: SkidMark[] = [];
  private floatingTexts: FloatingText[] = [];

  // Spawners & Timers
  private spawnTimer: number = 0;
  private pickupTimer: number = 0;
  private vehicleIdCounter: number = 1;
  private pickupIdCounter: number = 1;
  private floatingTextCounter: number = 1;

  // Visual polish
  private screenShake: number = 0;
  private hitStopRemaining: number = 0;
  private passedVehicleIds: Set<number> = new Set();
  private nearMissLoggedIds: Set<number> = new Set();

  // Inputs
  private inputState: InputState = {
    steerLeft: false,
    steerRight: false,
    accelerate: false,
    brake: false,
    nitro: false
  };

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not supported');
    this.ctx = context;
    this.renderer = new GameRenderer(this.ctx);
    this.callbacks = callbacks;

    // Load saved high scores
    const savedBest = localStorage.getItem('turbo_racer_best_score');
    if (savedBest) this.bestScore = parseInt(savedBest, 10) || 0;

    const savedDist = localStorage.getItem('turbo_racer_best_distance');
    if (savedDist) this.bestDistance = parseInt(savedDist, 10) || 0;

    this.handleResize();
  }

  public setCarColor(color: CarColor) {
    this.carColor = color;
  }

  public handleResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    this.renderer.setDimensions(width, height);

    if (this.playerY === 0) {
      this.playerY = height * 0.78;
    } else {
      this.playerY = height * 0.78;
    }

    if (this.playerX === 0) {
      this.playerX = width / 2;
    }
  }

  public setInputs(inputs: Partial<InputState>) {
    this.inputState = { ...this.inputState, ...inputs };
  }

  public start() {
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    sound.startEngine();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
    sound.stopEngine();
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    sound.startEngine();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    cancelAnimationFrame(this.animFrameId);
    sound.stopEngine();
  }

  public reset() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.playerX = width / 2;
    this.playerY = height * 0.78;
    this.playerVx = 0;
    this.speed = GAME_CONSTANTS.CRUISE_SPEED;
    this.nitro = 60;
    this.isBoosting = false;
    this.shieldActive = false;
    this.shieldTimeRemaining = 0;

    this.distance = 0;
    this.score = 0;
    this.multiplier = 1;
    this.nearMissCount = 0;
    this.coinsCollected = 0;
    this.topSpeed = GAME_CONSTANTS.CRUISE_SPEED;

    this.vehicles = [];
    this.pickups = [];
    this.particles = [];
    this.skidMarks = [];
    this.floatingTexts = [];
    this.passedVehicleIds.clear();
    this.nearMissLoggedIds.clear();

    this.spawnTimer = 0.5; // Initial delay
    this.pickupTimer = 2.0;
    this.screenShake = 0;
    this.hitStopRemaining = 0;
  }

  private loop = (timestamp: number) => {
    if (!this.isRunning || this.isPaused) return;

    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling

    // Hitstop logic (simulation freeze on impact)
    if (this.hitStopRemaining > 0) {
      this.hitStopRemaining -= dt;
      this.render();
      this.animFrameId = requestAnimationFrame(this.loop);
      return;
    }

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const cfg = this.renderer.getRoadConfig();

    // 1. NITRO LOGIC
    if (this.inputState.nitro && this.nitro > 0) {
      this.isBoosting = true;
      this.nitro = Math.max(0, this.nitro - GAME_CONSTANTS.NITRO_DEPLETION_RATE * dt);
      if (Math.random() < 0.4) {
        sound.playNitro();
      }
    } else {
      this.isBoosting = false;
      // Passive recharge
      this.nitro = Math.min(GAME_CONSTANTS.NITRO_MAX, this.nitro + GAME_CONSTANTS.NITRO_PASSIVE_RECHARGE * dt);
    }

    // 2. SPEED ACCELERATION / BRAKING
    const maxAllowedSpeed = this.isBoosting ? GAME_CONSTANTS.MAX_TURBO_SPEED : GAME_CONSTANTS.MAX_NORMAL_SPEED;

    if (this.inputState.accelerate || this.isBoosting) {
      const accelRate = this.isBoosting ? GAME_CONSTANTS.ACCELERATION * 1.6 : GAME_CONSTANTS.ACCELERATION;
      this.speed = Math.min(maxAllowedSpeed, this.speed + accelRate * dt);
    } else if (this.inputState.brake) {
      this.speed = Math.max(GAME_CONSTANTS.MIN_SPEED, this.speed - GAME_CONSTANTS.BRAKING_RATE * dt);
      if (Math.random() < 0.15 && this.speed > 70) {
        sound.playTireScreech();
      }
    } else {
      // Natural coasting towards CRUISE_SPEED
      if (this.speed > GAME_CONSTANTS.CRUISE_SPEED) {
        this.speed = Math.max(GAME_CONSTANTS.CRUISE_SPEED, this.speed - GAME_CONSTANTS.NATURAL_DECEL * dt);
      } else if (this.speed < GAME_CONSTANTS.CRUISE_SPEED) {
        this.speed = Math.min(GAME_CONSTANTS.CRUISE_SPEED, this.speed + GAME_CONSTANTS.NATURAL_DECEL * 0.8 * dt);
      }
    }

    if (this.speed > this.topSpeed) {
      this.topSpeed = Math.floor(this.speed);
    }

    // Update sound engine pitch
    const speedRatio = (this.speed - GAME_CONSTANTS.MIN_SPEED) / (GAME_CONSTANTS.MAX_TURBO_SPEED - GAME_CONSTANTS.MIN_SPEED);
    sound.updateEnginePitch(speedRatio, this.isBoosting);

    // 3. STEERING & LATERAL PHYSICS
    const steerInput = (this.inputState.steerRight ? 1 : 0) - (this.inputState.steerLeft ? 1 : 0);
    if (steerInput !== 0) {
      this.playerVx += steerInput * GAME_CONSTANTS.STEER_SPEED * dt * 4;
      if (Math.abs(this.playerVx) > GAME_CONSTANTS.STEER_SPEED) {
        this.playerVx = Math.sign(this.playerVx) * GAME_CONSTANTS.STEER_SPEED;
      }
      if (Math.abs(this.playerVx) > 260 && Math.random() < 0.1 && this.speed > 100) {
        sound.playTireScreech();
        this.addTireSmoke(this.playerX, this.playerY + GAME_CONSTANTS.PLAYER_HEIGHT / 2);
      }
    } else {
      this.playerVx *= GAME_CONSTANTS.LATERAL_FRICTION;
      if (Math.abs(this.playerVx) < 5) this.playerVx = 0;
    }

    this.playerX += this.playerVx * dt;

    // Road shoulder bounds constraint
    const minX = cfg.roadLeft - GAME_CONSTANTS.ROAD_SHOULDER + GAME_CONSTANTS.PLAYER_WIDTH / 2;
    const maxX = cfg.roadRight + GAME_CONSTANTS.ROAD_SHOULDER - GAME_CONSTANTS.PLAYER_WIDTH / 2;

    if (this.playerX < minX) {
      this.playerX = minX;
      this.playerVx = 0;
      this.speed = Math.max(GAME_CONSTANTS.MIN_SPEED, this.speed - 40 * dt);
      this.screenShake = 2;
    } else if (this.playerX > maxX) {
      this.playerX = maxX;
      this.playerVx = 0;
      this.speed = Math.max(GAME_CONSTANTS.MIN_SPEED, this.speed - 40 * dt);
      this.screenShake = 2;
    }

    // Road rumble if on the shoulder
    const onShoulder = this.playerX < cfg.roadLeft + 10 || this.playerX > cfg.roadRight - 10;
    if (onShoulder) {
      this.screenShake = Math.max(this.screenShake, 1.5);
      if (Math.random() < 0.2) {
        sound.triggerHaptic(10);
      }
    }

    // 4. DISTANCE & SCROLLING
    // Convert speed (km/h) to pixels scrolled
    // 100 km/h ~ 650 px/s
    const pxPerSec = (this.speed / 100) * 650;
    const scrollDelta = pxPerSec * dt;
    this.roadOffset += scrollDelta;

    const metersDelta = (this.speed * 1000 / 3600) * dt;
    this.distance += metersDelta;

    // Score accumulation: speed + distance multiplier
    const speedScoreBonus = Math.floor((this.speed / 50) * this.multiplier * 2);
    this.score += speedScoreBonus;

    // 5. SHIELD DURATION
    if (this.shieldActive) {
      this.shieldTimeRemaining -= dt;
      if (this.shieldTimeRemaining <= 0) {
        this.shieldActive = false;
      }
    }

    // 6. SCREEN SHAKE DECAY
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 8 * dt);
    }

    // 7. TRAFFIC SPAWNING
    this.updateTraffic(dt, pxPerSec, cfg);

    // 8. PICKUPS SPAWNING & COLLECTION
    this.updatePickups(dt, pxPerSec, cfg);

    // 9. PARTICLES & FLOATING TEXTS
    this.updateParticles(dt, scrollDelta);

    // 10. NOTIFY STATS
    this.callbacks.onStatsUpdate({
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      speed: Math.floor(this.speed),
      nitro: Math.floor(this.nitro),
      shieldActive: this.shieldActive,
      shieldTimeRemaining: Math.ceil(this.shieldTimeRemaining),
      multiplier: Number(this.multiplier.toFixed(1)),
      nearMissCount: this.nearMissCount,
      coinsCollected: this.coinsCollected,
      topSpeed: this.topSpeed,
      bestScore: Math.max(this.bestScore, Math.floor(this.score)),
      bestDistance: Math.max(this.bestDistance, Math.floor(this.distance))
    });
  }

  private updateTraffic(dt: number, playerPxPerSec: number, cfg: ReturnType<GameRenderer['getRoadConfig']>) {
    // Difficulty progression based on distance
    // Increase density and spawn frequency
    const difficultyLevel = Math.min(this.distance / 1200, 4); // 0 to 4
    const baseSpawnInterval = Math.max(0.7, 1.8 - difficultyLevel * 0.25);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = baseSpawnInterval + Math.random() * 0.6;
      this.spawnTrafficVehicle(cfg, difficultyLevel);
    }

    // Move existing traffic relative to player
    const toRemove: number[] = [];

    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];

      // Vehicle speed in px/s
      const vPxPerSec = (v.speed / 100) * 650;
      // Relative movement: downward if player is faster than enemy
      const relativeVy = playerPxPerSec - vPxPerSec;
      v.y += relativeVy * dt;

      // Lane-changing AI logic
      v.laneChangeTimer -= dt;
      if (v.laneChangeTimer <= 0 && !v.isChangingLane) {
        // Decide if it should change lane
        if (Math.random() < 0.35) {
          const possibleLanes: number[] = [];
          if (v.lane > 0) possibleLanes.push(v.lane - 1);
          if (v.lane < cfg.laneCount - 1) possibleLanes.push(v.lane + 1);

          if (possibleLanes.length > 0) {
            const nextLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
            v.targetLane = nextLane;
            v.turnSignal = nextLane > v.lane ? 'right' : 'left';
            v.isChangingLane = true;
            v.turnSignalBlink = 0;
            v.laneChangeTimer = 1.2; // Signal duration
          }
        } else {
          v.laneChangeTimer = 2.0 + Math.random() * 3.0;
        }
      }

      // Execute lane shift after turn signal blink
      if (v.isChangingLane) {
        v.turnSignalBlink += dt;
        const targetX = cfg.roadLeft + v.targetLane * cfg.laneWidth + cfg.laneWidth / 2;
        const dx = targetX - v.x;
        if (Math.abs(dx) > 1) {
          v.x += Math.sign(dx) * 45 * dt;
        } else {
          v.x = targetX;
          v.lane = v.targetLane;
          v.isChangingLane = false;
          v.turnSignal = null;
          v.laneChangeTimer = 3.0 + Math.random() * 4.0;
        }
      }

      // Collision detection with Player
      if (this.checkCollisionWithPlayer(v)) {
        if (this.shieldActive) {
          // Shield saves the player!
          this.shieldActive = false;
          this.triggerExplosion(v.x, v.y, '#34d399');
          this.screenShake = 6;
          sound.playCrash();
          this.addFloatingText(v.x, v.y, 'SHIELD BROKEN!', '#34d399');
          toRemove.push(i);
          continue;
        } else {
          // Crash game over!
          this.triggerCrashGameOver(v);
          return;
        }
      }

      // Near-miss check
      this.checkNearMiss(v);

      // Clean up off-screen vehicles
      const canvasHeight = this.canvas.getBoundingClientRect().height || window.innerHeight;
      if (v.y > canvasHeight + 200 || v.y < -300) {
        toRemove.push(i);
      }
    }

    // Remove deleted vehicles
    for (let j = toRemove.length - 1; j >= 0; j--) {
      this.vehicles.splice(toRemove[j], 1);
    }
  }

  private spawnTrafficVehicle(cfg: ReturnType<GameRenderer['getRoadConfig']>, difficultyLevel: number) {
    const lane = Math.floor(Math.random() * cfg.laneCount);
    const laneX = cfg.roadLeft + lane * cfg.laneWidth + cfg.laneWidth / 2;

    // Check if spawn lane is clear near top
    const isOccupied = this.vehicles.some(
      (v) => Math.abs(v.x - laneX) < cfg.laneWidth * 0.8 && v.y < 80
    );
    if (isOccupied) return;

    // Pick vehicle type
    const roll = Math.random();
    let type: Vehicle['type'] = 'sedan';
    if (roll < 0.25) type = 'sports';
    else if (roll < 0.55) type = 'sedan';
    else if (roll < 0.8) type = 'van';
    else type = 'truck';

    const spec = GAME_CONSTANTS.TRAFFIC_TYPES[type];
    const color = spec.colors[Math.floor(Math.random() * spec.colors.length)];

    // Speed: traffic cruises between 60 km/h and 120 km/h
    const baseSpeed = 75 + Math.random() * 25 + difficultyLevel * 8;
    const speed = Math.max(45, baseSpeed + spec.minSpeedOffset + Math.random() * (spec.maxSpeedOffset - spec.minSpeedOffset));

    this.vehicles.push({
      id: this.vehicleIdCounter++,
      x: laneX,
      y: -140,
      width: spec.width,
      height: spec.height,
      speed,
      type,
      color,
      lane,
      targetLane: lane,
      isChangingLane: false,
      laneChangeTimer: 2.5 + Math.random() * 3,
      turnSignal: null,
      turnSignalBlink: 0
    });
  }

  private updatePickups(dt: number, playerPxPerSec: number, cfg: ReturnType<GameRenderer['getRoadConfig']>) {
    this.pickupTimer -= dt;
    if (this.pickupTimer <= 0) {
      this.pickupTimer = 4.5 + Math.random() * 3.5;

      const lane = Math.floor(Math.random() * cfg.laneCount);
      const laneX = cfg.roadLeft + lane * cfg.laneWidth + cfg.laneWidth / 2;

      // Pick type: Coin (70%), Nitro (20%), Shield (10%)
      const r = Math.random();
      let type: Pickup['type'] = 'coin';
      if (r < 0.65) type = 'coin';
      else if (r < 0.88) type = 'nitro';
      else type = 'shield';

      this.pickups.push({
        id: this.pickupIdCounter++,
        x: laneX,
        y: -60,
        width: 24,
        height: 24,
        type,
        collected: false,
        angle: 0
      });
    }

    const canvasHeight = this.canvas.getBoundingClientRect().height || window.innerHeight;
    const toRemove: number[] = [];

    for (let i = 0; i < this.pickups.length; i++) {
      const p = this.pickups[i];
      p.angle += dt * 5;
      p.y += playerPxPerSec * dt;

      // Check collision with player
      const dx = Math.abs(p.x - this.playerX);
      const dy = Math.abs(p.y - this.playerY);

      if (dx < (GAME_CONSTANTS.PLAYER_WIDTH / 2 + p.width / 2) &&
          dy < (GAME_CONSTANTS.PLAYER_HEIGHT / 2 + p.height / 2)) {
        p.collected = true;

        if (p.type === 'coin') {
          this.coinsCollected++;
          this.score += 200 * this.multiplier;
          sound.playCoin();
          this.addFloatingText(p.x, p.y, `+${200 * this.multiplier}`, '#facc15');
        } else if (p.type === 'nitro') {
          this.nitro = Math.min(GAME_CONSTANTS.NITRO_MAX, this.nitro + GAME_CONSTANTS.NITRO_PICKUP_AMOUNT);
          sound.playNitro();
          this.addFloatingText(p.x, p.y, 'NITRO BOOST!', '#38bdf8');
        } else if (p.type === 'shield') {
          this.shieldActive = true;
          this.shieldTimeRemaining = 8; // 8 seconds of invulnerability
          sound.playCoin();
          this.addFloatingText(p.x, p.y, 'SHIELD READY!', '#34d399');
        }
        toRemove.push(i);
      } else if (p.y > canvasHeight + 100) {
        toRemove.push(i);
      }
    }

    for (let j = toRemove.length - 1; j >= 0; j--) {
      this.pickups.splice(toRemove[j], 1);
    }
  }

  private checkCollisionWithPlayer(v: Vehicle): boolean {
    // Inset collision box by 6px horizontally and 8px vertically for forgiving arcade responsiveness
    const pLeft = this.playerX - (GAME_CONSTANTS.PLAYER_WIDTH / 2) + 6;
    const pRight = this.playerX + (GAME_CONSTANTS.PLAYER_WIDTH / 2) - 6;
    const pTop = this.playerY - (GAME_CONSTANTS.PLAYER_HEIGHT / 2) + 8;
    const pBottom = this.playerY + (GAME_CONSTANTS.PLAYER_HEIGHT / 2) - 8;

    const vLeft = v.x - (v.width / 2) + 4;
    const vRight = v.x + (v.width / 2) - 4;
    const vTop = v.y - (v.height / 2) + 6;
    const vBottom = v.y + (v.height / 2) - 6;

    return !(pRight < vLeft || pLeft > vRight || pBottom < vTop || pTop > vBottom);
  }

  private checkNearMiss(v: Vehicle) {
    if (this.nearMissLoggedIds.has(v.id)) return;

    // Near miss occurs when player overtakes closely alongside an enemy vehicle
    const dx = Math.abs(this.playerX - v.x);
    const dy = Math.abs(this.playerY - v.y);

    const minX = (GAME_CONSTANTS.PLAYER_WIDTH / 2 + v.width / 2);
    const maxX = minX + 22; // within 22px margin
    const inYRange = dy < (GAME_CONSTANTS.PLAYER_HEIGHT / 2 + v.height / 2 + 10);

    if (dx >= minX && dx <= maxX && inYRange && this.speed > 80) {
      this.nearMissLoggedIds.add(v.id);
      this.nearMissCount++;
      const bonus = 250 * Math.floor(this.multiplier);
      this.score += bonus;
      this.multiplier = Math.min(5, this.multiplier + 0.2);

      sound.playNearMiss();
      this.addFloatingText(this.playerX, this.playerY - 40, `CLOSE CALL! +${bonus}`, '#38bdf8');
      this.screenShake = 3;
    }
  }

  private triggerCrashGameOver(v: Vehicle) {
    this.hitStopRemaining = 0.08; // 80ms hitstop
    this.screenShake = 16;
    sound.playCrash();

    // Spawn massive fiery debris
    this.triggerExplosion(this.playerX, this.playerY, '#ef4444');
    this.triggerExplosion(v.x, v.y, '#f59e0b');

    // Save best scores
    const finalScore = Math.floor(this.score);
    const finalDist = Math.floor(this.distance);

    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;
      localStorage.setItem('turbo_racer_best_score', String(finalScore));
    }
    if (finalDist > this.bestDistance) {
      this.bestDistance = finalDist;
      localStorage.setItem('turbo_racer_best_distance', String(finalDist));
    }

    setTimeout(() => {
      this.stop();
      this.callbacks.onGameOver({
        score: finalScore,
        distance: finalDist,
        speed: 0,
        nitro: Math.floor(this.nitro),
        shieldActive: false,
        shieldTimeRemaining: 0,
        multiplier: this.multiplier,
        nearMissCount: this.nearMissCount,
        coinsCollected: this.coinsCollected,
        topSpeed: this.topSpeed,
        bestScore: this.bestScore,
        bestDistance: this.bestDistance
      });
    }, 450);
  }

  private triggerExplosion(x: number, y: number, primaryColor: string) {
    const colors = [primaryColor, '#ef4444', '#f59e0b', '#fbbf24', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.5
      });
    }
  }

  private addTireSmoke(x: number, y: number) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 16,
      y,
      vx: (Math.random() - 0.5) * 20,
      vy: 10 + Math.random() * 30,
      size: 4 + Math.random() * 4,
      color: '#94a3b8',
      alpha: 0.5,
      life: 0,
      maxLife: 0.35
    });
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: this.floatingTextCounter++,
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0
    });
  }

  private updateParticles(dt: number, scrollDelta: number) {
    // Update and prune particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt + scrollDelta * 0.5; // Drag down with road motion
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life += dt;
      t.y -= 38 * dt; // Float upwards
      t.alpha = Math.max(0, 1 - t.life / 0.9);

      if (t.life >= 0.9) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private render() {
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    ctx.save();

    // Screen shake transform
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Environment & Road
    this.renderer.renderEnvironment(this.roadOffset, this.speed);

    // 2. Pickups
    this.renderer.renderPickups(this.pickups);

    // 3. Enemy Vehicles
    for (const v of this.vehicles) {
      this.renderer.renderVehicle(v);
    }

    // 4. Player Car
    const steerAngle = this.playerVx / GAME_CONSTANTS.STEER_SPEED;
    this.renderer.renderPlayerCar(
      this.playerX,
      this.playerY,
      this.carColor,
      this.inputState.brake,
      this.inputState.accelerate,
      this.isBoosting,
      steerAngle,
      this.shieldActive
    );

    // 5. Particles
    this.renderer.renderParticles(this.particles);

    // 6. Speed streaks when high speed
    this.renderer.renderSpeedLines(this.speed);

    // 7. Floating reward texts
    this.renderer.renderFloatingTexts(this.floatingTexts);

    ctx.restore();
  }
}
