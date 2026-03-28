import React, { useState } from 'react'
import imgCup from '../img/shops/level1.png'
import { fmt } from '../constants'
import Leaderboard from './Leaderboard'
import type { LeaderboardEntry } from '../hooks/useGameScore'
import './StartScreen.less'

interface Props {
  playerName:   string | null
  playerAvatar: string | null
  bestScore:    number
  isInAigram:   boolean
  onPlay:   () => void
  onReset:  () => void
  fetchGlobal:  () => Promise<LeaderboardEntry[]>
  fetchFriends: () => Promise<LeaderboardEntry[]>
}

export default function StartScreen({ playerName, playerAvatar, bestScore, isInAigram, onPlay, onReset, fetchGlobal, fetchFriends }: Props) {
  const [showLb, setShowLb] = useState(false)
  const [showReset, setShowReset] = useState(false)
  return (
    <div className="ss">
      {/* Subtle radial glow */}
      <div className="ss__glow" />

      {/* Title */}
      <div className="ss__title-wrap">
        <div className="ss__title">BOBA RUSH</div>
        <div className="ss__subtitle">TAP TO BREW</div>
      </div>

      {/* Floating poster logo */}
      <div className="ss__cup-wrap">
        <img src={imgCup} alt="Boba Rush" draggable={false} className="ss__poster" />
        <div className="ss__cup-shadow" />
      </div>

      {/* Decorative dots */}
      <div className="ss__dots">
        {'✦✦✦'.split('').map((c, i) => (
          <span key={i} className="ss__dot" style={{ animationDelay: `${i * 0.3}s` }}>{c}</span>
        ))}
      </div>

      {/* Bottom area */}
      <div className="ss__bottom">
        {playerName && (
          <div className="ss__greeting">
            {playerAvatar && <img src={playerAvatar} alt="" draggable={false} className="ss__avatar" />}
            <span>{playerName}</span>
            {bestScore > 0 && <span className="ss__best">· 最高 {fmt(bestScore)}</span>}
          </div>
        )}

        {/* Ticket-style play button */}
        <div className="ss__ticket-wrap" onPointerDown={onPlay}>
          <div className="ss__ticket">
            <span className="ss__ticket-label">
              {bestScore > 0 ? '继续营业' : '开始营业'}
            </span>
            <span className="ss__ticket-sub">🧋 OPEN</span>
          </div>
        </div>

        {/* Reset button — only when there's a previous save */}
        {bestScore > 0 && (
          <button className="ss__reset-btn" onPointerDown={() => setShowReset(true)}>
            重新开始
          </button>
        )}

        {/* Leaderboard button */}
        <button className="ss__lb-btn" onPointerDown={() => setShowLb(true)}>🏆</button>
      </div>
      {/* Reset confirm dialog */}
      {showReset && (
        <div className="ss__confirm-overlay" onPointerDown={() => setShowReset(false)}>
          <div className="ss__confirm" onPointerDown={e => e.stopPropagation()}>
            <div className="ss__confirm-title">重新开始？</div>
            <div className="ss__confirm-body">当前进度将会清空，无法恢复。</div>
            <div className="ss__confirm-btns">
              <button className="ss__confirm-btn ss__confirm-btn--cancel" onPointerDown={() => setShowReset(false)}>取消</button>
              <button className="ss__confirm-btn ss__confirm-btn--ok" onPointerDown={onReset}>确认重置</button>
            </div>
          </div>
        </div>
      )}

      {showLb && (
        <Leaderboard
          gameName="Boba Rush"
          isInAigram={isInAigram}
          onClose={() => setShowLb(false)}
          fetchGlobal={fetchGlobal}
          fetchFriends={fetchFriends}
        />
      )}
    </div>
  )
}
