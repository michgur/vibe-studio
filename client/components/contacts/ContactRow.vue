<template>
  <th :title="fmtName(contact.firstName, contact.lastName)" class="ellipsize">
    {{ fmtName(contact.firstName, contact.lastName) }}
  </th>
  <td>{{ contact.status }}</td>
  <td>{{ contact.retryCount }} / {{ contact.retryLimit }}</td>
  <td>{{ contact.phone }}</td>
  <td><small>{{ fmtDate(contact.scheduledAt) }}</small></td>
  <td>
    <CallDirectionIcon v-if="contact.calls.length" :direction="contact.calls.at(0)?.direction!" />
    <small>{{ fmtDate(contact.calls?.at(0)?.dialedAt) }}</small>
  </td>
  <td>
    <PlayButton v-if="lastRecId(contact)" :recId="lastRecId(contact)!" />
  </td>
</template>

<script setup lang="ts">
import { type Contact } from "@shared/types"
import { fmtDate, fmtName } from '@/fmt'
import CallDirectionIcon from "@/components/calls/CallDirectionIcon.vue"
import PlayButton from "@/components/recordings/PlayButton.vue"

defineProps<{ contact: Contact }>()

const lastRecId = (c: Contact) => c.calls.find(a => a.recordingId)?.recordingId
</script>
