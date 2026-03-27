import { useEffect, useRef, useState } from 'react'
import { SHOP_LEVELS, getShopLevel, getNextShopLevel } from '../constants'

// Default shop images (static assets, always available)
const DEFAULT_IMAGES = import.meta.glob(
  '../img/shops/level*.png', { eager: true, import: 'default' }
) as Record<string, string>

function getDefaultImage(level: number): string {
  return DEFAULT_IMAGES[`../img/shops/level${level}.png`] ?? ''
}

const API_URL  = 'http://aiservice.wdabuliu.com:8019/genl_image'
const R2_ACCOUNT_ID = 'bdccd2c68ff0d2e622994d24dbb1bae3'
const R2_ACCESS_KEY = 'b203adb7561b4f8800cbc1fa02424467'
const R2_SECRET_KEY = 'e7926e4175b7a0914496b9c999afd914cd1e4af7db8f83e0cf2bfad9773fa2b0'
const R2_BUCKET     = 'aigram'
const R2_ENDPOINT   = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
const R2_PUBLIC     = 'https://images.aiwaves.tech'

async function sha256hex(data: ArrayBuffer): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSha256(key: ArrayBuffer, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg))
}

async function uploadToR2(blob: Blob, filename: string): Promise<string> {
  const data = await blob.arrayBuffer()
  const objKey = `shop-refs/${filename}`
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const now = new Date()
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const dateStamp = amzDate.slice(0, 8)
  const contentType = 'image/png'
  const contentHash = await sha256hex(data)
  const canonUri = `/${R2_BUCKET}/${objKey}`
  const canonHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${contentHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
  const canonReq = ['PUT', canonUri, '', canonHeaders, signedHeaders, contentHash].join('\n')
  const credScope = `${dateStamp}/auto/s3/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, await sha256hex(new TextEncoder().encode(canonReq).buffer)].join('\n')

  let k = new TextEncoder().encode('AWS4' + R2_SECRET_KEY).buffer
  k = await hmacSha256(k, dateStamp)
  k = await hmacSha256(k, 'auto')
  k = await hmacSha256(k, 's3')
  k = await hmacSha256(k, 'aws4_request')
  const sigBuf = await hmacSha256(k, stringToSign)
  const sig = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('')

  const auth = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${sig}`
  const url = `${R2_ENDPOINT}/${R2_BUCKET}/${objKey}`

  await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'x-amz-content-sha256': contentHash,
      'x-amz-date': amzDate,
      'Authorization': auth,
    },
    body: data,
  })

  return `${R2_PUBLIC}/${objKey}`
}

async function generateShopImage(refUrl: string, level: number): Promise<string> {
  const sl = SHOP_LEVELS[level - 1]
  const prompt = [
    `anime illustration style, ${sl.nameZh} boba tea shop storefront`,
    level === 1 ? 'humble street cart, simple and small'
    : level === 2 ? 'small cozy shop with fairy lights'
    : level === 3 ? 'busy popular cafe with neon signs'
    : level === 4 ? 'trendy viral boba shop, modern aesthetic'
    : level === 5 ? 'upscale chain store, premium illuminated'
    : 'grand flagship UMe California headquarters, golden luxury',
    'warm evening lighting, no text, wide exterior view',
  ].join(', ')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '', params: { url: refUrl, prompt, user_id: 123456 } }),
  })
  const json = await res.json() as { code: number; url?: string }
  if (json.code !== 200 || !json.url) throw new Error('gen failed')
  return json.url
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface ShopImages {
  current: string   // URL for current level (default or personalized)
  next: string      // URL for next level (pre-generated or default)
  isPersonalized: boolean
}

export function useShopImage(
  totalEarned: number,
  avatarUrl: string | null,
  loaded: boolean,
) {
  const currentLevel = getShopLevel(totalEarned).level
  const nextLevel    = getNextShopLevel(totalEarned)

  const [images, setImages] = useState<ShopImages>({
    current: getDefaultImage(currentLevel),
    next:    getDefaultImage(nextLevel?.level ?? currentLevel),
    isPersonalized: false,
  })

  // Track which levels we've already generated for this session
  const generatedRef = useRef<Set<number>>(new Set())
  const generatingRef = useRef<Set<number>>(new Set())

  async function generateLevel(level: number, avatarImageUrl: string) {
    if (generatedRef.current.has(level) || generatingRef.current.has(level)) return
    generatingRef.current.add(level)

    try {
      // Fetch avatar as blob, upload to R2, use as ref
      const avatarBlob = await fetch(avatarImageUrl).then(r => r.blob())
      const refUrl = await uploadToR2(avatarBlob, `avatar_${Date.now()}.png`)
      const genUrl = await generateShopImage(refUrl, level)

      generatedRef.current.add(level)

      setImages(prev => {
        const isCurrent = level === currentLevel
        const isNext    = level === (nextLevel?.level ?? -1)
        return {
          current: isCurrent ? genUrl : prev.current,
          next:    isNext    ? genUrl : prev.next,
          isPersonalized: isCurrent ? true : prev.isPersonalized,
        }
      })
    } catch {
      // Silently fall back to default image
      generatingRef.current.delete(level)
    }
  }

  // On load: update default images, then trigger personalized generation
  useEffect(() => {
    if (!loaded) return

    // Always update defaults first (instant)
    setImages({
      current: getDefaultImage(currentLevel),
      next:    getDefaultImage(nextLevel?.level ?? currentLevel),
      isPersonalized: false,
    })
    generatedRef.current.clear()
    generatingRef.current.clear()

    // Personalize if we have an avatar
    if (avatarUrl) {
      generateLevel(currentLevel, avatarUrl)
      if (nextLevel) generateLevel(nextLevel.level, avatarUrl)
    }
  }, [loaded]) // eslint-disable-line

  // When shop levels up: swap to pre-generated next image, trigger new next
  useEffect(() => {
    if (!loaded) return
    setImages(prev => ({
      current: prev.next,
      next:    getDefaultImage(nextLevel?.level ?? currentLevel),
      isPersonalized: generatedRef.current.has(currentLevel),
    }))
    // Generate new "next" level personalized image
    if (avatarUrl && nextLevel && !generatedRef.current.has(nextLevel.level)) {
      generateLevel(nextLevel.level, avatarUrl)
    }
  }, [currentLevel]) // eslint-disable-line

  // Pre-generate next level at 60% progress
  useEffect(() => {
    if (!loaded || !avatarUrl || !nextLevel) return
    const progress = (totalEarned - getShopLevel(totalEarned).threshold)
      / (nextLevel.threshold - getShopLevel(totalEarned).threshold)
    if (progress >= 0.6 && !generatedRef.current.has(nextLevel.level)) {
      generateLevel(nextLevel.level, avatarUrl)
    }
  }, [totalEarned, loaded]) // eslint-disable-line

  return images
}
