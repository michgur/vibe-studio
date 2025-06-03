<script setup lang="ts">
import { ref, watch } from "vue"
import type { Contact, DateRange } from "@shared/types"
import PlayButton from "@/components/recordings/PlayButton.vue"
import Pagination from "@/components/ui/Pagination.vue"
import ContactStatusFilter, { type ContactStatus } from "./ContactStatusFilter.vue"
import CallDirectionIcon from "@/components/calls/CallDirectionIcon.vue"
import { fmtDate, fmtName } from "@/fmt"
import globalAudio from "@/state/globalAudio"

const props = defineProps<{ agent: string, dateRange: DateRange }>()

const statusFilter = ref<ContactStatus[]>([])
const contacts = ref<Contact[]>([])
const totalContacts = ref<number | undefined>(undefined)
const totalPages = ref<number | undefined>(undefined)
const currentPage = ref(1)
const isLoading = ref(true)
const isHorizontallyScrolled = ref(false)
const errorShown = ref<string | undefined>(undefined)
const selectedContact = defineModel<Contact | undefined>("contact")

function selectNextContact(offset: number) {
  if (selectedContact.value) {
    const idx = contacts.value.findIndex(c => c.id === selectedContact.value?.id)
    if ((offset < 0 && idx >= -offset) || (offset >= 0 && idx < contacts.value.length - offset)) {
      selectedContact.value = contacts.value[idx + offset]
    }
  }
}

function playSelectedRecording() {
  if (selectedContact.value) {
    const recId = lastRecId(selectedContact.value)
    if (globalAudio.currentRecId !== recId) {
      globalAudio.currentRecId = recId
      globalAudio.isPlaying = true
    } else {
      globalAudio.isPlaying = !globalAudio.isPlaying
    }
  }
}

async function fetchContacts() {
  selectedContact.value = undefined;
  contacts.value = []
  isLoading.value = true
  isHorizontallyScrolled.value = false

  const query = new URLSearchParams()
  if (props.dateRange) {
    query.set('from', props.dateRange[0])
    query.set('to', props.dateRange[1])
  }
  query.set('page', currentPage.value.toString())
  for (const status of statusFilter.value) {
    query.append('status', status)
  }

  try {
    const res = await fetch(`/api/${props.agent}/contacts?` + query.toString(), {
      method: 'GET'
    }).then(r => r.json())

    contacts.value = res.contacts || []
    totalContacts.value = res.totalContacts
    totalPages.value = res.totalPages
  } catch (e) {
    contacts.value = []
    totalContacts.value = undefined
    totalPages.value = undefined
  } finally {
    isLoading.value = false
  }
}

watch(() => [props.agent, props.dateRange, currentPage.value, statusFilter.value], fetchContacts)

const onPrev = () => (currentPage.value = Math.max(1, currentPage.value - 1))
const onNext = () => (currentPage.value = Math.min(totalPages.value || 0, currentPage.value + 1))
const lastRecId = (c: Contact) => (c.calls.find((a) => a.recordingId)?.recordingId)
</script>

<template>
  <section id="contact-list" class="card" tabindex="0" @keydown.up="selectNextContact(-1)"
    @keydown.down="selectNextContact(1)" @keydown.space="playSelectedRecording">
    <div>
      <ContactStatusFilter v-model="statusFilter" />
      <div v-if="selectedContact" class="sidepanel-icon" @click="selectedContact = undefined"
        v-tooltip="'Hide Call Log'">
      </div>
    </div>

    <p v-if="errorShown">Error fetching contacts: {{ errorShown }}</p>
    <div v-else-if="isLoading" class="skeleton" style="flex-grow:1"></div>
    <p v-else-if="!contacts.length" style="flex-grow:1;padding-inline:8px">
      No contacts found.
    </p>
    <figure v-else :class="{ scrolled: isHorizontallyScrolled }"
      @scroll="(e) => isHorizontallyScrolled = ((e.target as HTMLElement).scrollLeft !== 0)">
      <table id="contact-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Calls</th>
            <th>Phone</th>
            <th>Next Call</th>
            <th>Last Call</th>
            <th v-tooltip="'Quick Listen'">🎧</th>
          </tr>
        </thead>
        <tbody :class="isLoading && 'skeleton'">
          <tr v-for="c in contacts" :key="c.id" @click="selectedContact = c"
            :class="{ selected: selectedContact?.id === c.id }">
            <th :title="fmtName(c.firstName, c.lastName)" class="ellipsize">
              {{ fmtName(c.firstName, c.lastName) }}
            </th>
            <td>{{ c.status }}</td>
            <td>{{ c.retryCount }} / {{ c.retryLimit }}</td>
            <td>{{ c.phone }}</td>
            <td><small>{{ fmtDate(c.scheduledAt) }}</small></td>
            <td>
              <CallDirectionIcon v-if="c.calls.length" :direction="c.calls.at(0)?.direction!" />
              <small>{{ fmtDate(c.calls?.at(0)?.dialedAt) }}</small>
            </td>
            <td>
              <PlayButton v-if="lastRecId(c)" :recId="lastRecId(c)!" />
            </td>
          </tr>
        </tbody>
      </table>
    </figure>
    <div class="card-footer" v-if="totalPages">
      <Pagination :page="currentPage" :items="totalContacts" :pages="totalPages" :loading="isLoading" @prev="onPrev"
        @next="onNext" />
      <small v-if="totalContacts">Showing {{ contacts.length }} / {{ totalContacts }} Contacts</small>
    </div>
  </section>
</template>

<style>
#contact-list {
  display: flex;
  flex-direction: column;
  position: relative;

  & figure {
    overflow-x: auto;
    margin: 0;
    flex-grow: 1;

    &.scrolled th:first-child::after {
      content: "";
      position: absolute;
      inset: 0;
      left: auto;
      width: 1px;
      background: var(--color-10);
    }
  }

  & table#contact-table {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
    overflow: auto;

    & thead {
      position: sticky;
      z-index: 1;
      top: 0;
      box-shadow: var(--shadow-sm), 0 1px 0 var(--color-10);
      color: var(--color-4);

      & tr {
        background: white;
      }

      & th {
        padding: 12px 8px;
        white-space: nowrap;
        text-align: center;
      }
    }

    & td:first-child,
    & th:first-child {
      text-align: start;
      position: sticky;
      left: 0;
      background: inherit;
    }

    & tbody {

      & td,
      & th {
        border-bottom: 1px solid var(--color-10);
        padding: 10px 8px;
        font-size: 0.9em;
        white-space: nowrap;
        cursor: pointer;
        text-align: center;

        &:has(button) {
          cursor: default;
        }
      }

      & tr {
        background: white;

        &:hover {
          background: var(--color-hover);
        }

        &.selected {
          background: var(--color-selected);
        }
      }
    }
  }

  &>:last-child {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }
}

.sidepanel-icon {
  width: 18px;
  padding: 1px;
  aspect-ratio: 1;
  background: var(--color-8);
  border-radius: 2px;
  cursor: pointer;
  vertical-align: text-top;
  position: absolute;
  right: 8px;
  top: 8px;

  &:hover {
    background: var(--color-6);
  }

  &::before {
    content: "";
    display: block;
    height: 100%;
    width: 70%;
    background: white;
  }

  &:hover::before {
    background: var(--color-10);
  }
}
</style>
