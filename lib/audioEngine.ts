// ─────────────────────────────────────────────
//  The Happiness Index — Audio Engine
//  Source: docs/07-decay-plan.md
//
//  Phase audio:
//    Early (stage 1, turns 1–4)  → /audio/ambience-early.wav  (morning birds)
//    Mid   (stage 2, turns 5–8)  → /audio/ambience-mid.ogg    (lower town city)
//    Late  (stage 3–4, turns 9–12) → city fades + synth hum rises
//
//  Fades match the 6000ms CSS desaturation transition.
//  Howler is lazy-initialised on first user gesture (autoplay policy).
// ─────────────────────────────────────────────

import { Howl } from 'howler'
import type { AtmosphereStage } from '@/types'

const FADE_MS = 6000

// ── Volume targets per stage ──────────────────
//   early : morning birds track  (/audio/ambience-early.wav)
//   mid   : lower town track     (/audio/ambience-mid.ogg)
//   hum   : synth drone (Web Audio) — rises in late game
const STAGE_VOLUMES: Record<
  AtmosphereStage['id'],
  { early: number; mid: number; hum: number }
> = {
  1: { early: 0.55, mid: 0.00, hum: 0.00 }, // birds only
  2: { early: 0.00, mid: 0.45, hum: 0.00 }, // crossfade: birds out, city in
  3: { early: 0.00, mid: 0.18, hum: 0.30 }, // city fades, hum rises
  4: { early: 0.00, mid: 0.04, hum: 0.55 }, // near silence + hum dominant
}

// ── Synth hum (Web Audio API) ─────────────────
// Provides late-game mechanical drone — no file needed.
function createSynthHum() {
  let ctx: AudioContext | null = null
  let gain: GainNode | null = null
  let osc: OscillatorNode | null = null
  let vol = 0

  const getCtx = () => {
    if (!ctx) {
      ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)()
    }
    return ctx
  }

  return {
    play() {
      if (osc) return
      const c = getCtx()
      gain = c.createGain()
      gain.gain.value = 0
      gain.connect(c.destination)
      osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 60 // deep 60 Hz mechanical drone
      osc.connect(gain)
      osc.start()
    },
    stop() {
      osc?.stop()
      osc?.disconnect()
      gain?.disconnect()
      osc = null
      gain = null
      vol = 0
    },
    fadeTo(target: number, ms: number) {
      if (!gain) return
      const c = getCtx()
      gain.gain.cancelScheduledValues(c.currentTime)
      gain.gain.setValueAtTime(vol, c.currentTime)
      gain.gain.linearRampToValueAtTime(target, c.currentTime + ms / 1000)
      vol = target
    },
    currentVol() {
      return vol
    },
  }
}

// ── Lazy singletons ───────────────────────────
let earlyTrack: Howl | null = null
let midTrack: Howl | null = null
let hum: ReturnType<typeof createSynthHum> | null = null
let audioInitialised = false
let currentStage: AtmosphereStage['id'] = 1

// ── Helper ────────────────────────────────────
function fadeHowl(h: Howl | null, to: number, ms: number) {
  if (!h) return
  const from = h.volume() as number
  if (!h.playing()) {
    h.volume(0)
    h.play()
  }
  h.fade(from, to, ms)
}

// ── Public API ────────────────────────────────

/**
 * Initialise audio. Call from a user-gesture handler (e.g. End Turn click)
 * to satisfy browser autoplay policy. Safe to call multiple times — no-op after first.
 */
export function initAudio(): void {
  if (typeof window === 'undefined' || audioInitialised) return
  audioInitialised = true

  earlyTrack = new Howl({
    src: ['/audio/ambience-early.wav'],
    loop: true,
    volume: 0,
    preload: true,
  })

  midTrack = new Howl({
    src: ['/audio/ambience-mid.ogg'],
    loop: true,
    volume: 0,
    preload: true,
  })

  hum = createSynthHum()
  hum.play()

  // Ramp in to Stage 1 target (morning birds) over 2s
  fadeHowl(earlyTrack, STAGE_VOLUMES[1].early, 2000)
}

/**
 * Transition audio to a new stage's volume targets over FADE_MS.
 * No-op if audio not yet initialised or stage hasn't changed.
 */
export function transitionToStage(stage: AtmosphereStage['id']): void {
  if (typeof window === 'undefined' || !audioInitialised) return
  if (stage === currentStage) return
  currentStage = stage

  const t = STAGE_VOLUMES[stage]
  fadeHowl(earlyTrack, t.early, FADE_MS)
  fadeHowl(midTrack, t.mid, FADE_MS)
  hum?.fadeTo(t.hum, FADE_MS)
}

/**
 * Stop and release all audio resources. Call on component unmount.
 */
export function stopAudio(): void {
  if (typeof window === 'undefined') return
  earlyTrack?.stop()
  midTrack?.stop()
  hum?.stop()
  earlyTrack = null
  midTrack = null
  hum = null
  audioInitialised = false
  currentStage = 1
}
