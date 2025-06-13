<template>
  <div style="display: flex; justify-content: space-between; align-items: center;" v-if="pages > 1">
    <button type="button"  :disabled="page <= 1 || loading" @click="page = Math.max(page - 1, 0)">Previous</button>
    <small>Page {{ page }} / {{ pages }}</small>
    <button type="button"  :disabled="page >= pages || loading" @click="page = Math.min(page + 1, pages)">Next</button>
  </div>
</template>

<script setup lang="ts">
const page = defineModel<number>({ default: 1 })
defineProps<{
  pages: number,
  loading: boolean,
}>()
</script>
