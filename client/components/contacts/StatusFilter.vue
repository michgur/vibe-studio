<template>
  <Popover placement="bottom-end">
    <template #trigger>
      Status: <span>{{ presetIdx === undefined ? `Custom (${model.length})` : presets[presetIdx].label }}</span>
    </template>
    <template #popover="{ close }">
      <div>
        <div role="tablist">
          <button role="tab" :aria-selected="tab === 'presets'" @click="tab = 'presets'">Presets</button>
          <button role="tab" :aria-selected="tab === 'custom'" @click="tab = 'custom'">Custom</button>
        </div>
        <form id="contact-status">
          <fieldset v-if="tab === 'presets'">
            <label v-for="(preset, i) in presets" :key="i">
              <input type="radio" name="preset" :value="i" v-model="presetIdx"
                @change="(($event.target as HTMLInputElement)?.checked) && close()">
              {{ preset.label }}
            </label>
          </fieldset>
          <fieldset v-else>
            <label v-for="(state, i) in contactStates" :key="i">
              <input type="checkbox" :value="state" v-model="model">
              {{ fmtKey(state) }}
            </label>
          </fieldset>
        </form>
      </div>
    </template>
  </Popover>
</template>

<script setup lang="ts">
import Popover from "@/components/ui/Popover.vue";
import { fmtKey } from "@/fmt";
import { ref, watch } from "vue"

const contactStates = [
  'new',
  'paused',
  'unanswered',
  'unreachable',
  'connecting',
  'answered',
  'contact_verified',
  'disqualified',
  'qualified',
  'converted',
  'dont_call',
  'dnc_blocked'
] as const
export type ContactStatus = typeof contactStates[number]

interface FilterOption {
  label: string
  status: readonly ContactStatus[]
}

const presets: FilterOption[] = [
  {
    label: 'Answered',
    status: ['unreachable', 'answered', 'contact_verified', 'disqualified', 'qualified', 'converted', 'dont_call',]
  },
  { label: 'Identified', status: ['contact_verified', 'disqualified', 'qualified', 'converted', 'dont_call'] },
  { label: 'Qualified', status: ['qualified', 'converted'] },
  { label: 'Converted', status: ['converted'] },
  { label: 'All', status: contactStates },
]

const tab = ref<'presets' | 'custom'>('presets')
const presetIdx = ref<number | undefined>(0)
const model = defineModel<ContactStatus[]>({ default: [] })

watch(presetIdx, (i) => { if (i !== undefined) model.value = [...presets[i].status] }, { immediate: true })
watch(model, (status) => {
  const i = presets.findIndex(p => {
    return p.status.every(s => status.includes(s)) && status.every(s => p.status.includes(s))
  })
  presetIdx.value = i === -1 ? undefined : i
})
</script>

<style>
#contact-status fieldset {
  appearance: none;
  border: none;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;

  & label {
    font-size: .8em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
