import { useCallback, useEffect, useRef, useState } from 'react'
import type { DrinkProgress, GameSave } from '../types'
import { DRINKS, buyCost, cycleMs, incomePerCycle, getShopLevel } from '../constants'
import { playCollect, playBuy, playManager, playStart } from '../utils/sounds'

// ── Default save ──────────────────────────────────────────────────────────────
export function defaultSave(): GameSave {
  const drinks: Record<string, DrinkProgress> = {}
  for (const d of DRINKS) {
    drinks[d.id] = { qty: 0, cycleStarted: 0, hasManager: false }
  }
  drinks['pearl_milk_tea'].qty = 1
  return { coins: 0, totalEarned: 0, drinks, lastActive: Date.now() }
}

/** Offline earnings: simulate all manager-driven cycles */
export function calcOffline(save: GameSave): number {
  const elapsed = Date.now() - save.lastActive
  if (elapsed < 5000) return 0
  const shopMult = getShopLevel(save.totalEarned).multiplier
  let earned = 0
  for (const def of DRINKS) {
    const dp = save.drinks[def.id]
    if (!dp || dp.qty === 0 || !dp.hasManager) continue
    const ms = cycleMs(def, dp.qty)
    const cycles = Math.floor(elapsed / ms)
    earned += cycles * incomePerCycle(def, dp.qty, shopMult)
  }
  return Math.floor(earned * 0.6)
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export interface FloatNum { id: string; value: number; x: number; y: number }

export function useAdCap(
  initialSave: GameSave,
  onSave: (s: GameSave) => void,
  active: boolean = false,
) {
  const [save, setSave] = useState<GameSave>(initialSave)
  const [floats, setFloats] = useState<FloatNum[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const saveRef = useRef(save)
  saveRef.current = save

  // Sync when the loaded save arrives (initialSave starts as defaultSave,
  // then updates once after async load — we apply it exactly once)
  const prevInitRef = useRef(initialSave)
  useEffect(() => {
    if (initialSave !== prevInitRef.current) {
      prevInitRef.current = initialSave
      setSave(initialSave)
    }
  }, [initialSave])

  const activeRef = useRef(active)
  activeRef.current = active

  // ── Progress tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const newProgress: Record<string, number> = {}
      const earned: Record<string, number> = {}

      for (const def of DRINKS) {
        const dp = saveRef.current.drinks[def.id]
        if (!dp || dp.qty === 0) { newProgress[def.id] = 0; continue }

        if (dp.cycleStarted === 0) {
          newProgress[def.id] = 1
          continue
        }

        const ms = cycleMs(def, dp.qty)
        const elapsed = now - dp.cycleStarted
        const pct = Math.min(elapsed / ms, 1)
        newProgress[def.id] = pct

        if (pct >= 1 && dp.hasManager && activeRef.current) {
          const shopMult = getShopLevel(saveRef.current.totalEarned).multiplier
          earned[def.id] = incomePerCycle(def, dp.qty, shopMult)
        }
      }

      setProgress(newProgress)

      if (Object.keys(earned).length > 0) {
        // Play collect sound for auto-earnings
        const totalEarned = Object.values(earned).reduce((a, b) => a + b, 0)
        playCollect(totalEarned)

        setSave(s => {
          let coins = s.coins
          let totalEarnedAcc = s.totalEarned
          const drinks = { ...s.drinks }
          for (const [id, amt] of Object.entries(earned)) {
            coins += amt
            totalEarnedAcc += amt
            drinks[id] = { ...drinks[id], cycleStarted: Date.now() }
          }
          return { ...s, coins, totalEarned: totalEarnedAcc, drinks }
        })
      }
    }, 100)
    return () => clearInterval(id)
  }, [])

  // ── Auto-save every 30s ───────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => onSave(saveRef.current), 30_000)
    return () => clearInterval(id)
  }, [onSave])

  // ── Tap a drink row to collect ────────────────────────────────────────────
  const tapDrink = useCallback((drinkId: string, x: number, y: number) => {
    setSave(s => {
      const dp = s.drinks[drinkId]
      const def = DRINKS.find(d => d.id === drinkId)!
      if (!dp || dp.qty === 0 || dp.hasManager) return s

      const now = Date.now()

      if (dp.cycleStarted === 0) {
        playStart()
        return { ...s, drinks: { ...s.drinks, [drinkId]: { ...dp, cycleStarted: now } } }
      }

      const ms = cycleMs(def, dp.qty)
      if (now - dp.cycleStarted < ms) return s

      const shopMult = getShopLevel(s.totalEarned).multiplier
      const earned = incomePerCycle(def, dp.qty, shopMult)
      playCollect(earned)

      const id = crypto.randomUUID()
      setFloats(f => [...f, { id, value: earned, x, y }])
      setTimeout(() => setFloats(f => f.filter(n => n.id !== id)), 1200)

      return {
        ...s,
        coins: s.coins + earned,
        totalEarned: s.totalEarned + earned,
        drinks: { ...s.drinks, [drinkId]: { ...dp, cycleStarted: now } },
      }
    })
  }, [])

  // ── Buy 1 unit ────────────────────────────────────────────────────────────
  const buyDrink = useCallback((drinkId: string) => {
    setSave(s => {
      const dp = s.drinks[drinkId]
      const def = DRINKS.find(d => d.id === drinkId)!
      const cost = buyCost(def, dp.qty)
      if (s.coins < cost) return s
      playBuy()
      const newQty = dp.qty + 1
      const cycleStarted = newQty === 1 ? Date.now() : dp.cycleStarted
      return {
        ...s,
        coins: s.coins - cost,
        drinks: { ...s.drinks, [drinkId]: { ...dp, qty: newQty, cycleStarted } },
      }
    })
  }, [])

  // ── Hire manager ──────────────────────────────────────────────────────────
  const hireManager = useCallback((drinkId: string) => {
    setSave(s => {
      const dp = s.drinks[drinkId]
      const def = DRINKS.find(d => d.id === drinkId)!
      if (s.coins < def.managerCost || dp.hasManager) return s
      playManager()
      return {
        ...s,
        coins: s.coins - def.managerCost,
        drinks: {
          ...s.drinks,
          [drinkId]: { ...dp, hasManager: true, cycleStarted: dp.cycleStarted || Date.now() },
        },
      }
    })
  }, [])

  return { save, setSave, progress, floats, tapDrink, buyDrink, hireManager }
}
