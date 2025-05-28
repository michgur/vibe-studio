<template>
  <div :style="wrapper" v-if="pages > 1">
    <button :disabled="page <= 1 || loading" @click="$emit('prev')">Previous</button>
    <small>Page {{ page }} / {{ pages }}</small>
    <button :disabled="page >= pages || loading" @click="$emit('next')">Next</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  page: number,
  pages: number,
  loading: boolean,
}>()

const wrapper = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
}
</script>
