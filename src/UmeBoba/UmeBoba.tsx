import React, { useEffect, useRef, useState } from 'react'
import { useSave } from './hooks/useSave'
import { useAdCap, defaultSave, calcOffline } from './hooks/useAdCap'
import { useAigramUser } from './hooks/useAigramUser'
import { useGuide } from './hooks/useGuide'
import { useTutorial } from './hooks/useTutorial'
import { useGameScore } from './hooks/useGameScore'
import { useShopImage } from './hooks/useShopImage'
import SplashScreen from './components/SplashScreen'
import StartScreen from './components/StartScreen'
import DrinkRow, { type BuyMode } from './components/DrinkRow'
import GuidePopup from './components/GuidePopup'
import TutorialLayer from './components/TutorialLayer'
import Leaderboard from './components/Leaderboard'
import ShopView from './components/ShopView'
import HelpPanel from './components/HelpPanel'
import { DRINKS, fmt, fmtUSD, incomePerCycle, cycleMs, getShopLevel, prestigeGain, prestigeMultiplier, PRESTIGE_THRESHOLD } from './constants'
import { t, localeName } from './i18n'
import { playUnlock, isMuted, setMuted } from './utils/sounds'
import type { GameSave } from './types'
import imgBgShop from './img/bg_shop.png'
import imgUme from './img/ume_counter.png'
import imgLogo from './img/ume_logo.png'
import imgDrinkPearl      from './img/drink_pearl_milk_tea.png'
import imgDrinkWatermelon from './img/drink_watermelon.png'
import imgDrinkMango      from './img/drink_mango.png'
import imgDrinkLemon      from './img/drink_lemon.png'
import imgDrinkAvocado    from './img/drink_avocado.png'
import imgDrinkAngel      from './img/drink_angel.png'
import imgIconSound from './img/icon_sound.png'
import imgIconMute  from './img/icon_mute.png'
import imgIconHelp  from './img/icon_help.png'
import './UmeBoba.less'

const DRINK_IMGS: Record<string, string> = {
  pearl_milk_tea: imgDrinkPearl,
  watermelon:     imgDrinkWatermelon,
  mango:          imgDrinkMango,
  lemon:          imgDrinkLemon,
  avocado:        imgDrinkAvocado,
  angel:          imgDrinkAngel,
}

type Screen = 'splash' | 'start' | 'playing'

export default function UmeBoba() {
  const params = new URLSearchParams(window.location.search)
  const telegramId = params.get('telegram_id')
  const apiOrigin = decodeURIComponent(params.get('api_origin') ?? '')

  const { load, persist } = useSave(telegramId)
  const aigramUser = useAigramUser(apiOrigin, telegramId)
  const { isInAigram, submitScore, fetchGlobalLeaderboard, fetchFriendsLeaderboard } =
    useGameScore('boba-rush')

  const [screen, setScreen] = useState<Screen>('splash')
  const [initSave, setInitSave] = useState<GameSave>(defaultSave())
  const [offlineCoins, setOfflineCoins] = useState(0)
  const [showOffline, setShowOffline] = useState(false)
  const [showLb, setShowLb] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showPrestige, setShowPrestige] = useState(false)
  const [muted, setMutedState] = useState(isMuted())
  const [buyMode, setBuyMode] = useState<BuyMode>(1)

  function toggleMute() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }
  const loaded = screen !== 'splash'

  // Refs for tutorial highlight positioning
  const firstDrinkRowRef = useRef<HTMLDivElement>(null)
  const firstBuyBtnRef   = useRef<HTMLButtonElement>(null)
  const [drinkRowRect, setDrinkRowRect] = useState<DOMRect | null>(null)
  const [buyBtnRect,   setBuyBtnRect]   = useState<DOMRect | null>(null)

  // Load save (triggered once splash says it's done preloading assets)
  const [splashDone, setSplashDone] = useState(false)
  const [saveDone,   setSaveDone]   = useState(false)

  useEffect(() => {
    load().then(({ save, offlineCoins: oc }) => {
      setInitSave(save)
      if (oc > 0) { setOfflineCoins(oc); setShowOffline(true) }
      setSaveDone(true)
    })
  }, []) // eslint-disable-line

  // Advance to start screen once both splash animation AND save are ready
  useEffect(() => {
    if (splashDone && saveDone) setScreen('start')
  }, [splashDone, saveDone])

  const { save, setSave, progress, floats, tapDrink, buyDrink, hireManager } =
    useAdCap(initSave, persist, screen === 'playing')

  const shopLevel  = getShopLevel(save.totalEarned)
  const shopImages = useShopImage(save.totalEarned, aigramUser?.head_url ?? null, loaded)
  const pMult      = prestigeMultiplier(save.prestige ?? 0)
  const effectiveMult = shopLevel.multiplier * pMult

  function doPrestige() {
    const gain = prestigeGain(save.totalEarned)
    const prevPrestige = save.prestige ?? 0
    setSave(s => ({
      ...s,
      coins: 0,
      totalEarned: 0,
      prestige: prevPrestige + gain,
      tutorialDone: true,
      drinks: Object.fromEntries(
        DRINKS.map(d => [d.id, { qty: d.id === 'pearl_milk_tea' ? 1 : 0, cycleStarted: 0, hasManager: false }])
      ),
      lastActive: Date.now(),
    }))
    setShowPrestige(false)
  }

  const { guide, dismissGuide } = useGuide(save, loaded)
  const { tutStep, tutDone, advanceTut, skipTut } = useTutorial(
    save, progress, loaded,
    () => setSave(s => ({ ...s, tutorialDone: true })),
  )

  // Update rects when tutorial needs highlights
  useEffect(() => {
    if (!tutStep) return
    const needsDrink = tutStep.kind === 'wait_tap_drink' || tutStep.kind === 'wait_collect'
    const needsBuy   = tutStep.kind === 'wait_buy'
    if (needsDrink && firstDrinkRowRef.current)
      setDrinkRowRect(firstDrinkRowRef.current.getBoundingClientRect())
    if (needsBuy && firstBuyBtnRef.current)
      setBuyBtnRect(firstBuyBtnRef.current.getBoundingClientRect())
  }, [tutStep])

  // Total per-second rate (includes shop multiplier)
  const perSec = DRINKS.reduce((sum, def) => {
    const dp = save.drinks[def.id]
    if (!dp || dp.qty === 0 || !dp.hasManager) return sum
    const ms = cycleMs(def, dp.qty)
    return sum + (incomePerCycle(def, dp.qty, effectiveMult) / ms * 1000)
  }, 0)

  function collectOffline() {
    setSave(s => ({ ...s, coins: s.coins + offlineCoins, totalEarned: s.totalEarned + offlineCoins }))
    setShowOffline(false)
  }

  const visibleDrinks = DRINKS.filter(d => save.totalEarned >= d.unlockCost)
  const nextDrink = DRINKS.find(d => save.totalEarned < d.unlockCost)

  // Play unlock sound when a new drink is unlocked
  const prevVisibleCount = useRef(visibleDrinks.length)
  useEffect(() => {
    if (loaded && visibleDrinks.length > prevVisibleCount.current) playUnlock()
    prevVisibleCount.current = visibleDrinks.length
  }, [visibleDrinks.length, loaded])

  // ── Score submission ───────────────────────────────────────────────────────
  // Submit prestige crystal count every 60 seconds + on page-hide
  const crystals = save.prestige ?? 0
  const lastSubmittedRef = useRef(-1)
  useEffect(() => {
    if (!loaded) return
    const id = setInterval(() => {
      if (crystals > lastSubmittedRef.current) {
        submitScore(crystals)
        lastSubmittedRef.current = crystals
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [loaded, crystals, submitScore])

  useEffect(() => {
    const handler = () => { submitScore(crystals) }
    window.addEventListener('pagehide', handler)
    document.addEventListener('visibilitychange', handler)
    return () => {
      window.removeEventListener('pagehide', handler)
      document.removeEventListener('visibilitychange', handler)
    }
  }, [crystals, submitScore])

  // ── Screen routing ─────────────────────────────────────────────────────────

  if (screen === 'splash') {
    return <SplashScreen onDone={() => setSplashDone(true)} />
  }

  if (screen === 'start') {
    return (
      <StartScreen
        playerName={aigramUser?.name ?? null}
        playerAvatar={aigramUser?.head_url ?? null}
        bestScore={initSave.prestige ?? 0}
        hasSave={initSave.totalEarned > 0 || initSave.coins > 0}
        isInAigram={isInAigram}
        onPlay={() => setScreen('playing')}
        onReset={() => {
          const fresh = defaultSave()
          setSave(fresh)
          setInitSave(fresh)
          persist(fresh)
          setOfflineCoins(0)
          setShowOffline(false)
          localStorage.removeItem('ume-boba-tutorial-done')
        }}
        fetchGlobal={fetchGlobalLeaderboard}
        fetchFriends={fetchFriendsLeaderboard}
      />
    )
  }

  return (
    <div className="ub">

      {/* ── Top HUD ─────────────────────────────────────────────────── */}
      <div className="ub__hud">
        <div className="ub__hud-player">
          <img
            src={aigramUser?.head_url ?? imgUme}
            alt=""
            draggable={false}
            className="ub__ume"
          />
          {aigramUser?.name && (
            <span className="ub__username">{aigramUser.name}</span>
          )}
        </div>
        <div className="ub__hud-money">
          {(save.prestige ?? 0) > 0 && (
            <div className="ub__prestige-badge">
              🌙 {save.prestige} {t('crystals')} · ×{pMult.toFixed(1)}
            </div>
          )}
          <div className="ub__coins">{fmtUSD(save.coins)}</div>
          {perSec >= 0.1 && (
            <div className="ub__per-sec">+{fmtUSD(perSec)}{t('per_sec')}</div>
          )}
        </div>
        <div className="ub__hud-right">
          <div className="ub__hud-btns">
            <button className={`ub__icon-btn ub__icon-btn--sound ${muted ? 'ub__icon-btn--muted' : ''}`} onPointerDown={toggleMute}>
              <span className="ub__sound-icon" />
            </button>
            <button className="ub__icon-btn ub__icon-btn--help" onPointerDown={() => setShowHelp(true)}>
              <span className="ub__help-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Drink list ───────────────────────────────────────────────── */}
      <div className="ub__list">
        {/* ── Shop view (top of list) ───────────────────────────────── */}
        <ShopView
          totalEarned={save.totalEarned}
          perSec={perSec}
          currentImage={shopImages.current}
        />

        {/* Buy mode toggle */}
        <div className="ub__buy-mode">
          {([1, 10, 'max'] as const).map(m => (
            <button
              key={m}
              className={`ub__buy-mode-btn ${buyMode === m ? 'ub__buy-mode-btn--active' : ''}`}
              onPointerDown={() => setBuyMode(m)}
            >
              {m === 'max' ? t('max') : `×${m}`}
            </button>
          ))}
        </div>

        {visibleDrinks.map((def, i) => (
          <DrinkRow
            key={def.id}
            def={def}
            dp={save.drinks[def.id]}
            progress={progress[def.id] ?? 0}
            shopMult={effectiveMult}
            coins={save.coins}
            buyMode={buyMode}
            canAffordManager={save.coins >= def.managerCost}
            onTap={(x, y) => tapDrink(def.id, x, y)}
            onBuy={(qty) => buyDrink(def.id, qty)}
            onManager={() => hireManager(def.id)}
            rowRef={i === 0 ? firstDrinkRowRef : undefined}
            buyRef={i === 0 ? firstBuyBtnRef : undefined}
          />
        ))}

        {nextDrink && (
          <div className="ub__locked-row">
            <img src={DRINK_IMGS[nextDrink.id]} alt={localeName(nextDrink)} draggable={false} className="ub__locked-img" />
            <div>
              <div className="ub__locked-name">{localeName(nextDrink)}</div>
              <div className="ub__locked-hint">{t('locked_pre')}{fmtUSD(nextDrink.unlockCost)}{t('locked_post')}</div>
            </div>
            <div className="ub__locked-bar">
              <div className="ub__locked-fill" style={{ width: `${Math.min(save.totalEarned / nextDrink.unlockCost * 100, 100)}%` }} />
            </div>
          </div>
        )}

        {/* ── Prestige ticket ──────────────────────────────────────────── */}
        {save.totalEarned >= PRESTIGE_THRESHOLD && (
          <div className="ub__prestige-ticket" onPointerDown={() => setShowPrestige(true)}>
            <div className="ub__prestige-ticket__bg" />
            <div className="ub__prestige-ticket__stars">✦ ✦ ✦ ✦ ✦</div>
            <div className="ub__prestige-ticket__left">
              <div className="ub__prestige-ticket__moon">🌙</div>
              <div className="ub__prestige-ticket__label">PRESTIGE</div>
            </div>
            <div className="ub__prestige-ticket__body">
              <div className="ub__prestige-ticket__title">{t('prestige_title')}</div>
              <div className="ub__prestige-ticket__gain">
                {t('prestige_earn')} <strong>+{prestigeGain(save.totalEarned)}</strong> 🌙 {t('crystals')}
              </div>
              <div className="ub__prestige-ticket__current">
                {t('prestige_now')} {save.prestige ?? 0} 🌙 · {t('prestige_after_x')}{prestigeMultiplier((save.prestige ?? 0) + prestigeGain(save.totalEarned)).toFixed(1)}{t('prestige_global')}
              </div>
            </div>
            <div className="ub__prestige-ticket__tear" />
            <div className="ub__prestige-ticket__cta">
              <span>{t('prestige_cta1')}</span>
              <span>{t('prestige_cta2')}</span>
            </div>
          </div>
        )}

      </div>

      {/* ── Floating +coins ────────────────────────────────────────────── */}
      {floats.map(f => (
        <div key={f.id} className="ub__float" style={{ left: f.x, top: f.y }}>
          ✨+{fmt(f.value)}
        </div>
      ))}

      {/* ── Tutorial (new players only) ───────────────────────────────── */}
      {!tutDone && (
        <TutorialLayer
          step={tutStep}
          onAdvance={advanceTut}
          onSkip={skipTut}
          drinkRowRect={drinkRowRect}
          buyBtnRect={buyBtnRect}
        />
      )}

      {/* ── Guide popup — shows whenever not blocked by a tutorial dialog ── */}
      {tutStep?.kind !== 'dialog' && (
        <GuidePopup guide={guide} onClose={dismissGuide} />
      )}

      {/* ── Leaderboard modal ────────────────────────────────────────── */}
      {showLb && (
        <Leaderboard
          gameName={t('game_name')}
          isInAigram={isInAigram}
          onClose={() => setShowLb(false)}
          fetchGlobal={fetchGlobalLeaderboard}
          fetchFriends={fetchFriendsLeaderboard}
        />
      )}

      {/* ── Help panel ───────────────────────────────────────────────── */}
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

      {/* ── Prestige modal ───────────────────────────────────────────── */}
      {showPrestige && (
        <div className="ub__overlay" onPointerDown={() => setShowPrestige(false)}>
          <div className="ub__modal" onPointerDown={e => e.stopPropagation()}>
            <div className="ub__modal-icon">🌙</div>
            <div className="ub__modal-title">{t('prestige_title')}</div>
            <div className="ub__modal-body">
              {t('prestige_reset_body')}<br />
              {t('prestige_earn')} <span className="ub__modal-coins">+{prestigeGain(save.totalEarned)} 🌙 {t('crystals')}</span>
            </div>
            <div className="ub__modal-body" style={{ fontSize: 13, opacity: 0.7 }}>
              {t('prestige_current_label')}{save.prestige ?? 0} 🌙<br />
              {t('prestige_after_label')}{(save.prestige ?? 0) + prestigeGain(save.totalEarned)} 🌙<br />
              {t('global_mult_label')}{prestigeMultiplier((save.prestige ?? 0) + prestigeGain(save.totalEarned)).toFixed(1)}
            </div>
            <button className="ub__modal-btn" onPointerDown={doPrestige}>{t('prestige_confirm')}</button>
            <button className="ub__modal-btn" style={{ background: 'rgba(255,255,255,0.1)', boxShadow: 'none', marginTop: 0 }} onPointerDown={() => setShowPrestige(false)}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* ── Offline modal ────────────────────────────────────────────── */}
      {showOffline && (
        <div className="ub__overlay">
          <div className="ub__modal">
            <div className="ub__modal-icon">🌙</div>
            <div className="ub__modal-title">{t('offline_title')}</div>
            <div className="ub__modal-body">
              {t('offline_body')}<br />
              <span className="ub__modal-coins">+{fmtUSD(offlineCoins)}</span>
            </div>
            <button className="ub__modal-btn" onPointerDown={collectOffline}>{t('offline_collect')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
