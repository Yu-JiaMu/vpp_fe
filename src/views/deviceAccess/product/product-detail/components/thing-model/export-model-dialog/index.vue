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
      <MonacoEditor v-model="jsonContent" theme="vs" class="h-[378px]" lang="json" readOnly />
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
  const dialogVisible = ref(true)

  const data = reactive({ productId: '689d7b55d582f20018456cd6' })

  const testContent = `{
  "schemaVersion": "1.0",  "categoryId": "324",
  "productId": "5baNm7MNE",
  "properties": [
    {
      "identifier": "AdsSwitch",
      "name": "广告开关",
      "functionType": "s",
      "accessMode": "rw",
      "desc": "",
      "dataType": {
        "type": "bool",
        "specs": {
          "true": "开",
          "false": "关"
        }
      },
      "functionMode": "property",
      "required": false
    },
    {
      "identifier": "BtSwitch",
      "name": "蓝牙开关",
      "functionType": "s",
      "accessMode": "rw",
      "desc": "",
      "dataType": {
        "type": "bool",
        "specs": {
          "true": "开",
          "false": "关"
        }
      }
    }
  ]
}`

  const jsonContent = ref(testContent)

  /** 取消 */
  const handleCancel = () => {
    visible.value = false
  }

  /** 导出 */
  const handleExport = () => {
    const content =
      typeof jsonContent.value === 'string'
        ? jsonContent.value
        : JSON.stringify(jsonContent.value, null, 2)

    const blob = new Blob([content], {
      type: 'application/json;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'thing-model.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const open = (row) => {
    dialogVisible.value = true
  }

  defineExpose({ open })
</script>

<style lang="scss">
  .export-model-dialog {
  }
</style>
