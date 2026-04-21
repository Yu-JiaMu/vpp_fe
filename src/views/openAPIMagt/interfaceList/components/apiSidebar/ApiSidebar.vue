<template>
  <div class="sidebar">
    <div class="sidebar-search">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入接口名称"
        clearable
        prefix-icon="Search"
      />
    </div>
    <el-tree
      :data="filteredTreeData"
      :props="treeProps"
      default-expand-all
      @node-click="handleNodeClick"
      class="sidebar-tree"
    >
      <template #default="{ node, data }">
        <div class="tree-node-custom">
          <div
            class="node-label"
            :class="{
              'node-label-level1': node.level === 1,
              'node-label-level2': node.level === 2
            }"
          >
            {{ node.label }}
          </div>
          <div class="node-id" v-if="data.apiPath">{{ data.apiPath }}</div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import apiListData from '@/assets/openapi/apiListData.json'

const emit = defineEmits(['node-click'])

const searchKeyword = ref('')
const originalTreeData = ref(apiListData)

const filteredTreeData = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return originalTreeData.value
  }

  function filterNodes(nodes) {
    if (!Array.isArray(nodes)) return []

    return nodes.map(node => {
      const item = { ...node }

      if (item.children && item.children.length) {
        const filteredChildren = filterNodes(item.children)
        if (filteredChildren.length > 0) {
          item.children = filteredChildren
          return item
        }
      }

      const matchLabel = item.label?.toLowerCase().includes(keyword)
      const matchId = item.id?.toLowerCase().includes(keyword)

      if (matchLabel || matchId) {
        return item
      }

      return null
    }).filter(Boolean)
  }

  return filterNodes(originalTreeData.value)
})

const treeProps = {
  children: 'children',
  label: 'label'
}

const handleNodeClick = (node) => {
  if (node.id) {
    emit('node-click', node)
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 25%;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;

  .sidebar-search {
    :deep(.el-input__wrapper) {
      border-radius: 8px;
    }
  }

  // ... existing code ...

  .sidebar-tree {
    flex: 1;
    overflow-y: auto;

    :deep(.tree-node-custom) {
      display: flex;
      flex-direction: column;
      padding: 4px 0;
      width: 100%;
      word-wrap: break-word;
      word-break: break-all;
    }

    :deep(.node-label-level1) {
      max-width: 100%;
      min-height: 21px;
      font-size: 15px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #303537;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-word;
      line-height: 1.4;
    }

    :deep(.node-label-level2) {
      max-width: 100%;
      min-height: 20px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #303537;
      line-height: 1.4;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-word;
    }

    :deep(.node-id) {
      max-width: 100%;
      min-height: 17px;
      font-size: 12px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #afb2b8;
      line-height: 1.4;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-all;
    }

    :deep(.el-tree-node__content) {
      height: auto !important;
      padding: 6px 4px;
      line-height: 1.4;
      align-items: flex-start !important;
    }
  }
}
</style>

