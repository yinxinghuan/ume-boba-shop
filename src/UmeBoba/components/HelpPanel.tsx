import React from 'react'
import imgStepTea   from '../img/step_tea.png'
import imgStepPearl from '../img/step_pearl.png'
import imgStepSeal  from '../img/step_seal.png'
import imgDrink     from '../img/drink_pearl_milk_tea.png'
import imgShop      from '../img/shops/level6.png'
import imgYoome     from '../img/guides/yoome_happy.png'
import imgBubble    from '../img/guides/bubblepearl_happy.png'
import './HelpPanel.less'

interface Props { onClose: () => void }

export default function HelpPanel({ onClose }: Props) {
  return (
    <div className="ub-hp" onPointerDown={onClose}>
      <div className="ub-hp__panel" onPointerDown={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="ub-hp__header">
          <span className="ub-hp__title">玩法说明</span>
          <button className="ub-hp__close" onPointerDown={onClose}>✕</button>
        </div>

        {/* ── Section 1: 收益循环 ── */}
        <div className="ub-hp__section-label">收益循环</div>
        <div className="ub-hp__cycle">
          <CycleStep img={imgStepTea}   label="点击开始" />
          <div className="ub-hp__cycle-arrow">→</div>
          <CycleStep img={imgStepPearl} label="等进度满" />
          <div className="ub-hp__cycle-arrow">→</div>
          <CycleStep img={imgStepSeal}  label="点击收取" />
        </div>
        <p className="ub-hp__cycle-note">进度条变金色后再点一次，美元就到手了</p>

        {/* ── Section 2: 升级票 ── */}
        <div className="ub-hp__section-label">升级票</div>
        <HelpRow
          img={imgDrink} imgSize={56} accent="#ffd700"
          title="买更多杯数"
          lines={[
            '数量越多 → 每轮收益越高、速度越快',
            '10 / 25 / 50 / 100 杯时收益大跳升',
          ]}
        />

        {/* ── Section 3: 招聘票 ── */}
        <div className="ub-hp__section-label">招聘票</div>
        <HelpRow
          img={imgYoome} imgSize={72} accent="#c084fc"
          title="雇用店员，自动打工"
          lines={[
            '雇用后进度满自动收取，无需盯屏幕',
            '关掉游戏也能赚取离线收益',
          ]}
        />

        {/* ── Section 4: 店铺升级 ── */}
        <div className="ub-hp__section-label">店铺升级</div>
        <HelpRow
          img={imgShop} imgSize={64} accent="#34d399"
          title="收益越高，等级越高"
          lines={[
            '累计总收益提升店铺等级',
            '等级越高，全局收益倍率越高',
          ]}
        />

        {/* ── Tip ── */}
        <div className="ub-hp__tip">
          <img src={imgBubble} alt="" draggable={false} className="ub-hp__tip-char" />
          <span>💡 招满所有饮品的店员，关掉手机也能赚钱！</span>
        </div>

        <button className="ub-hp__btn" onPointerDown={onClose}>知道了！</button>
      </div>
    </div>
  )
}

function CycleStep({ img, label }: { img: string; label: string }) {
  return (
    <div className="ub-hp__step">
      <img src={img} alt={label} draggable={false} className="ub-hp__step-img" />
      <span className="ub-hp__step-label">{label}</span>
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
