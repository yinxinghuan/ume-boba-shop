import React from 'react'
import type { DrinkDef, DrinkProgress } from '../types'
import { buyCost, cycleMs, fmtUSD, fmtMs, incomePerCycle } from '../constants'
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

function getManagerSprite(drinkId: string): string {
  const char = MANAGER_CHARS[drinkId] ?? 'bubblepearl'
  return GUIDE_SPRITES[`../img/guides/${char}_happy.png`] ?? ''
}

interface Props {
  def: DrinkDef
  dp: DrinkProgress
  progress: number
  canAffordBuy: boolean
  onTap: (x: number, y: number) => void
  onBuy: () => void
  onManager: () => void
  rowRef?: React.RefObject<HTMLDivElement>
  buyRef?: React.RefObject<HTMLButtonElement>
}

export default function DrinkRow({ def, dp, progress, canAffordBuy, onTap, onBuy, onManager, rowRef, buyRef }: Props) {
  const ready   = progress >= 1 && !dp.hasManager && dp.cycleStarted > 0
  const waiting = dp.cycleStarted === 0 && dp.qty > 0 && !dp.hasManager
  const income  = incomePerCycle(def, dp.qty)
  const ms      = cycleMs(def, dp.qty)
  const nextCost = buyCost(def, dp.qty)
  const canHire  = !dp.hasManager

  return (
    <div
      ref={rowRef}
      className={`dr ${ready ? 'dr--ready' : ''} ${waiting ? 'dr--waiting' : ''}`}
      style={{ '--accent': def.color } as React.CSSProperties}
    >
      {/* ── Top: icon + info ── */}
      <div
        className="dr__top"
        onPointerDown={e => { if (ready || waiting) onTap(e.clientX, e.clientY) }}
      >
        <div className="dr__icon">
          <img src={DRINK_IMGS[def.id]} alt={def.nameZh} draggable={false} className="dr__img" />
          {dp.qty > 0 && <div className="dr__qty">{dp.qty}</div>}
        </div>

        <div className="dr__center">
          <div className="dr__meta">
            {dp.qty > 0
              ? <span className="dr__income">{fmtUSD(income)}<em>/次</em></span>
              : <span className="dr__name">{def.nameZh}</span>
            }
            {dp.qty > 0 && <span className="dr__time">{fmtMs(ms)}</span>}
          </div>
          {dp.qty > 0 && <span className="dr__name">{def.nameZh}</span>}
          {dp.qty > 0 ? (
            <div className="dr__bar-track">
              <div className="dr__bar-fill" style={{ width: `${progress * 100}%`, background: def.color }} />
              {ready   && <span className="dr__bar-label">收取！</span>}
              {waiting && <span className="dr__bar-label dr__bar-label--dim">点击开始</span>}
            </div>
          ) : (
            <div className="dr__bar-empty" />
          )}
        </div>
      </div>

      {/* ── Bottom: 3-part horizontal ticket ── */}
      <div className="dr__bottom">
        <div className={`dr__ticket ${canAffordBuy ? 'dr__ticket--buyable' : ''}`}>

          {/* Stub 1: Quantity */}
          <div className="dr__stub dr__stub--qty">
            <span className="dr__stub-qty-num">×{dp.qty}</span>
          </div>

          <div className="dr__tear" />

          {/* Stub 2: Buy / upgrade */}
          <button
            ref={buyRef}
            className="dr__stub dr__stub--buy"
            onPointerDown={e => { e.stopPropagation(); onBuy() }}
          >
            <span className="dr__stub-arrow">↑</span>
            <span className="dr__stub-price">{fmtUSD(nextCost)}</span>
          </button>

          <div className="dr__tear" />

          {/* Stub 3: Staff / manager */}
          <div
            className={`dr__stub dr__stub--staff ${dp.hasManager ? 'dr__stub--hired' : ''} ${dp.qty === 0 ? 'dr__stub--locked' : ''}`}
            onPointerDown={e => { if (canHire && dp.qty > 0) { e.stopPropagation(); onManager() } }}
          >
            <div className="dr__staff-avatar">
              <img src={getManagerSprite(def.id)} alt="" draggable={false} className="dr__staff-img" />
              {dp.hasManager && <span className="dr__staff-check">✓</span>}
            </div>
            <span className="dr__staff-label">
              {dp.hasManager ? '自动' : fmtUSD(def.managerCost)}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
