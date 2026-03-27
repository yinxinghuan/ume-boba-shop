export type GuideExpr = 'normal' | 'happy' | 'surprised'
export type GuideChar = 'yoome' | 'melonmick' | 'lemonshark' | 'guacpiggy' | 'mangochick' | 'bubblepearl'

export interface GuideLine {
  char: GuideChar
  expr: GuideExpr
  lines: string[]
}

// One-time triggers (blocked by seen-set after first show)
export type GuideTrigger =
  | 'first_buy'
  | 'first_manager'
  | 'can_hire_manager'
  | 'all_managers'
  | 'offline_coins'
  | 'offline_no_manager'
  | 'unlock_melonmick'
  | 'unlock_lemonshark'
  | 'unlock_guacpiggy'
  | 'unlock_mangochick'
  | 'unlock_bubblepearl'
  | 'unlock_all'
  // Per-drink qty milestones — fire once per drink per milestone
  | `qty_${string}_10`
  | `qty_${string}_25`
  | `qty_${string}_50`
  | `qty_${string}_100`
  // Coin-total milestones
  | 'coins_100' | 'coins_500' | 'coins_1k' | 'coins_5k'
  | 'coins_10k' | 'coins_50k' | 'coins_100k'
  // Periodic rotating tips (shown roughly every 3 min, each once per session)
  | 'tip_1' | 'tip_2' | 'tip_3' | 'tip_4' | 'tip_5' | 'tip_6'
  | 'tip_7' | 'tip_8' | 'tip_9' | 'tip_10'

// These triggers bypass the localStorage seen-set (can fire every session)
export const SESSION_ONLY_TRIGGERS = new Set<string>([
  'tip_1','tip_2','tip_3','tip_4','tip_5',
  'tip_6','tip_7','tip_8','tip_9','tip_10',
])

// Rotating tip order
export const TIP_SEQUENCE: GuideTrigger[] = [
  'tip_1','tip_2','tip_3','tip_4','tip_5',
  'tip_6','tip_7','tip_8','tip_9','tip_10',
]

// ── Per-drink qty milestone lines (shared by all drinks) ──────────────────────
const QTY_LINES: Record<10 | 25 | 50 | 100, GuideLine> = {
  10: {
    char: 'melonmick', expr: 'happy',
    lines: ['10 杯！里程碑达成！', '数量越多每轮收益越高，', '继续冲 25 杯吧！'],
  },
  25: {
    char: 'mangochick', expr: 'happy',
    lines: ['25 杯！利润大涨！🎉', '你已经是个小老板了，', '50 杯，更大的跳升等着你！'],
  },
  50: {
    char: 'guacpiggy', expr: 'happy',
    lines: ['50 杯！收益翻倍！', '记得给每种饮品都招店员，', '离开手机也能赚钱！🥑'],
  },
  100: {
    char: 'bubblepearl', expr: 'surprised',
    lines: ['100 杯！！太厉害了！✨', '你简直是奶茶界的传说，', '继续冲，收益没有上限的！'],
  },
}

export function getQtyMilestoneLine(qty: 10 | 25 | 50 | 100): GuideLine {
  return QTY_LINES[qty]
}

export const GUIDE_LINES: Partial<Record<GuideTrigger, GuideLine>> = {
  // ── Purchases ──────────────────────────────────────────────────────────────
  first_buy: {
    char: 'melonmick', expr: 'happy',
    lines: ['买了！数量越多，', '每轮收益越高，速度也越快！', '多买，才是正确打开方式！'],
  },

  // ── Managers ───────────────────────────────────────────────────────────────
  can_hire_manager: {
    char: 'lemonshark', expr: 'surprised',
    lines: ['看到"招店员"按钮了吗？', '雇了之后进度条满了自动收取，', '完全不用盯着屏幕！快点！！'],
  },
  first_manager: {
    char: 'lemonshark', expr: 'happy',
    lines: ['店员上岗了！', '关掉游戏它也帮你赚，', '回来就有离线收益领！'],
  },
  all_managers: {
    char: 'bubblepearl', expr: 'happy',
    lines: ['所有店员都上岗了！', '关掉手机我们帮你赚，', '回来再领就好啦～🌙'],
  },

  // ── Offline ─────────────────────────────────────────────────────────────────
  offline_coins: {
    char: 'yoome', expr: 'happy',
    lines: ['你回来啦！', '店员们帮你守着店，', '快来收钱！💰'],
  },
  offline_no_manager: {
    char: 'yoome', expr: 'surprised',
    lines: ['你不在的时候……', '店里没人守😢', '招上店员，下次离开也有收入哦！'],
  },

  // ── Unlocks ─────────────────────────────────────────────────────────────────
  unlock_melonmick: {
    char: 'melonmick', expr: 'happy',
    lines: ['热到不想说话？', '来口我的西瓜特调！', '量大利润大，冲吧！'],
  },
  unlock_lemonshark: {
    char: 'lemonshark', expr: 'happy',
    lines: ['生活太苦？', '来点"柠"力爆棚的快乐！', '柠檬鲨，正式登场！'],
  },
  unlock_guacpiggy: {
    char: 'guacpiggy', expr: 'happy',
    lines: ['今天的奶茶，', '必须"果"力全开！', '牛油果拿铁，上架啦～'],
  },
  unlock_mangochick: {
    char: 'mangochick', expr: 'happy',
    lines: ['没有芒果的奶茶，', '就像没有太阳的夏天！☀️', '来，解锁我！'],
  },
  unlock_bubblepearl: {
    char: 'bubblepearl', expr: 'happy',
    lines: ['喝一口珍珠奶茶，', '烦恼像泡泡一样飞走啦～', '记得招店员，离线也有钱！'],
  },
  unlock_all: {
    char: 'bubblepearl', expr: 'surprised',
    lines: ['全部饮品都解锁了！', '招齐所有店员，', '你就是真正的大老板！🏆'],
  },

  // ── Coin milestones ─────────────────────────────────────────────────────────
  coins_100: {
    char: 'yoome', expr: 'happy',
    lines: ['100 美元！', '第一个小里程碑达成～', '继续点，越来越多的！'],
  },
  coins_500: {
    char: 'melonmick', expr: 'normal',
    lines: ['500 美元！', '现在可以多买几杯了，', '数量越多收益越快！'],
  },
  coins_1k: {
    char: 'mangochick', expr: 'happy',
    lines: ['1000 美元！🎉', '快去买更多数量，', '或者给饮品招上店员！'],
  },
  coins_5k: {
    char: 'lemonshark', expr: 'happy',
    lines: ['5000 美元！你真厉害！', '有店员的话离线也赚钱，', '没店员……还不快去招！'],
  },
  coins_10k: {
    char: 'guacpiggy', expr: 'surprised',
    lines: ['1万美元！！', '你已经是认真玩家了，', '目标：招满所有店员！🥑'],
  },
  coins_50k: {
    char: 'bubblepearl', expr: 'surprised',
    lines: ['5万美元！✨', '这都是泡泡在帮你积累的！', '里程碑突破收益还会跳升！'],
  },
  coins_100k: {
    char: 'bubblepearl', expr: 'happy',
    lines: ['10万美元！传奇！🏆', '奶茶店已经是你的帝国了，', '继续无限冲吧！'],
  },

  // ── Periodic rotating tips ──────────────────────────────────────────────────
  tip_1: {
    char: 'yoome', expr: 'normal',
    lines: ['小提示：', '进度条满了必须点一下才能收取，', '不会自动入账哦！'],
  },
  tip_2: {
    char: 'melonmick', expr: 'normal',
    lines: ['买到 10/25/50/100 杯时，', '收益会大幅跳升！', '这几个数字值得冲！'],
  },
  tip_3: {
    char: 'lemonshark', expr: 'normal',
    lines: ['有了店员，', '关掉手机它也帮你赚，', '回来就有离线收益等你领！'],
  },
  tip_4: {
    char: 'mangochick', expr: 'happy',
    lines: ['不同饮品同时进行，', '收益叠加才快！', '记得每种都要点才会走进度！'],
  },
  tip_5: {
    char: 'guacpiggy', expr: 'normal',
    lines: ['买更多不只是钱的问题——', '数量越高每杯产出也越高，', '投资回报率超划算！🥑'],
  },
  tip_6: {
    char: 'bubblepearl', expr: 'normal',
    lines: ['离开前先招好店员，', '回来的时候，', '美元就一直在涨了！'],
  },
  tip_7: {
    char: 'yoome', expr: 'happy',
    lines: ['解锁新饮品需要累计收益，', '不是现有余额，', '所以多赚多买很重要！'],
  },
  tip_8: {
    char: 'melonmick', expr: 'surprised',
    lines: ['你知道吗，', '有了店员再买数量，', '收益提升是指数级的！快算！'],
  },
  tip_9: {
    char: 'lemonshark', expr: 'happy',
    lines: ['柠檬鲨提醒你：', '手动点击最多同时经营 1 种，', '店员才是真正的多线作战！'],
  },
  tip_10: {
    char: 'mangochick', expr: 'normal',
    lines: ['攒够钱先干什么？', '买到下一个里程碑 > 招店员 > 解锁新饮品，', '按这个顺序效率最高！'],
  },
}
