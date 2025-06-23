<template>
  <th class="ellipsize">
    <strong v-tooltip="fmtName(contact.firstName, contact.lastName)">
      {{ fmtName(contact.firstName, contact.lastName) }}
    </strong>
  </th>
  <td class="monospace">{{ contact.phone }}</td>
  <td>
    <small>
      <FormattedDateTime :date-time="contact.queuedAt" :timezone="contact.timezone" />
    </small>
  </td>
  <td>
    <StatusChip :status="contact.status" />
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
import FormattedDateTime from "../ui/FormattedDateTime.vue";
import StatusChip from "./StatusChip.vue";
import CallCounter from "./CallCounter.vue";

defineProps<{ contact: Contact }>()

const lastRecId = (c: Contact) => c.calls.find(a => a.recordingId)?.recordingId
</script>
