<template>
  <div class="doc-content">
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="error" class="error-container">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
    </div>
    <div v-else class="markdown-body" v-html="renderedHtml"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { marked } from 'marked'
import { Loading, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  docPath: {
    type: String,
    required: true,
    default: ''
  }
})

const renderedHtml = ref('')
const loading = ref(false)
const error = ref('')

const loadAndRenderMarkdown = async () => {
  if (!props.docPath) {
    renderedHtml.value = ''
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(props.docPath)

    if (!response.ok) {
      throw new Error(`加载失败: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      throw new Error('无法加载文档，请检查文件路径是否正确')
    }

    const markdownText = await response.text()

    if (!markdownText || markdownText.trim().startsWith('<!DOCTYPE') || markdownText.trim().startsWith('<html')) {
      throw new Error('文档内容为空或格式不正确')
    }

    renderedHtml.value = marked.parse(markdownText, {
      breaks: true,
      gfm: true
    })
  } catch (err) {
    console.error('加载 Markdown 文件失败:', err)
    error.value = err.message || '加载文档失败'
    renderedHtml.value = ''
  } finally {
    loading.value = false
  }
}

watch(
  () => props.docPath,
  () => {
    loadAndRenderMarkdown()
  },
  { immediate: true }
)

onMounted(() => {
  loadAndRenderMarkdown()
})
</script>

<style lang="scss" scoped>
.doc-content {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
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

  .loading-container,
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    color: #909399;
    font-size: 14px;

    .el-icon {
      font-size: 20px;
    }
  }

  .error-container {
    color: #f56c6c;
  }

  .markdown-body {
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      color: #303133;
    }

    :deep(h1) {
      font-size: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #eaecef;
    }

    :deep(h2) {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #eaecef;
    }

    :deep(h3) {
      font-size: 1.25em;
    }

    :deep(h4) {
      font-size: 1em;
    }

    :deep(p) {
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.6;
      color: #606266;
    }

    :deep(a) {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(strong) {
      font-weight: 600;
      color: #303133;
    }

    :deep(ul),
    :deep(ol) {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
      color: #606266;

      li {
        margin-bottom: 4px;
        line-height: 1.6;
      }
    }

    :deep(code) {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      color: #303133;
    }

    :deep(pre) {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
      margin-bottom: 16px;

      code {
        padding: 0;
        margin: 0;
        font-size: 100%;
        background-color: transparent;
        border-radius: 0;
      }
    }

    :deep(blockquote) {
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
      margin: 0 0 16px 0;

      p {
        margin: 8px 0;
      }
    }

    :deep(table) {
      display: block;
      width: 100%;
      overflow: auto;
      margin-bottom: 16px;
      border-spacing: 0;
      border-collapse: collapse;

      th,
      td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }

      th {
        font-weight: 600;
        background-color: #f6f8fa;
        color: #303133;
      }

      tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;

        &:nth-child(2n) {
          background-color: #f6f8fa;
        }
      }
    }

    :deep(img) {
      max-width: 100%;
      box-sizing: border-box;
      border-radius: 4px;
      margin: 8px 0;
    }

    :deep(hr) {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #e1e4e8;
      border: 0;
    }
  }
}
</style>
