import React, { forwardRef, useCallback, useMemo } from 'react';
import type { HoleState } from '../types';
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

/** Character-specific whack lines */
const WHACK_LINES: Record<string, string[]> = {
  guitarist: ['我的吉他！', '走音了！', '别碰琴弦！'],
  coder: ['咖啡洒了！', '代码没保存！', 'Bug警告！'],
  hacker: ['眼镜歪了！', '防火墙破了！', '系统崩溃！'],
  ghost: ['嘻嘻~扣分！', '中计啦！', '抓到我啦~'],
};

const getRandomLine = (characterId: string): string => {
  const lines = WHACK_LINES[characterId] || ['啊！'];
  return lines[Math.floor(Math.random() * lines.length)];
};

const Hole = React.memo(
  forwardRef<HTMLDivElement, HoleProps>((props, ref) => {
    const { index = 0, hole = defaultHole, onWhack } = props;

    const handleTap = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (hole.isActive && !hole.isWhacked) {
          onWhack?.(index);
        }
      },
      [index, hole.isActive, hole.isWhacked, onWhack]
    );

    const whackLine = useMemo(() => {
      if (hole.isWhacked && hole.character) {
        return getRandomLine(hole.character.id);
      }
      return '';
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
                <>
                  {/* Star burst effect */}
                  <div className="wam-hole__burst" />
                  {/* Speech bubble */}
                  <div className="wam-hole__speech">{whackLine}</div>
                  {/* Points */}
                  <div
                    className={`wam-hole__points ${
                      hole.character.points < 0
                        ? 'wam-hole__points--negative'
                        : ''
                    }`}
                  >
                    {hole.character.points > 0 ? '+' : ''}
                    {hole.character.points}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  })
);

Hole.displayName = 'Hole';
export default Hole;
