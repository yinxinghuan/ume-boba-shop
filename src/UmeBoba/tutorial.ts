import type { GuideLine } from './types'

export type TutorialStepKind =
  | 'dialog'          // show popup, advance on dismiss
  | 'wait_tap_drink'  // no popup, highlight drink row, advance when player taps drink
  | 'wait_bar_full'   // no popup, advance when progress >= 1
  | 'wait_collect'    // no popup, highlight drink row, advance when coins increase
  | 'wait_buy'        // no popup, highlight buy button, advance when qty increases

export interface TutorialStep {
  kind: TutorialStepKind
  dialog?: GuideLine
  highlight?: 'drink_row' | 'buy_btn'
  arrowText?: { zh: string; en: string }
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ── 1. Welcome ─────────────────────────────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'happy',
      lines: {
        zh: ['欢迎来到 UMe 奶茶店！', '点饮品 → 等进度满 → 点击收取', '赚到的美元就是你的收益！'],
        en: ['Welcome to UMe Boba Shop!', 'Tap a drink → wait for the bar → tap to collect', 'The dollars you earn are your score!'],
      },
    },
  },
  // ── 2. Tap a drink ─────────────────────────────────────────────────────────
  {
    kind: 'wait_tap_drink',
    highlight: 'drink_row',
    arrowText: { zh: '点这里！', en: 'Tap here!' },
  },
  // ── 3. Wait for full bar ───────────────────────────────────────────────────
  {
    kind: 'wait_bar_full',
  },
  // ── 4. Collect ─────────────────────────────────────────────────────────────
  {
    kind: 'wait_collect',
    highlight: 'drink_row',
    arrowText: { zh: '收取！', en: 'Collect!' },
  },
  // ── 5. Buy more + income explanation ──────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'melonmick', expr: 'normal',
      lines: {
        zh: ['杯数越多，每轮收益越高！', '达到 10、25、50、100 杯时', '收益还会大幅跳升！'],
        en: ['More cups = higher income per cycle!', 'At 10, 25, 50, and 100 cups', 'income makes a huge jump!'],
      },
    },
  },
  {
    kind: 'wait_buy',
    highlight: 'buy_btn',
    arrowText: { zh: '买更多！', en: 'Buy more!' },
  },
  // ── 6. Prestige crystal system ─────────────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'lemonshark', expr: 'surprised',
      lines: {
        zh: ['店铺收入越高，等级越高！', '全局收益倍率随等级上升，', '最终能解锁月球旗舰站！'],
        en: ['More shop earnings = higher level!', 'Your global income multiplier grows,', 'and you\'ll eventually unlock the Lunar Flagship!'],
      },
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'bubblepearl', expr: 'happy',
      lines: {
        zh: ['总收入达到 $1B 后，', '可以进行「月球转生」🌙', '重置换结晶，全局收益永久提升！'],
        en: ['Once total earnings hit $1B,', 'you can do a Moon Prestige 🌙', 'Reset for crystals — permanent global boost!'],
      },
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'bubblepearl', expr: 'normal',
      lines: {
        zh: ['结晶越多，倍率越高，', '每次转生后推进速度更快，', '排行榜也以结晶数量排名！'],
        en: ['More crystals = higher multiplier,', 'each prestige run goes faster,', 'and the leaderboard ranks by crystal count!'],
      },
    },
  },
  // ── 7. Wrap-up ─────────────────────────────────────────────────────────────
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'happy',
      lines: {
        zh: ['招满店员、解锁所有饮品，', '攒够 $1B 就能转生了！', '加油，星际奶茶帝国等你来建！✨'],
        en: ['Hire all staff, unlock every drink,', 'reach $1B and you can prestige!', 'Good luck — your boba empire awaits! ✨'],
      },
    },
  },
]

export const TUTORIAL_DONE_KEY = 'ume-boba-tutorial-done'
