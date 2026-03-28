import React, { useState } from 'react'
import type { DrinkDef, DrinkProgress } from '../types'
import { buyCost, maxBuyQty, cycleMs, fmtUSD, fmtMs, incomePerCycle } from '../constants'
import { t, localeName } from '../i18n'
import './DrinkRow.less'

import imgPearl      from '../img/drink_pearl_milk_tea.png'
import imgWatermelon from '../img/drink_watermelon.png'
import imgMango      from '../img/drink_mango.png'
import imgLemon      from '../img/drink_lemon.png'
import imgAvocado    from '../img/drink_avocado.png'
import imgAngel      from '../img/drink_angel.png'

const DRINK_IMGS: Record<string, string> = {
  pearl_milk_tea: imgPearl,
  watermelon:     imgWatermelon,
  mango:          imgMango,
  lemon:          imgLemon,
  avocado:        imgAvocado,
  angel:          imgAngel,
}

const GUIDE_SPRITES: Record<string, string> = import.meta.glob(
  '../img/guides/*.png', { eager: true, import: 'default' }
) as Record<string, string>

const MANAGER_CHARS: Record<string, string> = {
  pearl_milk_tea: 'bubblepearl',
  watermelon:     'melonmick',
  mango:          'mangochick',
  lemon:          'lemonshark',
  avocado:        'guacpiggy',
  angel:          'yoome',
}

function getManagerSprite(drinkId: string, done = false): string {
  const char = MANAGER_CHARS[drinkId] ?? 'bubblepearl'
  const expr = done ? 'surprised' : 'happy'
  return GUIDE_SPRITES[`../img/guides/${char}_${expr}.png`] ?? ''
}

export type BuyMode = 1 | 10 | 'max'

interface Props {
  def: DrinkDef
  dp: DrinkProgress
  progress: number
  shopMult: number
  coins: number
  buyMode: BuyMode
  canAffordManager: boolean
  onTap: (x: number, y: number) => void
  onBuy: (qty: number) => void
  onManager: () => void
  rowRef?: React.RefObject<HTMLDivElement>
  buyRef?: React.RefObject<HTMLButtonElement>
}

interface Particle { id: number; x: number; y: number; tx: number; ty: number; rot: number; dur: number }

export default function DrinkRow({
  def, dp, progress, shopMult, coins, buyMode, canAffordManager,
  onTap, onBuy, onManager, rowRef, buyRef
}: Props) {
  const ready    = progress >= 1 && !dp.hasManager && dp.cycleStarted > 0
  const waiting  = dp.cycleStarted === 0 && dp.qty > 0 && !dp.hasManager
  const income   = incomePerCycle(def, dp.qty, shopMult)
  const ms       = cycleMs(def, dp.qty)
  const showHire = dp.qty > 0

  // Buy quantity based on mode
  const affordable = maxBuyQty(def, dp.qty, coins)
  const wantQty    = buyMode === 'max' ? Math.max(1, affordable) : buyMode
  const actualQty  = Math.max(1, Math.min(wantQty, Math.max(1, affordable)))
  const totalCost  = buyCost(def, dp.qty, actualQty)
  const canAffordBuy = coins >= totalCost

  // Next milestone
  const nextMilestone = def.milestones.find(m => m > dp.qty)

  const [particles, setParticles] = useState<Particle[]>([])
  const [buyFlash, setBuyFlash] = useState(false)

  function handleBuyPress(e: React.PointerEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onBuy(actualQty)
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const newP: Particle[] = Array.from({ length: 7 }, (_, i) => ({
      id:  Date.now() + i,
      x:   cx + (Math.random() - 0.5) * 24,   // slight horizontal spread at origin
      y:   cy - 20,
      tx:  (Math.random() - 0.5) * 50,         // mild horizontal drift while falling
      ty:  60 + Math.random() * 80,            // always fall downward, varying distance
      rot: (Math.random() - 0.5) * 360,
      dur: 0.45 + Math.random() * 0.45,        // 0.45 – 0.9 s, each at its own speed
    }))
    setParticles(newP)
    setTimeout(() => setParticles([]), 900)
    setBuyFlash(true)
    setTimeout(() => setBuyFlash(false), 500)
  }

  return (
    <div
      ref={rowRef}
      className={`dr ${ready ? 'dr--ready' : ''} ${waiting ? 'dr--waiting' : ''} ${buyFlash ? 'dr--bought' : ''}`}
      style={{ '--accent': def.color } as React.CSSProperties}
      onPointerDown={e => { if (ready || waiting) onTap(e.clientX, e.clientY) }}
    >
      {/* ── Icon ── */}
      <div className="dr__icon">
        <img src={DRINK_IMGS[def.id]} alt={localeName(def)} draggable={false} className="dr__img" />
        {dp.qty > 0 && (
          <div className="dr__qty-wrap">
            <div key={dp.qty} className="dr__qty">{dp.qty}</div>
            {nextMilestone && <div className="dr__next-ms">→{nextMilestone}</div>}
          </div>
        )}
      </div>

      {/* ── Center ── */}
      <div className="dr__center">
        <div className="dr__meta">
          {dp.qty > 0
            ? <span className="dr__income">{fmtUSD(income / ms * 1000)}<em>{t('per_sec')}</em></span>
            : <span className="dr__name">{localeName(def)}</span>
          }
          {dp.qty > 0 && <span className="dr__name dr__name--meta">{localeName(def)}</span>}
          {dp.qty > 0 && <span className="dr__time">{fmtMs(ms)}</span>}
        </div>
        {dp.qty > 0 ? (
          <div className="dr__bar-track">
            <div className="dr__bar-fill" style={{ width: `${progress * 100}%`, background: def.color }} />
            {ready   && <span className="dr__bar-label">{t('collect')}</span>}
            {waiting && <span className="dr__bar-label dr__bar-label--dim">{t('tap_to_start')}</span>}
          </div>
        ) : (
          <div className="dr__bar-empty" />
        )}
      </div>

      {/* ── Right: ticket column ── */}
      <div className="dr__tickets">

        {/* Left: hire ticket (stamp style) — only when qty > 0 */}
        {showHire && (
          dp.hasManager ? (
            /* hired → character image only, no ticket */
            <div className="dr__hire dr__hire--done">
              <img src={getManagerSprite(def.id, true)} alt="" draggable={false} className="dr__hire-char" />
            </div>
          ) : (
            /* not hired → stamp ticket */
            <div
              className={`dr__hire ${canAffordManager ? 'dr__hire--on' : ''}`}
              onPointerDown={e => { e.stopPropagation(); onManager() }}
            >
              {canAffordManager && (
                <img src={getManagerSprite(def.id)} alt="" draggable={false} className="dr__hire-char" />
              )}
              <span className="dr__hire-label">{t('employ')}</span>
              <span className="dr__hire-cost">{fmtUSD(def.managerCost)}</span>
            </div>
          )
        )}

        {/* Right: buy ticket (notch style) */}
        <button
          ref={buyRef}
          className={`dr__buy ${canAffordBuy ? 'dr__buy--on' : ''} ${!showHire ? 'dr__buy--solo' : ''}`}
          onPointerDown={handleBuyPress}
        >
          <div className={`dr__buy-inner ${dp.qty === 0 ? 'dr__buy-inner--unlock' : ''}`}>
            {dp.qty === 0 ? (
              <span className="dr__buy-label">{t('research')}</span>
            ) : actualQty > 1 ? (
              <span className="dr__buy-multi">×{actualQty}</span>
            ) : (
              <span className="dr__buy-arrow" />
            )}
            <div className="dr__buy-tear" />
            <span className="dr__buy-price">{fmtUSD(totalCost)}</span>
          </div>
        </button>

      </div>
      {/* ── Money scatter particles ── */}
      {particles.map(p => (
        <div
          key={p.id}
          className="dr__money-particle"
          style={{
            left: p.x, top: p.y,
            '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, '--rot': `${p.rot}deg`, '--dur': `${p.dur}s`,
          } as React.CSSProperties}
        >💵</div>
      ))}
    </div>
  )
}
