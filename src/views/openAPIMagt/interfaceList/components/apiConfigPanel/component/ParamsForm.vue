<template>
  <div class="params-form">
    <div class="params-section">
      <h3 class="section-title">
        <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />输入参数
      </h3>
      <div v-for="item in inputParams" :key="item.key">
        <div class="param-item" v-if="item.needId.includes(apiInfo.id)">
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
              v-if="item.type==='input'"
              v-model="item.value"
              :placeholder="`请输入${item.cnLabel}`"
              clearable
              class="param-input"
          />
          <el-date-picker
              v-if="item.type==='daterange'"
              v-model="item.value"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="param-input date-range-picker"
          >
          </el-date-picker>
        </div>
      </div>
    </div>

    <div class="params-section" v-if="apiInfo.hasPage">
      <h3 class="section-title">
        <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />分页参数
      </h3>
      <div v-for="item in pageParams" :key="item.key" class="param-item">
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
          v-if="item.type==='pageSize'"
          v-model="item.value"
          controls-position="right"
          class="param-input"
          :min="1"
          :max="100"
          :step-strictly="true"
        />
        <el-input-number
          v-if="item.type==='currentPage'"
          v-model="item.value"
          controls-position="right"
          class="param-input"
          :min="1"
          :max="100"
          :step-strictly="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Warning } from '@element-plus/icons-vue'

defineProps({
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
  apiInfo: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
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

    .section-title {
      display: flex;
      align-items: center;
      white-space: nowrap;
      line-height: 1;
      width: 56px;
      height: 20px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #131617;
      margin-bottom: 16px;
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

        .info-icon {
          width: 14px;
          height: 14px;
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

// 穿透 scoped，覆盖日期选择器宽度
:deep(.date-range-picker) {
  width: 100% !important;  // 和 el-input 保持一致的宽度
}

// 强制覆盖 Element Plus 内置的日期编辑器宽度
:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__wrapper) {
  width: 100% !important;  // 覆盖 var(--el-date-editor-width)
  height: unset !important;  // 继承父元素高度，和 input 对齐
}
</style>
