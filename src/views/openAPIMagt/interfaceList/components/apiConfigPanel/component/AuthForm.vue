<template>
  <el-form ref="formRef" :model="authModel" :rules="authRules" class="params-form-root">
    <div class="params-form">
      <div class="params-section">
        <div class="auth-form">
          <p class="auth-tip">使用 OpenAPI 前，您需要配置密钥信息。</p>
          <el-form-item prop="appKey" class="param-item">
            <div class="param-label">
              <span class="required">*</span>
              <span class="field-label">Key</span>
              <span class="cn-label">应用唯一标识</span>
            </div>
            <el-input
              v-model="authModel.appKey"
              placeholder="请输入key"
              clearable
              class="param-input"
            />
          </el-form-item>
          <el-form-item prop="appSecret" class="param-item">
            <div class="param-label">
              <span class="required">*</span>
              <span class="field-label">Secret</span>
              <span class="cn-label">用于生成请求签名</span>
            </div>
            <el-input
              v-model="authModel.appSecret"
              placeholder="请输入Secret"
              clearable
              class="param-input"
            />
          </el-form-item>
        </div>
      </div>
    </div>
  </el-form>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue'

  const props = defineProps({
    appKey: { type: String, default: '' },
    appSecret: { type: String, default: '' }
  })

  const emit = defineEmits(['update:appKey', 'update:appSecret'])
  const formRef = ref(null)

  const authModel = reactive({
    appKey: props.appKey,
    appSecret: props.appSecret
  })

  watch(
    () => props.appKey,
    (val) => {
      authModel.appKey = val
    }
  )
  watch(
    () => props.appSecret,
    (val) => {
      authModel.appSecret = val
    }
  )
  watch(
    () => authModel.appKey,
    (val) => emit('update:appKey', val)
  )
  watch(
    () => authModel.appSecret,
    (val) => emit('update:appSecret', val)
  )

  const authRules = {
    appKey: { required: true, message: 'Key 不能为空', trigger: ['blur', 'change'] },
    appSecret: { required: true, message: 'Secret 不能为空', trigger: ['blur', 'change'] }
  }

  defineExpose({
    validate: () => formRef.value?.validate()
  })
</script>

<style lang="scss" scoped>
  .params-form-root {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
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
  }

  .auth-form {
    margin-bottom: 24px;
    padding-right: 16px;
    .auth-tip {
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 400;
      text-align: left;
      color: #505658;
      line-height: 16px;
    }
  }

  .param-item {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    :deep(.el-form-item__label) {
      display: none;
    }
    :deep(.el-form-item__content) {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    :deep(.el-form-item__error) {
      position: relative;
      margin-top: 0;
      padding-top: 4px;
    }

    .param-label {
      font-size: 14px;
      color: #606266;
      display: flex;
      align-items: center;
      gap: 8px;

      .required {
        color: #f8345c;
      }
      .field-label {
        font-size: 14px;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Bold;
        font-weight: 700;
        color: #303537;
      }
      .cn-label {
        font-size: 13px;
        font-weight: 400;
        color: #b2bac4;
      }
    }

    .param-input {
      width: 100%;
    }
  }
</style>
