<template>
  <div class="right-panel">
    <el-tabs
      :model-value="activeTab"
      @update:model-value="$emit('update:activeTab', $event)"
      class="right-tabs"
    >
      <el-tab-pane label="文档" name="doc">
        <ApiDoc :doc-path="apiInfo.docPath" />
      </el-tab-pane>

      <el-tab-pane label="调用结果" name="result">
        <ApiResult
          :result="apiResult"
          :result-tab="resultTab"
          @update:result-tab="$emit('update:resultTab', $event)"
        />
      </el-tab-pane>

      <el-tab-pane label="调用历史" name="history">
        <CallHistory
          :history="callHistory"
          @recall="$emit('recall', $event)"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import ApiDoc from './component/ApiDoc.vue'
import ApiResult from './component/ApiResult.vue'
import CallHistory from './component/CallHistory.vue'

defineProps({
  activeTab: {
    type: String,
    default: 'result'
  },
  apiInfo: {
    type: Object,
    required: true,
    default: () => ({ docPath: '' })
  },
  apiResult: {
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
  },
  callHistory: {
    type: Array,
    required: true,
    default: () => []
  }
})

defineEmits(['update:activeTab', 'update:resultTab', 'recall'])
</script>

<style lang="scss" scoped>
.right-panel {
  width: 40%;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  .right-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.el-tabs__header) {
      flex-shrink: 0;
      margin: 0 0 16px 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-tabs__item) {
      height: 29px;
      font-size: 13px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #303537;
      padding-bottom: 10px;
    }

    :deep(.el-tabs__item.is-active) {
      height: 29px;
      font-size: 13px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #1464ee;
    }

    :deep(.el-tabs__item:hover) {
      color: #1464ee;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }
  }
}
</style>
