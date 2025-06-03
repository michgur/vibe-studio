<template>
  <div ref="el" style="width: 100%; height: 100%" />
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/min/vs/editor/editor.main.css' // theme CSS
import { watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue';

const el = useTemplateRef("el")
const { content } = defineProps<{ content: any }>()

let editor: monaco.editor.IStandaloneCodeEditor | null = null

watch(() => content, () => { if (editor) editor.setValue(content) })
onMounted(() => {
  editor = monaco.editor.create(el.value!, {
    value: content,
    language: 'json',
    readOnly: true,
    folding: true,
    wordWrap: 'on',
    minimap: { enabled: false }
  })
})
onBeforeUnmount(() => editor?.dispose())
</script>
