<template>
  <th class="ellipsize">
    <strong v-tooltip="fmtName(contact.firstName, contact.lastName)">
      {{ fmtName(contact.firstName, contact.lastName) }}
    </strong>
  </th>
  <td><span class="monospace">{{ contact.phone }}</span></td>
  <td>
    <small>
      <FormattedDateTime :date-time="contact.queuedAt" :timezone="contact.timezone" />
    </small>
  </td>
  <td>
    <StatusChip :rgbMap="STATUS_RGB" :status="contact.status" />
  </td>
  <td>
    <CallCounter :limit="contact.retryLimit" :count="contact.retryCount" />
  </td>
  <td>
    <small>
      <FormattedDateTime :date-time="contact.scheduledAt" :timezone="contact.timezone" />
    </small>
  </td>
  <td>
    <div style="display:flex;gap:4px;justify-content:center">
      <CallDirectionIcon v-if="contact.calls.length" :direction="contact.calls.at(0)?.direction!" />
      <small>
        <FormattedDateTime :date-time="contact.calls?.at(0)?.dialedAt" :timezone="contact.timezone" />
      </small>
    </div>
  </td>
  <td>
    <PlayButton v-if="lastRecId(contact)" :recId="lastRecId(contact)!" />
  </td>
</template>

<script setup lang="ts">
import { type Contact } from "@shared/types"
import { fmtName } from '@/fmt'
import CallDirectionIcon from "@/components/calls/CallDirectionIcon.vue"
import PlayButton from "@/components/recordings/PlayButton.vue"
import FormattedDateTime from "@/components/ui/FormattedDateTime.vue";
import StatusChip, { type StatusRGB } from "@/components/ui/StatusChip.vue";
import CallCounter from "./CallCounter.vue";

defineProps<{ contact: Contact }>()

const lastRecId = (c: Contact) => c.calls.find(a => a.recordingId)?.recordingId

const STATUS_RGB = {
  New: [99, 102, 241],
  Paused: [165, 180, 252],
  Unanswered: [245, 158, 11],
  Unreachable: [249, 115, 22],
  Connecting: [56, 189, 248],
  Answered: [186, 155, 89],
  'Contact Verified': [20, 184, 166],
  Disqualified: [239, 68, 68],
  Qualified: [59, 130, 246],
  Converted: [34, 197, 94],
  'Dont Call': [100, 116, 139],
  'Dnc Blocked': [127, 29, 29],
} as StatusRGB
</script>
