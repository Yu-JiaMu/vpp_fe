<template>
  <div class="result-content">
    <!-- 顶部按钮切换 -->
    <div class="result-tabs">
      <el-button
          :class="['tab-btn', { 'tab-btn-active': activeTab === 'response' }]"
          @click="activeTab = 'response'"
      >
        响应信息
      </el-button>
      <el-button
          :class="['tab-btn', { 'tab-btn-active': activeTab === 'request' }]"
          @click="activeTab = 'request'"
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
            <img v-if="result.success" src="@imgs/openapi/4.png" class="w-5 h-5 mr-2.5" alt="" />
            <img v-else src="@imgs/openapi/5.png" class="w-5 h-5 mr-2.5" alt="" />
            <span class="status-item">{{ result.success ? '调用成功' : '调用失败' }}</span>
            <span class="status-item">状态码：{{ result.code }}</span>
            <span class="status-item">耗时：{{ result.costTime }}ms</span>
          </div>
          <div class="json-box">
            <el-button link type="primary" @click="copyJson(result.response, '响应结果')" class="copy-btn">
              <el-icon><CopyDocument /></el-icon>复制
            </el-button>
            <json-viewer :value="showData.response" expand-depth="3" class="json-viewer" />
          </div>
        </div>

        <!-- 响应头 -->
        <div class="result-section">
          <h3 class="section-title">
            <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
            Response Header
          </h3>
          <div class="json-box">
            <el-button link type="primary" @click="copyJson(result.responseHeaders, '响应头')" class="copy-btn">
              <el-icon><CopyDocument /></el-icon>复制
            </el-button>
            <json-viewer :value="showData.responseHeaders" expand-depth="3" class="json-viewer" />
          </div>
        </div>
      </template>
    </div>

    <!-- 请求信息 -->
    <div v-if="activeTab === 'request'" class="tab-content">
      <!-- 无调用信息时隐藏 -->
      <div v-if="!hasResult" class="empty-state">
        <el-icon :size="48"><Document /></el-icon>
        <p>暂无调用结果</p>
      </div>
      <!-- 有调用信息时展示 -->
      <template v-else>
        <!-- 请求头 -->
        <div class="result-section">
          <h3 class="section-title">
            <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
            Request Header
          </h3>
          <div class="json-box">
            <el-button link type="primary" @click="copyJson(result.requestHeaders, '请求头')" class="copy-btn">
              <el-icon><CopyDocument /></el-icon>复制
            </el-button>
            <json-viewer :value="showData.requestHeaders" expand-depth="3" class="json-viewer" />
          </div>
        </div>
        <!-- 请求内容 -->
        <div class="result-section">
          <h3 class="section-title">
            <img src="@imgs/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
            Request Body
          </h3>
          <div class="json-box">
            <el-button link type="primary" @click="copyJson(result.request, '请求内容')" class="copy-btn">
              <el-icon><CopyDocument /></el-icon>复制
            </el-button>
            <json-viewer :value="showData.request" expand-depth="3" class="json-viewer" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, CopyDocument } from '@element-plus/icons-vue'

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

// 统一处理要展示的数据（核心修复）
const showData = reactive({
  response: {},
  request: {},
  responseHeaders: {},
  requestHeaders: {}
})

// 监听数据变化自动解析
watch(
    () => props.result,
    (val) => {
      showData.response = safeJsonParse(val.response)
      showData.request = safeJsonParse(val.request)
      showData.responseHeaders = safeJsonParse(val.responseHeaders)
      showData.requestHeaders = safeJsonParse(val.requestHeaders)
    },
    { immediate: true, deep: true }
)

const hasResult = computed(() => {
  return props.result.response || props.result.request
})

// 安全 JSON 解析（不会崩溃，一定返回对象）
function safeJsonParse(data) {
  if (!data) return {}
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch (e) {
    try {
      return JSON.parse(JSON.stringify(data))
    } catch {
      return { raw: data }
    }
  }
}

// 复制功能
const copyJson = async (jsonStr, label) => {
  if (!jsonStr) {
    ElMessage.warning(`${label}为空`)
    return
  }

  const text = typeof jsonStr === 'string' ? jsonStr : JSON.stringify(jsonStr, null, 2)

  try {
    // 优先使用现代 API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制到剪贴板')
    } else {
      // 降级方案:使用传统方法
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)

      if (successful) {
        ElMessage.success('已复制到剪贴板')
      } else {
        ElMessage.error('复制失败，请手动复制')
      }
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制')
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
      font-weight: 400;
      color: #131617;
      background: #f7f7f9;
      border: 1px solid #ced1d9;
      border-radius: 4px;
      transition: all 0.2s ease;
      // 移除element默认的hover样式干扰
      &:not(.tab-btn-active):hover {
        color: #303537;
        background: #e7effe;
        border: 1px solid #1464ee;
        border-radius: 4px;
      }
    }
    // 选中状态样式
    .tab-btn-active {
      color: #303537!important;
      background: #e7effe !important;
      border: 1px solid #1464ee;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
      &:hover {
        background: #e7effe !important;
        border-color: #1464ee !important;
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
    p { margin: 0; font-size: 14px; }
  }

  .result-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
    &.success {
      background: #eefeff;
      border: 1px solid #38ecf2;
    }
    &.error {
      background: #fef0f0;
      color: #f56c6c;
      border: 1px solid #fbc4c4;
    }
    .status-item {
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #303537;
    }
  }

  .result-section {
    .section-title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
      color: #131617;
      margin-bottom: 16px;
    }
    .json-box {
      position: relative;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      max-height: 400px;
      overflow: auto;
      background: #fafafa;
      .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 10;
        padding: 4px 8px;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        &:hover {
          border-color: #409eff;
          color: #409eff;
        }
      }
    }
  }
}

:deep(.json-viewer) {
  padding: 0;
  box-sizing: border-box;
  font-size: 13px;
  line-height: 1.6;
}
:deep(.jv-key) {
  color: #c41d7f !important;
  font-weight: 500 !important;
}

// 覆盖element按钮默认样式，避免冲突
:deep(.result-tabs .el-button) {
  --el-button-text-color: #131617;
  --el-button-bg-color: #f7f7f9;
  --el-button-border-color: #ced1d9;
  --el-button-hover-text-color: #409eff;
  --el-button-hover-bg-color: #f0f7ff;
  --el-button-hover-border-color: #409eff;
}
:deep(.result-tabs .el-button.tab-btn-active) {
  --el-button-text-color: #fff;
  --el-button-bg-color: #409eff;
  --el-button-border-color: #409eff;
  --el-button-hover-text-color: #fff;
  --el-button-hover-bg-color: #3399ff;
  --el-button-hover-border-color: #3399ff;
}
</style>
