<template>
  <div class="card-header">
    Call Log:
    {{ fmtName(contact.firstName, contact.lastName) }}<br>
    <small class="monospace line-clamp">{{ contact.id }}</small>
  </div>
</template>

<script setup lang="ts">
import type { Contact } from '../../shared/types'
import { fmtName } from '../fmt'

defineProps<{ contact: Contact }>()
</script>

<style scoped>
.card-header {
  background: white;
  font-weight: 600;
  color: var(--color-2);
  box-shadow: var(--shadow-sm);
  z-index: 1;

  & small {
    line-break: anywhere;
  }
}
</style>
