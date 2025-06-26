<template>
  <label id="timezone-toggle">
    <svg v-tooltip="'Select Timezone'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 21">
      <path fill="CurrentColor"
        d="M10.12 20.88a9.78 9.78 0 0 0 3.96-.82 6.54 6.54 0 0 1-.77-1.12 8.94 8.94 0 0 1-.78.26c.22-.19.41-.42.58-.7a6.07 6.07 0 0 1-.49-1.67c-.52 1.13-1.14 1.84-1.85 2.15v-3.1a20.02 20.02 0 0 1 1.8.17 5.35 5.35 0 0 1 .14-1.26 21.13 21.13 0 0 0-1.94-.18v-3.05h3.78a6.66 6.66 0 0 1 1.88-1.27h-1.31a17.1 17.1 0 0 0-.52-3.62 7.5 7.5 0 0 0 2.34-1.12c.48.59.89 1.24 1.22 1.96.32.71.54 1.46.64 2.25a5.23 5.23 0 0 1 1.37.1 9.49 9.49 0 0 0-1.05-3.46 10.33 10.33 0 0 0-5.32-4.73 9.89 9.89 0 0 0-3.67-.69c-1.38 0-2.68.26-3.9.78A10.34 10.34 0 0 0 .8 7.1a9.27 9.27 0 0 0-.8 3.83c0 1.36.26 2.64.8 3.84a10.18 10.18 0 0 0 5.42 5.33c1.22.52 2.52.78 3.9.78Zm5.94-16.26a7.88 7.88 0 0 1-1.83.86 9.28 9.28 0 0 0-.78-1.62c-.29-.48-.6-.88-.94-1.2a8.65 8.65 0 0 1 3.55 1.96ZM12.95 5.8a16.7 16.7 0 0 1-2.18.22V2.9c.43.18.83.52 1.2 1.04.38.5.7 1.13.98 1.87Zm-3.48.22A15.43 15.43 0 0 1 7.3 5.8c.27-.74.6-1.37.97-1.87.37-.52.78-.86 1.2-1.04v3.13Zm-3.45-.54a6.38 6.38 0 0 1-1.82-.86 8.21 8.21 0 0 1 1.63-1.18c.6-.34 1.23-.6 1.9-.78-.34.32-.65.73-.94 1.2-.3.48-.55 1.02-.77 1.62Zm7.78 4.8h-3.03V7.3a14.42 14.42 0 0 0 2.55-.29 16.94 16.94 0 0 1 .48 3.28Zm-4.33 0H6.45a14.23 14.23 0 0 1 .48-3.27 17.04 17.04 0 0 0 2.54.3v2.98Zm-4.35 0H1.38A8.54 8.54 0 0 1 3.3 5.56c.62.46 1.4.83 2.34 1.12-.16.54-.28 1.12-.36 1.72-.09.6-.14 1.24-.17 1.9Zm4.35 4.33a14.04 14.04 0 0 0-2.53.29 15.93 15.93 0 0 1-.5-3.34h3.03v3.05Zm-3.82.62c-.94.3-1.71.66-2.32 1.11-.55-.66-1-1.4-1.34-2.2a8.07 8.07 0 0 1-.61-2.58h3.74c.03.67.08 1.32.17 1.94.08.6.2 1.19.36 1.73Zm3.82 3.75a2.93 2.93 0 0 1-1.19-1.03 7.7 7.7 0 0 1-.97-1.84c.64-.12 1.36-.2 2.16-.23v3.1Zm-1.75.22a8.33 8.33 0 0 1-3.5-1.94 6.8 6.8 0 0 1 1.81-.83c.22.58.47 1.1.76 1.57.28.48.6.88.93 1.2Z" />
      <path fill="CurrentColor"
        d="M16.43 16.55h2.56a.33.33 0 0 0 .34-.34v-3.28c0-.1-.03-.18-.1-.24a.33.33 0 0 0-.24-.1c-.1 0-.18.03-.24.1a.32.32 0 0 0-.1.24v2.94h-2.22a.33.33 0 0 0-.35.34c0 .1.04.17.1.24.07.06.15.1.25.1Zm2.56 4.43a4.88 4.88 0 0 1-3.54-1.45 4.82 4.82 0 0 1-1.47-3.5 4.82 4.82 0 0 1 1.47-3.52A5.03 5.03 0 0 1 24 16.02a5.05 5.05 0 0 1-5 4.96Z" />
    </svg>
    <div>
      <input type="checkbox" hidden v-model="overrideWithBrowserTimezone">
      <div name="browser" v-tooltip="`Browser Timezone (${timezone})`">{{ flag }} Browser</div>
      <div name="auto" v-tooltip="'Auto Timezone (from contact / agent)'">Auto</div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { useTimezoneSetting, overrideWithBrowserTimezone } from '@/composables/timezone';
const { timezone, flag } = useTimezoneSetting()
</script>

<style>
#timezone-toggle {
  font-size: .7em;
  cursor: pointer;
  text-align: center;

  &>svg {
    color: var(--color-6);
    height: 16px;
    width: 22px;
  }

  &>div {
    display: flex;
    gap: 2px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 0.5px 2px -0.5px rgba(var(--rgb-shadow), 0.8);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 2px;

    &:active {
      border-bottom: none;
    }

    & div {
      padding-inline: 4px;
      user-select: none;
      display: flex;
      align-items: center;
    }

    & input:checked~[name=browser],
    & input:not(:checked)~[name=auto] {
      background: var(--color-c);
      color: white;
      z-index: 1;
      border-radius: 3px;
      box-shadow: 0 0 1px rgba(var(--rgb-shadow), .7),
        0 0 5px -1px rgba(var(--rgb-shadow), .3),
        inset 0 0 2px rgba(0, 0, 0, .05);
    }
  }
}
</style>
