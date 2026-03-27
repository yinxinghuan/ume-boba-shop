import React, { useState } from 'react'
import imgPoster from '../img/poster.png'
import imgUme    from '../img/ume_counter.png'
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

      {/* Blurred background */}
      <div className="ss__bg" style={{ backgroundImage: `url(${imgPoster})` }} />

      {/* Poster cover art */}
      <div className="ss__hero">
        <img src={imgPoster} alt="BOBA RUSH" draggable={false} className="ss__poster" />
      </div>

      {/* Bottom panel */}
      <div className="ss__panel">
        {/* Player row */}
        <div className="ss__player">
          <img
            src={playerAvatar ?? imgUme}
            alt="" draggable={false}
            className="ss__avatar"
          />
          <div className="ss__player-info">
            <div className="ss__name">{playerName ?? 'UMe 奶茶师'}</div>
            {bestScore > 0 && (
              <div className="ss__best">💰 最高收入 {fmt(bestScore)}</div>
            )}
          </div>
          <button className="ss__lb-icon" onPointerDown={() => setShowLb(true)}>🏆</button>
        </div>

        {/* Play button */}
        <button className="ss__play" onPointerDown={onPlay}>
          {bestScore > 0 ? '继续营业 🧋' : '开始营业 🧋'}
        </button>
      </div>

      {showLb && (
        <Leaderboard
          gameName="BOBA RUSH"
          isInAigram={isInAigram}
          onClose={() => setShowLb(false)}
          fetchGlobal={fetchGlobal}
          fetchFriends={fetchFriends}
        />
      )}
    </div>
  )
}
