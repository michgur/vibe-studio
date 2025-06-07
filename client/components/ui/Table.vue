<template>
  <figure ref="wrap" role="table" :class="{
    scrolled: isScrolled,
    'sticky-head': stickyHeader,
    'sticky-col': stickyFirstColumn,
  }" tabindex="0" @scroll="onScroll" @keydown.up.prevent="selectRel(-1)" @keydown.down.prevent="selectRel(1)">
    <table>
      <thead v-if="$slots.header">
        <tr>
          <slot name="header" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="item.id" :class="{ selected: selected?.id === item.id }"
          @click="selected = item">
          <slot name="row" :item="item" :index="i" :selected="selected?.id === item.id" />
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<script setup lang="ts" generic="R extends {id: string}">
import { ref, nextTick, useTemplateRef } from 'vue'

const { items } = defineProps<{
  items: R[]
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
}>()

const selected = defineModel<R | undefined>()

const wrap = useTemplateRef("wrap")
const isScrolled = ref(false)

const rows = () =>
  Array.from(
    wrap.value?.querySelectorAll<HTMLTableRowElement>('tbody tr') ?? []
  )

function selectRel(d: number) {
  const list = rows()
  if (list.length === 0) return

  const selIdx = items.findIndex(item => item.id === selected.value?.id)
  const next = Math.min(
    Math.max(selIdx + d, 0),
    list.length - 1
  )
  selected.value = items[next]
  nextTick(() => rows()[next]?.scrollIntoView({ block: 'center' }))
}

function onScroll(e: Event) {
  isScrolled.value = (e.target as HTMLElement).scrollLeft >= 20
}
</script>

<style>
figure[role=table] {
  overflow-x: auto;
  outline: none;
  margin: 0;

  & table {
    width: 100%;
    min-width: 900px;
    border-collapse: separate;
    border-spacing: 0;

    & thead th {
      padding: 12px 8px;
      color: var(--color-4);
      background: white;
    }

    & th,
    & td {
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

      & td,
      & th {
        border-bottom: 1px solid var(--color-10);
      }

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--color-hover);
      }

      &.selected {
        background: var(--color-selected);
      }
    }
  }

  &.sticky-head,
  &.sticky-col {
    isolation: isolate;
  }

  &.sticky-head thead {
    position: sticky;
    top: 0;
    z-index: 2;
    filter: drop-shadow(0 2px 2px #48486111);
    background: white;
  }

  &.sticky-col th:first-child {
    position: sticky;
    text-align: start;
    left: 0;
    background: inherit;
    z-index: 1;
    max-width: 10dvh;
  }

  &.sticky-col.scrolled th:first-child::after {
    content: '';
    position: absolute;
    inset: 0;
    left: auto;
    width: 1px;
    background: var(--color-10);
  }
}
</style>
