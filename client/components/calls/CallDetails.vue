<template>
  <div role="tablist">
    <button role="tab" :aria-selected="tab === 'details'" @click="tab = 'details'">Metadata</button>
    <button role="tab" :aria-selected="tab === 'transcript'" @click="tab = 'transcript'"
      :disabled="!call.duration">Transcript</button>
  </div>

  <div id="call-details" ref="callDetails" :class="{ skeleton: isLoading && tab === 'transcript' }">
    <template v-if="tab === 'details'">
      <table v-if="call.metadata" class="monospace">
        <tbody>
          <tr v-for="[k, v] in Object.entries(call.metadata)" :key="k">
            <th><span v-tooltip="k" class="line-clamp">{{ k }}</span></th>
            <td>
              <CopyableSpan :text="v" class="line-clamp" />
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else>
      <p v-if="errorShown" style="color:red">Error: {{ errorShown }}</p>
      <p v-else-if="!transcript?.length">No transcript.</p>
      <div v-else id="message-box">
        <template v-for="(m, idx) in transcript" :key="idx">
          <div v-if="m.debugJSON" :aria-selected="selectedMessage === m" :data-speaker="m.speaker" data-debug
            @click="selectedMessage = m" v-tooltip="'Click to View Debug Info'">
            <div>{{ m.content || '[empty]' }}</div>
            <small><strong>{{ m.speaker }}</strong> | {{ fmtTimestamp(m.timestamp) }}</small>
          </div>
          <div v-else :data-speaker="m.speaker">
            <div>{{ m.content || '[empty]' }}</div>
            <small><strong>{{ m.speaker }}</strong> | {{ fmtTimestamp(m.timestamp) }}</small>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import type { Contact, CallMetadata, CallMessage } from '@shared/types'
import { fmtTimestamp } from '@/fmt';
import CopyableSpan from '../ui/CopyableSpan.vue';

export type CallDetailsTab = 'details' | 'transcript'

const props = defineProps<{
  contact: Contact,
  agent: string,
  call: CallMetadata,
  debug?: boolean,
  defaultTab?: CallDetailsTab
}>()
const selectedMessage = defineModel<CallMessage | undefined>('message')

const transcript = ref<CallMessage[] | null>(null)
const isLoading = ref(false)
const errorShown = ref<string | null>(null)
const tab = ref<CallDetailsTab>(props.defaultTab || 'details')
const callDetails = useTemplateRef("callDetails")

async function fetchTranscript(): Promise<CallMessage[]> {
  try {
    let url = `/api/${props.agent}/calls/${props.call.id}/transcript`
    if (props.debug) url += '?debug'
    const res = await fetch(url, {
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
  selectedMessage.value = undefined
  tab.value = props.defaultTab || 'details'

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
    background: var(--color-active);
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

    &[data-debug] {
      margin: -8px;
      padding: 8px;
      cursor: pointer;
      position: relative;

      &:hover,
      &[aria-selected="true"] {
        background: var(--color-hover);
        outline: 2px solid var(--color-10);

        &::after {
          content: "{}";
          position: absolute;
          right: 8px;
          bottom: 8px;
          font-weight: 600;
          color: var(--color-6);
        }
      }

      &[aria-selected="true"] {
        background: var(--color-active);

        &::after {
          color: var(--color-b) !important;
          content: "{ }" !important;
        }
      }
    }
  }
}

#call-details {
  overflow-y: auto;
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  & h4 {
    padding-inline-start: 8px;
  }

  & table {
    border-collapse: collapse;
    font-size: .9em;

    & th,
    & td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--color-10);
      color: var(--color-2);
      word-break: break-all;
      text-align: left;

      & * {
        margin: 0;
      }
    }

    & th {
      color: var(--color-4);
      width: 35%;
    }
  }
}

[role=tablist] {
  display: flex;
  box-shadow: var(--shadow-sm), inset 0 -1px 0 var(--color-8);
}

[role=tab] {
  border: none;
  background: none;
  font-weight: 600;
  padding: 6px 8px 6px 8px;

  &:not([disabled]) {
    &:hover {
      background: var(--color-hover);
      border-bottom: 2px solid var(--color-8);
      padding-bottom: 4px;
    }

    &:active {
      background: var(--color-active);
      border-bottom: 2px solid var(--color-6);
      padding-bottom: 4px;
    }

    &[aria-selected=true] {
      border-bottom: 2px solid var(--color-b);
      padding-bottom: 4px;
    }
  }
}
</style>
