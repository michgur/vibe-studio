<template>
  <button type="button"  class="copy-to-clipboard" v-tooltip="isCopying ? 'Copied' : 'Copy to Clipboard'" @click="onClick">📋</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { getText } = defineProps<{ getText: (evt: MouseEvent) => string }>()

const isCopying = ref<boolean>(false)
function onClick(evt: MouseEvent) {
  isCopying.value = true
  setTimeout(() => isCopying.value = false, 1500)

  navigator.clipboard.writeText(getText(evt))
}
</script>

<style>
.copy-to-clipboard {
  font-size: 18px;
  aspect-ratio: 1;
}
</style>
