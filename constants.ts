/**
 * Turbo Racer Mobile - Game Physics & Visual Constants
 */

export const GAME_CONSTANTS = {
  // Road dimensions
  LANE_COUNT: 4,
  LANE_WIDTH: 74,
  ROAD_SHOULDER: 24,

  // Speed physics (internal units)
  MIN_SPEED: 35, // km/h
  CRUISE_SPEED: 85, // km/h
  MAX_NORMAL_SPEED: 180, // km/h
  MAX_TURBO_SPEED: 245, // km/h
  ACCELERATION: 95, // km/h per sec
  BRAKING_RATE: 140, // km/h per sec
  NATURAL_DECEL: 30, // km/h per sec

  // Steering
  STEER_SPEED: 340, // px per sec
  LATERAL_FRICTION: 0.88,

  // Player dimensions
  PLAYER_WIDTH: 42,
  PLAYER_HEIGHT: 74,

  // Nitro
  NITRO_MAX: 100,
  NITRO_DEPLETION_RATE: 28, // % per sec
  NITRO_PASSIVE_RECHARGE: 2.5, // % per sec
  NITRO_PICKUP_AMOUNT: 35,

  // Near miss detection zone
  NEAR_MISS_DISTANCE_X: 62,
  NEAR_MISS_DISTANCE_Y: 82,

  // Traffic types specs
  TRAFFIC_TYPES: {
    sedan: {
      width: 42,
      height: 72,
      minSpeedOffset: -30,
      maxSpeedOffset: -10,
      colors: ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'],
      name: 'Sedan'
    },
    sports: {
      width: 44,
      height: 76,
      minSpeedOffset: -10,
      maxSpeedOffset: 15,
      colors: ['#ef4444', '#10b981', '#f97316', '#06b6d4'],
      name: 'Racer'
    },
    van: {
      width: 48,
      height: 84,
      minSpeedOffset: -40,
      maxSpeedOffset: -20,
      colors: ['#0284c7', '#d97706', '#475569'],
      name: 'Van'
    },
    truck: {
      width: 52,
      height: 120,
      minSpeedOffset: -55,
      maxSpeedOffset: -35,
      colors: ['#15803d', '#b45309', '#334155'],
      name: 'Semi Truck'
    }
  },

  // Color schemes for player car
  CAR_COLORS: {
    'crimson': {
      primary: '#e11d48',
      secondary: '#9f1239',
      highlight: '#fda4af',
      name: 'Crimson Fury'
    },
    'electric-blue': {
      primary: '#0ea5e9',
      secondary: '#0369a1',
      highlight: '#7dd3fc',
      name: 'Electric Blue'
    },
    'cyber-yellow': {
      primary: '#eab308',
      secondary: '#a16207',
      highlight: '#fef08a',
      name: 'Cyber Sun'
    },
    'emerald-green': {
      primary: '#10b981',
      secondary: '#047857',
      highlight: '#6ee7b7',
      name: 'Neon Emerald'
    },
    'neon-purple': {
      primary: '#a855f7',
      secondary: '#7e22ce',
      highlight: '#d8b4fe',
      name: 'Viper Violet'
    }
  }
};
