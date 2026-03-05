import React, { forwardRef } from 'react';
import './ScoreBoard.less';

export interface ScoreBoardProps {
  score?: number;
  timeLeft?: number;
  totalTime?: number;
  combo?: number;
  highScore?: number;
  isPlaying?: boolean;
}

const ScoreBoard = React.memo(
  forwardRef<HTMLDivElement, ScoreBoardProps>((props, ref) => {
    const {
      score = 0,
      timeLeft = 30,
      totalTime = 30,
      combo = 0,
      highScore = 0,
      isPlaying = false,
    } = props;

    const timePercent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
    const isUrgent = timeLeft <= 5 && isPlaying;

    return (
      <div className="wam-scoreboard" ref={ref}>
        <div className="wam-scoreboard__row">
          <div className="wam-scoreboard__score">
            <span className="wam-scoreboard__label">得分</span>
            <span className="wam-scoreboard__value">{score}</span>
          </div>
          {combo >= 2 && (
            <div className="wam-scoreboard__combo">
              <span className="wam-scoreboard__combo-text">
                {combo}连击!
              </span>
            </div>
          )}
          <div className="wam-scoreboard__best">
            <span className="wam-scoreboard__label">最高</span>
            <span className="wam-scoreboard__value">{highScore}</span>
          </div>
        </div>
        <div className={`wam-scoreboard__timer ${isUrgent ? 'wam-scoreboard__timer--urgent' : ''}`}>
          <div
            className="wam-scoreboard__timer-bar"
            style={{ width: `${timePercent}%` }}
          />
          <span className="wam-scoreboard__timer-text">{timeLeft}s</span>
        </div>
      </div>
    );
  })
);

ScoreBoard.displayName = 'ScoreBoard';
export default ScoreBoard;
