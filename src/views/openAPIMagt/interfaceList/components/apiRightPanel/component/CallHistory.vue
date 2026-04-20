<template>
  <div class="history-content">
    <div class="table-scroll-container">
      <el-table :data="history" border>
        <el-table-column prop="time" label="调用时间" width="180" />
        <el-table-column prop="api" label="接口" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'">
              {{ row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="耗时" width="80" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button link type="primary" @click="$emit('recall', row)">重调</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  history: {
    type: Array,
    required: true,
    default: () => []
  }
})

defineEmits(['recall'])
</script>

<style lang="scss" scoped>
.history-content {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;

  .table-scroll-container {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 16px;
    scrollbar-width: thin;
    scrollbar-color: #dcdfe6 #f5f7fa;

    &::-webkit-scrollbar {
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

    :deep(.el-table) {
      width: 100%;
      min-width: max-content;
      max-height: 300px;
      overflow-y: auto;
    }
  }
}
</style>
