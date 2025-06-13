<template>
  <div id="rec-player" class="card" v-show="recAudio.currentRecId">
    <p v-if="recAudio.error" style="color: red">Error: {{ recAudio.error }}</p>

    <div>
      <input type="range" :max="Math.floor(recAudio.duration)" v-model="recAudio.currentTime"
        :disabled="recAudio.isLoading || !!recAudio.error || !recAudio.duration" />
      <button type="button"  @click="recAudio.currentRecId = undefined" v-tooltip="'Close Player'">✕</button>
    </div>

    <div>
      <div>
        <PlayButton :recId="recAudio.currentRecId" />
        <select v-tooltip="'Audio Speed'" v-model="recAudio.playbackRate"
          :disabled="recAudio.isLoading || !!recAudio.error">
          <option v-for="r in rates" :key="r" :value="r">{{ r }}x</option>
        </select>
      </div>
      <small>{{ fmtTimestamp(recAudio.currentTime) }} / {{ fmtTimestamp(recAudio.duration) }}</small>
    </div>
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
