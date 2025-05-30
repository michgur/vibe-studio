<template>
  <div class="App">
    <header>
      <img src="/assets/vibe.svg" alt="OneAI Vibe Studio">
      <div>
        <label for="agent-select">Agent: </label>
        <select id="agent-select" v-model="agent">
          <option v-for="id in AGENT_IDS" :key="id" :value="id">
            {{ id }}
          </option>
        </select>
      </div>
    </header>

    <main>
      <RouterView :agent="agent" />
    </main>

    <SharedAudioPlayer :agent="agent" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SharedAudioPlayer from './components/SharedAudioPlayer.vue'

const AGENT_IDS = ['better-move-backlog', 'msc-merchant'] as const

const router = useRouter()
const route = useRoute()
const agent = ref<string>(AGENT_IDS[0])

watch(() => route.params.agent, (a) => agent.value = a as string, { immediate: true })
watch(agent, (a) => {
  router.push({ params: { agent: a } })
})
</script>

<style>
.App {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;

  &>header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;

    &>img {
      height: 36px;
    }
  }

  &>main {
    display: flex;
    align-items: stretch;
    flex-grow: 1;
    min-height: 0;
  }
}
</style>
