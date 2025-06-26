<template>
  <span v-tooltip="isIncoming ? 'Incoming Call' : 'Outgoing Call'" :data-call-direction="props.direction">
    <svg v-if="isIncoming" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
      <path
        d="m3.2 8.7-1.6-2-1.2-2a5 5 0 0 1-.4-2c0-.4 0-.7.2-1.1.1-.4.3-.7.6-1 .2 0 .4-.3.6-.4l.7-.2c.2 0 .3 0 .5.2l.4.5 1 1.5.3.5v.7s0 .2-.2.3l-.5 1a19.4 19.4 0 0 1-.1.3V5.3L4.8 7l1 .8a4.4 4.4 0 0 0 1 .6.7.7 0 0 0 .2 0h.2l1-.6.4-.2h.6l.5.3L11.2 9l.5.4v1a3 3 0 0 1-1.4 1.4L9 12c-.6 0-1.2-.1-1.9-.4a16.5 16.5 0 0 1-4-2.9ZM11.5 0c.2 0 .3 0 .4.2l.1.3c0 .1 0 .2-.2.3L9.1 3.7l-1 1 1.8-.1h1l.3.1.1.3v.4l-.4.1H7.2l-.4-.1V.9h.7l.1.4v1L7.5 4l1-1L11.2.3l.3-.2Z" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
      <path
        d="M3.2 8.6C2.6 8 2 7.3 1.6 6.6 1 6 .7 5.3.4 4.6A5 5 0 0 1 0 2.7c0-.4 0-.8.2-1.1.1-.4.3-.7.6-1l.6-.4.7-.2c.2 0 .3 0 .4.2l.5.5 1 1.5.3.4v.7l-.2.4-.6 1a19 19 0 0 1 0 .3v.2a10.4 10.4 0 0 0 2.2 2.5 4.4 4.4 0 0 0 1 .7.7.7 0 0 0 .3 0l.1-.1 1-.6.4-.1h.6l.5.2L11 9l.5.4v.9a2.9 2.9 0 0 1-1.4 1.4l-1.2.2c-.6 0-1.2-.1-1.8-.4a16.4 16.4 0 0 1-4-2.9Zm4-3.1c-.2 0-.3 0-.4-.2-.1 0-.2-.1-.2-.3l.2-.3 2.7-2.8 1-1-1.8.1H7.4V.2l.4-.2h3.6c.2 0 .3 0 .4.2l.1.3v3.7l-.1.4c-.1 0-.2.1-.4 0h-.3l-.1-.4v-1l.1-1.8-1 1-2.7 2.8-.3.2Z" />
    </svg>
  </span>
</template>

<style>
[data-call-direction] {
  color: var(--color-m);
  cursor: default;

  &[data-call-direction="outgoing"] {
    color: var(--color-c);
  }

  &>svg {
    height: .9em;
    width: .9em;
    fill: currentColor;
    overflow: visible;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ direction: string }>()
const isIncoming = computed(() => props.direction === "incoming")
</script>
