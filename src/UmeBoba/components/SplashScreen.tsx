import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import posterImg from '../img/poster.png'

import imgUme    from '../img/ume_counter.png'
import imgLogo   from '../img/ume_logo.png'
import imgBgShop from '../img/bg_shop.png'
import imgCup    from '../img/cup.png'

import './SplashScreen.less'

const GAME_IMAGES: string[] = [
  imgUme,
  imgLogo,
  imgBgShop,
  imgCup,
  new URL('../img/guides/yoome_happy.png',      import.meta.url).href,
  new URL('../img/guides/yoome_normal.png',     import.meta.url).href,
  new URL('../img/guides/melonmick_happy.png',  import.meta.url).href,
  new URL('../img/guides/lemonshark_happy.png', import.meta.url).href,
]

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
          alt="UMe 珍珠奶茶小铺"
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
