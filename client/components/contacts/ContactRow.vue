<template>
  <th class="ellipsize">
    <strong v-tooltip="fmtName(contact.firstName, contact.lastName)">
      {{ fmtName(contact.firstName, contact.lastName) }}
    </strong>
  </th>
  <td>{{ contact.status }}</td>
  <td>{{ contact.retryCount }} / {{ contact.retryLimit }}</td>
  <td>{{ contact.phone }}</td>
  <td>
    <FormattedDateTime :date-time="contact.scheduledAt" />
  </td>
  <td>
    <CallDirectionIcon v-if="contact.calls.length" :direction="contact.calls.at(0)?.direction!" />
    <FormattedDateTime :date-time="contact.calls?.at(0)?.dialedAt" />
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

defineProps<{ contact: Contact }>()

const lastRecId = (c: Contact) => c.calls.find(a => a.recordingId)?.recordingId
</script>
