<template>
  <div class="card" id="call-log">
    <div class="card-header">
      Call Log:
      {{ fmtName(contact.firstName, contact.lastName) }}<br>
      <small class="monospace line-clamp">{{ contact.id }}</small>
    </div>

    <ul v-if="contact.calls.length">
      <li v-for="(call, i) in contact.calls" :key="call.id ? call.id + '-' + call.attempt : i"
        :aria-selected="call === selectedCall" @click="selectedCall = call">
        <CallDirectionIcon :direction="call.direction" />
        <span class="ellipsize">{{ call.result || 'N/A' }}</span>
        <small>{{ fmtDate(call.dialedAt) }}</small>
        <QuickPlay v-if="call.recordingId" :recId="call.recordingId" />
      </li>

    </ul>
    <div v-else style="padding:16px; text-align:center; color:var(--color-6)">No call attempts logged.</div>

    <CallDetails v-if="selectedCall" :agent="agent" :contact="contact" :call="selectedCall" />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import QuickPlay from './QuickPlay.vue'
import type { Contact, CallMetadata } from '../../shared/types'
import CallDetails from './CallDetails.vue'
import CallDirectionIcon from './CallDirectionIcon.vue'
import { fmtDate, fmtName } from '../fmt'

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
#call-log {
  display: flex;
  flex-direction: column;

  &>.card-header {
    background: white;
    font-weight: 600;
    color: var(--color-2);
    box-shadow: var(--shadow-sm);
    z-index: 1;

    & small {
      line-break: anywhere;
    }
  }

  & ul {
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
}
</style>
