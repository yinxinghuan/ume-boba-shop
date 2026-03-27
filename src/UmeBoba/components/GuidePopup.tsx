import React, { useEffect, useState } from 'react'
import type { GuideLine } from '../guideLines'
import './GuidePopup.less'

// Eagerly import all 18 guide sprites
const SPRITES: Record<string, string> = import.meta.glob(
  '../img/guides/*.png', { eager: true, import: 'default' }
) as Record<string, string>

function getSprite(char: string, expr: string): string {
  const key = `../img/guides/${char}_${expr}.png`
  return SPRITES[key] ?? ''
}

interface Props {
  guide: GuideLine | null
  onClose: () => void
}

export default function GuidePopup({ guide, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState<GuideLine | null>(null)

  useEffect(() => {
    if (guide) {
      setDisplayed(guide)
      // Small delay so CSS transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setDisplayed(null), 350)
      return () => clearTimeout(t)
    }
  }, [guide])

  if (!displayed) return null

  const src = getSprite(displayed.char, displayed.expr)

  return (
    <div className={`gp ${visible ? 'gp--in' : ''}`} onPointerDown={onClose}>
      <div className="gp__panel">
        <img src={src} alt={displayed.char} draggable={false} className="gp__sprite" />
        <div className="gp__bubble">
          {displayed.lines.map((line, i) => (
            <span key={i} className="gp__line">{line}</span>
          ))}
          <span className="gp__tap-hint">点击继续</span>
        </div>
      </div>
    </div>
  )
}
