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
  canAffordManager: boolean
  onTap: (x: number, y: number) => void
  onBuy: () => void
  onManager: () => void
  rowRef?: React.RefObject<HTMLDivElement>
  buyRef?: React.RefObject<HTMLButtonElement>
}

export default function DrinkRow({
  def, dp, progress, canAffordBuy, canAffordManager,
  onTap, onBuy, onManager, rowRef, buyRef
}: Props) {
  const ready    = progress >= 1 && !dp.hasManager && dp.cycleStarted > 0
  const waiting  = dp.cycleStarted === 0 && dp.qty > 0 && !dp.hasManager
  const income   = incomePerCycle(def, dp.qty)
  const ms       = cycleMs(def, dp.qty)
  const nextCost = buyCost(def, dp.qty)
  const showHire = dp.qty > 0

  return (
    <div
      ref={rowRef}
      className={`dr ${ready ? 'dr--ready' : ''} ${waiting ? 'dr--waiting' : ''}`}
      style={{ '--accent': def.color } as React.CSSProperties}
      onPointerDown={e => { if (ready || waiting) onTap(e.clientX, e.clientY) }}
    >
      {/* ── Icon ── */}
      <div className="dr__icon">
        <img src={DRINK_IMGS[def.id]} alt={def.nameZh} draggable={false} className="dr__img" />
        {dp.qty > 0 && <div className="dr__qty">{dp.qty}</div>}
      </div>

      {/* ── Center ── */}
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

      {/* ── Right: ticket column ── */}
      <div className="dr__tickets">

        {/* Left: hire ticket (stamp style) — only when qty > 0 */}
        {showHire && (
          dp.hasManager ? (
            /* hired → character image only, no ticket */
            <div className="dr__hire dr__hire--done">
              <img src={getManagerSprite(def.id)} alt="" draggable={false} className="dr__hire-char" />
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
              <span className="dr__hire-label">Employ</span>
              <div className="dr__hire-tear" />
              <span className="dr__hire-cost">{fmtUSD(def.managerCost)}</span>
            </div>
          )
        )}

        {/* Right: buy ticket (notch style) */}
        <button
          ref={buyRef}
          className={`dr__buy ${canAffordBuy ? 'dr__buy--on' : ''} ${!showHire ? 'dr__buy--solo' : ''}`}
          onPointerDown={e => { e.stopPropagation(); onBuy() }}
        >
          <div className="dr__buy-inner">
            <span className="dr__buy-arrow">↑</span>
            <div className="dr__buy-tear" />
            <span className="dr__buy-price">{fmtUSD(nextCost)}</span>
          </div>
        </button>

      </div>
    </div>
  )
}
