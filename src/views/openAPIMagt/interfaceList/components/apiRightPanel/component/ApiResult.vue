<template>
  <div class="result-content">
    <!-- 顶部按钮切换 -->
    <div class="result-tabs">
      <el-button
        :type="activeTab === 'response' ? 'primary' : ''"
        @click="activeTab = 'response'"
        class="tab-btn"
      >
        响应信息
      </el-button>
      <el-button
        :type="activeTab === 'request' ? 'primary' : ''"
        @click="activeTab = 'request'"
        class="tab-btn"
      >
        请求信息
      </el-button>
    </div>

    <!-- 响应信息 -->
    <div v-if="activeTab === 'response'" class="tab-content">
      <!-- 无调用信息时隐藏 -->
      <div v-if="!hasResult" class="empty-state">
        <el-icon :size="48"><Document /></el-icon>
        <p>暂无调用结果</p>
      </div>

      <!-- 有调用信息时展示 -->
      <template v-else>
        <!-- 响应结果 -->
        <div class="result-section">
          <h3 class="section-title">
            <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
            响应结果
          </h3>

          <!-- 调用状态 -->
          <div class="result-status" :class="{ success: result.success, error: !result.success }">
            <el-icon :size="18">
              <CircleCheck v-if="result.success" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ result.success ? '调用成功' : '调用失败' }}</span>
            <span class="status-item">状态码：{{ result.code }}</span>
            <span class="status-item">耗时：{{ result.costTime }}ms</span>
          </div>

          <div class="json-wrapper">
            <el-button
                link
                type="primary"
                :icon="CopyDocument"
                @click="copyToClipboard(result.response, '响应结果')"
                class="copy-btn"
            >
              复制
            </el-button>
            <div class="json-content">
              <pre><code>{{ formatJson(result.response) }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 响应头 -->
        <div class="result-section">
          <h3 class="section-title">
            <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
            Response Header
          </h3>
          <div class="json-wrapper">
            <el-button
                link
                type="primary"
                :icon="CopyDocument"
                @click="copyToClipboard(result.responseHeaders, '响应头')"
                class="copy-btn"
            >
              复制
            </el-button>
            <div class="json-content">
              <pre><code>{{ formatJson(result.responseHeaders) }}</code></pre>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 请求信息 -->
    <div v-if="activeTab === 'request'" class="tab-content">
      <!-- 请求头 -->
      <div class="result-section">
        <h3 class="section-title">
          <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
          Request Header
        </h3>
        <div class="json-wrapper">
          <el-button
              link
              type="primary"
              :icon="CopyDocument"
              @click="copyToClipboard(result.requestHeaders, '请求头')"
              class="copy-btn"
          >
            复制
          </el-button>
          <div class="json-content">
            <pre><code>{{ formatJson(result.requestHeaders) }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 请求内容 -->
      <div class="result-section">
        <h3 class="section-title">
          <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
          Request Body
        </h3>
        <div class="json-wrapper">
          <el-button
              link
              type="primary"
              :icon="CopyDocument"
              @click="copyToClipboard(result.request, '请求内容')"
              class="copy-btn"
          >
            复制
          </el-button>
          <div class="json-content">
            <pre><code>{{ formatJson(result.request) }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CircleCheck,
  CircleClose,
  CopyDocument,
  Document,
  Histogram,
  Memo
} from '@element-plus/icons-vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
    default: () => ({
      success: false,
      code: -100,
      costTime: 0,
      response: '',
      request: '',
      responseHeaders: '',
      requestHeaders: ''
    })
  },
  resultTab: {
    type: String,
    default: 'response'
  }
})

const emit = defineEmits(['update:resultTab'])

const activeTab = computed({
  get: () => props.resultTab,
  set: (val) => emit('update:resultTab', val)
})

const hasResult = computed(() => {
  return props.result.response || props.result.request
})

const formatJson = (jsonStr) => {
  if (!jsonStr) return '{}'
  try {
    const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return jsonStr
  }
}

const copyToClipboard = async (text, label) => {
  if (!text) {
    ElMessage.warning(`${label}为空，无法复制`)
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${label}已复制到剪贴板`)
  } catch (err) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success(`${label}已复制到剪贴板`)
  }
}
</script>

<style lang="scss" scoped>
.result-content {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding-right: 10px;

  .result-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .tab-btn {
      min-width: auto;
      width: 96px;
      height: 31px;
      padding: 0;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #131617;
      background: #f7f7f9;
      border: 1px solid #ced1d9;
      border-radius: 4px;

      &:hover {
        color: #409eff;
        background: #f7f7f9;
        border-color: #409eff;
      }

      &.is-active,
      &:focus {
        color: #409eff;
        background: #f7f7f9;
        border-color: #409eff;
      }
    }
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #909399;

    .el-icon {
      margin-bottom: 16px;
      color: #c0c4cc;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .result-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 6px;
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

    .status-item {
      margin-left: 16px;
      color: #606266;
      font-weight: 400;
    }
  }

  .result-section {
    .section-title {
      display: flex;
      align-items: center;
      white-space: nowrap;
      line-height: 1;
      height: 20px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #131617;
      margin-bottom: 16px;
    }

    .json-wrapper {
      position: relative;

      .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 10;
        font-size: 13px;
        font-weight: 400;
        font-family: Source Han Sans SC, Source Han Sans SC-Regular;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        padding: 4px 12px;

        &:hover {
          background: #fff;
          border-color: #409eff;
        }
      }
    }

    .json-content {
      max-height: 400px;
      overflow: auto;
      background: #fafafa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
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

      pre {
        margin: 0;
        padding: 16px;
        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #303133;
        white-space: pre-wrap;
        word-wrap: break-word;

        code {
          font-family: inherit;
        }
      }
    }
  }
}
</style>
