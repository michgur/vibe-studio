<template>
  <ContactList v-if="agent" :agent="agent" :dateRange="dateRange" style="min-width: 300px" v-model:contact="contact" />
  <ResizablePane :minWidth="0.2" :open="contact !== undefined">
    <div class="card" id="call-log" v-if="contact">
      <CallLogHeader :text="`Call Log: ${fmtName(contact.firstName, contact.lastName)}`" :id="contact.id" />
      <CallList :agent="agent" :contact="contact" v-model="call" />
      <CallLogHeader v-if="call" :text="`Call #${call.attempt} (${call.direction})`" :id="call.id"
        style="box-shadow:none;border:none" />
      <CallDetails v-if="call" :agent="agent" :contact="contact" :call="call" />
    </div>
  </ResizablePane>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CallMetadata, Contact, DateRange } from '@shared/types'
import CallDetails from '@/components/calls/CallDetails.vue'
import CallList from '@/components/calls/CallList.vue'
import ContactList from '@/components/contacts/ContactList.vue'
import ResizablePane from '@/components/ui/ResizablePane.vue'
import CallLogHeader from '@/components/calls/CallLogHeader.vue'
import { useDebounce } from '@vueuse/core'
import { fmtName } from '@/fmt'

const { agent, dateRange } = defineProps<{ agent: string, dateRange: DateRange }>()
const contact = ref<Contact | undefined>(undefined)
const call = ref<CallMetadata | undefined>(undefined)

const router = useRouter();
const route = useRoute();

watch(useDebounce(call, 200), () => {
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
