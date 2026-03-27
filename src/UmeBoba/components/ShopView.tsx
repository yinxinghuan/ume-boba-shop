import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getShopLevel, getNextShopLevel, fmt, fmtUSD } from '../constants'
import './ShopView.less'

interface Particle {
  id: number
  x: number      // % from left
  symbol: string
  duration: number  // animation duration ms
  delay: number
  size: number
}

let _pid = 0

interface Props {
  totalEarned: number
  perSec: number
  currentImage: string
}

export default function ShopView({ totalEarned, perSec, currentImage }: Props) {
  const shopLevel = getShopLevel(totalEarned)
  const nextLevel = getNextShopLevel(totalEarned)

  const progress = nextLevel
    ? Math.min((totalEarned - shopLevel.threshold) / (nextLevel.threshold - shopLevel.threshold), 1)
    : 1

  // ── Particle system ────────────────────────────────────────────────────────
  const [particles, setParticles] = useState<Particle[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Intensity: how many particles per second, based on income rate
  const intensity = useMemo(() => {
    if (perSec <= 0) return 0
    if (perSec < 1)   return 0.5
    if (perSec < 10)  return 1
    if (perSec < 100) return 2
    if (perSec < 1000) return 4
    return 8
  }, [perSec])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (intensity <= 0) return

    const ms = 1000 / intensity
    intervalRef.current = setInterval(() => {
      const symbols = ['$', '✨', '$', '💰', '$', '⭐']
      setParticles(prev => {
        // Remove old particles
        const now = Date.now()
        const cleaned = prev.filter(p => p.delay + p.duration + now > now - 3000)
        const newP: Particle = {
          id: _pid++,
          x: 10 + Math.random() * 80,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          duration: 1800 + Math.random() * 1200,
          delay: 0,
          size: 12 + Math.random() * 10,
        }
        return [...cleaned.slice(-20), newP]
      })
    }, ms)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [intensity])

  // ── Glow intensity CSS var ─────────────────────────────────────────────────
  const glowAlpha = Math.min(perSec / 50, 1) * 0.7

  return (
    <div className="sv">
      <div className="sv__stage" style={{ '--glow': glowAlpha } as React.CSSProperties}>

        {/* Cup image — square, centered */}
        <div className="sv__cup-wrap">
          <img src={currentImage} alt={shopLevel.nameZh} draggable={false} className="sv__img" />
          <div className="sv__glow" />
        </div>

        {/* Particles float over the whole stage */}
        <div className="sv__particles">
          {particles.map(p => (
            <span
              key={p.id}
              className="sv__particle"
              style={{
                left: `${p.x}%`,
                fontSize: p.size,
                animationDuration: `${p.duration}ms`,
              }}
            >
              {p.symbol}
            </span>
          ))}
        </div>

        {/* Info overlay on top of cup */}
        <div className="sv__info">
          <div className="sv__info-top">
            <div className="sv__level-badge">Lv.{shopLevel.level}</div>
            <div className="sv__name">{shopLevel.nameZh}</div>
            <div className="sv__mult">×{shopLevel.multiplier}</div>
          </div>

          {nextLevel && (
            <div className="sv__next">
              <div className="sv__next-label">
                <span>→ {nextLevel.nameZh}</span>
                <span className="sv__next-cost">{fmtUSD(nextLevel.threshold)}</span>
              </div>
              <div className="sv__progress-track">
                <div className="sv__progress-fill" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          )}

          {!nextLevel && (
            <div className="sv__maxed">🏆 已达到最高等级！</div>
          )}
        </div>

      </div>
    </div>
  )
}
