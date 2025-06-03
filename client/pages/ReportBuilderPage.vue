<template>
  <div id="report-builder">
    <div class="card" style="min-width: 50%">
      <ReportTable :dateRange="dateRange" :agent="agent" :columns="columns" :rows="rows" />
    </div>
    <ResizablePane>
      <div class="card" id="report-setup">
        <ReportFieldsDraggableList :group="rowGroup" v-model="rows"
          :glow="draggedField && canMove(draggedField, rowGroup)" :fullUI="true" @start="f => draggedField = f"
          @end="draggedField = undefined" @remove="removeRow" />
        <ReportFieldsDraggableList :group="colGroup" v-model="columns"
          :glow="draggedField && canMove(draggedField, colGroup)" :fullUI="true" @start="f => draggedField = f"
          @end="draggedField = undefined" @remove="removeColumn" />
        <ReportFieldsDraggableList style="grid-row:1/3; border-inline-start: 1px solid var(--color-8)" :search="true"
          :group="sharedGroup" v-model="pool" @start="f => draggedField = f" @end="draggedField = undefined"
          @remove="addField" />
      </div>
    </ResizablePane>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PREDEFINED_FIELDS, type DateRange, type ReportField } from '../../shared/types'
import type { GroupOptions } from 'sortablejs';
import ResizablePane from '@/components/ui/ResizablePane.vue'
import ReportFieldsDraggableList from '@/components/reports/ReportFieldsDraggableList.vue';
import ReportTable from '@/components/reports/ReportTable.vue';

const { agent, dateRange } = defineProps<{ agent: string, dateRange: DateRange }>()
const pool = ref<ReportField[]>(PREDEFINED_FIELDS.concat([{ id: '', label: '', type: 'custom' }]))
const rows = ref<ReportField[]>([])
const columns = ref<ReportField[]>([])
const draggedField = ref<ReportField | undefined>()

function findField(elt: HTMLElement): ReportField | undefined {
  const f = (f: ReportField) => f.id === elt.dataset.field
  return pool.value.find(f) || rows.value.find(f) || columns.value.find(f)
}
function canMove(eltOrField: HTMLElement | ReportField | undefined, group: GroupOptions): boolean {
  if (!eltOrField) return false
  if (group.name === 'all_fields') return true

  const field = (eltOrField instanceof HTMLElement) ? findField(eltOrField) : eltOrField;
  return !!field && (field.type === group.name || (field.type === 'custom' && !!field.id))
}

const pull: GroupOptions['pull'] = (to, _, e) => canMove(e, to.options.group as GroupOptions)
const sharedGroup: GroupOptions = {
  name: 'all_fields',
  put: ['row', 'column'],
  pull,
}
const rowGroup = { name: 'row', put: ['all_fields'], pull }
const colGroup = { name: 'column', put: ['all_fields'], pull }

function move(
  field: ReportField,
  from: typeof rows | typeof columns | typeof pool,
  to: typeof rows | typeof columns | typeof pool,
  prepend?: boolean,
) {
  if (to.value.find(f => f.id === field.id)) return
  from.value = from.value.filter(f => f.id !== field.id)
  if (prepend) to.value.unshift(field)
  else to.value.push(field)
}
function addField(field: ReportField) {
  const list = field.type === rowGroup.name ? rows : columns
  move(field, pool, list)
}
function removeRow(field: ReportField) {
  move(field, rows, pool, true)
}
function removeColumn(field: ReportField) {
  move(field, rows, pool, true)
}
</script>

<style>
#report-builder {
  display: flex;
  height: 100%;
  width: 100%;
}

#report-setup {
  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  grid-auto-flow: column;
  background: var(--color-10);
}
</style>
