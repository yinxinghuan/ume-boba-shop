import React, { useEffect, useRef, useState } from 'react'
import type { TutorialStep } from '../tutorial'
import type { GuideLine } from '../guideLines'
import './TutorialLayer.less'

const SPRITES: Record<string, string> = import.meta.glob(
  '../img/guides/*.png', { eager: true, import: 'default' }
) as Record<string, string>

function getSprite(char: string, expr: string): string {
  return SPRITES[`../img/guides/${char}_${expr}.png`] ?? ''
}

interface Props {
  step: TutorialStep | null
  onAdvance: () => void
  onSkip: () => void
  // rect of the first drink row element (for highlight positioning)
  drinkRowRect: DOMRect | null
  buyBtnRect: DOMRect | null
}

export default function TutorialLayer({ step, onAdvance, onSkip, drinkRowRect, buyBtnRect }: Props) {
  const [visible, setVisible] = useState(false)
  const [displayedDialog, setDisplayedDialog] = useState<GuideLine | null>(null)

  useEffect(() => {
    console.log('[Tutorial] step:', step?.kind, step)
    if (!step) { setVisible(false); return }
    if (step.kind === 'dialog' && step.dialog) {
      setDisplayedDialog(step.dialog)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
    }
  }, [step])

  if (!step) return null

  const isDialog     = step.kind === 'dialog'
  const isHighlight  = step.kind === 'wait_tap_drink' || step.kind === 'wait_collect'
  const isBuyHighlight = step.kind === 'wait_buy'
  const targetRect   = isBuyHighlight ? buyBtnRect : drinkRowRect

  return (
    <div className={`tut ${visible && isDialog ? 'tut--dialog-in' : ''}`}>
      {/* Dimmed backdrop for dialog steps */}
      {isDialog && <div className="tut__backdrop" onPointerDown={onAdvance} />}

      {/* Skip button always visible */}
      <button className="tut__skip" onPointerDown={onSkip}>跳过引导</button>

      {/* Arrow highlight for action steps */}
      {(isHighlight || isBuyHighlight) && targetRect && (
        <ArrowHint rect={targetRect} text={step.arrowText ?? '点这里！'} />
      )}

      {/* Dialog popup */}
      {isDialog && displayedDialog && (
        <div className={`tut__panel ${visible ? 'tut__panel--in' : ''}`}
             onPointerDown={onAdvance}>
          <img
            src={getSprite(displayedDialog.char, displayedDialog.expr)}
            alt={displayedDialog.char}
            draggable={false}
            className="tut__sprite"
          />
          <div className="tut__bubble">
            {displayedDialog.lines.map((line, i) => (
              <span key={i} className="tut__line">{line}</span>
            ))}
            <span className="tut__tap-hint">点击继续 →</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ArrowHint({ rect, text }: { rect: DOMRect; text: string }) {
  // Position arrow below the target element
  const arrowTop  = rect.bottom + 8
  const arrowLeft = rect.left + rect.width / 2

  return (
    <div className="tut__arrow" style={{ top: arrowTop, left: arrowLeft }}>
      <div className="tut__arrow-icon">▲</div>
      <div className="tut__arrow-label">{text}</div>
    </div>
  )
}
