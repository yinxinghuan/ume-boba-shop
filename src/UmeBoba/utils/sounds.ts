// Web Audio API — all sounds synthesized, no audio files needed

let _muted = localStorage.getItem('ume_muted') === '1'
export function isMuted() { return _muted }
export function setMuted(v: boolean) {
  _muted = v
  localStorage.setItem('ume_muted', v ? '1' : '0')
}

let _ctx: AudioContext | null = null
function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function osc(freq: number, type: OscillatorType, startT: number, endT: number,
              gainStart: number, gainEnd: number, freqEnd?: number) {
  const c = ctx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.connect(g); g.connect(c.destination)
  o.frequency.setValueAtTime(freq, startT)
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, endT)
  g.gain.setValueAtTime(gainStart, startT)
  g.gain.exponentialRampToValueAtTime(Math.max(gainEnd, 0.001), endT)
  o.start(startT); o.stop(endT)
}

/** Coin collect — pitch scales with value */
export function playCollect(value = 10) {
  if (_muted) return
  const c = ctx(); const t = c.currentTime
  const pitch = Math.min(880 + Math.log2(value / 10) * 120, 1800)
  osc(pitch, 'sine', t, t + 0.15, 0.35, 0.001, pitch * 1.3)
  // sparkle tail
  osc(pitch * 2, 'sine', t + 0.05, t + 0.22, 0.12, 0.001)
}

/** Big collect (milestone) — triumphant chord */
export function playMilestone() {
  if (_muted) return
  const c = ctx(); const t = c.currentTime
  const notes: number[] = [523, 659, 784, 1047]
  notes.forEach((freq: number, i: number) => {
    osc(freq, 'sine', t + i * 0.07, t + i * 0.07 + 0.5, 0.25, 0.001)
  })
}

/** Buy +1 — satisfying thump + chime */
export function playBuy() {
  if (_muted) return
  const c = ctx(); const t = c.currentTime
  // low thump
  osc(120, 'sine', t, t + 0.15, 0.4, 0.001, 60)
  // chime
  osc(660, 'sine', t + 0.05, t + 0.3, 0.2, 0.001, 880)
}

/** Hire manager — ascending fanfare */
export function playManager() {
  if (_muted) return
  const c = ctx(); const t = c.currentTime
  const notes: number[] = [523, 659, 784]
  notes.forEach((freq: number, i: number) => {
    osc(freq, 'sine', t + i * 0.1, t + i * 0.1 + 0.35, 0.28, 0.001)
  })
  osc(1047, 'sine', t + 0.32, t + 0.7, 0.35, 0.001)
}

/** Unlock new drink — magic ascending chime */
export function playUnlock() {
  if (_muted) return
  const c = ctx(); const t = c.currentTime
  const notes: number[] = [392, 523, 659, 880, 1047]
  notes.forEach((freq: number, i: number) => {
    osc(freq, 'sine', t + i * 0.06, t + i * 0.06 + 0.4, 0.22, 0.001)
  })
}

/** Button tap — soft click */
export function playTap() {
  if (_muted) return
  const c = ctx(); const t = c.currentTime
  osc(300, 'sine', t, t + 0.06, 0.15, 0.001, 200)
}

/** Start cycle tap */
export function playStart() {
  if (_muted) return
  const c = ctx(); const t = c.currentTime
  osc(440, 'sine', t, t + 0.1, 0.2, 0.001, 550)
}
