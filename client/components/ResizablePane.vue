<template>
  <div v-show="open" class="resizable-pane" ref="pane">
    <div @mousedown="start" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted, useTemplateRef } from 'vue'

const { minWidth = 0.2, open = true } = defineProps<{ minWidth?: number, open?: boolean }>()
const pane = useTemplateRef("pane")
let left: HTMLElement | undefined = undefined

function start(_: MouseEvent) {
  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', stop)
}

function drag(e: MouseEvent) {
  const parent = pane.value?.parentElement
  if (parent) {
    const { right: x, width: pw } = parent.getBoundingClientRect()
    setWidth(Math.max(minWidth, (x - e.clientX) / pw))
  }
}
function stop() {
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', stop)
}

function setWidth(w: number) {
  if (left) {
    left.style.flexBasis = (1 - w) * 100 + '%'
  }
}
watch<[HTMLElement, boolean]>(() => [pane.value as HTMLElement, open], ([elt, op]) => {
  if (elt) {
    left = elt.previousElementSibling as HTMLElement
    setWidth(op ? Math.min(1, minWidth * 2) : 0)
  }
})
onUnmounted(() => {
  stop()
  setWidth(0)
})
</script>

<style>
:has(~ .resizable-pane) {
  flex: 0 0 auto;
}

:has(> .resizable-pane) {
  display: grid;
  justify-items: stretch;
  position: relative;
}

.resizable-pane {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;

  &>:first-child {
    width: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active::after {
      cursor: col-resize;
      position: absolute;
      content: "";
      z-index: 20;
      inset: 0;
    }

    &::before {
      content: "";
      display: block;
      background: var(--color-8);
      width: 4px;
      height: 80px;
      border-radius: 10px;
      cursor: col-resize;
    }

    &:hover::before {
      background: var(--color-6);
    }
  }

  &>:last-child {
    flex-grow: 1;
  }
}
</style>
