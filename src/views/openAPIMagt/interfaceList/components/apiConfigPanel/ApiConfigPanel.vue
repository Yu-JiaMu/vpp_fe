<template>
  <div class="main-content">
    <ApiHeader :api-info="apiInfo" />

    <div class="api-body">
      <el-tabs
        :model-value="activeTab"
        @update:model-value="$emit('update:activeTab', $event)"
        class="api-tabs"
      >
        <el-tab-pane label="参数配置" name="params">
          <ParamsForm
            :input-params="inputParams"
            :page-params="pageParams"
          />
        </el-tab-pane>

        <el-tab-pane label="API密钥配置" name="auth">
          <AuthForm
            :app-key="appKey"
            :app-secret="appSecret"
            @update:app-key="$emit('update:appKey', $event)"
            @update:app-secret="$emit('update:appSecret', $event)"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <ApiFooter
      :button-text="buttonText"
      @clear="$emit('clear')"
      @submit="$emit('submit')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ApiHeader from "@views/openAPIMagt/interfaceList/components/apiConfigPanel/component/ApiHeader.vue";
import ParamsForm from "@views/openAPIMagt/interfaceList/components/apiConfigPanel/component/ParamsForm.vue";
import AuthForm from "@views/openAPIMagt/interfaceList/components/apiConfigPanel/component/AuthForm.vue";
import ApiFooter from "@views/openAPIMagt/interfaceList/components/apiConfigPanel/component/ApiFooter.vue";

const props = defineProps({
  apiInfo: {
    type: Object,
    required: true,
    default: () => ({ title: '', desc: '' })
  },
  inputParams: {
    type: Array,
    required: true,
    default: () => []
  },
  pageParams: {
    type: Array,
    required: true,
    default: () => []
  },
  appKey: {
    type: String,
    default: ''
  },
  appSecret: {
    type: String,
    default: ''
  },
  activeTab: {
    type: String,
    default: 'params'
  }
})

const emit = defineEmits(['update:activeTab', 'update:appKey', 'update:appSecret', 'clear', 'submit'])

const buttonText = computed(() => {
  return props.activeTab === 'params'
    ? { clear: '清空', submit: '发起调用' }
    : { clear: '重置', submit: '保存配置' }
})
</script>

<style lang="scss" scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  box-sizing: border-box;

  .api-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .api-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      :deep(.el-tabs__header) {
        flex-shrink: 0;
        margin: 0 0 16px 0;
      }

      :deep(.el-tabs__content) {
        flex: 1;
        padding: 0;
        overflow: hidden;
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
    }
  }
}
</style>
