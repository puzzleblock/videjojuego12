import { GridData, BlockShape } from '../types';
import { GRID_SIZE } from '../constants';

export const canPlacePiece = (grid: GridData, piece: BlockShape, startRow: number, startCol: number): boolean => {
  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (piece.matrix[r][c] === 1) {
        const targetRow = startRow + r;
        const targetCol = startCol + c;

        // Out of bounds
        if (targetRow < 0 || targetRow >= GRID_SIZE || targetCol < 0 || targetCol >= GRID_SIZE) {
          return false;
        }

        // Already occupied
        if (grid[targetRow][targetCol] !== null) {
          return false;
        }
      }
    }
  }
  return true;
};

export const placePiece = (grid: GridData, piece: BlockShape, startRow: number, startCol: number): GridData => {
  const newGrid = grid.map(row => [...row]);
  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (piece.matrix[r][c] === 1) {
        newGrid[startRow + r][startCol + c] = piece.color;
      }
    }
  }
  return newGrid;
};

export const getCompletedLines = (grid: GridData): { rows: number[], cols: number[] } => {
  const rows: number[] = [];
  const cols: number[] = [];

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every(cell => cell !== null)) {
      rows.push(r);
    }
  }

  // Check cols
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) cols.push(c);
  }

  return { rows, cols };
};

export const clearBoardLines = (grid: GridData, lines: { rows: number[], cols: number[] }): GridData => {
  let newGrid = grid.map(row => [...row]);
  
  if (lines.rows.length > 0 || lines.cols.length > 0) {
    // Clear rows
    lines.rows.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) {
        newGrid[r][c] = null;
      }
    });
    // Clear cols
    lines.cols.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = null;
      }
    });
  }
  return newGrid;
};

export const checkGameOver = (grid: GridData, hand: (BlockShape | null)[]): boolean => {
  // If hand is empty (or all used), it's not game over (it will refill)
  const availablePieces = hand.filter(p => p !== null) as BlockShape[];
  if (availablePieces.length === 0) return false;

  // Brute force check: Can ANY piece fit ANYWHERE?
  for (const piece of availablePieces) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(grid, piece, r, c)) {
          return false; // Found a spot
        }
      }
    }
  }
  return true; // No spots found for any piece
};