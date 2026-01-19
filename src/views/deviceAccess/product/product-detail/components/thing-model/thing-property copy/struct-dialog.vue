<template>
  <div class="struct-dialog">
    <el-dialog
      v-model="dialogVisible"
      title="添加结构体参数"
      width="565"
      align-center
      :close-on-click-modal="false"
    >
      <ThingProperty ref="thingPropertyRef" isAddStruct></ThingProperty>
      <!-- Footer -->
      <template #footer>
        <div class="flex justify-center gap-[6px]">
          <el-button size="large" type="info" class="w-[177px]" v-ripple @click="handleCancel">
            取消
          </el-button>
          <el-button type="primary" class="w-[177px]" v-ripple @click="handleSubmit">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import ThingProperty from './index.vue'
  const dialogVisible = ref(false)
  const emits = defineEmits('addStruct')
  const handleCancel = () => {
    dialogVisible.value = false
  }

  const thingPropertyRef = useTemplateRef('thingPropertyRef')
  const handleSubmit = () => {
    console.log('thingPropertyRef', thingPropertyRef.value.standardFromData)

    emits('addStruct', thingPropertyRef.value.standardFromData)
    dialogVisible.value = false
  }

  const open = (row) => {
    dialogVisible.value = true
  }

  defineExpose({ open })
</script>

<style lang="scss" scoped>
  .struct-dialog {
  }
</style>
