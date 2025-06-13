<template>
  <div :class="{ glow: props.glow }" :data-field-group="props.group.name">
    <div>
      <h5 class="ellipsize">{{ fmtKey(props.group.name) }}</h5>
      <div v-if="props.search">
        <input type="text" v-model="searchTerm">
        <button type="button"  @click="searchTerm = ''">×</button>
      </div>
    </div>
    <Draggable :modelValue="filteredFields" @update:modelValue="model = $event" item-key="id" :group="props.group"
      tag="ul" :componentData="{ type: 'transition-group' }" :animation="200" @start="emitStart($event.item)"
      @end="emit('end')">
      <template #item="{ element }">
        <li :class="{ 'full-ui': props.fullUI }" @dblclick="emit('remove', element)" :data-field="element.id">
          <input type="text" v-if="element.type === 'custom' && !element.id" placeholder="⚙︎ Enter field name"
            @change="createCustomField($event.target as HTMLInputElement)">
          <span v-else>{{ element.label }}</span>
          <small class="monospace">{{ element.id || 'Custom field' }}</small>
          <button type="button"  v-if="props.fullUI" v-tooltip="'Remove field'" @click="emit('remove', element)">🗑️</button>
        </li>
      </template>
    </Draggable>
  </div>
</template>

<script setup lang="ts">
import { type ReportField } from '@shared/types'
import Draggable from 'vuedraggable'
import type { GroupOptions } from 'sortablejs'
import { fmtKey } from '@/fmt'
import { ref } from 'vue'
import { computed } from '@vue/reactivity'

const searchTerm = ref<string>("")
const model = defineModel<ReportField[]>()
const props = defineProps<{
  group: GroupOptions, glow?: boolean, fullUI?: boolean,
  search?: boolean
}>()
const emit = defineEmits<{
  start: [field: ReportField],
  remove: [field: ReportField],
  end: [],
}>()

function emitStart(elt: HTMLElement) {
  const field = model.value?.find((f) => f.id === elt.dataset.field)
  if (field) emit('start', field)
}

function normalizeSearch(s: string): string {
  return s.toLowerCase().replace(/\W/g, '')
}

const filteredFields = computed(() => {
  if (!model.value) return []
  if (searchTerm.value) {
    const s = normalizeSearch(searchTerm.value)
    return model.value.filter(val =>
      normalizeSearch(val.id).includes(s) || normalizeSearch(val.label).includes(s))
  } else return model.value
})

function createCustomField(input: HTMLInputElement) {
  if (!model.value) return []
  const existing = model.value.findIndex(f => f.id === input.value)
  const field: ReportField = existing !== -1 ? model.value.splice(existing, 1)[0] : {
    id: input.value,
    label: '⚙︎ ' + input.value,
    type: 'custom'
  }
  model.value.splice(-1, 0, field)
  input.value = ''
  input.blur()
}
</script>

<style>
[data-field-group] {
  border-bottom: 1px solid var(--color-8);
  display: flex;
  min-height: 100px;
  max-height: 100%;
  flex-direction: column;

  &>:first-child {
    padding: 8px 16px;
    border-bottom: 1px solid var(--color-8);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 0 0 42px;

    & h5 {
      margin: 0;
    }

    & div:has(input) {
      margin-inline-start: 8px;
      position: relative;

      &::before {
        content: '🔎';
        display: inline-block;
        position: absolute;
        left: 4px;
        z-index: 1;
      }

      & input {
        padding-inline: 24px;
        height: 100%;
        max-width: 100px;
      }

      & button {
        position: absolute;
        top: 4px;
        right: 2px;
        height: 18px;
      }
    }
  }

  &.glow {
    background: var(--color-hover);
  }

  & ul {
    display: flex;
    overflow-y: auto;
    margin: 0;
    flex-direction: column;
    justify-content: stretch;
    font-size: 12px;
    gap: 8px;
    padding: 8px 8px 36px 8px;
    flex-grow: 1;

    & li {
      display: grid;
      grid-template-rows: 1fr .75fr;
      grid-template-columns: 1fr auto;
      grid-auto-flow: column;
      padding: 6px 8px;
      cursor: move;
      user-select: none;
      border-radius: 4px;

      &:hover,
      &.full-ui,
      &.sortable-ghost {
        background: white;
        outline: 1px solid var(--color-8);
      }

      &.full-ui {
        & button {
          display: none;
          background: none;
          border: none;
          grid-row: 1/3;
          aspect-ratio: 1;
          align-self: center;
        }

        &:hover button {
          background: var(--color-active);
          display: block;
        }
      }

      & input {
        width: 100%;
      }
    }
  }
}
</style>
