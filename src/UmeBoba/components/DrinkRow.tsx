import React from 'react'
import type { DrinkDef, DrinkProgress } from '../types'
import { buyCost, cycleMs, fmtUSD, fmtMs, incomePerCycle } from '../constants'
import './DrinkRow.less'

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
  const ready    = progress >= 1 && !dp.hasManager && dp.cycleStarted > 0
  const waiting  = dp.cycleStarted === 0 && dp.qty > 0 && !dp.hasManager
  const income   = incomePerCycle(def, dp.qty)
  const ms       = cycleMs(def, dp.qty)
  const nextCost = buyCost(def, dp.qty)

  return (
    <div
      ref={rowRef}
      className={`dr ${ready ? 'dr--ready' : ''} ${waiting ? 'dr--waiting' : ''}`}
      style={{ '--accent': def.color } as React.CSSProperties}
      onPointerDown={e => { if (ready || waiting) onTap(e.clientX, e.clientY) }}
    >
      {/* ── Icon ── */}
      <div className="dr__icon">
        <span className="dr__emoji">{def.emoji}</span>
        {dp.qty > 0 && <div className="dr__qty">{dp.qty}</div>}
        {dp.hasManager && <span className="dr__star">⚡</span>}
      </div>

      {/* ── Center ── */}
      <div className="dr__center">
        {/* income + time */}
        <div className="dr__meta">
          {dp.qty > 0
            ? <span className="dr__income">{fmtUSD(income)}<em>/次</em></span>
            : <span className="dr__name">{def.nameZh}</span>
          }
          {dp.qty > 0 && <span className="dr__time">{fmtMs(ms)}</span>}
        </div>

        {/* name (when has qty, show below income) */}
        {dp.qty > 0 && <span className="dr__name">{def.nameZh}</span>}

        {/* progress bar */}
        {dp.qty > 0 ? (
          <div className="dr__bar-track">
            <div className="dr__bar-fill" style={{ width: `${progress * 100}%`, background: def.color }} />
            {ready   && <span className="dr__bar-label">收取！</span>}
            {waiting && <span className="dr__bar-label dr__bar-label--dim">点击开始</span>}
          </div>
        ) : (
          <div className="dr__bar-empty" />
        )}

        {/* hire staff */}
        {!dp.hasManager && dp.qty > 0 && (
          <div className="dr__hire" onPointerDown={e => { e.stopPropagation(); onManager() }}>
            招店员 {fmtUSD(def.managerCost)}
          </div>
        )}
      </div>

      {/* ── Buy button (right) ── */}
      <button
        ref={buyRef}
        className={`dr__buy ${canAffordBuy ? 'dr__buy--on' : ''}`}
        onPointerDown={e => { e.stopPropagation(); onBuy() }}
      >
        <span className="dr__buy-qty">{dp.qty === 0 ? '开业' : '+1'}</span>
        <span className="dr__buy-price">{fmtUSD(nextCost)}</span>
      </button>
    </div>
  )
}
