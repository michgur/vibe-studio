<template>
  <div class="App">
    <header>
      <img src="/assets/vibe.svg" alt="OneAI Vibe Studio">
      <RouterLink :to="`/${agent}/contacts`">Contacts</RouterLink>
      <RouterLink :to="`/${agent}/reports`">Report Builder</RouterLink>
      <nav>
        <TimezoneModeToggle />
        <label style="font-size:.9rem">
          <span style="line-height: 1.2">🤖</span>
          <select v-model="agent">
            <option v-for="id in ALL_AGENTS" :key="id" :value="id">
              {{ id }}
            </option>
          </select>
        </label>
      </nav>
    </header>

    <main>
      <RouterView :agent="agent" :dateRange="dateRange" />
    </main>

    <Player :agent="agent" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import Player from '@/components/recordings/Player.vue'
import type { DateRange } from '@shared/types'
import { prevDay, toISO } from '@shared/dates'
import { ALL_AGENTS } from '@shared/agents'
import TimezoneModeToggle from './components/ui/TimezoneModeToggle.vue'


const router = useRouter()
const route = useRoute()
const agent = ref<string>()
const dateRange = ref<DateRange>([toISO(prevDay(29)), toISO(prevDay(0))])

watch(() => route.params.agent, (a) => agent.value = a as string, { immediate: true })
watch(agent, (a) => router.push({ params: { agent: a } }))
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
    gap: 18px;
    color: var(--color-6);
    font-weight: 600;
    font-size: .9rem;
    line-height: 1;

    &>img {
      height: 36px;
    }

    & a {
      appearance: none;
      text-decoration: none;
      text-underline-offset: 2px;
      padding-top: 4px;
      color: var(--color-6);

      &.router-link-active,
      &:hover {
        color: var(--color-b);
        text-decoration: underline;
      }
    }

    &>nav {
      flex-grow: 1;
      display: flex;
      justify-content: end;
      align-items: stretch;
      gap: 8px;

      & label {
        height: 18px;
        font-size: .8em;
        display: flex;
        align-items: stretch;
        gap: 4px;
      }
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
