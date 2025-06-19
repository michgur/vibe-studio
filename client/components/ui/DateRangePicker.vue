<template>
  <Popover>
    <template #trigger>
      {{ rangeLabel }}
    </template>
    <template #popover>
      <div>
        <input type="date" v-model="localStart" />
        <span class="arrow">→</span>
        <input type="date" v-model="localEnd" />
      </div>
      <div>
        <button type="button" v-for="p in presets" :key="p.label" @click="applyPreset(p.range)">
          {{ p.label }}
        </button>
      </div>
      <div>
        <button type="button" @click="cancel">Cancel</button>
        <button type="button" @click="apply">Apply</button>
      </div>
    </template>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DateString, DateRange } from '@shared/types'
import { fromISO, labelRange, prevDay, toISO } from '@shared/dates'
import { endOfMonth, startOfMonth } from 'date-fns'
import Popover from './Popover.vue'

const model = defineModel<DateRange>({ default: [prevDay(29), prevDay(0)] })

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
}

function cancel() {
  localStart.value = toISO(start.value)
  localEnd.value = toISO(end.value)
}
</script>
