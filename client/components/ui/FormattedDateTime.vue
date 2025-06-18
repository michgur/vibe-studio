<template>
  <small v-if="dateTime">{{ fmtDate(typeof dateTime === 'string' ? new Date(dateTime) : dateTime) }}</small>
  <small v-else class="missing">-</small>
</template>

<script setup lang="ts">
import { fmtDate } from '@/fmt';
const { dateTime } = defineProps<{ dateTime?: Date | string }>()
</script>

<style scoped>
.missing {
  opacity: 0.5;
}
</style>
