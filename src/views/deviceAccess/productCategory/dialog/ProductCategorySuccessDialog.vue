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
      <div>
        <span class="font1">产品品类创建成功</span>
      </div>
      <div class="font2 mt20">
        <div>接下来推荐操作:</div>
        <div>【 定义产品品类物模型】</div>
        <div style="width: 390px">
          基于预置的物模型模板快速创建产品，可自动继承完整的产品品类功能定义。</div
        >
      </div>
      <div class="mt20">
        <el-button class="btn-height-45">去定义物模型</el-button>
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

  // 方法
  const goToModelDefinition = () => {
    emit('goToModelDefinition')
    dialogVisible.value = false
  }

  const handleCancel = () => {
    emit('cancel')
    dialogVisible.value = false
  }

  const handleConfirm = () => {
    emit('confirm')
    dialogVisible.value = false
  }

  const handleClose = () => {
    handleCancel()
  }
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
    padding-left: 100px;
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
