<template>
  <div :style="pane" ref="paneElement">
    <div :style="hdr">
      Call Log:
      {{ (contact.first_name + ' ' + contact.last_name) || 'Unnamed' }}
      <span style="font-size: 0.8em; color:#777">({{ contact.id }})</span>
    </div>

    <div v-if="contact.calls.length" :style="attemptList">
      <ul style="list-style:none; padding:0; margin:0">
        <li v-for="(att, i) in contact.calls" :key="att.id ? att.id + '-' + att.attempt_num : i" :style="itemStyle(att)"
          @click="handleAttemptClick(att)">
          <span :title="att.direction"
            :style="{ fontSize: '1.2em', color: att.direction === 'incoming' ? '#28a745' : '#007bff' }">
            {{ att.direction === 'incoming' ? '↗' : '↙' }}
          </span>
          <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
            {{ att.result || 'N/A' }}
          </span>
          <span style="font-size:0.9em; color:#777">{{ fmt(att.time) }}</span>
          <QuickPlay v-if="att.twilio_sid" :recId="att.twilio_sid" />
        </li>
      </ul>
    </div>
    <div v-else style="padding:16px; text-align:center; color:#777">No call attempts logged.</div>

    <CallDetails v-if="selectedCall" :agent="agent" :contact="contact" :call="selectedCall" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import QuickPlay from './QuickPlay.vue'
import type { Contact, CallMetadata } from '../../shared/types'
import CallDetails from './CallDetails.vue';

const props = defineProps<{
  contact: Contact
  agent: string
}>()
const emit = defineEmits<{ (e: 'closePane'): void }>()

const selectedCall = ref<CallMetadata | null>(null)

const pane = { position: 'fixed', right: '20px', top: '100px', width: '480px', maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: 0, boxShadow: '0 5px 15px rgba(0,0,0,.15)', zIndex: 1000 } as const
const hdr = { padding: '12px 16px', borderBottom: '1px solid #eee', fontWeight: 600, color: '#333' } as const
const attemptList = { overflowY: 'auto', maxHeight: '220px', borderBottom: '1px solid #eee', padding: '8px 16px', flexShrink: 0 } as const
const itemBase = { padding: '8px 6px', borderBottom: '1px solid #f0f0f0', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '8px', alignItems: 'center', fontSize: '0.88em', cursor: 'pointer' } as const
const itemStyle = (att: CallMetadata) => selectedCall.value?.id === att.id && selectedCall.value?.attempt_num === att.attempt_num ? { ...itemBase, background: '#e9f5ff', borderLeft: '3px solid #007bff' } : itemBase

const fmt = (d?: string | null) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'

const paneElement = ref<HTMLElement>() // Renamed from paneRef to avoid conflict
function onDoc(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (paneElement.value && !paneElement.value.contains(t) && !t.closest('tr[data-is-contact-row="true"]') && !t.closest('[data-is-audio-player="true"]') && !t.closest('.director-state-modal')) {
    emit('closePane')
  }
}
onMounted(() => document.addEventListener('mousedown', onDoc))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDoc))

const handleAttemptClick = (att: CallMetadata) => {
  if (!att) return
  if (selectedCall.value?.id === att.id && selectedCall.value.attempt_num === att.attempt_num)
    selectedCall.value = null
  else selectedCall.value = att
}

watch(() => props.contact, () => {
  selectedCall.value = null;
});
</script>
