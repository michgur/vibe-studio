<template>
  <div :style="tabs">
    <button :style="tabBtn('details')" @click="tab = 'details'">Details</button>
    <button :style="tabBtn('transcript')" @click="tab = 'transcript'" :disabled="!call.duration">Transcript</button>
  </div>

  <div :style="detailBox">
    <template v-if="tab === 'details'">
      <h4 style="margin:0 0 10px">Call Details:</h4>
      <table style="width:100%; border-collapse:collapse; font-size:0.9em">
        <tbody>
          <tr v-for="[k, v] in detailRows" :key="k">
            <td :style="th">{{ fmtKey(k) }}</td>
            <td :style="td">{{ fmtValue(v) }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else>
      <p v-if="isLoading">Loading transcript…</p>
      <p v-else-if="errorShown" style="color:red">Error: {{ errorShown }}</p>
      <p v-else-if="!transcript?.length">No transcript.</p>
      <div v-else :style="chatBox">
        <div v-for="(m, idx) in transcript" :key="idx" :style="msgStyle(m.speaker as 'user' | 'assistant')">
          <div>{{ m.content || '[empty]' }}</div>
          <div :style="meta">{{ fmtTimestamp(m.timestamp) }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Contact, CallMetadata, CallMessage } from '../../shared/types'

const props = defineProps<{ contact: Contact, agent: string, call: CallMetadata }>()

const transcript = ref<CallMessage[] | null>(null)
const isLoading = ref(false)
const errorShown = ref<string | null>(null)
const tab = ref<'details' | 'transcript'>('details')

async function fetchTranscript(): Promise<CallMessage[]> {
  try {
    const res = await fetch(`/api/${props.agent}/calls/${props.call.id}/transcript`, {
      method: 'GET'
    }).then(r => r.json())
    return res;
  } catch (e) {
    console.error(e);
    return [];
  }
}

watch(() => props.call, async (att) => {
  transcript.value = null
  errorShown.value = null
  tab.value = "details"

  if (!att?.id) return
  isLoading.value = true
  try {
    transcript.value = await fetchTranscript()
  } catch (e: any) {
    errorShown.value = e.message || 'Failed to load transcript.'
  } finally {
    isLoading.value = false
  }
}, { immediate: true })

const fmtTimestamp = (t?: number) => {
  if (t === undefined) return '--:--'
  return `${String(t / 60 | 0).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}
const fmtKey = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
const fmtValue = (v: any) => typeof v === 'object' ? JSON.stringify(v) : String(v)
const detailRows = computed(() => Object.entries(props.call || {}).filter(([k]) => !['result_metadata', 'recording_url', 'attempt_num', 'chat_id', 'start_time', 'result', 'call_direction'].includes(k)))

const tabs = { display: 'flex', borderBottom: '1px solid #eee' } as const
const detailBox = { overflowY: 'auto', padding: '16px', flexGrow: 1, position: 'relative' } as const
const th = { textAlign: 'left', padding: '6px 4px', borderBottom: '1px solid #eee', color: '#555', width: '35%' } as const
const td = { textAlign: 'left', padding: '6px 4px', borderBottom: '1px solid #eee', color: '#333', wordBreak: 'break-all' } as const
const chatBox = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0' } as const
const msgBase = { padding: '8px 12px', borderRadius: '15px', maxWidth: '75%', fontSize: '0.9em', cursor: 'pointer', textAlign: 'left', wordWrap: 'break-word' } as const
const meta = { fontSize: '0.75em', textAlign: 'right', opacity: 0.7, marginTop: '5px' } as const
const msgStyle = (speaker: 'user' | 'assistant') =>
  speaker === 'user'
    ? { ...msgBase, background: '#007bff', color: '#fff', alignSelf: 'flex-end' }
    : { ...msgBase, background: '#e9ecef', color: '#333', alignSelf: 'flex-start' }

const tabBtn = (t: 'details' | 'transcript') => t === tab.value ? { padding: '6px 12px', border: 'none', borderBottom: '2px solid #007bff', fontWeight: 'bold', background: 'transparent' } : { padding: '6px 12px', border: 'none', background: 'transparent' }
</script>
