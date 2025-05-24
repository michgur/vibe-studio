<template>
  <div :style="{ ...playerStyle, ...(!globalAudio.currentRecId && { display: 'none' } || {}) }"
    data-is-audio-player="true">
    <audio ref="audioRef" preload="metadata" />

    <p v-if="errorShown" style="color: red">Error: {{ errorShown }}</p>

    <div :style="controlRowStyle">
      <QuickPlay :recId="globalAudio.currentRecId" />
      <input type="range" :max="Math.floor(duration)" v-model.number="currentTime" @input="onSeek" :style="sliderStyle"
        :disabled="globalAudio.isLoading || !!errorShown || !duration" />
      <span>{{ fmt(currentTime) }} / {{ fmt(duration) }}</span>
      <button @click="onClose" title="Close Player">✕</button>
    </div>

    <div :style="controlRowStyle">
      <label for="rate">Speed:</label>
      <select id="rate" v-model.number="playbackRate" @change="onRateChanged" :style="selectStyle"
        :disabled="globalAudio.isLoading || !!errorShown">
        <option v-for="r in rates" :key="r" :value="r">{{ r }}x</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import globalAudio from '../state/globalAudio'
import QuickPlay from './QuickPlay.vue';

const props = defineProps<{ agent?: string }>()

const audioRef = ref<HTMLAudioElement | null>(null)
const duration = ref(0)
const currentTime = ref(0)
const errorShown = ref<string | null>(null)
const playbackRate = ref(1)

const rates = [1, 1.25, 1.5, 2]
const fmt = (t: number) => {
  const m = Math.floor(t / 60)
  const s = String(Math.floor(t % 60)).padStart(2, '0')
  return `${m}:${s}`
}

function onPlayPause() {
  const a = audioRef.value
  if (!a || !a.src) return
  if (globalAudio.isPlaying) a.play()
  else a.pause()
}
function onSeek() {
  if (audioRef.value) audioRef.value.currentTime = currentTime.value
}
function onRateChanged() {
  if (audioRef.value) audioRef.value.playbackRate = playbackRate.value
}
function onClose() {
  globalAudio.currentRecId = undefined;
  globalAudio.isPlaying = false;
}

watch(() => globalAudio.isPlaying, onPlayPause)
watch(() => globalAudio.currentRecId, () => {
  const a = audioRef.value
  if (!a) return
  errorShown.value = null
  currentTime.value = 0
  duration.value = 0
  globalAudio.isLoading = true

  if (props.agent && globalAudio.currentRecId) {
    a.src = `/api/${props.agent}/recordings/${globalAudio.currentRecId}.wav`
    a.playbackRate = playbackRate.value
  } else {
    a.src = ''
    globalAudio.isPlaying = false
    globalAudio.isLoading = false
  }
  onPlayPause()
})
watch(() => props.agent, onClose)

let detach: (() => void) | undefined = undefined
watch(
  () => audioRef.value,
  async (a, _, onCleanup) => {
    if (!a) return
    await nextTick()

    if (detach) detach()
    detach = (() => {
      const loaded = () => {
        duration.value = a.duration
        currentTime.value = a.currentTime
        globalAudio.isLoading = false
      }
      const time = () => (currentTime.value = a.currentTime)
      const ended = () => {
        globalAudio.isPlaying = false
        currentTime.value = a.duration
      }
      const err = (e: any) => {
        errorShown.value = `Error loading audio ${JSON.stringify(e)}`
        globalAudio.isLoading = false
        globalAudio.isPlaying = false
      }

      a.addEventListener('loadeddata', loaded)
      a.addEventListener('timeupdate', time)
      a.addEventListener('ended', ended)
      a.addEventListener('error', err)

      return () => {
        a.removeEventListener('loadeddata', loaded)
        a.removeEventListener('timeupdate', time)
        a.removeEventListener('ended', ended)
        a.removeEventListener('error', err)
      }
    })()
    onCleanup(() => detach?.())
  },
  { immediate: true }
)
onUnmounted(() => detach?.())


/* ---------- inline styles ---------- */
const playerStyle = {
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: '600px',
  padding: '15px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
}
const controlRowStyle = { display: 'flex', alignItems: 'center', gap: '10px' }
const sliderStyle = { flexGrow: 1 }
const selectStyle = { padding: '8px', borderRadius: '4px' }
</script>
