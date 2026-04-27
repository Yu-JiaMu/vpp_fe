<template>
  <div class="history-content">
    <ArtSearchBar
        ref="searchBarRef"
        v-model="form"
        :items="formItems"
        @search="handleSearch"
        @reset="handleReset"
    >
    </ArtSearchBar>
    <div class="table-container">
      <el-table
          :data="filteredHistory"
          ref="tableRef"
          border
          style="width: 100%"
          class="history-table"
      >
        <el-table-column label="请求时间" min-width="180" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ row.time }}</span>
          </template>
        </el-table-column>

        <el-table-column label="调用状态" min-width="170" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.success" type="success">调用成功</el-tag>
            <el-tag v-else type="danger">调用失败</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" min-width="200" align="center">
          <template #default="{ row }">
            <div class="action-cell">
              <!-- 查看调用参数 -->
              <el-popover
                  placement="right"
                  :width="320"
                  trigger="hover"
                  popper-class="param-popover"
              >
                <template #reference>
                  <el-button link type="primary" class="action-btn">查看调用参数</el-button>
                </template>
                <div class="param-popup">
                  <pre class="popup-content">{{ formatJson(row.params) }}</pre>
                </div>
              </el-popover>

              <!-- 重新调试 -->
              <el-button link type="primary" @click="$emit('recall', row)" class="action-btn">重新调试</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight, CopyDocument, Document } from '@element-plus/icons-vue'

const props = defineProps({
  history: {
    type: Array,
    required: true,
    default: () => []
  }
})

const form = reactive({
  filterStatus: ""
})

const formItems = computed(() => [
  {
    label: '调用状态',
    key: 'filterStatus',
    type: 'select',
    width: '100%',
    span: 13,
    props: {
      placeholder: '全部',
      options: filterStatusCode.value,
      clearable: true
    }
  }
]);

const filterStatusCode = ref([
  { label: '调用成功', value: "success" },
  { label: '调用失败', value: "error" }
])

const emit = defineEmits(['recall'])

// const filterStatus = ref('')

// 筛选后的历史记录
const filteredHistory = computed(() => {
  let result = [...props.history]

  // 按时间降序
  result.sort((a, b) => new Date(b.time) - new Date(a.time))

  // 按状态筛选
  if (form.filterStatus === 'success') {
    result = result.filter(item => item.success)
  } else if (form.filterStatus === 'error') {
    result = result.filter(item => !item.success)
  }

  return result
})

// 搜索
const handleSearch = () => {
  // 筛选逻辑已在 computed 中实现
}

// 重置
const handleReset = () => {
  form.filterStatus = ''
}

// 格式化 JSON
const formatJson = (data) => {
  if (!data) return '{}'
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return String(data)
  }
}

// 复制参数
const copyParams = async (params) => {
  if (!params) {
    ElMessage.warning('参数为空')
    return
  }

  try {
    const text = typeof params === 'string' ? params : JSON.stringify(params, null, 2)
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 监听历史记录变化，保存到本地存储
watch(
  () => props.history,
  (newHistory) => {
    if (newHistory && newHistory.length > 0) {
      localStorage.setItem('api_call_history', JSON.stringify(newHistory))
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.history-content {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;

  // 筛选栏
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .filter-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .filter-label {
        font-size: 14px;
        color: #606266;
        white-space: nowrap;
      }

      .filter-select {
        width: 100px;
      }
    }

    .search-btn {
      background: #ffffff;
      border: 1px solid #5b77ff;
      border-radius: 6px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Medium;
      font-weight: 500;
      text-align: left;
      color: #2a4dfc;
    }

    .reset-btn {
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #303537;
      border: 0;
    }
  }

  // 表格容器
  .table-container {
    .history-table {
      :deep(.el-table__body) {
        td {
          text-align: center;
        }
      }

      :deep(.el-table__body-wrapper) {
        overflow-y: auto;
        max-height: calc(100vh - 386px);

        // 滚动条美化
        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-thumb {
          background: #dcdfe6;
          border-radius: 4px;

          &:hover {
            background: #c0c4cc;
          }
        }

        &::-webkit-scrollbar-track {
          background: #f5f7fa;
        }
      }

      .time-text {
        color: #606266;
        font-size: 14px;
      }

      .status-text {
        font-weight: 500;
        font-size: 14px;

        &.success {
          color: #2ECB63;
        }

        &.error {
          color: #F8345C;
        }
      }

      .action-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .action-btn {
          padding: 0;
          font-size: 14px;
        }
      }
    }
  }

  // 空状态
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
}
</style>

<style lang="scss">
// 全局样式 - 参数弹窗
.param-popover {
  padding: 0 !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;

  .el-popover__title {
    display: none;
  }

  .param-popup {
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;

      span {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }

      .popup-copy-btn {
        padding: 0;
        font-size: 12px;
      }
    }

    .popup-content {
      margin: 0;
      padding: 12px;
      background: #fafafa;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #303133;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 300px;
      overflow-y: auto;

      // 滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 3px;

        &:hover {
          background: #c0c4cc;
        }
      }

      &::-webkit-scrollbar-track {
        background: #f5f7fa;
      }
    }
  }
}
</style>
