import React, { forwardRef } from 'react';
import type { WhackAMoleProps, Character } from './types';
import { useWhackAMole } from './hooks/useWhackAMole';
import ScoreBoard from './components/ScoreBoard';
import GameBoard from './components/GameBoard';
import guitaristImg from './img/guitarist.png';
import hackerImg from './img/hacker.png';
import ghostImg from './img/ghost.png';
import coderImg from './img/coder.png';
import { useLocale } from './i18n';
import './WhackAMole.less';

const DEFAULT_CHARACTERS: Character[] = [
  { id: 'guitarist', name: 'guitarist', image: guitaristImg, points: 20, weight: 2 },
  { id: 'coder', name: 'coder', image: coderImg, points: 15, weight: 3 },
  { id: 'hacker', name: 'hacker', image: hackerImg, points: 10, weight: 4 },
  { id: 'ghost', name: 'ghost', image: ghostImg, points: -15, weight: 2 },
];

const WhackAMole = React.memo(
  forwardRef<HTMLDivElement, WhackAMoleProps>((props, ref) => {
    const { t } = useLocale();
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
                <p className="wam__modal-subtitle">{t('subtitle')}</p>
              </div>

              <div className="wam__modal-rules">
                <p>{t('rule1')}</p>
                <p>{t('rule2')}</p>
              </div>

              <div className="wam__modal-characters">
                {characters.map((c) => (
                  <div key={c.id} className={`wam__modal-char ${c.points < 0 ? 'wam__modal-char--danger' : ''}`}>
                    <div className="wam__modal-char-avatar">
                      <img className="wam__modal-char-img" src={c.image} alt={t(`char.${c.id}.name`)} />
                    </div>
                    <span className="wam__modal-char-name">{t(`char.${c.id}.name`)}</span>
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
                {t('startBtn')}
              </button>
              {highScore > 0 && (
                <p className="wam__modal-highscore">{t('highRecord', { n: highScore })}</p>
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
              <h2 className="wam__modal-title">{t('gameOver')}</h2>
              <div className="wam__gameover-score">
                <span className="wam__gameover-label">{t('finalScore')}</span>
                <span className="wam__gameover-value">{score}</span>
              </div>
              {score >= highScore && score > 0 && (
                <div className="wam__gameover-record">{t('newRecord')}</div>
              )}
              <div className="wam__gameover-best">
                {t('historyBest', { n: Math.max(score, highScore) })}
              </div>
              <div className="wam__gameover-actions">
                <button className="wam__btn wam__btn--start" onClick={startGame}>
                  {t('replayBtn')}
                </button>
                <button className="wam__btn wam__btn--back" onClick={resetGame}>
                  {t('homeBtn')}
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
