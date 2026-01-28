<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="565"
    align-center
    :close-on-click-modal="false"
  >
    <ThingProperty
      ref="refForm"
      :tableData="modelValue"
      :key="`editIndex-${editIndex}-${paramsType}`"
      :currentIndex="editIndex"
      :currentRow="currentRow"
      :track="track"
    />
    <template #footer>
      <template v-if="isEdit">
        <div class="flex justify-center gap-[6px]">
          <el-button size="large" type="info" class="w-[177px]" v-ripple @click="visible = false">
            取消
          </el-button>
          <el-button type="primary" class="w-[177px]" v-ripple @click="submit"> 确认 </el-button>
        </div>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
  import ThingProperty from '../thing-property/index.vue'

  const props = defineProps({
    paramsType: {
      type: String,
      default: 'input'
    },
    track: {
      // 'function' | 'extended'
      type: String,
      default: 'function'
    }
  })
  const visible = ref(false)
  const modelValue = defineModel()
  const refForm = ref()
  const isEdit = ref(false)
  const isLook = ref(false)
  const editIndex = ref(-1)

  const dialogTitle = computed(() => {
    // 根据 track 确定前缀
    const prefix = props.track === 'extended' ? '功能点' : '参数'

    if (isLook.value) {
      return `${prefix}查看`
    }
    if (isEdit.value) {
      return `${prefix}编辑`
    } else {
      return `${prefix}设置`
    }
  })

  const emits = defineEmits(['submit'])
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
    emits('submit')
  }

  const currentRow = ref(null)
  const open = (row, index, type) => {
    // console.log(row, index, type)
    currentRow.value = row ?? null
    if (type) {
      isEdit.value = type === 'edit'
      isLook.value = type === 'look'
    } else {
      isEdit.value = true
    }
    if (row && index !== undefined) {
      editIndex.value = index
      nextTick(() => {
        Object.assign(refForm.value.form, JSON.parse(JSON.stringify(row)))
      })
    } else {
      editIndex.value = -1
      resetForm()
    }
    visible.value = true
  }

  defineExpose({ open })
</script>
