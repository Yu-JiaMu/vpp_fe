<template>
  <div class="result-content">
    <div class="result-status" :class="{ success: result.success, error: !result.success }">
      <el-icon :size="20">
        <CircleCheck v-if="result.success" />
        <CircleClose v-else />
      </el-icon>
      <span>{{ result.success ? '调用成功' : '调用失败' }}</span>
      <span class="status-code">状态码：{{ result.code }}</span>
      <span class="cost-time">耗时：{{ result.costTime }}s</span>
    </div>

    <el-tabs
      :model-value="resultTab"
      @update:model-value="$emit('update:resultTab', $event)"
      type="border-card"
    >
      <el-tab-pane label="响应信息" name="response">
        <el-input
          :model-value="result.response"
          type="textarea"
          :rows="15"
          readonly
          class="result-textarea"
        />
      </el-tab-pane>
      <el-tab-pane label="请求信息" name="request">
        <el-input
          :model-value="result.request"
          type="textarea"
          :rows="15"
          readonly
          class="result-textarea"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'

defineProps({
  result: {
    type: Object,
    required: true,
    default: () => ({
      success: false,
      code: -100,
      costTime: 0,
      response: '',
      request: ''
    })
  },
  resultTab: {
    type: String,
    default: 'response'
  }
})

defineEmits(['update:resultTab'])
</script>

<style lang="scss" scoped>
.result-content {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding-right: 10px;

  .result-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 500;
    flex-shrink: 0;

    &.success {
      background: #f0f9ff;
      color: #67c23a;
      border: 1px solid #e1f3d8;
    }

    &.error {
      background: #fef0f0;
      color: #f56c6c;
      border: 1px solid #fbc4c4;
    }

    .status-code,
    .cost-time {
      margin-left: 16px;
      color: #909399;
      font-weight: 400;
    }
  }

  .result-textarea {
    width: 100%;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
  }

  :deep(.el-tabs) {
    height: calc(100% - 60px);
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__content) {
      flex: 1;
    }
  }
}
</style>
