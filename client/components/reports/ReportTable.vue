<template>
  <div id="report-table">
    <figure :class="{ skeleton: isLoading }">
      <table v-if="headers.length" :style="{ width: tableWidth + 'px' }">
        <colgroup>
          <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w + 'px' }" />
        </colgroup>
        <thead>
          <tr>
            <th v-for="(h, i) in headers" :key="h.id" style="position: relative" class="ellipsize">
              <span v-tooltip="h.label">{{ h.label }}</span>
              <button type="button"  :data-sort="sortKey === i ? (sortDesc ? 'desc' : 'asc') : 'neutral'" @click="sortBy(i)"
                v-tooltip="'Sort'">
                {{ sortKey === i ? (sortDesc ? '↓' : '↑') : '⇅' }}
              </button>
              <div v-if="i < headers.length - 1" class="col-resizer" @mousedown="startResize(i, $event)"></div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, ri) in sortedRows" :key="ri">
            <td v-for="(val, ci) in row" :key="ci">{{ val }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else>
        Build a report by dragging fields into Row / Column.
      </div>
    </figure>
    <CopyToClipboard class="copy-report-table" :getText="toTSV" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount, onMounted } from 'vue'
import { type DateRange, type ReportField } from '@shared/types'
import CopyToClipboard from '@/components/ui/CopyToClipboard.vue'

const props = defineProps<{ agent: string, rows: ReportField[], columns: ReportField[], dateRange: DateRange }>()

const data = ref<string[][]>([])
const headers = ref<ReportField[]>([])
const isLoading = ref(false)

const sortKey = ref<number | null>(null)
const sortDesc = ref(false)
function sortBy(idx: number) {
  sortKey.value === idx ? (sortDesc.value = !sortDesc.value)
    : (sortKey.value = idx, sortDesc.value = false)
}
const sortedRows = computed(() => {
  if (sortKey.value === null) return data.value
  const i = sortKey.value, desc = sortDesc.value
  return [...data.value].sort((a, b) => {
    const [va, vb] = [a[i] ?? '', b[i] ?? '']
    const [nA, nB] = [+va, +vb]
    const cmp = !Number.isNaN(nA) && !Number.isNaN(nB)
      ? nA - nB
      : String(va).localeCompare(String(vb))
    return desc ? -cmp : cmp
  })
})

const colWidths = ref<number[]>([])
const containerWidth = ref(0)
const userHasResized = ref(false)

function resetColWidthsEven() {
  const n = headers.value.length
  if (!n) return
  const base = containerWidth.value || 800
  const even = Math.floor(base / n)
  colWidths.value = Array(n).fill(even)
}

onMounted(() => {
  const fig = document.getElementById('report-table')
  if (!fig) return
  const ro = new ResizeObserver(([entry]) => {
    containerWidth.value = entry.contentRect.width
  })
  ro.observe(fig)
  onBeforeUnmount(() => ro.disconnect())
})

const tableWidth = computed(() => {
  const cols = colWidths.value.reduce((s, w) => s + w, 0)
  return Math.max(cols, containerWidth.value)
})

let rCol: number | null = null, startX = 0, startW = 0
function startResize(idx: number, e: MouseEvent) {
  rCol = idx
  startX = e.clientX
  startW = colWidths.value[idx]
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
function onMove(e: MouseEvent) {
  if (rCol == null) return
  userHasResized.value = true
  const delta = e.clientX - startX
  colWidths.value[rCol] = Math.max(60, startW + delta)
}
function onUp() {
  rCol = null
  document.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseup', onUp)
}
onBeforeUnmount(() => onUp())

watch([headers, containerWidth], () => {
  if (!userHasResized.value) resetColWidthsEven()
})

function toTSV() {
  const lines = [
    headers.value.map(h => h.label).join('\t'),
    ...sortedRows.value.map(r => r.join('\t'))
  ]
  return lines.join('\n')
}

async function fetchReport() {
  isLoading.value = true
  try {
    const resp = await fetch(`/api/${props.agent}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: props.rows.map(r => r.id),
        columns: props.columns.map(c => c.id),
        dateRange: props.dateRange,
      }),
    })
    if (!resp.ok) throw new Error(await resp.text())
    const json = await resp.json()
    data.value = json.rows
    headers.value = json.headers.map((h: string) =>
      props.rows.find(r => r.id === h) || props.columns.find(c => c.id === h))
    userHasResized.value = false
    resetColWidthsEven()
  } catch (e) {
    console.error('Report fetch failed:', e)
    data.value = []; headers.value = []
  } finally { isLoading.value = false }
}

watch(props, () => {
  if (!props.rows.length && !props.columns.length) {
    data.value = []; headers.value = []
  } else { fetchReport() }
}, { deep: true, immediate: true })
</script>

<style>
#report-table {
  position: relative;
  height: 100%;
  width: 100%;

  & figure {
    font-size: 14px;
    height: 100%;
    overflow: auto;
    margin: 0;
    position: relative;

    &>table {
      border-collapse: collapse;
      table-layout: fixed;
      height: min-content;
    }

    & th,
    & td {
      padding: 4px 8px;
      border: 1px solid var(--color-8);
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:first-child {
        border-inline-start: none;
        text-align: start;
      }

      &:last-child {
        border-inline-end: none;
      }
    }

    & th {
      background: var(--color-10);
      border-top: none;

      &:hover,
      &:has([data-sort=desc]),
      &:has([data-sort=asc]) {
        padding-right: 24px;

        & button[data-sort] {
          display: block;
        }
      }

      & button[data-sort] {
        position: absolute;
        right: 4px;
        top: 6px;
        height: 18px;
        width: 18px;
        margin-left: .25rem;
        border: none;
        background: none;
        padding: 0;
        font-weight: 600;
        color: var(--color-10);
        display: none;

        &[data-sort=asc],
        &[data-sort=desc] {
          background: var(--color-b);
          display: block;
        }

        &:hover {
          background: var(--color-hover);
          color: var(--color-6);
        }

        &[data-sort=neutral] {
          color: var(--color-8);
        }
      }
    }
  }

  & .copy-report-table {
    display: none;
    position: absolute;
    bottom: 8px;
    right: 8px;
  }

  &:hover .copy-report-table {
    display: block;
  }
}


/* drag handle */
.col-resizer {
  position: absolute;
  right: 0;
  top: 0;
  width: 5px;
  height: 100%;
  cursor: col-resize;
  user-select: none;
}
</style>
