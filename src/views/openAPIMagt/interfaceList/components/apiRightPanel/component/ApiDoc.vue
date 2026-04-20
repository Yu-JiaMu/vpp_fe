<template>
  <div class="doc-content">
    <h3>接口说明</h3>
    <p>{{ apiInfo.doc }}</p>
    <h3>参数说明</h3>
    <div class="table-scroll-container">
      <el-table :data="params" border>
        <el-table-column prop="label" label="参数名" width="150" />
        <el-table-column prop="desc" label="说明" min-width="200" />
        <el-table-column prop="example" label="示例" width="200" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  apiInfo: {
    type: Object,
    required: true,
    default: () => ({ doc: '' })
  },
  params: {
    type: Array,
    required: true,
    default: () => []
  }
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

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
  }

  p {
    color: #606266;
    line-height: 1.6;
    margin-bottom: 16px;
  }

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
