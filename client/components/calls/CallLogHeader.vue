<template>
  <div class="card-header">
    {{ text }}
    <br>
    <small class="monospace ellipsize">
      <CopyableSpan :text="id" style="line-break:anywhere" />
    </small>
  </div>
</template>

<script setup lang="ts">
import CopyableSpan from '@/components/ui/CopyableSpan.vue'

defineProps<{ text: string, id: string }>()
</script>

<style scoped>
.card-header {
  background: white;
  font-weight: 600;
  color: var(--color-2);
  box-shadow: var(--shadow-sm);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: start;
}
</style>
