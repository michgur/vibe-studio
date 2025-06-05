<template>
  <div class="App">
    <header>
      <img src="/assets/vibe.svg" alt="OneAI Vibe Studio">
      <RouterLink :to="`/${agent}/contacts`">Contacts</RouterLink>
      <RouterLink :to="`/${agent}/reports`">Report Builder</RouterLink>
      <div style="flex-grow:1"></div>
      <DateRangePicker v-model="dateRange" />
      <div>
        <label for="agent-select">Agent </label>
        <select id="agent-select" v-model="agent">
          <option v-for="id in ALL_AGENTS" :key="id" :value="id">
            {{ id }}
          </option>
        </select>
      </div>
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
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import type { DateRange } from '@shared/types'
import { prevDay, toISO } from '@shared/dates'
import { ALL_AGENTS } from '@shared/agents'


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
    font-size: 14px;
    gap: 18px;
    color: var(--color-6);
    font-weight: 600;

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
  }

  &>main {
    display: flex;
    align-items: stretch;
    flex-grow: 1;
    min-height: 0;
  }
}
</style>
