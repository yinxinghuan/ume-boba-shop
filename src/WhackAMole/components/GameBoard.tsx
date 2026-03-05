import React, { forwardRef } from 'react';
import type { HoleState } from '../types';
import Hole from './Hole';
import './GameBoard.less';

export interface GameBoardProps {
  holes?: HoleState[];
  gridSize?: number;
  onWhack?: (index: number) => void;
}

const GameBoard = React.memo(
  forwardRef<HTMLDivElement, GameBoardProps>((props, ref) => {
    const { holes = [], gridSize = 3, onWhack } = props;

    return (
      <div
        className="wam-board"
        ref={ref}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {holes.map((hole, i) => (
          <Hole key={i} index={i} hole={hole} onWhack={onWhack} />
        ))}
      </div>
    );
  })
);

GameBoard.displayName = 'GameBoard';
export default GameBoard;
