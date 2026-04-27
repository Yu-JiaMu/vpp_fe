<template>
  <div class="params-form">
    <div class="params-section">
      <div class="auth-form">
        <p class="auth-tip">使用 OpenAPI 前，您需要配置密钥信息。</p>
        <div class="param-item">
          <div class="param-label">
            <span class="required">*</span>
            <span class="field-label">Key</span>
            <span class="cn-label">应用唯一标识</span>
          </div>
          <el-input
            :model-value="appKey"
            @update:model-value="$emit('update:appKey', $event)"
            placeholder="请输入key"
            clearable
            class="param-input"
          />
        </div>
        <div class="param-item">
          <div class="param-label">
            <span class="required">*</span>
            <span class="field-label">Secret</span>
            <span class="cn-label">用于生成请求签名</span>
          </div>
          <el-input
            :model-value="appSecret"
            @update:model-value="$emit('update:appSecret', $event)"
            placeholder="请输入Secret"
            clearable
            class="param-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  appKey: {
    type: String,
    default: ''
  },
  appSecret: {
    type: String,
    default: ''
  }
})

defineEmits(['update:appKey', 'update:appSecret'])
</script>

<style lang="scss" scoped>
.params-form {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 #f5f7fa;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;

    &:hover {
      background: #c0c4cc;
    }
  }

  .params-section {
    margin-bottom: 24px;
    padding-right: 16px;
  }

  .auth-form {
    padding: 16px;

    .auth-tip {
      margin-bottom: 16px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #505658;
      line-height: 16px;
    }

    .param-item {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .param-label {
        font-size: 14px;
        color: #606266;
        display: flex;
        align-items: center;
        gap: 8px;

        .required {
          color: #F8345C;
        }

        .field-label {
          height: 20px;
          font-size: 14px;
          font-family: Source Han Sans SC, Source Han Sans SC-Bold;
          font-weight: 700;
          text-align: left;
          color: #303537;
        }

        .cn-label {
          height: 19px;
          font-size: 13px;
          font-family: Source Han Sans SC, Source Han Sans SC-Regular;
          font-weight: 400;
          text-align: left;
          color: #b2bac4;
        }
      }

      .param-input {
        width: 100%;
      }
    }
  }
}
</style>
