import { useCallback, useEffect, useRef, useState } from 'react'
import { TUTORIAL_STEPS, TUTORIAL_DONE_KEY } from '../tutorial'
import type { GameSave } from '../types'

export function useTutorial(save: GameSave, progress: Record<string, number>, loaded: boolean) {
  const isDone = typeof localStorage !== 'undefined'
    && !!localStorage.getItem(TUTORIAL_DONE_KEY)

  const [stepIndex, setStepIndex] = useState(0)
  const [tutDone, setTutDone] = useState(isDone)

  useEffect(() => {
    console.log('[Tutorial] init — isDone:', isDone, 'stepIndex:', stepIndex)
  }, []) // eslint-disable-line

  // Snapshot game state at the moment we enter each action step
  // -1 means "not yet recorded"
  const entryCoinsRef        = useRef(-1)
  const entryQtyRef          = useRef(-1)
  const entryCycleStartedRef = useRef(-1)   // for wait_tap_drink / wait_bar_full

  const advance = useCallback(() => {
    setStepIndex(i => {
      const next = i + 1
      if (next >= TUTORIAL_STEPS.length) {
        localStorage.setItem(TUTORIAL_DONE_KEY, '1')
        setTutDone(true)
        return i
      }
      // Reset all entry snapshots for next action step
      entryCoinsRef.current        = -1
      entryQtyRef.current          = -1
      entryCycleStartedRef.current = -1
      return next
    })
  }, [])

  // Record entry snapshots when we arrive at an action step
  useEffect(() => {
    if (!loaded || tutDone) return
    const step = TUTORIAL_STEPS[stepIndex]
    if (!step) return

    const pearlId = 'pearl_milk_tea'
    const pearlDp = save.drinks[pearlId]
    const pearlCycleStarted = pearlDp?.cycleStarted ?? 0

    if ((step.kind === 'wait_tap_drink' || step.kind === 'wait_bar_full')
        && entryCycleStartedRef.current < 0) {
      entryCycleStartedRef.current = pearlCycleStarted
    }
    if (step.kind === 'wait_collect' && entryCoinsRef.current < 0) {
      entryCoinsRef.current = save.coins
    }
    if (step.kind === 'wait_buy' && entryQtyRef.current < 0) {
      entryQtyRef.current = pearlDp?.qty ?? 1
    }
  }, [stepIndex, loaded, tutDone]) // eslint-disable-line

  // Watch for action completions
  useEffect(() => {
    if (!loaded || tutDone) return
    const step = TUTORIAL_STEPS[stepIndex]
    if (!step) return

    const pearlId = 'pearl_milk_tea'
    const pearlDp = save.drinks[pearlId]
    const pearlCycleStarted = pearlDp?.cycleStarted ?? 0
    const pearlQty   = pearlDp?.qty ?? 0
    const pearlProg  = progress[pearlId] ?? 0

    if (step.kind === 'wait_tap_drink') {
      // Advance only when cycleStarted changes from the entry snapshot to a new positive value
      if (entryCycleStartedRef.current >= 0
          && pearlCycleStarted > 0
          && pearlCycleStarted !== entryCycleStartedRef.current) advance()
    }

    if (step.kind === 'wait_bar_full') {
      // Bar filled while actively running (cycleStarted > 0 excludes idle state where progress=1)
      // Also require that cycleStarted changed from entry (so we only detect the NEW cycle)
      if (pearlCycleStarted > 0
          && pearlCycleStarted === entryCycleStartedRef.current
          && pearlProg >= 1) advance()
    }

    if (step.kind === 'wait_collect') {
      // Coins increased compared to entry snapshot
      if (entryCoinsRef.current >= 0 && save.coins > entryCoinsRef.current) advance()
    }

    if (step.kind === 'wait_buy') {
      // Qty increased compared to entry snapshot
      if (entryQtyRef.current >= 0 && pearlQty > entryQtyRef.current) advance()
    }
  }, [save, progress, loaded, stepIndex, tutDone, advance])

  const skip = useCallback(() => {
    localStorage.setItem(TUTORIAL_DONE_KEY, '1')
    setTutDone(true)
  }, [])

  if (tutDone) return { tutStep: null, tutDone: true, advanceTut: advance, skipTut: skip }

  return { tutStep: TUTORIAL_STEPS[stepIndex] ?? null, tutDone: false, advanceTut: advance, skipTut: skip }
}
