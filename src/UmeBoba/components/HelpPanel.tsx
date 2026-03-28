import React from 'react'
import imgShop      from '../img/shops/level6.png'
import imgYoome     from '../img/guides/yoome_happy.png'
import imgBubble    from '../img/guides/bubblepearl_happy.png'
import imgDrink     from '../img/drink_pearl_milk_tea.png'
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

        {/* ── 收益倍率 ── */}
        <div className="ub-hp__section-label">收益倍率</div>
        <HelpRow
          img={imgDrink} imgSize={56} accent="#ffd700"
          title="杯数越多，收益越高"
          lines={[
            '每多一杯，每轮收益线性增加',
            '10 / 25 / 50 / 100 杯时收益大幅跳升',
            '店铺等级提升后，全局收益倍率同步上涨',
          ]}
        />

        {/* ── 店员 ── */}
        <div className="ub-hp__section-label">自动化</div>
        <HelpRow
          img={imgYoome} imgSize={72} accent="#c084fc"
          title="雇用店员，自动收益"
          lines={[
            '雇用后进度满自动收取，无需手动点击',
            '关掉游戏也能积累离线收益',
          ]}
        />

        {/* ── 转生结晶 ── */}
        <div className="ub-hp__section-label">月球转生 🌙</div>
        <HelpRow
          img={imgShop} imgSize={64} accent="#d4aaff"
          title="重置换结晶，永久提升倍率"
          lines={[
            '总收入达到 $1B 后可进行转生',
            '转生获得🌙结晶，结晶越多全局倍率越高',
            '排行榜以结晶数量排名',
          ]}
        />

        {/* ── Tip ── */}
        <div className="ub-hp__tip">
          <img src={imgBubble} alt="" draggable={false} className="ub-hp__tip-char" />
          <span>💡 招满所有店员 → 攒到 $1B → 转生！每次都比上次快！</span>
        </div>

        <button className="ub-hp__btn" onPointerDown={onClose}>知道了！</button>
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
