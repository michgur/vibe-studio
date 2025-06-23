<script setup lang="ts">
import { ref, watch } from "vue"
import type { Contact, DateRange } from "@shared/types"
import Pagination from "@/components/ui/Pagination.vue"
import StatusFilter, { type ContactStatus } from "./StatusFilter.vue"
import useRecAudio from "@/composables/recAudio"
import Table from "@/components/ui/Table.vue"
import ContactRow from "./ContactRow.vue"
import { useDebounce } from "@vueuse/core"

const props = defineProps<{ agent: string; dateRange: DateRange }>()
const recAudio = useRecAudio()

const statusFilter = ref<ContactStatus[]>([])
const nameFilter = ref("")
const contacts = ref<Contact[]>([])
const totalContacts = ref<number | undefined>()
const totalPages = ref<number | undefined>()
const currentPage = ref(1)
const isLoading = ref(true)
const errorShown = ref<string | undefined>()

const selectedContact = defineModel<Contact | undefined>("contact")

function playSelectedRecording() {
  if (selectedContact.value) {
    const recId = lastRecId(selectedContact.value)
    recAudio.playOrPause(recId)
  }
}

async function fetchContacts() {
  selectedContact.value = undefined
  contacts.value = []
  isLoading.value = true

  const q = new URLSearchParams()
  q.set("from", props.dateRange[0])
  q.set("to", props.dateRange[1])
  q.set("page", currentPage.value.toString())
  if (nameFilter.value) q.set("query", nameFilter.value)
  statusFilter.value.forEach(s => q.append("status", s))

  try {
    const res = await fetch(`/api/${props.agent}/contacts?${q}`)
      .then(r => r.json())
    contacts.value = res.contacts || []
    totalContacts.value = res.totalContacts
    totalPages.value = res.totalPages
  } catch {
    contacts.value = []
    totalContacts.value = totalPages.value = undefined
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.agent, props.dateRange, currentPage.value, statusFilter.value],
  fetchContacts,
)

watch(useDebounce(nameFilter, 500), fetchContacts)

const lastRecId = (c: Contact) => c.calls.find(a => a.recordingId)?.recordingId
</script>

<template>
  <section id="contact-list" class="card" tabindex="0" @keydown.enter="playSelectedRecording">
    <div class="card-header">
      <StatusFilter v-model="statusFilter" />
      <input type="search" v-model="nameFilter" placeholder="Search name or phone">
      <div style="flex:1"></div>
      <div v-if="selectedContact" class="sidepanel-icon" @click="selectedContact = undefined"
        v-tooltip="'Hide Call Log'" />
    </div>

    <p v-if="errorShown" style="flex-grow: 1">Error fetching contacts: {{ errorShown }}</p>
    <div v-else-if="isLoading" class="skeleton" style="flex-grow: 1" />
    <p v-else-if="!contacts.length" style="flex-grow: 1; padding-inline: 8px">
      No contacts found.
    </p>
    <Table v-else :items="contacts" v-model="selectedContact" :sticky-header="true" :sticky-first-column="true"
      style="flex: 1">
      <template #header>
        <th>Name</th>
        <th>Phone</th>
        <th>Created</th>
        <th>Status</th>
        <th>Calls</th>
        <th>Next Call</th>
        <th>Last Call</th>
        <th v-tooltip="'Quick Listen'">🎧</th>
      </template>

      <template #row="{ item }">
        <ContactRow :contact="item" />
      </template>
    </Table>

    <div class="card-footer" v-if="totalPages">
      <Pagination v-model="currentPage" :items="totalContacts" :pages="totalPages" :loading="isLoading" />
      <small v-if="totalContacts">
        Showing {{ contacts.length }} / {{ totalContacts }} Contacts
      </small>
    </div>
  </section>
</template>

<style>
#contact-list {
  display: flex;
  flex-direction: column;
  position: relative;

  &>.card-header {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  &> :last-child {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.sidepanel-icon {
  width: 18px;
  height: 18px;
  padding: 1px;
  background: var(--color-8);
  border-radius: 2px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);

  &::before {
    content: '';
    display: block;
    height: 100%;
    width: 70%;
    background: white;
  }

  &:hover {
    background: var(--color-6);

    &::before {
      background: var(--color-10);
    }
  }

  &:active {
    background: var(--color-4);
    box-shadow: none;

    &::before {
      background: var(--color-8);
    }
  }
}
</style>
