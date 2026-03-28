import React from 'react'
import imgShop      from '../img/shops/level6.png'
import imgYoome     from '../img/guides/yoome_happy.png'
import imgBubble    from '../img/guides/bubblepearl_happy.png'
import imgDrink     from '../img/drink_pearl_milk_tea.png'
import { t } from '../i18n'
import './HelpPanel.less'

interface Props { onClose: () => void }

export default function HelpPanel({ onClose }: Props) {
  return (
    <div className="ub-hp" onPointerDown={onClose}>
      <div className="ub-hp__panel" onPointerDown={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="ub-hp__header">
          <span className="ub-hp__title">{t('help_title')}</span>
          <button className="ub-hp__close" onPointerDown={onClose}>✕</button>
        </div>

        {/* ── Income multiplier ── */}
        <div className="ub-hp__section-label">{t('help_multiplier_label')}</div>
        <HelpRow
          img={imgDrink} imgSize={56} accent="#ffd700"
          title={t('help_multiplier_title')}
          lines={[t('help_multiplier_l1'), t('help_multiplier_l2'), t('help_multiplier_l3')]}
        />

        {/* ── Automation ── */}
        <div className="ub-hp__section-label">{t('help_auto_label')}</div>
        <HelpRow
          img={imgYoome} imgSize={72} accent="#c084fc"
          title={t('help_auto_title')}
          lines={[t('help_auto_l1'), t('help_auto_l2')]}
        />

        {/* ── Prestige ── */}
        <div className="ub-hp__section-label">{t('help_prestige_label')}</div>
        <HelpRow
          img={imgShop} imgSize={64} accent="#d4aaff"
          title={t('help_prestige_title')}
          lines={[t('help_prestige_l1'), t('help_prestige_l2'), t('help_prestige_l3')]}
        />

        {/* ── Tip ── */}
        <div className="ub-hp__tip">
          <img src={imgBubble} alt="" draggable={false} className="ub-hp__tip-char" />
          <span>{t('help_tip')}</span>
        </div>

        <button className="ub-hp__btn" onPointerDown={onClose}>{t('help_ok')}</button>
      </div>
    </div>
  )
}

function HelpRow({ img, imgSize, accent, title, lines }: {
  img: string; imgSize: number; accent: string; title: string; lines: string[]
}) {
  return (
    <div className="ub-hp__row" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="ub-hp__row-img-wrap">
        <img src={img} alt="" draggable={false} className="ub-hp__row-img"
             style={{ width: imgSize, height: imgSize, filter: `drop-shadow(0 0 8px ${accent}80)` }} />
      </div>
      <div className="ub-hp__row-text">
        <span className="ub-hp__row-title">{title}</span>
        {lines.map((l, i) => (
          <span key={i} className="ub-hp__row-desc">{l}</span>
        ))}
      </div>
    </div>
  )
}
