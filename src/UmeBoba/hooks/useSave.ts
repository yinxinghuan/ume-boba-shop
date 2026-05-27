import { useCallback } from 'react'
import {
  callAigramAPI,
  postAigramAPI,
  getGameUuid,
  type AigramResponse,
} from '@shared/runtime'
import type { GameSave } from '../types'
import { calcOffline } from './useAdCap'

const GAME_ID = 'ume-boba-shop'

interface SaveRow {
  user_id: string
  time: string
  resource_data: string
}

export function useSave(telegramId: string | null) {
  const load = useCallback(async (): Promise<{ save: GameSave; offlineCoins: number }> => {
    const { defaultSave } = await import('./useAdCap')
    const sessionId = getGameUuid()

    if (telegramId && sessionId) {
      try {
        const res = await callAigramAPI<AigramResponse<SaveRow[]>>(
          `/note/aigram/ai/game/get/data/list?session_id=${encodeURIComponent(sessionId)}`,
        )
        const rows: SaveRow[] = Array.isArray(res?.data) ? res.data : []
        const mine = rows.find(r => r.user_id === telegramId)
        if (mine && mine.resource_data) {
          const save: GameSave = JSON.parse(mine.resource_data)
          return { save, offlineCoins: calcOffline(save) }
        }
      } catch { /* fall through */ }
    }
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
    const sessionId = getGameUuid()
    if (telegramId && sessionId) {
      postAigramAPI('/note/aigram/ai/game/save/data', {
        session_id: sessionId,
        resource_data: JSON.stringify(withTs),
      })
    }
  }, [telegramId])

  return { load, persist }
}
