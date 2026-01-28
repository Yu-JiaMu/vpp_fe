<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增产品品类"
    width="598px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    align-center
    class="success-dialog"
  >
    <!-- 弹窗主体内容 -->
    <div class="success-container">
      <div class="flex items-center gap-2.5">
        <img src="@/assets/images/deviceAccess/20.png" class="w-[24px] h-[24px]" alt="" />
        <span class="font1">产品品类创建成功</span>
      </div>
      <div class="font2 mt20 ml-[30px]">
        <div>接下来推荐操作:</div>
        <div>【 定义产品品类物模型】</div>
        <div> 您需自定义产品品类物模型，基于品类模板即可快速创建产品。</div>
      </div>
      <div class="mt20 ml-[30px]">
        <el-button class="btn-height-45" @click="addWMX">去定义物模型</el-button>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer flex flex-sp-center">
        <el-button type="info" class="btn-width-177" v-ripple @click="handleCancel">取消</el-button>
        <el-button class="btn-width-177" type="primary" v-ripple @click="handleConfirm"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed } from 'vue'

  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  })

  // Emits
  const emit = defineEmits(['update:modelValue', 'cancel', 'confirm', 'goToModelDefinition'])

  // 使用计算属性实现 v-model
  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const productCategoryId = ref('')
  const setId = (id) => {
    productCategoryId.value = id
  }

  const handleCancel = () => {
    emit('cancel')
    dialogVisible.value = false
  }
  const addWMX = () => {
    emit('goToModelDefinition', { id: productCategoryId.value })
    dialogVisible.value = false
  }
  const handleConfirm = () => {
    emit('confirm')
    dialogVisible.value = false
  }

  const handleClose = () => {
    handleCancel()
  }
  defineExpose({
    setId
  })
</script>

<style scoped lang="scss">
  .success-dialog {
    :deep(.el-dialog) {
      border-radius: 8px;
      overflow: hidden;
    }

    :deep(.el-dialog__header) {
      margin: 0;
      padding: 20px 24px 12px;
      border-bottom: none;
    }

    :deep(.el-dialog__title) {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
      line-height: 24px;
    }

    :deep(.el-dialog__headerbtn) {
      top: 20px;
      right: 24px;
    }

    :deep(.el-dialog__body) {
      padding: 0;
    }

    :deep(.el-dialog__footer) {
      padding: 20px 24px 20px;
      border-top: 1px solid #f0f0f0;
    }
  }

  .success-container {
    padding-left: 55px;
    .font1 {
      font-size: 16px;
      font-weight: 700;
      color: var(--art-gray-4);
    }
    .font2 {
      font-size: 16px;
      font-weight: 400;
      color: var(--art-gray-3);
    }
  }
</style>
