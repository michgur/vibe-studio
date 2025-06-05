// useRecAudio.ts  – ONE audio element, export-only the reactive state
import { reactive, watch } from 'vue'

/* ───────── singleton audio element ───────── */
const audio = new Audio()
audio.preload = 'metadata'

/* ───────── shared reactive state ───────── */
export interface RecAudioState {
  agent?: string
  currentRecId?: string
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  playbackRate: number
  error?: string
  playOrPause: (recId?: string) => void
}

const state = reactive<RecAudioState>({
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  playOrPause: (recId?: string) => {
    if (recId === undefined || recId === state.currentRecId) {
      state.isPlaying = !state.isPlaying
    } else {
      state.currentRecId = recId
      state.isPlaying = true
    }
  }
})

/* ───────── vue ⇆ audio sync ───────── */
function handlePlayPause() {
  if (state.isPlaying) audio.play()
  else audio.pause()
}

watch(() => state.playbackRate, r => (audio.playbackRate = r))
watch(() => state.currentTime, t => { if (Math.abs(audio.currentTime - t) > 0.01) audio.currentTime = t })
watch(() => state.isPlaying, handlePlayPause)

watch(
  () => state.currentRecId,
  (recId) => {
    state.error = undefined
    state.duration = state.currentTime = 0

    if (state.agent && recId) {
      audio.src = `/api/${state.agent}/recordings/${recId}.wav`
      audio.playbackRate = state.playbackRate
      state.isLoading = true
    } else {
      audio.src = ''
      state.isPlaying = false
      state.isLoading = false
    }
    handlePlayPause()
  }
)

watch(() => state.agent, () => {
  state.currentRecId = undefined
  state.isPlaying = false
})

/* native events → state */
audio.addEventListener('loadeddata', () => {
  state.duration = audio.duration
  state.currentTime = audio.currentTime
  state.isLoading = false
})
audio.addEventListener('timeupdate', () => { state.currentTime = audio.currentTime })
audio.addEventListener('ended', () => { state.isPlaying = false })
audio.addEventListener('error', e => {
  state.error = `Error loading audio ${JSON.stringify(e)}`
  state.isLoading = state.isPlaying = false
})

/* ───────── composable ───────── */
export default function useRecAudio() {
  return state
}
