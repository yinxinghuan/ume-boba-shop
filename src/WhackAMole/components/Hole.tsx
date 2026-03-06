import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { HoleState } from '../types';
import { t } from '../i18n';
import './Hole.less';

export interface HoleProps {
  index?: number;
  hole?: HoleState;
  onWhack?: (index: number) => void;
}

const defaultHole: HoleState = {
  isActive: false,
  character: null,
  isWhacked: false,
};

/** Number of whack lines per character */
const WHACK_LINE_COUNTS: Record<string, number> = {
  guitarist: 3,
  coder: 3,
  hacker: 3,
  ghost: 3,
};

const getRandomLine = (characterId: string): string => {
  const count = WHACK_LINE_COUNTS[characterId] ?? 1;
  const idx = Math.floor(Math.random() * count);
  return t(`whack.${characterId}.${idx}`);
};

interface FloatingEffect {
  id: number;
  line: string;
  points: number;
}

const FLOAT_DURATION = 1500;
let effectIdCounter = 0;

const Hole = React.memo(
  forwardRef<HTMLDivElement, HoleProps>((props, ref) => {
    const { index = 0, hole = defaultHole, onWhack } = props;
    const [floats, setFloats] = useState<FloatingEffect[]>([]);
    const prevWhackedRef = useRef(false);

    const handleTap = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (hole.isActive && !hole.isWhacked) {
          onWhack?.(index);
        }
      },
      [index, hole.isActive, hole.isWhacked, onWhack]
    );

    // Spawn a floating effect when whacked, independent of character lifecycle
    useEffect(() => {
      if (hole.isWhacked && !prevWhackedRef.current && hole.character) {
        const id = ++effectIdCounter;
        const effect: FloatingEffect = {
          id,
          line: getRandomLine(hole.character.id),
          points: hole.character.points,
        };
        setFloats((prev) => [...prev, effect]);

        const timer = window.setTimeout(() => {
          setFloats((prev) => prev.filter((f) => f.id !== id));
        }, FLOAT_DURATION);

        prevWhackedRef.current = true;
        return () => window.clearTimeout(timer);
      }
      if (!hole.isWhacked) {
        prevWhackedRef.current = false;
      }
    }, [hole.isWhacked, hole.character]);

    return (
      <div className={`wam-hole ${hole.isWhacked ? 'wam-hole--shaking' : ''}`} ref={ref}>
        {/* Dark hole behind everything */}
        <div className="wam-hole__pit" />
        {/* Character on top layer with gradient fade at bottom */}
        <div
          className={`wam-hole__character ${
            hole.isActive ? 'wam-hole__character--active' : ''
          } ${hole.isWhacked ? 'wam-hole__character--whacked' : ''}`}
          onTouchStart={handleTap}
          onMouseDown={handleTap}
        >
          {hole.character && (
            <>
              <img
                className="wam-hole__avatar"
                src={hole.character.image}
                alt={hole.character.name}
                draggable={false}
              />
              {hole.isWhacked && (
                <div className="wam-hole__burst" />
              )}
            </>
          )}
        </div>

        {/* Floating effects - independent of character lifecycle */}
        {floats.map((f) => (
          <div key={f.id} className="wam-hole__float">
            <div className="wam-hole__float-speech">{f.line}</div>
            <div
              className={`wam-hole__float-points ${
                f.points < 0 ? 'wam-hole__float-points--negative' : ''
              }`}
            >
              {f.points > 0 ? '+' : ''}{f.points}
            </div>
          </div>
        ))}
      </div>
    );
  })
);

Hole.displayName = 'Hole';
export default Hole;
