<template>
  <button ref="trigger" @click="isOpen = !isOpen" aria-haspopup="dialog">
    <slot name="trigger"></slot>
  </button>
  <Teleport to="body">
    <div v-if="isOpen" ref="popover" :style="floatingStyles" class="card popover">
      <slot name="popover" :close="() => isOpen = false"></slot>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/vue";
import type { Placement } from "@floating-ui/vue";
import { onClickOutside, onKeyStroke } from "@vueuse/core";

const props = defineProps({
  placement: {
    type: String as () => Placement,
    default: 'bottom-start'
  },
  offset: {
    type: Number,
    default: 2
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref<boolean>(false);

const trigger = useTemplateRef("trigger")
const popover = useTemplateRef("popover")

const { floatingStyles } = useFloating(trigger, popover, {
  placement: computed(() => props.placement),
  whileElementsMounted: autoUpdate,
  middleware: computed(() => [
    offset(props.offset),
    flip(),
    shift({ padding: 10 }),
  ]),
})

onClickOutside(popover, () => isOpen.value = false, { ignore: [trigger] });
onKeyStroke("Escape", () => isOpen.value = false);
</script>

<style>
.popover {
  border-radius: 5px;
  z-index: 20;
}
</style>
