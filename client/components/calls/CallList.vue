<template>
  <ul v-if="contact.calls.length" id="call-list">
    <li v-for="(call, i) in contact.calls" :key="call.id ? call.id + '-' + call.attempt : i"
      :aria-selected="call === selectedCall" @click="selectedCall = call">
      <CallDirectionIcon :direction="call.direction" />
      <small>#{{ call.attempt }}</small>
      <span class="ellipsize" :style="{ gridRow: call.duration ? '' : 'span 2' }">
        <FormattedDateTime :dateTime="call.dialedAt" :timezone="contact.timezone" />
      </span>
      <small v-if="call.duration">{{ fmtDuration(call.duration) }}</small>
      <StatusChip class="ellipsize" style="grid-row:span 2;margin-inline-end:0" :status="call.result"
        :rgb-map="CALL_RESULT_RGB" />
      <PlayButton v-if="call.recordingId" :recId="call.recordingId" style="grid-row:span 2" />
    </li>
  </ul>
  <div v-else style="padding:16px; text-align:center; color:var(--color-6)">No call attempts logged.</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import PlayButton from '@/components/recordings/PlayButton.vue'
import type { Contact, CallMetadata } from '@shared/types'
import CallDirectionIcon from './CallDirectionIcon.vue'
import FormattedDateTime from '@/components/ui/FormattedDateTime.vue'
import { fmtDuration } from '@/fmt'
import StatusChip, { type StatusRGB } from '@/components/ui/StatusChip.vue'

const props = defineProps<{
  contact: Contact
  agent: string
}>()

const selectedCall = defineModel<CallMetadata | undefined>(undefined)

watch(() => props.contact, () => {
  if (props.contact.calls.find(c => c.id === selectedCall.value?.id)) { }
  else selectedCall.value = props.contact.calls.find(c => c.recordingId) || props.contact.calls.at(0)
}, { immediate: true });

const CALL_RESULT_RGB = {
  New: [99, 102, 241],
  'Contact Verified': [20, 184, 166],
  Disqualified: [239, 68, 68],
  Qualified: [59, 130, 246],
  Converted: [34, 197, 94],
  'Do Not Call': [100, 116, 139],
  'Neutral Value Call': [234, 179, 8],
  Unknown: [113, 113, 122],
  Busy: [202, 138, 4],
  'No Answer': [148, 163, 184],
  'Invalid Number': [185, 28, 28],
  'Carrier Blocked': [153, 27, 27],
  'Wrong Language': [124, 45, 18],
  'Wrong Number': [190, 24, 93],
  Voicemail: [30, 64, 175],
  Ivr: [5, 150, 105],
  'Not Interested': [220, 38, 38],
  'Callback Requested': [37, 99, 235],
  'Human Busy': [202, 138, 4],
} as StatusRGB
</script>

<style>
ul#call-list {
  overflow-y: auto;
  max-height: 220px;
  flex-shrink: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  border-bottom: 1px solid var(--color-8);

  & li {
    height: 45px;
    padding: 8px;
    border-bottom: 1px solid var(--color-10);
    color: var(--color-2);
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 16px auto 1fr 24px;
    grid-template-rows: 1fr 1fr;
    column-gap: 8px;
    row-gap: 0;
    align-items: center;
    font-size: 0.8rem;
    line-height: 1.1em;
    cursor: pointer;

    &:hover {
      background: var(--color-hover);
    }

    &[aria-selected=true] {
      background: var(--color-active);
    }

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
