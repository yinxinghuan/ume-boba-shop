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
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'happy',
      lines: ['欢迎来到 UMe 奶茶店！', '我是 YooMe～', '来，我教你怎么开始赚美元！'],
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'normal',
      lines: ['看到这杯珍珠奶茶了吗？', '点一下它，就开始做奶茶！', '→ 试试点一下吧！'],
    },
  },
  {
    kind: 'wait_tap_drink',
    highlight: 'drink_row',
    arrowText: '点这里！',
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'normal',
      lines: ['好！进度条开始走了～', '等它走到头，', '再点一次就能收美元！'],
    },
  },
  {
    kind: 'wait_bar_full',
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'surprised',
      lines: ['进度条满了！', '快点一下珍珠奶茶，', '把美元收起来！'],
    },
  },
  {
    kind: 'wait_collect',
    highlight: 'drink_row',
    arrowText: '点这里收取！',
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'happy',
      lines: ['收到了！这是你的第一笔美元！', '现在教你怎么赚更多——'],
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'melonmick', expr: 'normal',
      lines: ['嘿！看右边那个按钮！', '买更多杯数，每轮收益更高，', '速度也会更快！来买一杯！'],
    },
  },
  {
    kind: 'wait_buy',
    highlight: 'buy_btn',
    arrowText: '点这里买！',
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'melonmick', expr: 'happy',
      lines: ['买了！看进度条是不是快了一点？', '数量越多 → 收益越高+速度越快！', '这是最重要的秘诀！'],
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'lemonshark', expr: 'normal',
      lines: ['最后一招——招店员！', '看饮品下面的小字"招店员"，', '雇了之后自动收，关掉游戏也赚钱！'],
    },
  },
  {
    kind: 'dialog',
    dialog: {
      char: 'yoome', expr: 'happy',
      lines: ['你学会了！', '赚美元、买更多、招店员，', '解锁更多饮品～今天的奶茶加点可爱吗？✨'],
    },
  },
]

export const TUTORIAL_DONE_KEY = 'ume-boba-tutorial-done'
