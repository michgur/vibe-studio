<script setup lang="ts">
import type { Contact } from "../../shared/types"
import { ref, watch } from "vue"
import QuickPlay from "./QuickPlay.vue"
import CallLog from "./CallLog.vue"
import Pagination from "./Pagination.vue"
import ContactStatusFilter from "./ContactStatusFilter.vue"

const props = defineProps<{ agent: string }>()

const statusFilter = ref<string[]>([])
const contacts = ref<Contact[]>([])
const totalContacts = ref<number | undefined>(undefined)
const totalPages = ref<number | undefined>(undefined)
const currentPage = ref(1)
const isLoading = ref(true)
const errorShown = ref<string | undefined>(undefined)
const selectedContact = ref<Contact | undefined>(undefined)

const formatDate = (d?: string) => {
  if (!d) return 'N/A'
  try {
    const date = new Date(d)
    return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return d
  }
}
const lastRecId = (c: Contact) => (c.calls.find((a) => a.twilio_sid)?.twilio_sid)

async function fetchContacts() {
  const query = new URLSearchParams()
  query.set('page', currentPage.value.toString())
  for (const status of statusFilter.value) {
    query.append('status', status)
  }

  try {
    isLoading.value = true
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

watch(() => [props.agent, currentPage.value, statusFilter.value], fetchContacts, { immediate: true })

const onPrev = () => (currentPage.value = Math.max(1, currentPage.value - 1))
const onNext = () => (currentPage.value = Math.min(totalPages.value || 0, currentPage.value + 1))
const onContactRowClick = (contact: Contact) => {
  selectedContact.value = contact
}
const onFilterChange = (f: string[]) => {
  statusFilter.value = f
}
</script>

<template>
  <section id="contact-list">
    <h2>Contact List for Agent: {{ agent }}</h2>

    <ContactStatusFilter @change="onFilterChange" />

    <p>Total Contacts: {{ totalContacts || 'N/A' }}</p>

    <Pagination v-if="totalPages" :page="currentPage" :pages="totalPages" :loading="isLoading" @prev="onPrev"
      @next="onNext" />

    <p v-if="isLoading && !contacts.length">
      Loading contacts for agent {{ agent }}...
    </p>
    <p v-else-if="errorShown">Error fetching contacts: {{ errorShown }}</p>
    <p v-else-if="!contacts.length && totalContacts">
      No contacts found for this page.
    </p>
    <p v-else-if="!contacts.length && !totalContacts">
      No contacts found for agent {{ agent }}.
    </p>

    <figure v-if="contacts.length">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Phone</th>
            <th>Last Call</th>
            <th>Scheduled</th>
            <th>Retries</th>
            <th>Quick Play</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in contacts" :key="c.id" data-is-contact-row="true" @click="onContactRowClick(c)"
            :class="{ selected: selectedContact === c }">
            <td :title="(c.first_name + ' ' + c.last_name) || 'Unnamed Contact'">
              <strong>{{ (c.first_name + ' ' + c.last_name) || 'Unnamed Contact' }}</strong>
            </td>
            <td>{{ c.status }}</td>
            <td>{{ c.phone }}</td>
            <td>{{ c.calls ? formatDate(c.calls.at(-1)?.time) : '' }}</td>
            <td>{{ formatDate(c.scheduled_time) }}</td>
            <td>{{ c.retry_count }} / {{ c.retry_limit }}</td>
            <td>
              <QuickPlay v-if="lastRecId(c)" :recId="lastRecId(c)!" />
              <span v-else>N/A</span>
            </td>
          </tr>
        </tbody>
      </table>
    </figure>

    <CallLog v-if="selectedContact" :contact="selectedContact" :agent="props.agent"
      @closePane="selectedContact = undefined" />

    <Pagination v-if="totalPages" :page="currentPage" :pages="totalPages" :loading="isLoading" @prev="onPrev"
      @next="onNext" />
  </section>
</template>

<style>
#contact-list {
  position: relative;

  & figure {
    overflow-x: auto;
    margin: 0;
  }

  & table {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
    margin-top: 10px;
  }

  & thead th {
    border-bottom: 2px solid #ddd;
    padding: 12px 8px;
    background: #f7f7f7;
    white-space: nowrap;
    text-align: center;
  }

  & thead th:first-child {
    text-align: start;
    min-width: 180px;
  }

  & tbody td {
    border-bottom: 1px solid #eee;
    padding: 10px 8px;
    font-size: 0.9em;
    white-space: nowrap;
    cursor: pointer;
    text-align: center;
  }

  & tbody td:last-child {
    cursor: default;
  }

  & tbody tr.selected {
    background: #f0f8ff;
  }

  & tbody td:first-child {
    text-align: start;
  }

  & tbody td:first-child strong {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & tbody td:last-child span {
    font-size: 0.9em;
    color: #aaa;
  }
}
</style>
