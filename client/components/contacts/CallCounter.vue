<script setup lang="ts">
import { computed } from 'vue';

const { limit, count } = defineProps<{ limit: number, count: number }>()
const background = computed(() => {
  const percent = limit > 0 ? count / limit * 100 : 101
  if (percent > 100) return 'red'
  else return `linear-gradient(to right, var(--color-8) ${percent}%, var(--color-10) ${percent}%)`
})
</script>

<template>
  <small>{{ count }} / {{ limit }}</small>
  <div :style="{ background }"></div>
</template>

<style scoped>
small {
  color: var(--color-2);
  font-weight: 600;
}

div {
  margin-bottom: -2px;
  margin-inline: auto;
  height: 2px;
  width: 30px;
  border-radius: 5px;
}
</style>
