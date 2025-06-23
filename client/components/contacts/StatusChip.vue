<template>
  <div class="contact-status-chip" :style="{ '--status-rgb': STATUS_RGB[status as keyof typeof STATUS_RGB].join(' ') }">
    {{ status }}
  </div>
</template>

<script setup lang="ts">
const STATUS_RGB = {
  New: [99, 102, 241],
  Paused: [165, 180, 252],
  Unanswered: [245, 158, 11],
  Unreachable: [249, 115, 22],
  Connecting: [56, 189, 248],
  Answered: [16, 185, 129],
  'Contact Verified': [20, 184, 166],
  Disqualified: [239, 68, 68],
  Qualified: [59, 130, 246],
  Converted: [34, 197, 94],
  'Dont Call': [100, 116, 139],
  'Dnc Blocked': [127, 29, 29],
}

const { status } = defineProps<{ status: string }>()
</script>

<style lang="css">
.contact-status-chip {
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
