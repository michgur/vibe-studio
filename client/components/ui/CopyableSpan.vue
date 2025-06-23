<script setup lang="ts">
import { useFloating } from '@floating-ui/vue';
import { ref } from '@vue/reactivity';
import { useClipboard } from '@vueuse/core';
import { useTemplateRef, watch, type StyleValue } from 'vue';

const { text } = defineProps<{ text: string }>()
const span = useTemplateRef("span")
const button = useTemplateRef("button")

const { copy, copied } = useClipboard({ copiedDuring: 100 })

const show = ref(false)
watch(copied, (c) => { if (!c) show.value = false })

const { floatingStyles } = useFloating(span, button, { placement: "bottom", transform: false })
</script>

<template>
  <span :style="($attrs.style || '') as StyleValue"
    :class="[{ 'copyable-span': true, 'copyable-span-show': show, 'copyable-span-overlay': show || copied }, ($attrs.class || {})]"
    @mouseover="show = true" @mouseout="show = false" @click="show && copy(text)" ref="span">
    {{ text }}
  </span>
  <Teleport to="body" v-if="show || copied">
    <button ref="button" type="button" :class="{ 'copyable-span-button': true, 'copyable-span-button-active': copied }"
      :style="{ ...floatingStyles, transform: `translateY(${(span?.getBoundingClientRect().height || 0) / -2 - 12}px)` }"
      @click="copy(text)">
      {{ copied ? '✅' : '📋' }}
    </button>
  </Teleport>
</template>

<style>
.copyable-span-show {
  cursor: pointer;
}

.copyable-span-overlay,
.copyable-span-overlay * {
  opacity: 0.5;
}

.copyable-span-button {
  z-index: 20;
  pointer-events: none;
  height: 24px;
  width: 24px;
  padding: 0;

  &.copyable-span-button-active {
    border-bottom: none;
    margin-top: 1px;
  }
}
</style>
