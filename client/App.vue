<template>
  <div class="App">
    <header class="App-header">
      <h1>One AI Vibe Studio</h1>
      <div>
        <label for="agent-select">Select Agent: </label>
        <select id="agent-select" v-model="agent">
          <option v-for="id in AGENT_IDS" :key="id" :value="id">
            {{ id }}
          </option>
        </select>
      </div>
    </header>

    <main>
      <ContactList v-if="agent" :agent="agent" />
    </main>

    <SharedAudioPlayer :agent="agent" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ContactList from './components/ContactList.vue'
import SharedAudioPlayer from './components/SharedAudioPlayer.vue'

const AGENT_IDS = ['lili-agent', 'better-move-backlog'] as const

const agent = ref<string>(AGENT_IDS[0])
</script>
