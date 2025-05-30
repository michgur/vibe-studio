<template>
  <CallLogHeader v-if="contact" :agent="agent" :contact="contact" />
  <ResizablePane :minWidth="0.2">
    <div class="card">
      <JsonView :data="{ a: 'b' }" />
    </div>
  </ResizablePane>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CallMetadata, Contact } from '../../shared/types'
import CallLogHeader from './CallLogHeader.vue'
import ResizablePane from './ResizablePane.vue'
import JsonView from './JsonView.vue'

const { agent } = defineProps<{ agent: string }>()
const contact = ref<Contact | undefined>(undefined)
const call = ref<CallMetadata | undefined>(undefined)

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
    console.log(contact.value)
    call.value = contact.value.calls.find(c => c.id === callId)
  }
}, { immediate: true })
</script>
