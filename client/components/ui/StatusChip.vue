<template>
  <div class="status-chip" :style="{ '--status-rgb': (rgbMap?.[status] || [173, 173, 219]).join(' ') }">
    {{ status }}
  </div>
</template>

<script setup lang="ts">
export type StatusRGB = Record<string, [number, number, number]>
defineProps<{ rgbMap?: StatusRGB, status: string }>()
</script>

<style lang="css">
.status-chip {
  cursor: default;
  width: min-content;
  margin-inline: auto;
  padding: 2px 10px;
  font-size: .8em;
  font-weight: 600;
  border-radius: 20px;
  background: rgba(var(--status-rgb) / 0.1);
  color: rgb(var(--status-rgb));
}
</style>
