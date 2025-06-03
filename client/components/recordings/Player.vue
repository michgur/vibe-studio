<template>
  <div id="rec-player" class="card" v-show="globalAudio.currentRecId">
    <audio ref="audioRef" preload="metadata" />

    <p v-if="errorShown" style="color: red">Error: {{ errorShown }}</p>

    <div>
      <input type="range" :max="Math.floor(duration)" v-model="currentTime" @input="onSeek"
        :disabled="globalAudio.isLoading || !!errorShown || !duration" />
      <button @click="onClose" v-tooltip="'Close Player'">✕</button>
    </div>

    <div>
      <div>
        <PlayButton :recId="globalAudio.currentRecId" />
        <select v-tooltip="'Audio Speed'" v-model="playbackRate" @change="onRateChanged"
          :disabled="globalAudio.isLoading || !!errorShown">
          <option v-for="r in rates" :key="r" :value="r">{{ r }}x</option>
        </select>
      </div>
      <small>{{ fmtTimestamp(currentTime) }} / {{ fmtTimestamp(duration) }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import globalAudio from '@/state/globalAudio'
import PlayButton from './PlayButton.vue';
import { fmtTimestamp } from '@/fmt';

const props = defineProps<{ agent?: string }>()

const audioRef = ref<HTMLAudioElement | null>(null)
const duration = ref(0)
const currentTime = ref(0)
const errorShown = ref<string | null>(null)
const playbackRate = ref(1)

const rates = [1, 1.25, 1.5, 2]

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
</script>
<style>
#rec-player {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  padding: 8px;
  background-color: var(--color-selected);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;

  & input[type=range] {
    flex-grow: 1;
    accent-color: var(--color-b);
  }

  & select {
    height: 24px;
    padding: 0;
    appearance: none;
    text-align: center;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;

    & option {
      padding: 0;
    }
  }

  & div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
}
</style>
