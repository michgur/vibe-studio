<template>
  <ul v-if="contact.calls.length" id="call-list" @keydown.down="console.log('calls down')">
    <li v-for="(call, i) in contact.calls" :key="call.id ? call.id + '-' + call.attempt : i"
      :aria-selected="call === selectedCall" @click="selectedCall = call">
      <CallDirectionIcon :direction="call.direction" />
      <span class="ellipsize">{{ call.result || 'N/A' }}</span>
      <small>{{ fmtDate(call.dialedAt) }}</small>
      <PlayButton v-if="call.recordingId" :recId="call.recordingId" />
    </li>
  </ul>
  <div v-else style="padding:16px; text-align:center; color:var(--color-6)">No call attempts logged.</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import PlayButton from '@/components/recordings/PlayButton.vue'
import type { Contact, CallMetadata } from '@shared/types'
import CallDirectionIcon from './CallDirectionIcon.vue'
import { fmtDate } from '@/fmt'

const props = defineProps<{
  contact: Contact
  agent: string
}>()

const selectedCall = defineModel<CallMetadata | undefined>(undefined)

watch(() => props.contact, () => {
  if (props.contact.calls.find(c => c.id === selectedCall.value?.id)) { }
  else selectedCall.value = props.contact.calls.find(c => c.recordingId) || props.contact.calls.at(0)
}, { immediate: true });
</script>

<style>
ul#call-list {
  overflow-y: auto;
  max-height: 220px;
  flex-shrink: 0;
  list-style: none;
  padding: 0;
  margin: 0;

  & li {
    padding: 8px;
    border-bottom: 1px solid var(--color-10);
    display: grid;
    grid-template-columns: 10px 1fr auto 24px;
    gap: 8px;
    align-items: center;
    font-size: 0.88em;
    cursor: pointer;

    &:hover {
      background: var(--color-hover);
    }

    &[aria-selected=true] {
      background: var(--color-selected);
    }

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
