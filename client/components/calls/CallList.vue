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
      <span class="ellipsize call-result" style="grid-row:span 2">{{ call.result }}</span>
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

.call-result {
  background: var(--color-10);
  font-weight: 600;
  color: var(--color-6);
  padding: 1px 10px;
  border-radius: 10px;
  font-size: .8em;
  justify-self: end;
  text-align: center;
}
</style>
