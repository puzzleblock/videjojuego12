import { BlockShape } from './types';

export const GRID_SIZE = 8;
export const CELL_GAP_PX = 4;

export const COLORS = [
  '#C10FF5', // Purple
  '#82F50F', // Lime Green
  '#0FDAF5', // Cyan
  '#F53D0F', // Red-Orange
  '#F50F1E', // Red
];

// Shapes represented as binary matrices
// We pre-define the specific shapes requested
const SHAPE_TEMPLATES = [
  // 1x1
  [[1]],
  
  // Bars
  [[1, 1]], [[1], [1]], // 2
  [[1, 1, 1]], [[1], [1], [1]], // 3
  [[1, 1, 1, 1]], [[1], [1], [1], [1]], // 4
  
  // Square 2x2
  [[1, 1], [1, 1]],
  
  // L Shapes (3 blocks)
  [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]],
  
  // T Shapes (3-4 blocks)
  // T3 (Small T is just 3 blocks? Usually T is 4, but prompt says T of 3 or 4)
  // Let's do standard Tetris T (4) and a corner T (3)
  [[1, 1, 1], [0, 1, 0]], // Classic T (4)
  [[0, 1, 0], [1, 1, 1]],
  [[0, 1], [1, 1], [0, 1]],
  [[1, 0], [1, 1], [1, 0]],
  
  // 3-block corner "T" lookalikes are essentially Ls, already covered.
];

export const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const generateRandomShape = (): BlockShape => {
  const matrix = SHAPE_TEMPLATES[Math.floor(Math.random() * SHAPE_TEMPLATES.length)];
  return {
    id: Math.random().toString(36).substr(2, 9),
    matrix: matrix,
    color: getRandomColor(),
  };
};

// For procedural generation
export const getSafeRandomBoard = (difficulty: string): string[][] => {
  // Initialize empty
  const grid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  
  let blockCount = 0;
  if (difficulty === 'EASY') blockCount = Math.floor(Math.random() * 6) + 10; // 10-15
  else if (difficulty === 'MEDIUM') blockCount = Math.floor(Math.random() * 10) + 16; // 16-25
  else blockCount = Math.floor(Math.random() * 5) + 26; // 26-30

  let placed = 0;
  let attempts = 0;

  while (placed < blockCount && attempts < 200) {
    attempts++;
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);

    if (grid[r][c] !== null) continue;

    // Tentatively place
    grid[r][c] = getRandomColor();

    // Check if this caused a line clear (Safety rule)
    let causesClear = false;
    
    // Check Row
    if (grid[r].every(cell => cell !== null)) causesClear = true;
    // Check Col
    if (!causesClear) {
      let colFilled = true;
      for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[i][c] === null) {
          colFilled = false;
          break;
        }
      }
      if (colFilled) causesClear = true;
    }

    if (causesClear) {
      // Revert
      grid[r][c] = null;
    } else {
      placed++;
    }
  }

  return grid;
};