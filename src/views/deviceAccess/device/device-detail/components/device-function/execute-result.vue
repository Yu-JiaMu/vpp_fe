<template>
  <!-- 执行结果 -->
  <div class="bg-white h-fit rounded-md border border-[#EEEFF1] flex-1">
    <div class="text-g-303537 border-b border-[#EEEFF1] px-5 py-4.5 font-scBold">执行结果</div>
    <!-- <div
      class="text-g-505658 whitespace-pre-line px-5 py-4.5 max-h-[500px] min-h-25 overflow-y-auto"
    >
      {{ result }}
    </div> -->
    <MonacoEditor
      :modelValue="result"
      theme="vs"
      class="h-[378px]"
      lang="json"
      readOnly
      :options="{ minimap: { enabled: false }, lineNumbers: 'off' }"
    />
  </div>
</template>

<script setup>
  const props = defineProps({
    result: {
      type: String,
      default: ''
    }
  })
</script>

<style lang="scss" scoped>
  .excute-result {
  }
</style>
