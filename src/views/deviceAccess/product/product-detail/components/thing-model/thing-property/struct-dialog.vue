<template>
  <el-dialog v-model="visible" title="添加结构体参数" width="565" align-center>
    <ThingProperty ref="refForm" isAddStruct />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import ThingProperty from './index.vue'
  const visible = ref(false)
  const emit = defineEmits(['addStruct'])
  const refForm = ref()

  const submit = () => {
    emit('addStruct', refForm.value.getThingJson())
    visible.value = false
  }
  const open = () => (visible.value = true)
  defineExpose({ open })
</script>
