// ─────────────────────────────────────────────
//  The Happiness Index — Audio Engine
//  Source: docs/07-decay-plan.md
//
//  Manages 3 ambient tracks (city ambience, crowd voices, low hum).
//  Volume targets per stage, fades over 6000ms (matching CSS transition).
//  Safe to call in SSR context — Howler is lazy-initialised client-side only.
// ─────────────────────────────────────────────

import type { AtmosphereStage } from '@/types'

// Volume targets per stage
const STAGE_VOLUMES: Record<
  AtmosphereStage['id'],
  { ambience: number; crowd: number; hum: number }
> = {
  1: { ambience: 1.0, crowd: 0.8, hum: 0.0 },
  2: { ambience: 0.6, crowd: 0.4, hum: 0.1 },
  3: { ambience: 0.25, crowd: 0.05, hum: 0.35 },
  4: { ambience: 0.05, crowd: 0.0, hum: 0.5 },
}

const FADE_DURATION_MS = 6000

type HowlInstance = {
  play: () => void
  stop: () => void
  fade: (from: number, to: number, duration: number) => void
  volume: (v?: number) => number
  playing: () => boolean
}

// Lazy singletons — created only in the browser
let ambienceSound: HowlInstance | null = null
let crowdSound: HowlInstance | null = null
let humSound: HowlInstance | null = null
let audioInitialised = false
let currentStage: AtmosphereStage['id'] = 1

/**
 * Create a Howl-compatible looping placeholder using Web Audio API.
 * We generate simple synthesised tones so the game ships without audio assets.
 * Replace with real .mp3 paths by swapping the `src` in the Howl constructor.
 */
function createSynthHowl(
  frequency: number,
  baseVolume: number
): HowlInstance {
  // Use Web Audio API to create a looping oscillator-based sound
  let audioCtx: AudioContext | null = null
  let gainNode: GainNode | null = null
  let oscillator: OscillatorNode | null = null
  let isPlaying = false
  let currentVolume = 0

  const getCtx = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtx
  }

  return {
    play() {
      if (isPlaying) return
      const ctx = getCtx()
      gainNode = ctx.createGain()
      gainNode.gain.value = 0
      gainNode.connect(ctx.destination)

      oscillator = ctx.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(gainNode)
      oscillator.start()
      isPlaying = true
    },
    stop() {
      if (!isPlaying) return
      oscillator?.stop()
      oscillator?.disconnect()
      gainNode?.disconnect()
      oscillator = null
      gainNode = null
      isPlaying = false
      currentVolume = 0
    },
    fade(from: number, to: number, duration: number) {
      if (!gainNode) return
      const ctx = getCtx()
      const scaledFrom = from * baseVolume
      const scaledTo = to * baseVolume
      gainNode.gain.cancelScheduledValues(ctx.currentTime)
      gainNode.gain.setValueAtTime(scaledFrom, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(
        scaledTo,
        ctx.currentTime + duration / 1000
      )
      currentVolume = to
    },
    volume(v?: number): number {
      if (v !== undefined) {
        currentVolume = v
        if (gainNode) {
          gainNode.gain.value = v * baseVolume
        }
      }
      return currentVolume
    },
    playing() {
      return isPlaying
    },
  }
}

/**
 * Initialise audio engine. Must be called from a user gesture handler
 * (e.g. first button click) to satisfy browser autoplay policy.
 */
export function initAudio(): void {
  if (typeof window === 'undefined' || audioInitialised) return
  audioInitialised = true

  // City ambience: warm low-frequency drone (80 Hz)
  ambienceSound = createSynthHowl(80, 0.15)
  // Crowd voices: mid-range murmur (320 Hz)
  crowdSound = createSynthHowl(320, 0.08)
  // System hum: high electronic tone (640 Hz)
  humSound = createSynthHowl(640, 0.10)

  // Start all sounds silently
  ambienceSound.play()
  crowdSound.play()
  humSound.play()

  // Ramp in to Stage 1 target volumes over 2s
  const targets = STAGE_VOLUMES[1]
  ambienceSound.fade(0, targets.ambience, 2000)
  crowdSound.fade(0, targets.crowd, 2000)
  humSound.fade(0, targets.hum, 2000)
}

/**
 * Transition audio to a new stage's volume targets.
 * Safe to call even if audio hasn't been initialised (no-op).
 */
export function transitionToStage(stage: AtmosphereStage['id']): void {
  if (typeof window === 'undefined' || !audioInitialised) return
  if (stage === currentStage) return
  currentStage = stage

  const targets = STAGE_VOLUMES[stage]

  if (ambienceSound?.playing()) {
    ambienceSound.fade(ambienceSound.volume(), targets.ambience, FADE_DURATION_MS)
  }
  if (crowdSound?.playing()) {
    crowdSound.fade(crowdSound.volume(), targets.crowd, FADE_DURATION_MS)
  }
  if (humSound?.playing()) {
    humSound.fade(humSound.volume(), targets.hum, FADE_DURATION_MS)
  }
}

/**
 * Stop and clean up all audio. Call on component unmount.
 */
export function stopAudio(): void {
  if (typeof window === 'undefined') return
  ambienceSound?.stop()
  crowdSound?.stop()
  humSound?.stop()
  audioInitialised = false
  ambienceSound = null
  crowdSound = null
  humSound = null
  currentStage = 1
}
