<template>
  <button :rec="isCurrent ? (globalAudio.isPlaying ? 'playing' : 'paused') : ''" :disabled="recId === undefined"
    :title="isCurrent ? (globalAudio.isPlaying ? (globalAudio.isLoading ? 'Loading' : 'Pause') : 'Play') : 'Play Recording'"
    v-tooltip="isCurrent ? (globalAudio.isPlaying ? (globalAudio.isLoading ? 'Loading' : 'Pause') : 'Play') : 'Play Recording'"
    @click="clicked">
    {{ isCurrent && globalAudio.isPlaying ? (globalAudio.isLoading ? "⏳" : "⏸︎") : "▶︎" }}
  </button>
</template>

<style>
button[rec] {
  width: 24px;
  height: 24px;
  text-align: center;
  padding: 0;
}

button[rec^=p] {
  background: #cdefec;
  border: 1px solid var(--color-c);
}

button[rec^=p]:hover {
  background: #bfdfdc;
  border-color: #2fbab5;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import globalAudio from '@/state/globalAudio'

const props = defineProps<{ recId?: string }>()

const isCurrent = computed(() => globalAudio.currentRecId === props.recId)

function clicked() {
  if (isCurrent.value) {
    globalAudio.isPlaying = !globalAudio.isPlaying
  } else {
    globalAudio.currentRecId = props.recId
    globalAudio.isPlaying = true
  }
}
</script>
