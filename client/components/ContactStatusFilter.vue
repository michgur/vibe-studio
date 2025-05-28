<template>
  <div id="contact-status" class="card-header">
    <label for="state-filter" style="margin-inline-end: 10px">Filter by status:</label>
    <select id="state-filter" v-model="selectedFilterLabel">
      <option v-for="opt in FILTER_OPTIONS" :key="opt.label" :value="opt.label">
        {{ opt.label }}
      </option>
    </select>
  </div>

  <div v-if="selectedFilter.status === 'custom'" id="custom-status" class="card-header">
    <label v-for="st in ALL_CONTACT_STATES" :key="st">
      <input type="checkbox" :value="st" v-model="customSelectedStatus" />
      {{ prettify(st) }}
    </label>
  </div>
</template>

<style>
#custom-status {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 8px 10px;
  margin-bottom: 0;

  & label {
    display: flex;
    align-items: center;
    font-size: 0.9em;
    cursor: pointer;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from "vue"

const model = defineModel<ContactStatus[]>()

const ALL_CONTACT_STATES = [
  'new',
  'paused',
  'unanswered',
  'unreachable',
  'connecting',
  'answered',
  'contact_verified',
  'disqualified',
  'qualified',
  'converted',
  'dont_call',
  'dnc_blocked'
] as const
export type ContactStatus = typeof ALL_CONTACT_STATES[number]

interface FilterOption {
  label: string
  status: ContactStatus[] | 'all' | 'custom'
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    label: 'Answered',
    status: ['unreachable', 'answered', 'contact_verified', 'disqualified', 'qualified', 'converted', 'dont_call',]
  },
  { label: 'Identified', status: ['contact_verified', 'disqualified', 'qualified', 'converted', 'dont_call'] },
  { label: 'Qualified', status: ['qualified', 'converted'] },
  { label: 'Converted', status: ['converted'] },
  { label: 'All', status: 'all' },
  { label: 'Custom', status: 'custom' }
]

const selectedFilter = ref<FilterOption>(FILTER_OPTIONS[0])
const selectedFilterLabel = computed({
  get: () => selectedFilter.value.label,
  set: (lbl) => {
    const opt = FILTER_OPTIONS.find((o) => o.label === lbl)
    if (opt) selectedFilter.value = opt
  }
})
const customSelectedStatus = ref<ContactStatus[]>([])

const prettify = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

const filter = computed(() =>
  selectedFilter.value.status === 'custom'
    ? customSelectedStatus.value
    : selectedFilter.value.status === 'all'
      ? []
      : selectedFilter.value.status
)
watch(filter, (f) => {
  model.value = f
}, { immediate: true })
</script>
