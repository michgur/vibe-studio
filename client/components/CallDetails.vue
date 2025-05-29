<template>
  <div role="tablist" style="display:flex">
    <button role="tab" :aria-selected="tab === 'details'" @click="tab = 'details'">Details</button>
    <button role="tab" :aria-selected="tab === 'transcript'" @click="tab = 'transcript'"
      :disabled="!call.duration">Transcript</button>
  </div>

  <div id="call-details" ref="callDetails">
    <template v-if="tab === 'details'">
      <table>
        <tbody>
          <tr v-for="[k, v] in detailRows" :key="k">
            <th>{{ fmtKey(k) }}</th>
            <td>{{ fmtValue(v) }}</td>
          </tr>
        </tbody>
      </table>
      <h4>Result Metadata</h4>
      <table v-if="call.metadata" class="monospace">
        <tbody>
          <tr v-for="[k, v] in Object.entries(call.metadata)" :key="k">
            <th>{{ k }}</th>
            <td>
              <p class="line-clamp">{{ v }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else>
      <div v-if="isLoading" class="skeleton"></div>
      <p v-else-if="errorShown" style="color:red">Error: {{ errorShown }}</p>
      <p v-else-if="!transcript?.length">No transcript.</p>
      <div v-else id="message-box">
        <div v-for="(m, idx) in transcript" :key="idx" :data-speaker="m.speaker">
          <div>{{ m.content || '[empty]' }}</div>
          <small><strong>{{ m.speaker }}</strong> | {{ fmtTimestamp(m.timestamp) }}</small>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue'
import type { Contact, CallMetadata, CallMessage } from '../../shared/types'
import { fmtKey, fmtTimestamp, fmtValue } from '../fmt';

const props = defineProps<{ contact: Contact, agent: string, call: CallMetadata }>()

const transcript = ref<CallMessage[] | null>(null)
const isLoading = ref(false)
const errorShown = ref<string | null>(null)
const tab = ref<'details' | 'transcript'>('details')
const callDetails = useTemplateRef("callDetails")

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

watch(() => props.call, async (call) => {
  transcript.value = null
  errorShown.value = null
  tab.value = "details"

  if (!call?.id) return
  isLoading.value = true
  try {
    transcript.value = await fetchTranscript()
  } catch (e: any) {
    errorShown.value = e.message || 'Failed to load transcript.'
  } finally {
    isLoading.value = false
  }
}, { immediate: true })

const detailRows = computed(() => Object.entries(props.call || {}).filter(([k]) => !['metadata', 'recording_url', 'attempt_num', 'chat_id', 'start_time', 'result', 'call_direction'].includes(k)))

watch(() => [tab.value, props.call], () => {
  callDetails.value?.scrollTo({ top: 0, left: 0 })
})
</script>

<style>
#message-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 8px 64px 8px;

  & [data-speaker] {
    border-radius: 10px;
    font-size: 0.9em;
    text-align: left;
    word-wrap: break-word;

    & small {
      font-size: 0.75em;
      opacity: 0.7;
      margin-top: 5px;
    }
  }

  & [data-speaker=user] {
    padding: 8px;
    background: var(--color-selected);
    align-self: flex-end;
    max-width: 75%;

    & small {
      width: 100%;
      display: inline-block;
      text-align: end;
    }
  }

  & [data-speaker=assistant] {
    align-self: flex-start;
  }
}

#call-details {
  overflow-y: auto;
  flex-grow: 1;
  position: relative;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  & table {
    border-collapse: collapse;
    font-size: .9em;
    margin-inline: -8px;

    & th,
    & td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--color-10);
      color: var(--color-2);
      word-break: break-all;
      text-align: left;

      & p {
        margin: 0;
        --lines: 10;
      }
    }

    & th {
      color: var(--color-4);
      width: 35%;
    }
  }
}

[role=tablist] {
  border-top: 1px solid var(--color-8);
  box-shadow: var(--shadow-sm), inset 0 -1px 0 var(--color-8);
}

[role=tab] {
  background: none;
  border: none;
  border-radius: 0;
  font-weight: 600;
  padding: 6px 8px 6px 8px;

  &[aria-selected=true] {
    border-bottom: 2px solid var(--color-b);
    padding-bottom: 4px;
  }
}
</style>
