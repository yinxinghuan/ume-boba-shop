import React, { forwardRef } from 'react';
import type { WhackAMoleProps, Character } from './types';
import { useWhackAMole } from './hooks/useWhackAMole';
import ScoreBoard from './components/ScoreBoard';
import GameBoard from './components/GameBoard';
import guitaristImg from './img/guitarist.png';
import hackerImg from './img/hacker.png';
import ghostImg from './img/ghost.png';
import coderImg from './img/coder.png';
import './WhackAMole.less';

const DEFAULT_CHARACTERS: Character[] = [
  { id: 'guitarist', name: '吉他少年', image: guitaristImg, points: 20, weight: 2 },
  { id: 'coder', name: '咖啡女孩', image: coderImg, points: 15, weight: 3 },
  { id: 'hacker', name: '眼镜大叔', image: hackerImg, points: 10, weight: 4 },
  { id: 'ghost', name: '调皮幽灵', image: ghostImg, points: -15, weight: 2 },
];

const WhackAMole = React.memo(
  forwardRef<HTMLDivElement, WhackAMoleProps>((props, ref) => {
    const {
      totalTime = 30,
      gridSize = 3,
      minPopupDuration = 600,
      maxPopupDuration = 1800,
      maxActiveMoles = 3,
      characters = DEFAULT_CHARACTERS,
      onScore,
      onGameStart,
      onGameEnd,
    } = props;

    const {
      score,
      timeLeft,
      isPlaying,
      isGameOver,
      holes,
      combo,
      highScore,
      startGame,
      whackHole,
      resetGame,
    } = useWhackAMole({
      totalTime,
      gridSize,
      minPopupDuration,
      maxPopupDuration,
      maxActiveMoles,
      characters,
      onScore,
      onGameStart,
      onGameEnd,
    });

    return (
      <div className="wam" ref={ref}>
        {/* Start Modal */}
        {!isPlaying && !isGameOver && (
          <div className="wam__overlay">
            <div className="wam__modal">
              {/* Hero title area */}
              <div className="wam__modal-hero">
                <span className="wam__modal-hammer">🔨</span>
                <h1 className="wam__modal-title">
                  <span className="wam__modal-title-line">WHACK</span>
                  <span className="wam__modal-title-dash">- A -</span>
                  <span className="wam__modal-title-line">MOLE!</span>
                </h1>
                <p className="wam__modal-subtitle">🕳️ 打 地 鼠 🕳️</p>
              </div>

              <div className="wam__modal-rules">
                <p>👆 点击从地洞中探出的角色得分！</p>
                <p>👻 小心幽灵，打到它会扣分哦~</p>
              </div>

              <div className="wam__modal-characters">
                {characters.map((c) => (
                  <div key={c.id} className={`wam__modal-char ${c.points < 0 ? 'wam__modal-char--danger' : ''}`}>
                    <div className="wam__modal-char-avatar">
                      <img className="wam__modal-char-img" src={c.image} alt={c.name} />
                    </div>
                    <span className="wam__modal-char-name">{c.name}</span>
                    <span
                      className={`wam__modal-char-pts ${
                        c.points < 0 ? 'wam__modal-char-pts--neg' : ''
                      }`}
                    >
                      {c.points > 0 ? '+' : ''}{c.points}
                    </span>
                  </div>
                ))}
              </div>

              <button className="wam__btn wam__btn--start" onClick={startGame}>
                🎮 开始游戏
              </button>
              {highScore > 0 && (
                <p className="wam__modal-highscore">🏆 最高纪录: {highScore}</p>
              )}
            </div>
          </div>
        )}

        {/* Game Playing */}
        {isPlaying && (
          <>
            <ScoreBoard
              score={score}
              timeLeft={timeLeft}
              totalTime={totalTime}
              combo={combo}
              highScore={highScore}
              isPlaying={isPlaying}
            />
            <GameBoard holes={holes} gridSize={gridSize} onWhack={whackHole} />
          </>
        )}

        {/* Game Over */}
        {isGameOver && (
          <div className="wam__overlay">
            <div className="wam__modal wam__modal--gameover">
              <h2 className="wam__modal-title">游戏结束!</h2>
              <div className="wam__gameover-score">
                <span className="wam__gameover-label">最终得分</span>
                <span className="wam__gameover-value">{score}</span>
              </div>
              {score >= highScore && score > 0 && (
                <div className="wam__gameover-record">新纪录!</div>
              )}
              <div className="wam__gameover-best">
                历史最高: {Math.max(score, highScore)}
              </div>
              <div className="wam__gameover-actions">
                <button className="wam__btn wam__btn--start" onClick={startGame}>
                  再来一局
                </button>
                <button className="wam__btn wam__btn--back" onClick={resetGame}>
                  返回
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  })
);

WhackAMole.displayName = 'WhackAMole';
export default WhackAMole;
