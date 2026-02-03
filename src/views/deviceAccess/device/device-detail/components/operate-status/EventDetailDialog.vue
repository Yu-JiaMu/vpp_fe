<template>
  <el-dialog v-model="modelValue" title="详情" width="742px">
    <MonacoEditor v-model="content" theme="vs" class="h-[378px]" lang="json" readOnly />
  </el-dialog>
</template>

<script setup>
  import MonacoEditor from '@/components/MonacoEditor/index.vue'

  const props = defineProps({
    modelValue: Boolean,
    eventData: String
  })

  const emit = defineEmits(['update:modelValue'])
  const content = computed(() => props.eventData)
</script>
