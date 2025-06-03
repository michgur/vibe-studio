<template>
  <div class="card" style="min-width: 300px;">
    <CallLogHeader v-if="contact" :agent="agent" :contact="contact" />
    <CallDetails v-if="call && contact" :agent="agent" :contact="contact" :call="call" v-model:message="message"
      :debug="true" defaultTab="transcript" />
  </div>
  <ResizablePane :minWidth="0.2">
    <div class="card">
      <JsonView :content="message?.debugJSON || '{}'" />
    </div>
  </ResizablePane>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type CallMessage, type CallMetadata, type Contact } from '@shared/types'
import CallLogHeader from '@/components/calls/CallLogHeader.vue'
import CallDetails from '@/components/calls/CallDetails.vue'
import ResizablePane from '@/components/ui/ResizablePane.vue'
import JsonView from '@/components/ui/JsonView.vue'

const { agent } = defineProps<{ agent: string }>()
const contact = ref<Contact | undefined>(undefined)
const call = ref<CallMetadata | undefined>(undefined)
const message = ref<CallMessage | undefined>(undefined)

const router = useRouter();
const route = useRoute();

watch(contact, () => router.push({ query: { contact: contact.value?.id } }))
watch(call, () => router.replace({ query: { contact: contact.value?.id, call: call.value?.id } }))

watch(() => [route.query.contact, route.query.call], async ([contactId, callId]) => {
  if (!(contactId || callId)) return

  if (!contactId || contact.value?.id !== contactId) {
    const url = (!!contactId)
      ? `/api/${agent}/contacts/${contactId}`
      : `/api/${agent}/calls/${callId}/contact`
    try {
      const resp = await fetch(url)
      contact.value = await resp.json() as Contact
    } catch (err) {
      console.error(err)
      router.replace({ query: {} })
      return
    }
  }
  if (callId) {
    call.value = contact.value.calls.find(c => c.id === callId)
  }
}, { immediate: true })
</script>
