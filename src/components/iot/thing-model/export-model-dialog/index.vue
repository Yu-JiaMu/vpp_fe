<template>
  <el-dialog
    v-model="dialogVisible"
    align-center
    title="导出物模型"
    :show-close="false"
    width="598"
  >
    <div class="export-model-dialog">
      <!-- 说明信息 -->
      <div class="px-3 py-3 mb-2.5 text-sm leading-relaxed text-g-303537 rounded-md bg-[#f6f7fb]">
        物模型是物联网系统对设备在云端的功能描述的定义，包括设备的属性，功能和事件。采用JSON格式您可以根据物模型组装上报设备的数据。也可以导出物模型。
      </div>

      <!-- JSON 展示区域 -->
      <MonacoEditor v-model="editorContent" theme="vs" class="h-[378px]" lang="json" readOnly />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button
          size="large"
          type="info"
          class="w-[177px]"
          v-ripple
          @click="dialogVisible = false"
          >取消</el-button
        >
        <el-button type="primary" class="w-[177px]" v-ripple @click="handleExport">
          导出物模型
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  const props = defineProps({
    info: {
      type: Object,
      default: () => {}
    },

    module: {
      type: String,
      default: ''
    }
  })

  const editorContent = ref('')

  const dialogVisible = ref(false)

  /** 导出 */
  const handleExport = () => {
    if (!editorContent.value) return

    const content = JSON.stringify(editorContent.value, null, 2)

    const blob = new Blob([content], {
      type: 'application/json;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.info.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleEditContent = (thingJson) => {
    if (typeof thingJson === 'string') {
      editorContent.value = thingJson
    }
    editorContent.value = JSON.stringify(thingJson, null, 2)
  }
  const open = (thingJson) => {
    handleEditContent(thingJson)
    dialogVisible.value = true
  }

  defineExpose({ open })
</script>

<style lang="scss">
  .export-model-dialog {
  }
</style>
