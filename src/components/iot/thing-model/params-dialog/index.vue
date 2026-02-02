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
      <div v-if="mode !== 'look'" class="flex justify-center gap-[6px]">
        <el-button size="large" type="info" class="w-[177px]" v-ripple @click="handleCancel">
          取消
        </el-button>
        <el-button type="primary" class="w-[177px]" v-ripple @click="submit"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import ThingProperty from '../thing-property/index.vue'

  /* ---------------- props / emits ---------------- */

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

  const emits = defineEmits(['submit'])

  /* ---------------- state ---------------- */

  const visible = ref(false)
  const modelValue = defineModel()

  const refForm = ref()
  const currentRow = ref(null)
  const editIndex = ref(-1)

  // ⭐ 核心状态：统一管理弹窗模式
  // add | edit | look
  const mode = ref('add')

  /* ---------------- computed ---------------- */

  const dialogTitle = computed(() => {
    const prefix = props.track === 'extended' ? '功能点' : '参数'

    const suffixMap = {
      add: '新增',
      edit: '编辑',
      look: '查看'
    }

    return `${prefix}${suffixMap[mode.value]}`
  })

  /* ---------------- methods ---------------- */

  const resetForm = () => {
    const formRef = refForm.value?.formRef
    if (!formRef) return

    formRef.clearValidate()
    formRef.resetFields()
  }

  const handleCancel = () => {
    visible.value = false
    resetForm()
  }

  const submit = async () => {
    const { form, formRef } = refForm.value
    const valid = await formRef.validate()
    if (!valid) return

    const data = JSON.parse(JSON.stringify(form))

    if (mode.value === 'edit' && editIndex.value >= 0) {
      modelValue.value.splice(editIndex.value, 1, data)
    } else if (mode.value === 'add') {
      modelValue.value.push(data)
    }

    visible.value = false
    resetForm()
    emits('submit')
  }

  /**
   * 对外暴露方法
   * @param row   当前行数据
   * @param index 当前行索引
   * @param type  'add' | 'edit' | 'look'
   */
  const open = (row = null, index = -1, type = 'add') => {
    console.log(row, index, type)
    mode.value = type
    currentRow.value = row
    editIndex.value = index

    if (type !== 'add' && row && index >= 0) {
      nextTick(() => {
        Object.assign(refForm.value.form, JSON.parse(JSON.stringify(row)))
      })
    } else {
      resetForm()
    }

    visible.value = true
  }

  defineExpose({ open })
</script>
