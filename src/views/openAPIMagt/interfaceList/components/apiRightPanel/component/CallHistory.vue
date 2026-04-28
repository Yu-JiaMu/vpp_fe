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
                  :width="360"
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

const activeFilterStatus = ref('')

const filteredHistory = computed(() => {
  let result = [...props.history]

  result.sort((a, b) => new Date(b.time) - new Date(a.time))

  if (activeFilterStatus.value === 'success') {
    result = result.filter(item => item.success)
  } else if (activeFilterStatus.value === 'error') {
    result = result.filter(item => !item.success)
  }

  return result
})

const handleSearch = () => {
  activeFilterStatus.value = form.filterStatus
}

const handleReset = () => {
  form.filterStatus = ''
  activeFilterStatus.value = ''
}

const formatJson = (data) => {
  if (!data) return '{}'
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return String(data)
  }
}

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

// ... existing code ...
