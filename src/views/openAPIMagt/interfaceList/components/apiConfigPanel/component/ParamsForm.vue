<template>
  <el-form
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :validate-on-rule-change="false"
    class="params-form-root"
  >
    <div class="params-form">
      <div class="params-section">
        <h3 class="section-title">
          <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />输入参数
        </h3>
        <div v-for="item in inputParams" :key="item.key">
          <el-form-item v-if="item.needId.includes(apiInfo.id)" :prop="item.key" class="param-item">
            <div class="param-label">
              <span v-if="item.isRequired.includes(apiInfo.id)" class="required">*</span>
              <span class="field-label">{{ item.label }}</span>
              <span class="cn-label">{{ item.cnLabel }}</span>
              <el-tooltip
                :content="item.desc"
                placement="right"
                effect="light"
                :nowrap="false"
                raw-content
              >
                <el-icon :size="16" class="info-icon"><Warning /></el-icon>
              </el-tooltip>
            </div>
            <el-input
              v-if="item.type === 'input'"
              v-model="formModel[item.key]"
              :placeholder="`请输入${item.cnLabel}`"
              clearable
              class="param-input"
            />
            <el-date-picker
              v-if="item.type === 'daterange'"
              v-model="formModel[item.key]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="param-input date-range-picker"
            >
            </el-date-picker>
          </el-form-item>
        </div>
      </div>

      <div class="params-section" v-if="apiInfo.hasPage">
        <h3 class="section-title">
          <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />分页参数
        </h3>
        <div v-for="item in pageParams" :key="item.key">
          <el-form-item :prop="item.key" class="param-item">
            <div class="param-label">
              <span v-if="item.required" class="required">*</span>
              <span class="field-label">{{ item.label }}</span>
              <span class="cn-label">{{ item.cnLabel }}</span>
              <el-tooltip
                :content="item.desc"
                placement="right"
                effect="light"
                :nowrap="false"
                raw-content
              >
                <el-icon :size="16" class="info-icon"><Warning /></el-icon>
              </el-tooltip>
            </div>
            <el-input-number
              v-if="item.type === 'pageSize'"
              v-model="formModel[item.key]"
              controls-position="right"
              class="param-input"
              :min="1"
              :max="100"
              :step-strictly="true"
            />
            <el-input-number
              v-if="item.type === 'currentPage'"
              v-model="formModel[item.key]"
              controls-position="right"
              class="param-input"
              :min="1"
              :max="100"
              :step-strictly="true"
            />
          </el-form-item>
        </div>
      </div>
    </div>
  </el-form>
</template>

<script setup>
  import { ref, reactive, computed, watch } from 'vue'
  import { Warning } from '@element-plus/icons-vue'

  const props = defineProps({
    inputParams: { type: Array, required: true },
    pageParams: { type: Array, required: true },
    apiInfo: { type: Object, required: true }
  })

  const formRef = ref(null)
  const formModel = reactive({})

  // 初始化 formModel，并双向同步原数组
  const syncModel = () => {
    props.inputParams.forEach((item) => {
      formModel[item.key] = item.value
    })
    props.pageParams.forEach((item) => {
      formModel[item.key] = item.value
    })
  }
  syncModel()

  watch(
    () => props.inputParams,
    () => {
      props.inputParams.forEach((item) => {
        formModel[item.key] = item.value
      })
    },
    { deep: true }
  )
  watch(
    () => props.pageParams,
    () => {
      props.pageParams.forEach((item) => {
        formModel[item.key] = item.value
      })
    },
    { deep: true }
  )

  watch(
    () => ({ ...formModel }),
    (newModel) => {
      props.inputParams.forEach((item) => {
        if (newModel[item.key] !== undefined) item.value = newModel[item.key]
      })
      props.pageParams.forEach((item) => {
        if (newModel[item.key] !== undefined) item.value = newModel[item.key]
      })
    }
  )

  const formRules = computed(() => {
    const rules = {}
    props.inputParams.forEach((item) => {
      if (item.needId.includes(props.apiInfo.id) && item.isRequired.includes(props.apiInfo.id)) {
        rules[item.key] = [
          {
            required: true,
            message: `${item.cnLabel || item.label}不能为空`,
            trigger: ['blur', 'change']
          }
        ]
      }
    })
    props.pageParams.forEach((item) => {
      if (item.required) {
        rules[item.key] = [
          {
            required: true,
            message: `${item.cnLabel || item.label}不能为空`,
            trigger: ['blur', 'change']
          }
        ]
      }
    })
    return rules
  })

  defineExpose({
    validate: () => formRef.value?.validate(),
    clearValidate: () => formRef.value?.clearValidate() // 新增
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

      .section-title {
        display: flex;
        align-items: center;
        white-space: nowrap;
        line-height: 1;
        width: 56px;
        font-size: 14px;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Bold;
        font-weight: 700;
        text-align: left;
        color: #131617;
        margin-bottom: 16px;
      }
    }
  }

  /* 复用原 .param-item 样式，同时用于 el-form-item */
  .param-item {
    margin-bottom: 16px;
    flex-direction: column;
    display: flex;
    gap: 8px;

    /* 隐藏 Element Plus 默认 label */
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
      .info-icon {
        width: 14px;
        height: 14px;
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
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Regular;
        font-weight: 400;
        color: #b2bac4;
      }
    }

    .param-input {
      width: 100%;
    }
  }

  :deep(.date-range-picker) {
    width: 100% !important;
  }
  :deep(.el-date-editor.el-input),
  :deep(.el-date-editor.el-input__wrapper) {
    width: 100% !important;
    height: unset !important;
  }
</style>
