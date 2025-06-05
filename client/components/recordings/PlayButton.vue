<template>
  <button :rec="status" :disabled="recId === undefined" v-tooltip="tooltips[status]"
    @click="recAudio.playOrPause(recId)">{{ icons[status] }}</button>
</template>

<style>
button[rec] {
  width: 24px;
  height: 24px;
  text-align: center;
  padding: 0;

  &[rec^=p],
  &[rec=loading] {
    background: #cdefec;
    border: 1px solid var(--color-c);

    &:hover {
      background: #bfdfdc;
      border-color: #2fbab5;
    }
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import useRecAudio from '@/composables/recAudio';

const { recId } = defineProps<{ recId?: string }>()
const recAudio = useRecAudio()

const status = computed(() => {
  if (recAudio.currentRecId !== recId) return 'idle'
  if (recAudio.isLoading) return 'loading'
  if (recAudio.isPlaying) return 'playing'
  return 'paused'
})

const tooltips = {
  'idle': 'Play Recording',
  'loading': 'Loading',
  'playing': 'Pause',
  'paused': 'Play',
}
const icons = {
  'idle': '▶︎',
  'loading': '⏳',
  'playing': '⏸︎',
  'paused': '▶︎',
}
</script>
