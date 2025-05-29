<template>
  <span v-tooltip="isIncoming ? 'Incoming Call' : 'Outgoing Call'" :data-call-direction="props.direction">
    {{ isIncoming ? '↙' : '↗' }}
  </span>
</template>

<style>
[data-call-direction] {
  font-size: 1.2em;
  color: var(--color-m);
  cursor: default;
  padding-inline-end: 8px;
  vertical-align: middle;

  &[data-call-direction="outgoing"] {
    color: var(--color-c);
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ direction: string }>()
const isIncoming = computed(() => props.direction === "incoming")
</script>
