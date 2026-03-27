import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GUIDE_LINES, GuideLine, GuideTrigger,
  SESSION_ONLY_TRIGGERS, TIP_SEQUENCE,
  getQtyMilestoneLine,
} from '../guideLines'
import type { GameSave } from '../types'
import { DRINKS } from '../constants'

const SEEN_KEY = 'ume-boba-guide-seen'
const TIP_INTERVAL_MS = 3 * 60 * 1000  // show a tip every 3 minutes

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function persistSeen(s: Set<string>) {
  // Only persist non-session triggers
  const toSave = [...s].filter(k => !SESSION_ONLY_TRIGGERS.has(k))
  localStorage.setItem(SEEN_KEY, JSON.stringify(toSave))
}

export function useGuide(save: GameSave, loaded: boolean) {
  const [current, setCurrent] = useState<GuideLine | null>(null)
  const seen = useRef<Set<string>>(loadSeen())
  // Session-only seen set (resets each session)
  const sessionSeen = useRef<Set<string>>(new Set())
  const queueRef = useRef<Array<{ key: string; line: GuideLine }>>([])
  const showing = useRef(false)

  const enqueue = useCallback((key: string, line: GuideLine) => {
    const isSessionOnly = SESSION_ONLY_TRIGGERS.has(key)
    const alreadySeen = isSessionOnly
      ? sessionSeen.current.has(key)
      : seen.current.has(key)
    if (alreadySeen) return
    if (queueRef.current.some(q => q.key === key)) return
    queueRef.current.push({ key, line })
    if (!showing.current) flush()
  }, []) // eslint-disable-line

  function flush() {
    const next = queueRef.current.shift()
    if (!next) { showing.current = false; return }
    showing.current = true
    const { key, line } = next
    if (SESSION_ONLY_TRIGGERS.has(key)) {
      sessionSeen.current.add(key)
    } else {
      seen.current.add(key)
      persistSeen(seen.current)
    }
    setCurrent(line)
  }

  const dismiss = useCallback(() => {
    setCurrent(null)
    setTimeout(flush, 350)
  }, [])

  const show = useCallback((trigger: GuideTrigger) => {
    const line = GUIDE_LINES[trigger]
    if (!line) return
    enqueue(trigger, line)
  }, [enqueue])

  // ── Tip rotation: show a tip every TIP_INTERVAL_MS ──────────────────────────
  const tipIndexRef = useRef(0)
  useEffect(() => {
    if (!loaded) return
    const id = setInterval(() => {
      const idx = tipIndexRef.current % TIP_SEQUENCE.length
      const trigger = TIP_SEQUENCE[idx]
      tipIndexRef.current++
      const line = GUIDE_LINES[trigger]
      if (line) enqueue(trigger, line)
    }, TIP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [loaded, enqueue])

  // ── State-driven triggers ────────────────────────────────────────────────────
  const prevTotalRef   = useRef(0)
  const prevCoinsRef   = useRef(0)
  const prevDrinksRef  = useRef<GameSave['drinks']>({})

  useEffect(() => {
    if (!loaded) return

    const prevTotal  = prevTotalRef.current
    const total      = save.totalEarned
    const prevCoins  = prevCoinsRef.current
    const coins      = save.coins

    // ── New drink unlocks ──
    for (const def of DRINKS) {
      const wasUnlocked = prevTotal >= def.unlockCost && def.unlockCost > 0
      const nowUnlocked = total   >= def.unlockCost && def.unlockCost > 0
      if (!wasUnlocked && nowUnlocked) {
        const trigger = `unlock_${def.id}` as GuideTrigger
        if (GUIDE_LINES[trigger]) show(trigger)
      }
      if (def === DRINKS[DRINKS.length - 1] && !wasUnlocked && nowUnlocked) {
        show('unlock_all')
      }

      const dp     = save.drinks[def.id]
      const prevDp = prevDrinksRef.current[def.id]
      if (!dp) continue

      // ── First buy of any drink ──
      if ((!prevDp || prevDp.qty === 0) && dp.qty > 0) show('first_buy')

      // ── Per-drink qty milestones ──
      const milestones = [10, 25, 50, 100] as const
      for (const m of milestones) {
        const prevQty = prevDp?.qty ?? 0
        if (prevQty < m && dp.qty >= m) {
          const key = `qty_${def.id}_${m}` as GuideTrigger
          enqueue(key, getQtyMilestoneLine(m))
        }
      }

      // ── First manager / all managers ──
      if (dp.hasManager && prevDp && !prevDp.hasManager) {
        show('first_manager')
        const visible = DRINKS.filter(d => save.totalEarned >= d.unlockCost)
        if (visible.every(d => save.drinks[d.id]?.hasManager)) show('all_managers')
      }
    }

    // ── Coin total milestones ──
    const coinMilestones: [number, GuideTrigger][] = [
      [100, 'coins_100'], [500, 'coins_500'], [1000, 'coins_1k'],
      [5000, 'coins_5k'], [10000, 'coins_10k'], [50000, 'coins_50k'], [100000, 'coins_100k'],
    ]
    for (const [threshold, trigger] of coinMilestones) {
      if (prevTotal < threshold && total >= threshold) show(trigger)
    }

    prevTotalRef.current  = total
    prevCoinsRef.current  = coins
    prevDrinksRef.current = JSON.parse(JSON.stringify(save.drinks))
  }, [save, loaded]) // eslint-disable-line

  // ── Can-hire-manager hint (one-time, triggered by first affordable manager) ──
  useEffect(() => {
    if (!loaded) return
    const anyNeedsManager = DRINKS.some(d => {
      const dp = save.drinks[d.id]
      return dp && dp.qty > 0 && !dp.hasManager && save.coins >= d.managerCost
    })
    if (anyNeedsManager) show('can_hire_manager')
  }, [save.coins, loaded]) // eslint-disable-line

  return { guide: current, dismissGuide: dismiss }
}
