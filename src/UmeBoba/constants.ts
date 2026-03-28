import type { DrinkDef, ShopLevel } from './types'

// ── Shop levels ────────────────────────────────────────────────────────────────
export const SHOP_LEVELS: ShopLevel[] = [
  { level: 1, nameZh: '路边小摊',       threshold: 0,           multiplier: 1,    unlockDrinkId: 'pearl_milk_tea' },
  { level: 2, nameZh: '小奶茶铺',       threshold: 5_000,       multiplier: 1.5,  unlockDrinkId: 'watermelon'     },
  { level: 3, nameZh: '城市旗舰店',     threshold: 40_000,      multiplier: 2,    unlockDrinkId: 'mango'          },
  { level: 4, nameZh: '跨国连锁集团',   threshold: 250_000,     multiplier: 3,    unlockDrinkId: 'lemon'          },
  { level: 5, nameZh: '星际奶茶公司',   threshold: 1_500_000,   multiplier: 4,    unlockDrinkId: 'avocado'        },
  { level: 6, nameZh: '月球旗舰站',     threshold: 10_000_000,  multiplier: 6,    unlockDrinkId: 'angel'          },
]

export function getShopLevel(totalEarned: number): ShopLevel {
  let current = SHOP_LEVELS[0]
  for (const sl of SHOP_LEVELS) {
    if (totalEarned >= sl.threshold) current = sl
  }
  return current
}

export function getNextShopLevel(totalEarned: number): ShopLevel | null {
  return SHOP_LEVELS.find(sl => sl.threshold > totalEarned) ?? null
}

// ── Drinks ────────────────────────────────────────────────────────────────────
// unlockCost = same threshold as the shop level that introduces it
export const DRINKS: DrinkDef[] = [
  {
    id: 'pearl_milk_tea',
    emoji: '🧋',
    nameZh: '珍珠奶茶',
    color: '#f8a4c8',
    baseCycleMs: 3_000,
    baseIncome: 8,
    buyCostBase: 12,
    buyCostMult: 1.18,
    managerCost: 3_000,
    unlockCost: 0,
    milestones: [10, 25, 50, 100],
  },
  {
    id: 'watermelon',
    emoji: '🍉',
    nameZh: '西瓜特调',
    color: '#ff6b6b',
    baseCycleMs: 8_000,
    baseIncome: 40,
    buyCostBase: 200,
    buyCostMult: 1.16,
    managerCost: 60_000,
    unlockCost: 5_000,
    milestones: [10, 25, 50, 100],
  },
  {
    id: 'mango',
    emoji: '🐥',
    nameZh: '芒果波霸',
    color: '#ffd700',
    baseCycleMs: 20_000,
    baseIncome: 160,
    buyCostBase: 3_000,
    buyCostMult: 1.15,
    managerCost: 300_000,
    unlockCost: 40_000,
    milestones: [10, 25, 50, 100],
  },
  {
    id: 'lemon',
    emoji: '🍋',
    nameZh: '柠檬气泡',
    color: '#c8ff6b',
    baseCycleMs: 60_000,
    baseIncome: 700,
    buyCostBase: 40_000,
    buyCostMult: 1.14,
    managerCost: 1_500_000,
    unlockCost: 250_000,
    milestones: [10, 25, 50, 100],
  },
  {
    id: 'avocado',
    emoji: '🥑',
    nameZh: '牛油果拿铁',
    color: '#7fff7f',
    baseCycleMs: 3 * 60_000,
    baseIncome: 3_500,
    buyCostBase: 500_000,
    buyCostMult: 1.13,
    managerCost: 7_000_000,
    unlockCost: 1_500_000,
    milestones: [10, 25, 50, 100],
  },
  {
    id: 'angel',
    emoji: '😇',
    nameZh: '珍珠天使特调',
    color: '#c8b4ff',
    baseCycleMs: 15 * 60_000,
    baseIncome: 20_000,
    buyCostBase: 6_000_000,
    buyCostMult: 1.12,
    managerCost: 35_000_000,
    unlockCost: 10_000_000,
    milestones: [10, 25, 50, 100],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cost to buy `qty` more units starting from `owned` units */
export function buyCost(def: DrinkDef, owned: number, qty: number = 1): number {
  let total = 0
  for (let i = 0; i < qty; i++) {
    total += Math.ceil(def.buyCostBase * Math.pow(def.buyCostMult, owned + i))
  }
  return total
}

/** How many units can be bought with `budget` starting from `owned` */
export function maxBuyQty(def: DrinkDef, owned: number, budget: number): number {
  let qty = 0
  let remaining = budget
  while (true) {
    const cost = Math.ceil(def.buyCostBase * Math.pow(def.buyCostMult, owned + qty))
    if (cost > remaining) break
    remaining -= cost
    qty++
    if (qty > 10_000) break
  }
  return qty
}

/** Actual cycle ms accounting for milestones (each milestone cuts 20%, min 300ms) */
export function cycleMs(def: DrinkDef, qty: number): number {
  let ms = def.baseCycleMs
  for (const m of def.milestones) {
    if (qty >= m) ms = Math.max(300, ms * 0.80)
  }
  return ms
}

/** Income multiplier from drink-level milestones (each milestone × 2) */
export function milestoneMultiplier(def: DrinkDef, qty: number): number {
  let mult = 1
  for (const m of def.milestones) {
    if (qty >= m) mult *= 2
  }
  return mult
}

/** Coins per cycle with milestone multiplier applied */
export function incomePerCycle(def: DrinkDef, qty: number, shopMult = 1): number {
  return def.baseIncome * qty * milestoneMultiplier(def, qty) * shopMult
}

// ── Prestige ──────────────────────────────────────────────────────────────────

/** Minimum totalEarned to trigger prestige */
export const PRESTIGE_THRESHOLD = 1_000_000_000

/** Moon crystals earned from a prestige at the given totalEarned */
export function prestigeGain(totalEarned: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalEarned / 100_000_000)))
}

/** Global income multiplier from accumulated crystals (+20% each) */
export function prestigeMultiplier(crystals: number): number {
  return 1 + crystals * 0.2
}

/** Format large numbers */
export function fmt(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K'
  return Math.floor(n).toString()
}

/** Format as USD */
export function fmtUSD(n: number): string {
  return '$' + fmt(n)
}

/** Format cycle duration */
export function fmtMs(ms: number): string {
  if (ms >= 60_000) return (ms / 60_000).toFixed(1) + '分'
  if (ms >= 1_000)  return (ms / 1_000).toFixed(1) + '秒'
  return ms + 'ms'
}
