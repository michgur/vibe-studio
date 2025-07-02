<template>
  <div id="rec-player" class="card" v-show="recAudio.currentRecId">
    <p v-if="recAudio.error" style="color: red">Error: {{ recAudio.error }}</p>
    <template v-else>
      <PlayButton :recId="recAudio.currentRecId" />
      <button id="rec-playback-rate" v-tooltip="'Audio Speed'" @click="nextPlaybackRate">
        {{ recAudio.playbackRate }}×
      </button>
      <input type="range" :max="recAudio.duration" v-model="recAudio.currentTime" step="any"
        :style="{ '--progress': `${recAudio.currentTime / recAudio.duration * 100 || 0}%` }"
        :disabled="recAudio.isLoading || !!recAudio.error || !recAudio.duration" />
      <small>{{ fmtTimestamp(recAudio.currentTime) }} / {{ fmtTimestamp(recAudio.duration) }}</small>
      <button id="rec-close-player" type="button" @click="recAudio.currentRecId = undefined"
        v-tooltip="'Close Player'">✕</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import useRecAudio from '@/composables/recAudio';
import PlayButton from './PlayButton.vue';
import { fmtTimestamp } from '@/fmt';

const props = defineProps<{ agent?: string }>()
const recAudio = useRecAudio()

const rates = [1, 1.25, 1.5, 2]

watch(() => props.agent, (agent) => recAudio.agent = agent, { immediate: true })

function nextPlaybackRate() {
  const idx = (rates.indexOf(recAudio.playbackRate) + 1) % rates.length
  recAudio.playbackRate = rates[idx]
}
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
  background-color: var(--color-active);
  z-index: 100;
  gap: 4px;
  display: flex;
  align-items: center;

  & input[type=range] {
    flex-grow: 1;
    accent-color: var(--color-b);
    appearance: none;
    background: transparent;

    &::-webkit-slider-runnable-track {
      background: linear-gradient(to right, var(--color-b) var(--progress), var(--color-8) var(--progress));
      height: 4px;
      border-radius: 50px;
    }

    &::-moz-range-track {
      background: linear-gradient(to right, var(--color-b) var(--progress), var(--color-8) var(--progress));
      height: 4px;
      border-radius: 50px;
    }

    &::-webkit-slider-thumb {
      appearance: none;
      cursor: pointer;
      margin: 0;
      padding: 0;
      background: var(--color-b);
      outline: 3px solid var(--color-active);
      height: 24px;
      transform: translateY(-10px);
      border-radius: 3px;
      width: 4px;

      &:hover {
        background: var(--color-6);
      }

      &:active {
        background: var(--color-4);
      }
    }

    &:disabled::-webkit-slider-thumb {
      background: var(--color-8);
      cursor: not-allowed;
    }

    &::-moz-range-thumb {
      appearance: none;
      cursor: pointer;
      margin: 0;
      padding: 0;
      background: var(--color-b);
      outline: 3px solid var(--color-active);
      height: 24px;
      /*transform: translateY(-10px);*/
      border-radius: 3px;
      width: 4px;

      &:hover {
        background: var(--color-6);
      }

      &:active {
        background: var(--color-4);
      }
    }

    &:disabled::-moz-range-thumb {
      background: var(--color-8);
      cursor: not-allowed;
    }
  }

  & #rec-playback-rate {
    appearance: none;
    padding: 0;
    width: 30px;
    background: transparent;
    font-weight: 600;
  }

  & #rec-close-player {
    opacity: 0;
    position: absolute;
    right: 8px;
    width: 24px;
    height: 24px;
    font-size: 1rem;
    padding: 0;
    pointer-events: none;
  }

  &:hover #rec-close-player {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
