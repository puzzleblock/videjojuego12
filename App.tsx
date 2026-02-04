import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Difficulty, BlockShape, GridData } from './types';
import { GRID_SIZE, CELL_GAP_PX, generateRandomShape, getSafeRandomBoard } from './constants';
import { canPlacePiece, placePiece, getCompletedLines, clearBoardLines, checkGameOver } from './utils/gameLogic';
import { initAudio, playPlaceSound, playClearSound, playGameOverSound, playButtonSound } from './utils/sound';
import { Menu } from './components/Menu';
import { Block } from './components/Block';
import { DraggablePiece } from './components/DraggablePiece';

// Initial dummy state
const INITIAL_STATE: GameState = {
  score: 0,
  highScore: parseInt(localStorage.getItem('spb_highscore') || '0'),
  grid: Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(null)),
  hand: [],
  gameOver: false,
  screen: 'MENU',
  clearingLines: null,
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  
  // Need to ensure the grid cell size is calculated for consistent visuals
  // We handle this via CSS/Tailwind responsiveness, but logic assumes grid layout.

  const startGame = (difficulty: Difficulty) => {
    initAudio(); // Initialize audio context on user gesture
    const initialGrid = getSafeRandomBoard(difficulty);
    const initialHand = [generateRandomShape(), generateRandomShape(), generateRandomShape()];
    
    setState(prev => ({
      ...prev,
      score: 0,
      grid: initialGrid,
      hand: initialHand,
      gameOver: false,
      screen: 'GAME',
      clearingLines: null
    }));
  };

  const goHome = () => {
    playButtonSound();
    setState(prev => ({ ...prev, screen: 'MENU' }));
  };

  const handleDrop = useCallback((piece: BlockShape, r: number, c: number) => {
    // Prevent interaction during animation
    if (state.clearingLines) return false;

    // 1. Validate
    if (canPlacePiece(state.grid, piece, r, c)) {
      // 2. Place on temp grid
      let newGrid = placePiece(state.grid, piece, r, c);
      
      // 3. Base Score (block placement)
      let points = piece.matrix.flat().filter(x => x === 1).length;
      
      // 4. Check for Lines
      const { rows, cols } = getCompletedLines(newGrid);
      const linesCleared = rows.length + cols.length;
      
      // 5. Update Hand Logic
      const newHand = state.hand.map(p => (p?.id === piece.id ? null : p));
      let nextHand = newHand;
      if (newHand.every(p => p === null)) {
        nextHand = [generateRandomShape(), generateRandomShape(), generateRandomShape()];
      }

      const finishTurn = (finalGrid: GridData, addedPoints: number) => {
         const newScore = state.score + addedPoints;
         const newHighScore = Math.max(newScore, state.highScore);
         localStorage.setItem('spb_highscore', newHighScore.toString());
         
         const isOver = checkGameOver(finalGrid, nextHand);
         if (isOver) playGameOverSound();

         setState(prev => ({
            ...prev,
            grid: finalGrid,
            score: newScore,
            highScore: newHighScore,
            hand: nextHand,
            gameOver: isOver,
            clearingLines: null
         }));
      };

      if (linesCleared > 0) {
        // --- ANIMATION PATH ---
        points += linesCleared * 100;
        playClearSound(linesCleared);

        // Set state to "Animating" state (shows full grid + clearing flag)
        setState(prev => ({
          ...prev,
          grid: newGrid,
          hand: nextHand, // Update hand immediately so user sees new pieces (but can't drag yet due to clearingLines check)
          clearingLines: { rows, cols }
        }));

        // Wait for animation then finalize
        setTimeout(() => {
           const finalGrid = clearBoardLines(newGrid, { rows, cols });
           finishTurn(finalGrid, points);
        }, 300); // Match animation duration

      } else {
        // --- INSTANT PATH ---
        playPlaceSound();
        finishTurn(newGrid, points);
      }

      return true;
    }
    return false;
  }, [state.grid, state.hand, state.score, state.highScore, state.clearingLines]);

  // Handle Game Over modal locally or just show an overlay
  const resetGame = () => {
    playButtonSound();
    setState(prev => ({ ...prev, screen: 'MENU' }));
  };

  return (
    <div className="w-full h-full flex flex-col items-center relative font-sans">
      <Menu isVisible={state.screen === 'MENU'} onStart={startGame} />

      {/* Main Game Interface */}
      <div className={`w-full h-full flex flex-col items-center justify-between py-4 px-2 max-w-lg ${state.screen === 'MENU' ? 'hidden' : 'flex'}`}>
        
        {/* Header: Home, Scores */}
        <div className="w-full flex justify-between items-center mb-4">
          <button 
            onClick={goHome}
            className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-2xl active:scale-95 transition-transform"
          >
            🏠
          </button>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center bg-black/10 rounded px-3 py-1">
              <span className="text-xs font-bold opacity-70">SCORE</span>
              <span className="text-xl font-bold">{state.score}</span>
            </div>
            <div className="flex flex-col items-center bg-black/10 rounded px-3 py-1">
               <span className="text-xs font-bold opacity-70 flex items-center gap-1">
                 BEST 👑
               </span>
               <span className="text-xl font-bold">{state.highScore}</span>
            </div>
          </div>
        </div>

        {/* Board Container */}
        <div className="w-full aspect-square p-2 bg-black/5 rounded-xl">
           <div 
             className="w-full h-full grid grid-rows-8 grid-cols-8 relative"
             style={{ gap: `${CELL_GAP_PX}px` }}
           >
             {state.grid.map((row, r) => 
               row.map((cellColor, c) => {
                 const isClearing = state.clearingLines && (
                   state.clearingLines.rows.includes(r) ||
                   state.clearingLines.cols.includes(c)
                 );
                 return (
                   <div
                     key={`${r}-${c}`}
                     data-grid-cell="true"
                     data-row={r}
                     data-col={c}
                     className={`w-full h-full relative ${isClearing ? 'animate-flash-shrink z-10' : ''}`}
                   >
                     <Block color={cellColor} />
                   </div>
                 );
               })
             )}
             
             {/* Game Over Overlay */}
             {state.gameOver && (
                <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                  <h2 className="text-4xl font-bold text-white mb-2">GAME OVER</h2>
                  <p className="text-xl text-gray-300 mb-6">Score: {state.score}</p>
                  <button 
                    onClick={resetGame}
                    className="px-8 py-3 bg-gameBg text-black font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    Try Again
                  </button>
                </div>
             )}
           </div>
        </div>

        {/* Hand / Pieces Area */}
        <div className="w-full flex-1 flex items-center justify-center mt-4">
           <div className="flex items-center justify-around w-full h-32">
             {state.hand.map((piece, idx) => (
               <div key={idx} className="w-1/3 flex items-center justify-center h-full">
                 {piece && !state.gameOver && (
                   <div className={state.clearingLines ? 'opacity-50 pointer-events-none' : ''}>
                     <DraggablePiece 
                       piece={piece} 
                       onDrop={handleDrop} 
                     />
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;