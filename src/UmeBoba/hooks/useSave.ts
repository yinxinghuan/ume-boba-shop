import { useCallback } from 'react'
import type { GameSave } from '../types'
import { calcOffline } from './useAdCap'

const GAME_ID = 'ume-boba-shop'
const API_BASE = 'https://games-api.xinghuan-yin.workers.dev'

export function useSave(telegramId: string | null) {
  const load = useCallback(async (): Promise<{ save: GameSave; offlineCoins: number }> => {
    const { defaultSave } = await import('./useAdCap')
    try {
      if (telegramId) {
        const res = await fetch(`${API_BASE}/save?game_id=${GAME_ID}&telegram_id=${telegramId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            const save: GameSave = JSON.parse(json.data)
            return { save, offlineCoins: calcOffline(save) }
          }
        }
      }
    } catch { /* fall through */ }
    try {
      const raw = localStorage.getItem(`${GAME_ID}-save`)
      if (raw) {
        const save: GameSave = JSON.parse(raw)
        return { save, offlineCoins: calcOffline(save) }
      }
    } catch { /* ignore */ }
    return { save: defaultSave(), offlineCoins: 0 }
  }, [telegramId])

  const persist = useCallback(async (save: GameSave) => {
    const withTs = { ...save, lastActive: Date.now() }
    localStorage.setItem(`${GAME_ID}-save`, JSON.stringify(withTs))
    if (telegramId) {
      try {
        await fetch(`${API_BASE}/save`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_id: GAME_ID, telegram_id: telegramId, data: JSON.stringify(withTs) }),
        })
      } catch { /* ignore */ }
    }
  }, [telegramId])

  return { load, persist }
}
