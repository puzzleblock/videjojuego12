import React, { useRef, useEffect, useState } from 'react';
import { BlockShape } from '../types';
import { Block } from './Block';
import { createPortal } from 'react-dom';

interface DraggablePieceProps {
  piece: BlockShape;
  onDrop: (piece: BlockShape, x: number, y: number) => boolean; // returns true if success
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece, onDrop }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.6); // Mini in hand, 1.0 when dragging

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate offset so we grab exactly where we clicked/touched
    // We want the piece to be centered under finger for better visibility usually,
    // but preserving relative grab point feels more natural for precision.
    // However, on mobile, your finger covers the piece. Let's offset Y slightly up.
    
    const clientX = e.clientX;
    const clientY = e.clientY;

    setTouchOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    
    setPosition({ x: clientX, y: clientY });
    setIsDragging(true);
    setScale(1.0); // Grow to full size
    
    // Capture pointer to ensure we get events outside the div
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    setScale(0.6);
    (e.target as Element).releasePointerCapture(e.pointerId);

    // Hit Testing logic
    // We use document.elementFromPoint to find which grid cell is under the finger/pointer
    // We adjust by an offset because usually the user drops the "Center" of the piece or the top-left block
    
    // Let's check the point slightly above the finger to account for "seeing what you drop"
    const dropX = e.clientX;
    const dropY = e.clientY - 50; // Look 50px above finger

    // Find the element under the pointer
    const elements = document.elementsFromPoint(dropX, dropY);
    const cellElement = elements.find(el => el.hasAttribute('data-grid-cell'));
    
    if (cellElement) {
      const r = parseInt(cellElement.getAttribute('data-row') || '-1');
      const c = parseInt(cellElement.getAttribute('data-col') || '-1');
      
      if (r !== -1 && c !== -1) {
         // The user dropped on cell (r, c). 
         // However, the piece has a shape. We need to decide which block of the shape lands on (r,c).
         // To simplify, we assume the user is "aiming" with the approximate center of the piece.
         // A more robust way is to calculate the top-left of the piece relative to the grid.
         
         // Let's try to map the top-left of the dragged element to the grid.
         const pieceRect = ref.current?.getBoundingClientRect(); // This is the 'original' element, not the portal one.
         // Actually, relying on the 'center' drop point is usually enough for block puzzles if we snap correctly.
         
         // Let's assume the user is dropping the "first non-empty block" of the matrix onto the target cell
         // Or calculating the top-left based on touch offset.
         
         // Center of the drag view
         const draggedEl = document.getElementById(`drag-ghost-${piece.id}`);
         if (draggedEl) {
            const ghostRect = draggedEl.getBoundingClientRect();
            // Find cell closest to top-left of ghost
            const topLeftX = ghostRect.left + (ghostRect.width / piece.matrix[0].length) / 2;
            const topLeftY = ghostRect.top + (ghostRect.height / piece.matrix.length) / 2;
            
            const targetEls = document.elementsFromPoint(topLeftX, topLeftY);
            const targetCell = targetEls.find(el => el.hasAttribute('data-grid-cell'));
            
            if (targetCell) {
               const targetR = parseInt(targetCell.getAttribute('data-row') || '0');
               const targetC = parseInt(targetCell.getAttribute('data-col') || '0');
               onDrop(piece, targetR, targetC);
               return;
            }
         }
      }
    }
  };

  // The static display in the hand
  const staticRender = (
    <div 
      ref={ref}
      onPointerDown={handlePointerDown}
      className="touch-none relative cursor-grab active:cursor-grabbing transition-transform"
      style={{ 
        transform: `scale(0.6)`, // Always smaller in hand
        width: `${piece.matrix[0].length * 30}px`, // approximate size base
        height: `${piece.matrix.length * 30}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${piece.matrix[0].length}, 1fr)`,
        gridTemplateRows: `repeat(${piece.matrix.length}, 1fr)`,
        gap: '2px'
      }}
    >
      {piece.matrix.map((row, r) => 
        row.map((val, c) => (
          <div key={`${r}-${c}`} className="w-full h-full">
            {val === 1 ? <Block color={piece.color} /> : <div />}
          </div>
        ))
      )}
    </div>
  );

  // The dragging ghost (Portaled to body to escape overflow)
  const draggingRender = isDragging ? createPortal(
    <div 
      id={`drag-ghost-${piece.id}`}
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x - touchOffset.x,
        top: position.y - touchOffset.y - 80, // Lift it up nicely so finger doesn't obscure
        width: `${piece.matrix[0].length * 40}px`, // Match Grid Cell Size roughly (calc below)
        height: `${piece.matrix.length * 40}px`, // Assuming grid cell is ~40px on mobile
        display: 'grid',
        gridTemplateColumns: `repeat(${piece.matrix[0].length}, 1fr)`,
        gridTemplateRows: `repeat(${piece.matrix.length}, 1fr)`,
        gap: '4px' // Match grid gap
      }}
    >
      {piece.matrix.map((row, r) => 
        row.map((val, c) => (
          <div key={`${r}-${c}`} className="w-full h-full opacity-90">
             {val === 1 ? <Block color={piece.color} /> : <div />}
          </div>
        ))
      )}
    </div>,
    document.body
  ) : null;

  // Global event listeners for drag continuation/end
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove as any);
      window.addEventListener('pointerup', handlePointerUp as any);
    } else {
      window.removeEventListener('pointermove', handlePointerMove as any);
      window.removeEventListener('pointerup', handlePointerUp as any);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove as any);
      window.removeEventListener('pointerup', handlePointerUp as any);
    };
  }, [isDragging]);

  return (
    <>
      {staticRender}
      {draggingRender}
    </>
  );
};