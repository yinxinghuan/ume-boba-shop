import type { GuideLine } from './types'

export type GuideExpr = 'normal' | 'happy' | 'surprised'
export type GuideChar = 'yoome' | 'melonmick' | 'lemonshark' | 'guacpiggy' | 'mangochick' | 'bubblepearl'

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
    lines: {
      zh: ['10 杯！里程碑达成！', '数量越多每轮收益越高，', '继续冲 25 杯吧！'],
      en: ['10 cups — milestone hit!', 'More cups means more income,', 'keep going to 25!'],
    },
  },
  25: {
    char: 'mangochick', expr: 'happy',
    lines: {
      zh: ['25 杯！利润大涨！🎉', '你已经是个小老板了，', '50 杯，更大的跳升等着你！'],
      en: ['25 cups — profits surging! 🎉', "You're a real entrepreneur now,", 'aim for 50 for an even bigger boost!'],
    },
  },
  50: {
    char: 'guacpiggy', expr: 'happy',
    lines: {
      zh: ['50 杯！收益翻倍！', '记得给每种饮品都招店员，', '离开手机也能赚钱！🥑'],
      en: ['50 cups — income doubled!', 'Remember to hire staff for each drink,', 'so you earn even when offline! 🥑'],
    },
  },
  100: {
    char: 'bubblepearl', expr: 'surprised',
    lines: {
      zh: ['100 杯！！太厉害了！✨', '你简直是奶茶界的传说，', '继续冲，收益没有上限的！'],
      en: ['100 cups!! Incredible! ✨', "You're a boba legend,", 'keep going — the sky is the limit!'],
    },
  },
}

export function getQtyMilestoneLine(qty: 10 | 25 | 50 | 100): GuideLine {
  return QTY_LINES[qty]
}

export const GUIDE_LINES: Partial<Record<GuideTrigger, GuideLine>> = {
  // ── Purchases ──────────────────────────────────────────────────────────────
  first_buy: {
    char: 'melonmick', expr: 'happy',
    lines: {
      zh: ['买了！数量越多，', '每轮收益越高，速度也越快！', '多买，才是正确打开方式！'],
      en: ['Bought some! More cups =', 'higher income and faster cycles!', 'Keep buying — that\'s the way!'],
    },
  },

  // ── Managers ───────────────────────────────────────────────────────────────
  can_hire_manager: {
    char: 'lemonshark', expr: 'surprised',
    lines: {
      zh: ['看到"招店员"按钮了吗？', '雇了之后进度条满了自动收取，', '完全不用盯着屏幕！快点！！'],
      en: ['See the "Employ" button?', 'After hiring, the bar auto-collects —', 'no screen-watching needed! Do it!!'],
    },
  },
  first_manager: {
    char: 'lemonshark', expr: 'happy',
    lines: {
      zh: ['店员上岗了！', '关掉游戏它也帮你赚，', '回来就有离线收益领！'],
      en: ['Staff member hired!', 'They\'ll earn for you even when closed —', 'come back to collect offline earnings!'],
    },
  },
  all_managers: {
    char: 'bubblepearl', expr: 'happy',
    lines: {
      zh: ['所有店员都上岗了！', '关掉手机我们帮你赚，', '回来再领就好啦～🌙'],
      en: ['All staff hired!', 'We\'ll keep earning while you\'re away —', 'just come back to collect! 🌙'],
    },
  },

  // ── Offline ─────────────────────────────────────────────────────────────────
  offline_coins: {
    char: 'yoome', expr: 'happy',
    lines: {
      zh: ['你回来啦！', '店员们帮你守着店，', '快来收钱！💰'],
      en: ['You\'re back!', 'Your staff kept the shop running —', 'come collect your money! 💰'],
    },
  },
  offline_no_manager: {
    char: 'yoome', expr: 'surprised',
    lines: {
      zh: ['你不在的时候……', '店里没人守😢', '招上店员，下次离开也有收入哦！'],
      en: ['While you were away…', 'nobody was minding the shop 😢', 'Hire staff so you earn offline next time!'],
    },
  },

  // ── Unlocks ─────────────────────────────────────────────────────────────────
  unlock_melonmick: {
    char: 'melonmick', expr: 'happy',
    lines: {
      zh: ['热到不想说话？', '来口我的西瓜特调！', '量大利润大，冲吧！'],
      en: ['Too hot to talk?', 'Try my Watermelon Splash!', 'Big volume, big profits — let\'s go!'],
    },
  },
  unlock_lemonshark: {
    char: 'lemonshark', expr: 'happy',
    lines: {
      zh: ['生活太苦？', '来点"柠"力爆棚的快乐！', '柠檬鲨，正式登场！'],
      en: ['Life got you down?', 'Squeeze in some citrus happiness!', 'Lemon Shark, officially on the menu!'],
    },
  },
  unlock_guacpiggy: {
    char: 'guacpiggy', expr: 'happy',
    lines: {
      zh: ['今天的奶茶，', '必须"果"力全开！', '牛油果拿铁，上架啦～'],
      en: ['Today\'s boba order:', 'go full avocado!', 'Avocado Latte is now available!'],
    },
  },
  unlock_mangochick: {
    char: 'mangochick', expr: 'happy',
    lines: {
      zh: ['没有芒果的奶茶，', '就像没有太阳的夏天！☀️', '来，解锁我！'],
      en: ['Boba without mango', 'is like summer without sunshine! ☀️', 'Come on, unlock me already!'],
    },
  },
  unlock_bubblepearl: {
    char: 'bubblepearl', expr: 'happy',
    lines: {
      zh: ['喝一口珍珠奶茶，', '烦恼像泡泡一样飞走啦～', '记得招店员，离线也有钱！'],
      en: ['One sip of Pearl Milk Tea', 'and your worries just pop away~', 'Hire staff to earn offline too!'],
    },
  },
  unlock_all: {
    char: 'bubblepearl', expr: 'surprised',
    lines: {
      zh: ['全部饮品都解锁了！', '招齐所有店员，', '你就是真正的大老板！🏆'],
      en: ['All drinks unlocked!', 'Hire every staff member', 'and you\'ll be the ultimate boss! 🏆'],
    },
  },

  // ── Coin milestones ─────────────────────────────────────────────────────────
  coins_100: {
    char: 'yoome', expr: 'happy',
    lines: {
      zh: ['100 美元！', '第一个小里程碑达成～', '继续点，越来越多的！'],
      en: ['$100!', 'First little milestone reached!', 'Keep tapping — it only gets bigger!'],
    },
  },
  coins_500: {
    char: 'melonmick', expr: 'normal',
    lines: {
      zh: ['500 美元！', '现在可以多买几杯了，', '数量越多收益越快！'],
      en: ['$500!', 'Time to buy a few more cups —', 'more cups means faster income!'],
    },
  },
  coins_1k: {
    char: 'mangochick', expr: 'happy',
    lines: {
      zh: ['1000 美元！🎉', '快去买更多数量，', '或者给饮品招上店员！'],
      en: ['$1,000! 🎉', 'Buy more cups', 'or hire a staff member for a drink!'],
    },
  },
  coins_5k: {
    char: 'lemonshark', expr: 'happy',
    lines: {
      zh: ['5000 美元！你真厉害！', '有店员的话离线也赚钱，', '没店员……还不快去招！'],
      en: ['$5,000 — impressive!', 'With staff you earn offline too,', 'no staff yet? Go hire one now!'],
    },
  },
  coins_10k: {
    char: 'guacpiggy', expr: 'surprised',
    lines: {
      zh: ['1万美元！！', '你已经是认真玩家了，', '目标：招满所有店员！🥑'],
      en: ['$10,000!!', 'You\'re a serious player now —', 'goal: hire staff for every drink! 🥑'],
    },
  },
  coins_50k: {
    char: 'bubblepearl', expr: 'surprised',
    lines: {
      zh: ['5万美元！✨', '这都是泡泡在帮你积累的！', '里程碑突破收益还会跳升！'],
      en: ['$50,000! ✨', 'The pearls have been working hard!', 'Income jumps at milestone cup counts too!'],
    },
  },
  coins_100k: {
    char: 'bubblepearl', expr: 'happy',
    lines: {
      zh: ['10万美元！传奇！🏆', '奶茶店已经是你的帝国了，', '继续无限冲吧！'],
      en: ['$100,000 — legendary! 🏆', 'Your boba shop is an empire now —', 'keep going, there\'s no ceiling!'],
    },
  },

  // ── Periodic rotating tips ──────────────────────────────────────────────────
  tip_1: {
    char: 'yoome', expr: 'normal',
    lines: {
      zh: ['小提示：', '进度条满了必须点一下才能收取，', '不会自动入账哦！'],
      en: ['Tip:', 'A full bar won\'t auto-collect —', 'you need to tap it to claim!'],
    },
  },
  tip_2: {
    char: 'melonmick', expr: 'normal',
    lines: {
      zh: ['买到 10/25/50/100 杯时，', '收益会大幅跳升！', '这几个数字值得冲！'],
      en: ['At 10 / 25 / 50 / 100 cups,', 'income makes a big jump!', 'Those milestones are worth grinding for!'],
    },
  },
  tip_3: {
    char: 'lemonshark', expr: 'normal',
    lines: {
      zh: ['有了店员，', '关掉手机它也帮你赚，', '回来就有离线收益等你领！'],
      en: ['With staff hired,', 'they earn even when you close the game —', 'come back to collect offline earnings!'],
    },
  },
  tip_4: {
    char: 'mangochick', expr: 'happy',
    lines: {
      zh: ['不同饮品同时进行，', '收益叠加才快！', '记得每种都要点才会走进度！'],
      en: ['Run multiple drinks at once', 'to stack up income fast!', 'Remember to tap each one to start it!'],
    },
  },
  tip_5: {
    char: 'guacpiggy', expr: 'normal',
    lines: {
      zh: ['买更多不只是钱的问题——', '数量越高每杯产出也越高，', '投资回报率超划算！🥑'],
      en: ['Buying more isn\'t just about quantity —', 'each cup also produces more at higher counts,', 'the ROI is amazing! 🥑'],
    },
  },
  tip_6: {
    char: 'bubblepearl', expr: 'normal',
    lines: {
      zh: ['离开前先招好店员，', '回来的时候，', '美元就一直在涨了！'],
      en: ['Before you leave, hire your staff —', 'when you come back,', 'the dollars will have been piling up!'],
    },
  },
  tip_7: {
    char: 'yoome', expr: 'happy',
    lines: {
      zh: ['解锁新饮品需要累计收益，', '不是现有余额，', '所以多赚多买很重要！'],
      en: ['Unlocking new drinks requires total earnings,', 'not your current balance,', 'so keep earning and buying!'],
    },
  },
  tip_8: {
    char: 'melonmick', expr: 'surprised',
    lines: {
      zh: ['你知道吗，', '有了店员再买数量，', '收益提升是指数级的！快算！'],
      en: ['Did you know:', 'having staff AND buying more cups', 'gives exponential income growth? Do the math!'],
    },
  },
  tip_9: {
    char: 'lemonshark', expr: 'happy',
    lines: {
      zh: ['柠檬鲨提醒你：', '手动点击最多同时经营 1 种，', '店员才是真正的多线作战！'],
      en: ['Lemon Shark tip:', 'you can only tap one drink at a time,', 'but staff run all of them in parallel!'],
    },
  },
  tip_10: {
    char: 'mangochick', expr: 'normal',
    lines: {
      zh: ['攒够钱先干什么？', '买到下一个里程碑 > 招店员 > 解锁新饮品，', '按这个顺序效率最高！'],
      en: ['Best spending priority:', 'reach next milestone > hire staff > unlock new drinks —', 'that order maximizes efficiency!'],
    },
  },
}
