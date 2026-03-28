export interface ShopLevel {
  level: number
  nameZh: string
  threshold: number     // totalEarned required
  multiplier: number    // global income multiplier at this level
  unlockDrinkId: string
}

export interface DrinkDef {
  id: string
  emoji: string
  nameZh: string
  color: string          // accent color for this drink's bar
  baseCycleMs: number    // cycle duration at qty=1
  baseIncome: number     // coins per cycle at qty=1
  buyCostBase: number    // first purchase cost
  buyCostMult: number    // cost multiplier per unit
  managerCost: number    // coins to hire manager
  unlockCost: number     // totalEarned required to unlock row
  milestones: number[]   // qty milestones that double income
}

export interface DrinkProgress {
  qty: number
  cycleStarted: number    // Date.now() when current cycle began; 0 = waiting for tap to start
  hasManager: boolean
}

export interface GameSave {
  coins: number
  totalEarned: number
  drinks: Record<string, DrinkProgress>
  lastActive: number
  tutorialDone?: boolean
}
