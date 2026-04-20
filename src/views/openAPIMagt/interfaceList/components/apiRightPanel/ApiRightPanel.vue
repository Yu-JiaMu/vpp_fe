<template>
  <div class="right-panel">
    <el-tabs
      :model-value="activeTab"
      @update:model-value="$emit('update:activeTab', $event)"
      class="right-tabs"
    >
      <el-tab-pane label="文档" name="doc">
        <ApiDoc :api-info="apiInfo" :params="params" />
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


import ApiDoc from "@views/openAPIMagt/interfaceList/components/apiRightPanel/component/ApiDoc.vue";
import ApiResult from "@views/openAPIMagt/interfaceList/components/apiRightPanel/component/ApiResult.vue";
import CallHistory from "@views/openAPIMagt/interfaceList/components/apiRightPanel/component/CallHistory.vue";

defineProps({
  activeTab: {
    type: String,
    default: 'result'
  },
  apiInfo: {
    type: Object,
    required: true,
    default: () => ({ doc: '' })
  },
  params: {
    type: Array,
    required: true,
    default: () => []
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
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto;
    }
  }
}
</style>
