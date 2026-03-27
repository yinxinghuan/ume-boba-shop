import React, { useState } from 'react'
import imgLogo from '../img/ume_logo.png'
import imgUme  from '../img/ume_counter.png'
import { fmt } from '../constants'
import Leaderboard from './Leaderboard'
import type { LeaderboardEntry } from '../hooks/useGameScore'
import './StartScreen.less'

interface Props {
  playerName:   string | null
  playerAvatar: string | null
  bestScore:    number
  isInAigram:   boolean
  onPlay: () => void
  fetchGlobal:  () => Promise<LeaderboardEntry[]>
  fetchFriends: () => Promise<LeaderboardEntry[]>
}

export default function StartScreen({
  playerName, playerAvatar, bestScore,
  isInAigram, onPlay, fetchGlobal, fetchFriends,
}: Props) {
  const [showLb, setShowLb] = useState(false)

  return (
    <div className="ss">

      {/* Floating pearl bubbles */}
      <div className="ss__bubbles">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`ss__bubble ss__bubble--${i + 1}`} />
        ))}
      </div>

      {/* Logo */}
      <img src={imgLogo} alt="UMe California" draggable={false} className="ss__logo" />

      {/* Character */}
      <img src={imgUme} alt="" draggable={false} className="ss__char" />

      {/* Bottom card */}
      <div className="ss__card">
        {/* Player info */}
        <div className="ss__player">
          <img
            src={playerAvatar ?? imgUme}
            alt=""
            draggable={false}
            className="ss__avatar"
          />
          <div className="ss__player-info">
            <div className="ss__name">{playerName ?? 'UMe 奶茶师'}</div>
            {bestScore > 0 && (
              <div className="ss__best">最高收入 🧋 {fmt(bestScore)}</div>
            )}
          </div>
        </div>

        {/* Play button */}
        <button className="ss__play" onPointerDown={onPlay}>
          {bestScore > 0 ? '继续营业 🧋' : '开始营业 🧋'}
        </button>

        {/* Leaderboard button */}
        <button className="ss__lb-btn" onPointerDown={() => setShowLb(true)}>
          🏆 排行榜
        </button>
      </div>

      {/* Leaderboard modal */}
      {showLb && (
        <Leaderboard
          gameName="UMe 珍珠奶茶小铺"
          isInAigram={isInAigram}
          onClose={() => setShowLb(false)}
          fetchGlobal={fetchGlobal}
          fetchFriends={fetchFriends}
        />
      )}
    </div>
  )
}
