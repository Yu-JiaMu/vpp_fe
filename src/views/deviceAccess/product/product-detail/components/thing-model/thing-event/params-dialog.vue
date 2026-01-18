<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '参数编辑' : '参数设置'"
    width="565"
    align-center
    :close-on-click-modal="false"
  >
    <ThingProperty ref="refForm" fromFunction :tableData="modelValue" />
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button size="large" type="info" class="w-[177px]" v-ripple @click="visible = false">
          取消
        </el-button>
        <el-button type="primary" class="w-[177px]" v-ripple @click="submit"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import ThingProperty from '../thing-property/index.vue'

  const props = defineProps({})
  const visible = ref(false)
  const modelValue = defineModel()
  const refForm = ref()
  const isEdit = ref(false)
  const editIndex = ref(-1)

  const emits = defineEmits(['submitSuccess'])
  const resetForm = () => {
    if (refForm.value && refForm.value.formRef) {
      refForm.value.formRef.clearValidate()
      refForm.value.formRef.resetFields()
    }
  }

  const submit = async () => {
    const { form, formRef } = refForm.value
    const valid = await formRef.validate()
    if (!valid) return
    if (isEdit.value && editIndex.value >= 0) {
      modelValue.value[editIndex.value] = JSON.parse(JSON.stringify(form))
    } else {
      modelValue.value.push(JSON.parse(JSON.stringify(form)))
    }
    visible.value = false
    resetForm()
    emits('submitSuccess')
  }

  const open = (row, index) => {
    // console.log(row, index)

    if (row && index !== undefined) {
      isEdit.value = true
      editIndex.value = index
      nextTick(() => {
        Object.assign(refForm.value.form, JSON.parse(JSON.stringify(row)))
      })
    } else {
      isEdit.value = false
      editIndex.value = -1
      resetForm()
    }
    visible.value = true
  }

  defineExpose({ open })
</script>
