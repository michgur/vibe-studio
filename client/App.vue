<template>
  <div class="App">
    <header>
      <img src="/assets/vibe.svg" alt="OneAI Vibe Studio">
      <button>👥</button>
      <button>📊</button>
      <button>👥</button>
      <div>
        <label for="agent-select">Agent: </label>
        <select id="agent-select" v-model="agent">
          <option v-for="id in AGENT_IDS" :key="id" :value="id">
            {{ id }}
          </option>
        </select>
      </div>
    </header>

    <main>
      <ContactList v-if="agent" :agent="agent" style="min-width: 300px" v-model:contact="contact" />
      <ResizablePane :minWidth="0.2" :open="contact !== undefined">
        <CallLog v-if="contact" v-model="call" :contact="contact" :agent="agent" />
      </ResizablePane>
    </main>

    <SharedAudioPlayer :agent="agent" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CallMetadata, Contact } from '../shared/types'
import ContactList from './components/ContactList.vue'
import CallLog from './components/CallLog.vue'
import SharedAudioPlayer from './components/SharedAudioPlayer.vue'
import ResizablePane from './components/ResizablePane.vue'

const AGENT_IDS = ['better-move-backlog', 'msc-merchant'] as const

const agent = ref<string>(AGENT_IDS[0])
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
      ? `/api/${agent.value}/contacts/${contactId}`
      : `/api/${agent.value}/calls/${callId}/contact`
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
})
</script>

<style>
.App {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;

  &>header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;

    &>img {
      height: 36px;
    }
  }

  &>main {
    display: flex;
    align-items: stretch;
    flex-grow: 1;
    min-height: 0;
  }
}
</style>
