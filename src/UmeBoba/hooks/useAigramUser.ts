import { useEffect, useState } from 'react'

const toBase64 = (s: string) => btoa(unescape(encodeURIComponent(s)))
const fromBase64 = (s: string) => decodeURIComponent(escape(atob(s)))

interface AigramUser {
  name: string
  head_url: string
}

export function useAigramUser(apiOrigin: string, telegramId: string | null) {
  const [user, setUser] = useState<AigramUser | null>(null)

  useEffect(() => {
    if (!apiOrigin || !telegramId) return

    const requestId = crypto.randomUUID()

    const handler = (e: MessageEvent) => {
      if (e.origin !== apiOrigin) return
      if (typeof e.data !== 'string' || !e.data.startsWith('callAPIResult-')) return
      try {
        const result = JSON.parse(fromBase64(e.data.slice('callAPIResult-'.length)))
        if (result.request_id !== requestId) return
        if (result.success && result.data?.data) {
          const d = result.data.data
          setUser({ name: d.name, head_url: d.head_url })
        }
      } catch { /* ignore */ }
    }

    window.addEventListener('message', handler)

    window.parent.postMessage(
      `callAPI-${toBase64(JSON.stringify({
        url: `/note/telegram/user/get/info/by/telegram_id?telegram_id=${telegramId}`,
        method: 'GET',
        data: null,
        request_id: requestId,
        emitter: window.location.origin,
      }))}`,
      apiOrigin
    )

    return () => window.removeEventListener('message', handler)
  }, [apiOrigin, telegramId])

  return user
}
