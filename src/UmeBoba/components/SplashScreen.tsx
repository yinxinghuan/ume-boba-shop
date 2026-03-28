import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import posterImg from '../img/poster.png'

import './SplashScreen.less'

// Preload all game images (excluding poster which is already the splash image)
const _allImgModules = import.meta.glob('../img/**/*.png', { eager: true, query: '?url', import: 'default' })
const GAME_IMAGES: string[] = (Object.values(_allImgModules) as string[])
  .filter(url => !url.includes('poster'))

const MIN_MS = 2200
const MAX_ASSET_MS = 10000

export interface SplashScreenProps {
  onDone: () => void
}

const SplashScreen = React.memo(
  forwardRef<HTMLDivElement, SplashScreenProps>(function SplashScreen({ onDone }, ref) {
    const [posterReady, setPosterReady] = useState(false)
    const [progress, setProgress]       = useState(0)
    const [fading, setFading]           = useState(false)
    const [minDone, setMinDone]         = useState(false)
    const [assetsDone, setAssetsDone]   = useState(false)
    const fadingStarted                 = useRef(false)
    const onDoneRef                     = useRef(onDone)
    onDoneRef.current = onDone

    // Min timer — starts when poster is ready
    useEffect(() => {
      if (!posterReady) return
      const id = setTimeout(() => setMinDone(true), MIN_MS)
      return () => clearTimeout(id)
    }, [posterReady])

    // Preload game images — starts when poster is ready
    useEffect(() => {
      if (!posterReady) return

      let loaded = 0
      const total = GAME_IMAGES.length
      const timeout = setTimeout(() => setAssetsDone(true), MAX_ASSET_MS)

      const tick = () => {
        loaded++
        setProgress(loaded / total)
        if (loaded >= total) {
          clearTimeout(timeout)
          setAssetsDone(true)
        }
      }

      GAME_IMAGES.forEach(src => {
        const img = new Image()
        img.onload  = tick
        img.onerror = tick
        img.src     = src
      })

      return () => clearTimeout(timeout)
    }, [posterReady])

    // Fade out when both conditions met
    const tryFade = useCallback(() => {
      if (fadingStarted.current) return
      fadingStarted.current = true
      setFading(true)
      setTimeout(() => onDoneRef.current(), 500)
    }, [])

    useEffect(() => {
      if (minDone && assetsDone) tryFade()
    }, [minDone, assetsDone, tryFade])

    return (
      <div ref={ref} className={`ub-splash${fading ? ' ub-splash--fading' : ''}`}>
        <img
          className={`ub-splash__img${posterReady ? ' ub-splash__img--visible' : ''}`}
          src={posterImg}
          alt="Boba Rush"
          draggable={false}
          onLoad={() => setPosterReady(true)}
        />
        <div className="ub-splash__bar-track">
          <div
            className="ub-splash__bar-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    )
  })
)

SplashScreen.displayName = 'SplashScreen'
export default SplashScreen
