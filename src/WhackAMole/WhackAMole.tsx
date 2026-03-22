import React, { forwardRef, useCallback, useState } from 'react';
import type { WhackAMoleProps, Character } from './types';
import { useWhackAMole } from './hooks/useWhackAMole';
import { useGameScore } from './hooks/useGameScore';
import ScoreBoard from './components/ScoreBoard';
import GameBoard from './components/GameBoard';
import SplashScreen from './components/SplashScreen';
import Leaderboard from './components/Leaderboard';
import guitaristImg from './img/guitarist.png';
import guitaristSurprisedImg from './img/guitarist_surprised.png';
import hackerImg from './img/hacker.png';
import hackerSurprisedImg from './img/hacker_surprised.png';
import ghostImg from './img/ghost.png';
import ghostSurprisedImg from './img/ghost_surprised.png';
import coderImg from './img/coder.png';
import coderSurprisedImg from './img/coder_surprised.png';
import { useLocale } from './i18n';
import aigramLogo from './img/aigram.svg';
import './WhackAMole.less';

const DEFAULT_CHARACTERS: Character[] = [
  { id: 'guitarist', name: 'guitarist', image: guitaristImg, hitImage: guitaristSurprisedImg, points: 20, weight: 2 },
  { id: 'coder', name: 'coder', image: coderImg, hitImage: coderSurprisedImg, points: 15, weight: 3 },
  { id: 'hacker', name: 'hacker', image: hackerImg, hitImage: hackerSurprisedImg, points: 10, weight: 4 },
  { id: 'ghost', name: 'ghost', image: ghostImg, hitImage: ghostSurprisedImg, points: -15, weight: 2 },
];

const WhackAMole = React.memo(
  forwardRef<HTMLDivElement, WhackAMoleProps>((props, ref) => {
    const { t } = useLocale();
    const [showSplash, setShowSplash] = useState(true);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const {
      isInAigram,
      submitScore,
      fetchGlobalLeaderboard,
      fetchFriendsLeaderboard,
    } = useGameScore('wam');
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

    const handleGameEnd = useCallback((finalScore: number) => {
      submitScore(finalScore);
      onGameEnd?.(finalScore);
    }, [submitScore, onGameEnd]);

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
      onGameEnd: handleGameEnd,
    });

    return (
      <div className="wam" ref={ref}>
        <img className="wam__watermark" src={aigramLogo} alt="Aigram" draggable={false} />
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        {showLeaderboard && (
          <Leaderboard
            gameName="Whack-A-Mole"
            isInAigram={isInAigram}
            onClose={() => setShowLeaderboard(false)}
            fetchGlobal={fetchGlobalLeaderboard}
            fetchFriends={fetchFriendsLeaderboard}
          />
        )}

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
              <button
                className="wam__btn wam__btn--leaderboard"
                onPointerDown={() => setShowLeaderboard(true)}
              >
                {t('lb.btn')}
              </button>
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
