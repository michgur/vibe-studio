<template>
  <div class="drp">
    <!-- compact display button -->
    <button type="button"  class="trigger" @click="open = !open">
      {{ rangeLabel }}
    </button>

    <!-- dropdown panel (absolute; overlay) -->
    <div v-if="open" class="panel">
      <!-- manual date inputs -->
      <div class="row inputs">
        <input type="date" v-model="localStart" class="date-input" />
        <span class="arrow">→</span>
        <input type="date" v-model="localEnd" class="date-input" />
      </div>

      <!-- preset shortcuts -->
      <div class="row presets">
        <button type="button"  v-for="p in presets" :key="p.label" @click="applyPreset(p.range)" class="preset-btn">
          {{ p.label }}
        </button>
      </div>

      <!-- action buttons -->
      <div class="row actions">
        <button type="button"  class="text-btn" @click="cancel">Cancel</button>
        <button type="button"  class="primary-btn" @click="apply">Apply</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DateString, DateRange } from '@shared/types'
import { fromISO, labelRange, prevDay, toISO } from '@shared/dates'
import { endOfMonth, startOfMonth } from 'date-fns'

// v-model via defineModel
const model = defineModel<DateRange>({ default: [prevDay(29), prevDay(0)] })

/** reactive state */
const open = ref(false)
const start = ref<Date>(fromISO(model.value[0]))
const end = ref<Date>(fromISO(model.value[1]))
const localStart = ref<DateString>(model.value[0])
const localEnd = ref<DateString>(model.value[1])

watch(model, (v) => {
  start.value = fromISO(v[0])
  end.value = fromISO(v[1])
  localStart.value = v[0]
  localEnd.value = v[1]
})

const rangeLabel = computed(() => labelRange(start.value, end.value))

const today = prevDay(0)
const presets = [
  { label: 'Today', range: [today, today] as const },
  { label: 'Yesterday', range: [prevDay(1), prevDay(1)] as const },
  { label: 'Last 7 days', range: [prevDay(6), today] as const },
  { label: 'Last 30 days', range: [prevDay(29), today] as const },
  { label: 'Last 60 days', range: [prevDay(59), today] as const },
  { label: 'Last 90 days', range: [prevDay(89), today] as const },
  { label: 'This month', range: [startOfMonth(today), endOfMonth(today)] as const },
  {
    label: 'Prev. month',
    range: [
      startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      endOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
    ] as const,
  },
] as const

function applyPreset(r: readonly [Date, Date]) {
  localStart.value = toISO(r[0])
  localEnd.value = toISO(r[1])
  apply()
}

function apply() {
  start.value = fromISO(localStart.value)
  end.value = fromISO(localEnd.value)
  model.value = [localStart.value, localEnd.value]
  open.value = false
}

function cancel() {
  localStart.value = toISO(start.value)
  localEnd.value = toISO(end.value)
  open.value = false
}
</script>

<style scoped>
.drp {
  position: relative;
  display: inline-block;
  font-size: 0.875rem;
  /* ~text-sm */
}

.trigger {
  background: #fff;
}

.trigger:hover {
  background: #f8f8f8;
}

.panel {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  width: 20rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 1000;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.inputs {
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  flex: 1 1 45%;
  padding: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font: inherit;
}

.arrow {
  margin: 0 0.25rem;
}

.preset-btn {
  margin: 0 0.25rem 0.25rem 0;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f9f9f9;
  font-size: 0.75rem;
  cursor: pointer;
}

.preset-btn:hover {
  background: #f0f0f0;
}

.actions {
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
  margin-bottom: 0;
}

.text-btn {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
}

.primary-btn {
  padding: 0.25rem 0.75rem;
  background: #0d6efd;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.primary-btn:hover {
  background: #0b5ed7;
}
</style>
