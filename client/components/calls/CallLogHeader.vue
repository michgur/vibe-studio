<template>
  <div class="card-header">
    Call Log:
    {{ fmtName(contact.firstName, contact.lastName) }}<br>
    <small>
      <CopyableSpan :text="contact.id" style="line-break:anywhere" class="monospace line-clamp" />
    </small>
  </div>
</template>

<script setup lang="ts">
import type { Contact } from '@shared/types'
import { fmtName } from '@/fmt'
import CopyableSpan from '@/components/ui/CopyableSpan.vue'

defineProps<{ contact: Contact }>()
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
