export type CellData = string | null; // Hex color string or null if empty
export type GridData = CellData[][];

export interface Coordinate {
  x: number;
  y: number;
}

export interface BlockShape {
  id: string; // Unique ID for React keys
  matrix: number[][]; // 1 for block, 0 for empty space
  color: string;
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface GameState {
  score: number;
  highScore: number;
  grid: GridData;
  hand: (BlockShape | null)[]; // 3 slots, null means used
  gameOver: boolean;
  screen: 'MENU' | 'GAME';
  clearingLines: { rows: number[], cols: number[] } | null;
}