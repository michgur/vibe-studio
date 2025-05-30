<template>
  <ContactList v-if="agent" :agent="agent" style="min-width: 300px" v-model:contact="contact" />
  <ResizablePane :minWidth="0.2" :open="contact !== undefined">
    <div class="card" id="call-log" v-if="contact">
      <CallLogHeader :contact="contact" />
      <CallList :agent="agent" :contact="contact" v-model="call" />
      <CallDetails v-if="call" :agent="agent" :contact="contact" :call="call" />
    </div>
  </ResizablePane>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CallMetadata, Contact } from '../../shared/types'
import CallDetails from './CallDetails.vue'
import CallList from './CallList.vue'
import ContactList from './ContactList.vue'
import ResizablePane from './ResizablePane.vue'
import CallLogHeader from './CallLogHeader.vue'

const { agent } = defineProps<{ agent: string }>()
const contact = ref<Contact | undefined>(undefined)
const call = ref<CallMetadata | undefined>(undefined)

const router = useRouter();
const route = useRoute();

watch(call, () => {
  const query = { ...(contact.value && { contact: contact.value?.id }), ...(call.value && { call: call.value.id }) }
  if (route.query.contact === contact.value?.id) router.replace({ query })
  else router.push({ query })
})

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

<style>
#call-log {
  display: flex;
  flex-direction: column;

  &>.card-header {
    background: white;
    font-weight: 600;
    color: var(--color-2);
    box-shadow: var(--shadow-sm);
    z-index: 1;

    & small {
      line-break: anywhere;
    }
  }

}
</style>
