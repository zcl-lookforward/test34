import { ShapeType } from './types';

export const PARTICLE_COUNT = 18000;

// Blue-centric palette: Deep Blue, Royal Blue, Cyan, Ice Blue, White
export const PALETTE = [
  '#020b1a', // Midnight
  '#0b1e45', // Dark Blue
  '#1e40af', // Royal Blue
  '#3b82f6', // Blue
  '#60a5fa', // Light Blue
  '#93c5fd', // Ice
  '#e0f2fe', // Mist
  '#ffffff'  // Star white
];

export const ANIMATION_SPEED = 0.08; // Lerp factor

export const SEQUENCE = [
  ShapeType.TREE,
  ShapeType.EXPLOSION_1,
  ShapeType.HEART,
  ShapeType.EXPLOSION_2,
  ShapeType.GALAXY,
  ShapeType.EXPLOSION_3
];