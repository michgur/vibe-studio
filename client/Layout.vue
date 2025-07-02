<template>
  <div class="App">
    <header>
      <img src="/assets/vibe.svg" alt="OneAI Vibe Studio">
      <nav>
        <RouterLink :to="`/${agent}/contacts`">Contacts</RouterLink>
        <RouterLink :to="`/${agent}/reports`">Report Builder</RouterLink>
      </nav>
      <menu>
        <TimezoneModeToggle />
        <label v-tooltip="'Select Agent'">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="20" style="margin-top:-3px">
            <path fill="CurrentColor" fill-rule="evenodd"
              d="M13.677 14.99c.696 0 1.26.565 1.26 1.261v1.155a1.26 1.26 0 0 1-1.26 1.26H8.323a1.26 1.26 0 0 1-1.26-1.26V16.25c0-.696.564-1.26 1.26-1.26h5.354Zm-5.396 1.055a.21.21 0 0 0-.168.206v1.155a.21.21 0 0 0 .168.206l.042.004h.682V16.04h-.682l-.042.004Zm1.774 1.57h1.89v-1.574h-1.89v1.575Zm2.94 0h.682a.21.21 0 0 0 .21-.21v-1.154a.21.21 0 0 0-.21-.21h-.682v1.575ZM7.744 8.69a2.415 2.415 0 1 1 0 4.83 2.415 2.415 0 0 1 0-4.83Zm0 1.05a1.365 1.365 0 1 0 0 2.73 1.365 1.365 0 0 0 0-2.73ZM14.256 8.69a2.415 2.415 0 1 1 0 4.83 2.415 2.415 0 0 1 0-4.83Zm0 1.05a1.365 1.365 0 1 0 0 2.73 1.365 1.365 0 0 0 0-2.73Z"
              clip-rule="evenodd" />
            <path fill="CurrentColor" fill-rule="evenodd"
              d="M11 .5c1.073 0 1.943.87 1.943 1.942l-.01.199a1.944 1.944 0 0 1-1.408 1.671V5.75h2.94a4.41 4.41 0 0 1 4.404 4.2h.531c1.16 0 2.1.94 2.1 2.1v1.575a2.1 2.1 0 0 1-2.1 2.1h-.525v2.1l-.005.189a3.675 3.675 0 0 1-3.481 3.48l-.189.006H6.8a3.675 3.675 0 0 1-3.67-3.486l-.005-.189v-2.1H2.6a2.1 2.1 0 0 1-2.1-2.1V12.05c0-1.16.94-2.1 2.1-2.1h.53a4.41 4.41 0 0 1 4.178-4.194l.227-.006h2.94V4.311A1.942 1.942 0 0 1 11 .5ZM7.535 6.8a3.36 3.36 0 0 0-3.36 3.36v7.665A2.625 2.625 0 0 0 6.8 20.45h8.4a2.625 2.625 0 0 0 2.625-2.625V10.16a3.36 3.36 0 0 0-3.187-3.356l-.173-.004h-6.93ZM2.6 11c-.58 0-1.05.47-1.05 1.05v1.575c0 .58.47 1.05 1.05 1.05h.525V11H2.6Zm16.275 3.675h.525c.58 0 1.05-.47 1.05-1.05V12.05c0-.58-.47-1.05-1.05-1.05h-.525v3.675ZM11 1.55a.892.892 0 1 0 0 1.785.892.892 0 0 0 0-1.785Z"
              clip-rule="evenodd" />
          </svg>
          <select v-model="agent">
            <option v-for="id in ALL_AGENTS" :key="id" :value="id">
              {{ id }}
            </option>
          </select>
        </label>
      </menu>
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
import TimezoneModeToggle from '@/components/ui/TimezoneModeToggle.vue'


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
    align-items: end;
    justify-content: space-between;
    padding-bottom: 10px;
    color: var(--color-6);
    font-weight: 600;
    font-size: .9rem;

    &>img {
      height: 36px;
    }

    & a {
      line-height: 1;
      appearance: none;
      text-decoration: none;
      padding: 4px 10px;
      color: var(--color-6);

      &.router-link-active {
        color: var(--color-b);
      }

      &:hover {
        text-shadow: 0 0 1px white,
          0 0 3px rgba(var(--rgb-shadow), 0.15);
      }

      &:active {
        color: var(--color-4);
      }
    }

    &>nav {
      display: flex;
      justify-content: center;
      flex-grow: 1;
    }

    &>menu {
      line-height: 1.2;
      display: flex;
      justify-content: end;
      align-items: stretch;
      margin: 0;
      padding: 0;
      gap: 16px;

      & label {
        height: 18px;
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
