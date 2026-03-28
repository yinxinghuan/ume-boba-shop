import type { GuideLine } from './guideLines'

export type TutorialStepKind =
  | 'dialog'          // show popup, advance on dismiss
  | 'wait_tap_drink'  // no popup, highlight drink row, advance when player taps drink
  | 'wait_bar_full'   // no popup, advance when progress >= 1
  | 'wait_collect'    // no popup, highlight drink row, advance when coins increase
  | 'wait_buy'        // no popup, highlight buy button, advance when qty increases

export interface TutorialStep {
  kind: TutorialStepKind
  dialog?: GuideLine   // only for 'dialog' steps
  // For highlight steps: which element to spotlight (CSS class suffix)
  highlight?: 'drink_row' | 'buy_btn'
  arrowText?: string   // text shown near the arrow
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ── 1. 欢迎 ────────────────────────────────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'happy',
      lines: ['欢迎来到 UMe 奶茶店！', '点饮品 → 等进度满 → 点击收取', '赚到的美元就是你的收益！'],
    },
  },
  // ── 2. 点饮品 ──────────────────────────────────────────────────────────────
  {
    kind: 'wait_tap_drink',
    highlight: 'drink_row',
    arrowText: '点这里！',
  },
  // ── 3. 等进度满 ────────────────────────────────────────────────────────────
  {
    kind: 'wait_bar_full',
  },
  // ── 4. 收取 ────────────────────────────────────────────────────────────────
  {
    kind: 'wait_collect',
    highlight: 'drink_row',
    arrowText: '收取！',
  },
  // ── 5. 买更多 → 收益说明 ────────────────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'melonmick', expr: 'normal',
      lines: ['杯数越多，每轮收益越高！', '达到 10、25、50、100 杯时', '收益还会大幅跳升！'],
    },
  },
  {
    kind: 'wait_buy',
    highlight: 'buy_btn',
    arrowText: '买更多！',
  },
  // ── 6. 转生结晶系统 ─────────────────────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'lemonshark', expr: 'surprised',
      lines: ['店铺收入越高，等级越高！', '全局收益倍率随等级上升，', '最终能解锁月球旗舰站！'],
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'bubblepearl', expr: 'happy',
      lines: ['总收入达到 $1B 后，', '可以进行「月球转生」🌙', '重置换结晶，全局收益永久提升！'],
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'bubblepearl', expr: 'normal',
      lines: ['结晶越多，倍率越高，', '每次转生后推进速度更快，', '排行榜也以结晶数量排名！'],
    },
  },
  // ── 7. 收尾 ─────────────────────────────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'happy',
      lines: ['招满店员、解锁所有饮品，', '攒够 $1B 就能转生了！', '加油，星际奶茶帝国等你来建！✨'],
    },
  },
]

export const TUTORIAL_DONE_KEY = 'ume-boba-tutorial-done'
