import React, { useState } from 'react'
import imgCup from '../img/shops/level1.png'
import { fmt } from '../constants'
import Leaderboard from './Leaderboard'
import type { LeaderboardEntry } from '../hooks/useGameScore'
import { t } from '../i18n'
import './StartScreen.less'

interface Props {
  playerName:   string | null
  playerAvatar: string | null
  bestScore:    number
  hasSave:      boolean
  isInAigram:   boolean
  onPlay:   () => void
  onReset:  () => void
  fetchGlobal:  () => Promise<LeaderboardEntry[]>
  fetchFriends: () => Promise<LeaderboardEntry[]>
}

export default function StartScreen({ playerName, playerAvatar, bestScore, hasSave, isInAigram, onPlay, onReset, fetchGlobal, fetchFriends }: Props) {
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
            {bestScore > 0 && <span className="ss__best">· 🌙 {bestScore} {t('crystals')}</span>}
          </div>
        )}

        {/* Ticket-style play button */}
        <div className="ss__ticket-wrap" onPointerDown={onPlay}>
          <div className="ss__ticket">
            <span className="ss__ticket-label">
              {bestScore > 0 ? t('continue_business') : t('open_business')}
            </span>
            <span className="ss__ticket-sub">🧋 OPEN</span>
          </div>
        </div>

        {/* Reset button — only when there's a previous save */}
        {hasSave && (
          <button className="ss__reset-btn" onPointerDown={() => setShowReset(true)}>
            {t('restart')}
          </button>
        )}

        {/* Leaderboard button */}
        <button className="ss__lb-btn" onPointerDown={() => setShowLb(true)}>🏆</button>
      </div>
      {/* Reset confirm dialog */}
      {showReset && (
        <div className="ss__confirm-overlay" onPointerDown={() => setShowReset(false)}>
          <div className="ss__confirm" onPointerDown={e => e.stopPropagation()}>
            <div className="ss__confirm-title">{t('reset_confirm_title')}</div>
            <div className="ss__confirm-body">{t('reset_confirm_body')}</div>
            <div className="ss__confirm-btns">
              <button className="ss__confirm-btn ss__confirm-btn--cancel" onPointerDown={() => setShowReset(false)}>{t('cancel')}</button>
              <button className="ss__confirm-btn ss__confirm-btn--ok" onPointerDown={() => { onReset(); setShowReset(false) }}>{t('confirm_reset')}</button>
            </div>
          </div>
        </div>
      )}

      {showLb && (
        <Leaderboard
          gameName={t('game_name')}
          isInAigram={isInAigram}
          onClose={() => setShowLb(false)}
          fetchGlobal={fetchGlobal}
          fetchFriends={fetchFriends}
        />
      )}
    </div>
  )
}
