<template>
  <button :rec="isCurrent ? (globalAudio.isPlaying ? 'playing' : 'paused') : ''" :disabled="recId === undefined"
    :title="isCurrent ? (globalAudio.isPlaying ? (globalAudio.isLoading ? 'Loading' : 'Pause') : 'Play') : 'Play Recording'"
    @click="clicked">
    {{ isCurrent && globalAudio.isPlaying ? (globalAudio.isLoading ? "⏳" : "⏸︎") : "▶︎" }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import globalAudio from '../state/globalAudio'

const props = defineProps<{ recId?: string }>()

const isCurrent = computed(() => globalAudio.currentRecId === props.recId)

function clicked(e: MouseEvent) {
  e.stopPropagation()
  if (isCurrent.value) {
    globalAudio.isPlaying = !globalAudio.isPlaying
  } else {
    globalAudio.currentRecId = props.recId
    globalAudio.isPlaying = true
  }
}
</script>
