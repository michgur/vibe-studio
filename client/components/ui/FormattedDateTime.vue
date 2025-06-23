<template>
  <span v-if="renderDateTime" style="cursor:default" v-tooltip="fmtDateLong(renderDateTime, renderTimezone)">
    {{ fmtDate(renderDateTime, renderTimezone) }}
  </span>
  <span v-else style="opacity:0.5">-</span>
</template>

<script setup lang="ts">
import { useTimezoneSetting } from '@/composables/timezone';
import { fmtDate, fmtDateLong } from '@/fmt';
import { computed } from "vue";
const props = defineProps<{ dateTime?: Date | string, timezone?: string }>()
const renderDateTime = computed(() => typeof props.dateTime === 'string' ? new Date(props.dateTime) : props.dateTime)
const { timezone: renderTimezone } = useTimezoneSetting(() => props.timezone)
</script>
