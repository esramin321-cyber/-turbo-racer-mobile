/**
 * Turbo Racer Mobile - Canvas Vector Renderer
 * High-performance, lightweight 2D graphics optimized for mobile displays.
 */

import { CarColor, FloatingText, Particle, Pickup, SkidMark, Vehicle } from '../types/game';
import { GAME_CONSTANTS } from './constants';

interface RoadConfig {
  roadLeft: number;
  roadRight: number;
  roadWidth: number;
  laneWidth: number;
  laneCount: number;
  centerX: number;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setDimensions(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public getRoadConfig(): RoadConfig {
    const laneCount = GAME_CONSTANTS.LANE_COUNT;
    const laneWidth = GAME_CONSTANTS.LANE_WIDTH;
    const roadWidth = laneCount * laneWidth;
    const centerX = this.canvasWidth / 2;
    const roadLeft = centerX - roadWidth / 2;
    const roadRight = centerX + roadWidth / 2;

    return {
      roadLeft,
      roadRight,
      roadWidth,
      laneWidth,
      laneCount,
      centerX
    };
  }

  // Clear and render background environment
  public renderEnvironment(roadOffset: number, speed: number) {
    const ctx = this.ctx;
    const cfg = this.getRoadConfig();

    // Side grass/desert verge
    ctx.fillStyle = '#0f172a'; // Deep slate roadside terrain
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Subtle roadside terrain texture / grid / terrain patterns
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridStep = 48;
    const offsetGridY = (roadOffset * 0.4) % gridStep;
    for (let y = -gridStep; y < this.canvasHeight + gridStep; y += gridStep) {
      const lineY = y + offsetGridY;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(cfg.roadLeft - GAME_CONSTANTS.ROAD_SHOULDER, lineY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cfg.roadRight + GAME_CONSTANTS.ROAD_SHOULDER, lineY);
      ctx.lineTo(this.canvasWidth, lineY);
      ctx.stroke();
    }

    // Roadside markers / lampposts
    const markerStep = 120;
    const markerOffsetY = (roadOffset * 0.8) % markerStep;
    for (let y = -markerStep; y < this.canvasHeight + markerStep; y += markerStep) {
      const my = y + markerOffsetY;
      // Left lamppost
      ctx.fillStyle = '#334155';
      ctx.fillRect(cfg.roadLeft - GAME_CONSTANTS.ROAD_SHOULDER - 14, my, 6, 6);
      ctx.fillStyle = speed > 100 ? '#38bdf8' : '#64748b';
      ctx.beginPath();
      ctx.arc(cfg.roadLeft - GAME_CONSTANTS.ROAD_SHOULDER - 11, my + 3, 3, 0, Math.PI * 2);
      ctx.fill();

      // Right lamppost
      ctx.fillStyle = '#334155';
      ctx.fillRect(cfg.roadRight + GAME_CONSTANTS.ROAD_SHOULDER + 8, my, 6, 6);
      ctx.fillStyle = speed > 100 ? '#38bdf8' : '#64748b';
      ctx.beginPath();
      ctx.arc(cfg.roadRight + GAME_CONSTANTS.ROAD_SHOULDER + 11, my + 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Road shoulders (gravel)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(
      cfg.roadLeft - GAME_CONSTANTS.ROAD_SHOULDER,
      0,
      GAME_CONSTANTS.ROAD_SHOULDER,
      this.canvasHeight
    );
    ctx.fillRect(
      cfg.roadRight,
      0,
      GAME_CONSTANTS.ROAD_SHOULDER,
      this.canvasHeight
    );

    // Rumble strips (red & white curbs)
    const curbStep = 32;
    const curbOffsetY = (roadOffset * 0.9) % (curbStep * 2);
    for (let y = -curbStep * 2; y < this.canvasHeight + curbStep * 2; y += curbStep) {
      const cy = y + curbOffsetY;
      const isRed = Math.floor((y - curbOffsetY) / curbStep) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc';

      // Left curb
      ctx.fillRect(cfg.roadLeft - 6, cy, 6, curbStep);
      // Right curb
      ctx.fillRect(cfg.roadRight, cy, 6, curbStep);
    }

    // Main asphalt road
    const asphaltGrad = ctx.createLinearGradient(cfg.roadLeft, 0, cfg.roadRight, 0);
    asphaltGrad.addColorStop(0, '#131b2c');
    asphaltGrad.addColorStop(0.5, '#1e2738');
    asphaltGrad.addColorStop(1, '#131b2c');
    ctx.fillStyle = asphaltGrad;
    ctx.fillRect(cfg.roadLeft, 0, cfg.roadWidth, this.canvasHeight);

    // Solid outer road boundaries (yellow/white)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cfg.roadLeft, 0, 3, this.canvasHeight);
    ctx.fillRect(cfg.roadRight - 3, 0, 3, this.canvasHeight);

    // Dashed lane dividers
    const dashLength = 36;
    const gapLength = 28;
    const totalDash = dashLength + gapLength;
    const dashOffsetY = roadOffset % totalDash;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.setLineDash([dashLength, gapLength]);
    ctx.lineDashOffset = -dashOffsetY;

    for (let i = 1; i < cfg.laneCount; i++) {
      const laneX = cfg.roadLeft + i * cfg.laneWidth;
      ctx.beginPath();
      ctx.moveTo(laneX, 0);
      ctx.lineTo(laneX, this.canvasHeight);
      ctx.stroke();
    }
    ctx.setLineDash([]); // Reset line dash
  }

  // Render skid marks left on the tarmac
  public renderSkidMarks(skidMarks: SkidMark[]) {
    const ctx = this.ctx;
    ctx.lineWidth = 3;
    for (const sm of skidMarks) {
      ctx.strokeStyle = `rgba(15, 23, 42, ${sm.alpha * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(sm.x1, sm.y1);
      ctx.lineTo(sm.x2, sm.y2);
      ctx.stroke();
    }
  }

  // Render pickups (Coins, Nitro, Shield)
  public renderPickups(pickups: Pickup[]) {
    const ctx = this.ctx;

    for (const p of pickups) {
      if (p.collected) continue;
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'coin') {
        // Rotating gold coin
        const scaleX = Math.cos(p.angle);
        ctx.scale(Math.abs(scaleX) < 0.2 ? 0.2 : scaleX, 1);

        // Glow ring
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.fill();

        // Coin outer rim
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#eab308';
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner star
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1);
      } else if (p.type === 'nitro') {
        // Nitro canister
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.fill();

        // Bottle shape
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-7, -11, 14, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-5, -9, 10, 18);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(-3, -14, 6, 4);

        // Bolt symbol
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(2, -5);
        ctx.lineTo(-3, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(-2, 5);
        ctx.lineTo(3, -1);
        ctx.lineTo(0, -1);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'shield') {
        // Shield pickup
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Render player car with aerodynamic features, headlights, taillights, spoiler
  public renderPlayerCar(
    x: number,
    y: number,
    colorSchemeKey: CarColor,
    isBraking: boolean,
    isAccelerating: boolean,
    isNitro: boolean,
    steerAngle: number,
    shieldActive: boolean
  ) {
    const ctx = this.ctx;
    const colors = GAME_CONSTANTS.CAR_COLORS[colorSchemeKey] || GAME_CONSTANTS.CAR_COLORS['crimson'];
    const w = GAME_CONSTANTS.PLAYER_WIDTH;
    const h = GAME_CONSTANTS.PLAYER_HEIGHT;

    ctx.save();
    ctx.translate(x, y);

    // Subtle bank/tilt angle when steering
    const tilt = steerAngle * 0.12;
    ctx.rotate(tilt);

    // Headlight light beams projected onto road ahead
    const beamGrad = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 - 170);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = beamGrad;
    // Left beam
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 6, -h / 2);
    ctx.lineTo(-w / 2 - 25, -h / 2 - 170);
    ctx.lineTo(-w / 2 + 15, -h / 2 - 170);
    ctx.lineTo(-w / 2 + 12, -h / 2);
    ctx.closePath();
    ctx.fill();

    // Right beam
    ctx.beginPath();
    ctx.moveTo(w / 2 - 12, -h / 2);
    ctx.lineTo(w / 2 - 15, -h / 2 - 170);
    ctx.lineTo(w / 2 + 25, -h / 2 - 170);
    ctx.lineTo(w / 2 - 6, -h / 2);
    ctx.closePath();
    ctx.fill();

    // Exhaust flames when accelerating or boosting
    if (isNitro || isAccelerating) {
      const flameLength = isNitro ? 28 + Math.random() * 12 : 12 + Math.random() * 8;
      const flameColor = isNitro ? '#38bdf8' : '#f97316';
      const innerColor = isNitro ? '#ffffff' : '#fef08a';

      // Left exhaust
      ctx.fillStyle = flameColor;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 9, h / 2);
      ctx.lineTo(-w / 2 + 13, h / 2);
      ctx.lineTo(-w / 2 + 11, h / 2 + flameLength);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = innerColor;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 10, h / 2);
      ctx.lineTo(-w / 2 + 12, h / 2);
      ctx.lineTo(-w / 2 + 11, h / 2 + flameLength * 0.5);
      ctx.closePath();
      ctx.fill();

      // Right exhaust
      ctx.fillStyle = flameColor;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 13, h / 2);
      ctx.lineTo(w / 2 - 9, h / 2);
      ctx.lineTo(w / 2 - 11, h / 2 + flameLength);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = innerColor;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 12, h / 2);
      ctx.lineTo(w / 2 - 10, h / 2);
      ctx.lineTo(w / 2 - 11, h / 2 + flameLength * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 4, w / 2 + 3, h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front animated wheels (angled according to steering)
    const wheelAngle = steerAngle * 0.35;
    const wheelW = 6;
    const wheelH = 14;

    // Front left wheel
    ctx.save();
    ctx.translate(-w / 2 - 1, -h / 2 + 16);
    ctx.rotate(wheelAngle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-wheelW / 2, -wheelH / 2, wheelW, wheelH);
    ctx.restore();

    // Front right wheel
    ctx.save();
    ctx.translate(w / 2 + 1, -h / 2 + 16);
    ctx.rotate(wheelAngle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-wheelW / 2, -wheelH / 2, wheelW, wheelH);
    ctx.restore();

    // Rear fixed wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w / 2 - 4, h / 2 - 24, wheelW, wheelH);
    ctx.fillRect(w / 2 - 2, h / 2 - 24, wheelW, wheelH);

    // Car main chassis
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    // Rounded nose
    ctx.moveTo(-w / 2 + 8, -h / 2);
    ctx.quadraticCurveTo(0, -h / 2 - 4, w / 2 - 8, -h / 2);
    // Right side aero taper
    ctx.lineTo(w / 2 - 2, -h / 2 + 18);
    ctx.lineTo(w / 2, h / 2 - 10);
    ctx.lineTo(w / 2 - 4, h / 2);
    // Rear
    ctx.lineTo(-w / 2 + 4, h / 2);
    ctx.lineTo(-w / 2, h / 2 - 10);
    ctx.lineTo(-w / 2 + 2, -h / 2 + 18);
    ctx.closePath();
    ctx.fill();

    // Body contour side shades
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-w / 2 + 3, -h / 2 + 15, 4, h - 25);
    ctx.fillRect(w / 2 - 7, -h / 2 + 15, 4, h - 25);

    // Center dual racing stripes
    ctx.fillStyle = colors.highlight;
    ctx.fillRect(-4, -h / 2 + 2, 3, h - 10);
    ctx.fillRect(1, -h / 2 + 2, 3, h - 10);

    // Cockpit windshield & tinted glass
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, -h / 2 + 18);
    ctx.lineTo(w / 2 - 8, -h / 2 + 18);
    ctx.lineTo(w / 2 - 9, h / 2 - 22);
    ctx.lineTo(-w / 2 + 9, h / 2 - 22);
    ctx.closePath();
    ctx.fill();

    // Front windshield glass highlight
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 9, -h / 2 + 20);
    ctx.lineTo(w / 2 - 9, -h / 2 + 20);
    ctx.lineTo(w / 2 - 11, -h / 2 + 30);
    ctx.lineTo(-w / 2 + 11, -h / 2 + 30);
    ctx.closePath();
    ctx.fill();

    // Glass glare reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 11, -h / 2 + 22);
    ctx.lineTo(-w / 2 + 14, -h / 2 + 22);
    ctx.lineTo(-w / 2 + 12, h / 2 - 25);
    ctx.lineTo(-w / 2 + 9, h / 2 - 25);
    ctx.closePath();
    ctx.fill();

    // Rear spoiler
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-w / 2 + 2, h / 2 - 6, w - 4, 6);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(-w / 2 + 1, h / 2 - 7, w - 2, 3);

    // Headlights (LED clusters)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-w / 2 + 6, -h / 2 + 1, 6, 3);
    ctx.fillRect(w / 2 - 12, -h / 2 + 1, 6, 3);

    // Taillights
    const tailColor = isBraking ? '#ef4444' : '#991b1b';
    ctx.fillStyle = tailColor;
    ctx.fillRect(-w / 2 + 5, h / 2 - 2, 7, 3);
    ctx.fillRect(w / 2 - 12, h / 2 - 2, 7, 3);

    if (isBraking) {
      // Taillight glow bloom
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(-w / 2 + 8, h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2 - 8, h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield protective energy sphere
    if (shieldActive) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(w, h) / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.fill();
    }

    ctx.restore();
  }

  // Render enemy vehicles (Sedan, Sports, Van, Truck)
  public renderVehicle(v: Vehicle) {
    const ctx = this.ctx;
    const w = v.width;
    const h = v.height;

    ctx.save();
    ctx.translate(v.x, v.y);

    // Vehicle drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 2, w / 2 + 2, h / 2 + 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Render by type
    if (v.type === 'truck') {
      // Long semi truck
      // Cab (front)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w / 2 + 4, -h / 2, w - 8, 28);

      // Windshield
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, 10);

      // Cargo Container (rear)
      ctx.fillStyle = v.color;
      ctx.fillRect(-w / 2 + 2, -h / 2 + 28, w - 4, h - 32);

      // Container roof ridges
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let y = -h / 2 + 34; y < h / 2 - 10; y += 12) {
        ctx.fillRect(-w / 2 + 5, y, w - 10, 2);
      }

      // Wheels (6 sets)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 8, 4, 12);
      ctx.fillRect(w / 2 - 2, -h / 2 + 8, 4, 12);
      ctx.fillRect(-w / 2 - 2, h / 2 - 34, 4, 12);
      ctx.fillRect(w / 2 - 2, h / 2 - 34, 4, 12);
      ctx.fillRect(-w / 2 - 2, h / 2 - 18, 4, 12);
      ctx.fillRect(w / 2 - 2, h / 2 - 18, 4, 12);
    } else if (v.type === 'van') {
      // Delivery van
      ctx.fillStyle = v.color;
      ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, h);

      // Front windshield
      ctx.fillStyle = '#334155';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 6, w - 8, 12);

      // Roof ridges
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(-w / 2 + 6, -h / 2 + 24, w - 12, h - 34);

      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 10, 4, 12);
      ctx.fillRect(w / 2 - 2, -h / 2 + 10, 4, 12);
      ctx.fillRect(-w / 2 - 2, h / 2 - 20, 4, 12);
      ctx.fillRect(w / 2 - 2, h / 2 - 20, 4, 12);
    } else if (v.type === 'sports') {
      // Sports car
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 6, -h / 2);
      ctx.lineTo(w / 2 - 6, -h / 2);
      ctx.lineTo(w / 2, h / 2 - 8);
      ctx.lineTo(-w / 2, h / 2 - 8);
      ctx.closePath();
      ctx.fill();

      // Racing stripe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -h / 2 + 2, 4, h - 14);

      // Cockpit
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 + 6, -h / 2 + 14, w - 12, h - 32);

      // Rear wing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w / 2 + 2, h / 2 - 6, w - 4, 5);

      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 12, 4, 12);
      ctx.fillRect(w / 2 - 2, -h / 2 + 12, 4, 12);
      ctx.fillRect(-w / 2 - 2, h / 2 - 22, 4, 12);
      ctx.fillRect(w / 2 - 2, h / 2 - 22, 4, 12);
    } else {
      // Standard sedan
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 2, -h / 2, w - 4, h, 6);
      ctx.fill();

      // Front & Rear Glass
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w / 2 + 5, -h / 2 + 10, w - 10, 10);
      ctx.fillRect(-w / 2 + 5, h / 2 - 18, w - 10, 8);

      // Roof
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(-w / 2 + 5, -h / 2 + 20, w - 10, h - 38);

      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 10, 4, 12);
      ctx.fillRect(w / 2 - 2, -h / 2 + 10, 4, 12);
      ctx.fillRect(-w / 2 - 2, h / 2 - 20, 4, 12);
      ctx.fillRect(w / 2 - 2, h / 2 - 20, 4, 12);
    }

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 1, 5, 3);
    ctx.fillRect(w / 2 - 9, -h / 2 + 1, 5, 3);

    // Taillights
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-w / 2 + 4, h / 2 - 3, 5, 3);
    ctx.fillRect(w / 2 - 9, h / 2 - 3, 5, 3);

    // Turn signal telegraph flasher
    if (v.turnSignal && Math.sin(v.turnSignalBlink * 14) > 0) {
      ctx.fillStyle = '#f59e0b';
      const sigX = v.turnSignal === 'left' ? -w / 2 - 3 : w / 2 - 1;

      // Front flasher
      ctx.fillRect(sigX, -h / 2 + 4, 4, 4);
      // Rear flasher
      ctx.fillRect(sigX, h / 2 - 8, 4, 4);

      // Glow circle
      ctx.beginPath();
      ctx.arc(sigX + 2, -h / 2 + 6, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.fill();
    }

    ctx.restore();
  }

  // Render dynamic particle effects (smoke, fire, debris)
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Render floating reward text ("+250 CLOSE CALL!", "+500 NITRO")
  public renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    for (const t of texts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  // High-speed visual streaks
  public renderSpeedLines(speed: number) {
    if (speed < 130) return;
    const ctx = this.ctx;
    const intensity = Math.min((speed - 130) / 100, 1);
    const count = Math.floor(intensity * 12);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < count; i++) {
      const x = Math.random() < 0.5
        ? Math.random() * (this.canvasWidth * 0.2)
        : this.canvasWidth * 0.8 + Math.random() * (this.canvasWidth * 0.2);
      const y = Math.random() * this.canvasHeight;
      const len = 30 + Math.random() * 80;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + len);
      ctx.stroke();
    }
  }
}
