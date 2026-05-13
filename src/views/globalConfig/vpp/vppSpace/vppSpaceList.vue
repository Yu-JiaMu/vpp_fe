<template>
  <ElCard class="art-table-card" shadow="never">
    <ArtSearchBar
      ref="searchBarRef"
      v-model="form"
      :items="formItems"
      label-width="100px"
      @search="onSearch"
      @reset="onReset"
    />
    <ArtAddBtn class="mb-4" @click="handleAdd">新增虚拟电厂</ArtAddBtn>
    <el-table
      :data="tableData"
      ref="tableRef"
      border
      show-overflow-tooltip
      style="width: 100%"
      @sort-change="handleSort"
    >
      <el-table-column prop="vppName" label="虚拟电厂名称" min-width="180" />
      <el-table-column prop="vppCode" label="虚拟电厂编号" min-width="160" />
      <el-table-column prop="operatorName" label="所属运营商" min-width="160" />
      <el-table-column label="虚拟电厂类型" width="140">
        <template #default="{ row }">
          <el-tag :type="VPP_TYPE.getItem(row.vppType)?.tag">
            {{ VPP_TYPE.getLabel(row.vppType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="市场准入状态" width="120">
        <template #default="{ row }">
          <el-tag :type="MARKET_ACCESS_STATUS.getItem(row.marketAccessStatus)?.tag">
            {{ MARKET_ACCESS_STATUS.getLabel(row.marketAccessStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="region" label="所在地区" min-width="120" />
      <el-table-column prop="createdAt" label="创建时间" sortable="custom" width="180" />
      <el-table-column label="操作" fixed="right" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click.prevent="viewDetail(row)">详情</el-button>
          <el-button link type="danger" @click.prevent="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ArtPagination v-model="pagination" @change="getTableData" />
  </ElCard>
</template>

<script setup>
import * as api from '@/api/vpp'
import { VPP_TYPE, MARKET_ACCESS_STATUS } from '@/enums/vppEnum'
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateMockVppSpaces } from './vppSpaceMockData.js'

const router = useRouter()

const form = reactive({
  vppName: '',
  vppCode: '',
  operatorName: '',
  vppType: undefined,
  region: '',
  marketAccessStatus: undefined,
  orderByColumn: 'createdAt',
  isAsc: 'descending'
})

const pagination = reactive({
  size: 10,
  current: 1,
  total: 0
})
const tableData = ref([])
const tableRef = useTemplateRef('tableRef')

const formItems = computed(() => [
  {
    label: '虚拟电厂名称',
    key: 'vppName',
    type: 'input',
    placeholder: '请输入虚拟电厂名称',
    clearable: true
  },
  {
    label: '虚拟电厂编号',
    key: 'vppCode',
    type: 'input',
    placeholder: '请输入虚拟电厂编号',
    clearable: true
  },
  {
    label: '所属运营商',
    key: 'operatorName',
    type: 'input',
    placeholder: '请输入所属运营商',
    clearable: true
  },
  {
    label: '虚拟电厂类型',
    key: 'vppType',
    type: 'select',
    placeholder: '请选择虚拟电厂类型',
    clearable: true,
    props: {
      options: [
        { label: '发电类虚拟电厂', value: 1 },
        { label: '负荷类虚拟电厂', value: 2 }
      ]
    }
  },
  {
    label: '所在地区',
    key: 'region',
    type: 'input',
    placeholder: '请输入所在地区',
    clearable: true
  },
  {
    label: '市场准入状态',
    key: 'marketAccessStatus',
    type: 'select',
    placeholder: '请选择市场准入状态',
    clearable: true,
    props: {
      options: [
        { label: '未准入', value: 1 },
        { label: '已注册', value: 2 },
        { label: '暂停', value: 3 },
        { label: '注销', value: 4 }
      ]
    }
  }
])

const useMockData = true // 开发阶段使用 mock 数据，联调时改为 false

const deletedIds = ref(new Set())

const getTableData = async () => {
  try {
    if (useMockData) {
      const allData = generateMockVppSpaces(15)
      let filtered = allData.filter(item => !deletedIds.value.has(item.id))
      if (form.vppName) {
        filtered = filtered.filter(item => item.vppName.includes(form.vppName))
      }
      if (form.vppCode) {
        filtered = filtered.filter(item => item.vppCode.includes(form.vppCode))
      }
      if (form.operatorName) {
        filtered = filtered.filter(item => item.operatorName.includes(form.operatorName))
      }
      if (form.vppType !== undefined && form.vppType !== '') {
        filtered = filtered.filter(item => item.vppType === form.vppType)
      }
      if (form.region) {
        filtered = filtered.filter(item => item.region.includes(form.region))
      }
      if (form.marketAccessStatus !== undefined && form.marketAccessStatus !== '') {
        filtered = filtered.filter(item => item.marketAccessStatus === form.marketAccessStatus)
      }
      if (form.orderByColumn === 'createdAt') {
        filtered.sort((a, b) => {
          const dir = form.isAsc === 'ascending' ? 1 : -1
          return (new Date(a.createdAt) - new Date(b.createdAt)) * dir
        })
      }
      const total = filtered.length
      const start = (pagination.current - 1) * pagination.size
      const end = start + pagination.size
      tableData.value = filtered.slice(start, end)
      pagination.total = total
      return
    }

    const queryParams = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...form
    }
    const response = await api.getVppSpaceList(queryParams)
    if (response) {
      tableData.value = response.rows
      pagination.total = response.total || 0
    }
  } catch (error) {
    console.error('获取虚拟电厂列表失败:', error)
    ElMessage.error('获取虚拟电厂列表失败')
  }
}

function onSearch() {
  pagination.current = 1
  getTableData()
}

function onReset() {
  pagination.current = 1
  tableRef.value?.clearSort()
  form.orderByColumn = 'createdAt'
  form.isAsc = 'descending'
  getTableData()
}

function handleSort({ order, prop }) {
  form.orderByColumn = prop
  form.isAsc = order
  getTableData()
}

function handleAdd() {
  router.push({
    name: 'VppSpaceAdd'
  })
}

function viewDetail(row) {
  router.push({
    name: 'VppSpaceDetail',
    query: { id: row.id }
  })
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除虚拟电厂「${row.vppName}」吗？删除后不可恢复。`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (useMockData) {
      deletedIds.value.add(row.id)
      ElMessage.success('删除成功')
      getTableData()
      return
    }

    await api.deleteVppSpace({ id: row.id })
    ElMessage.success('删除成功')
    getTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onActivated(() => {
  getTableData()
})
</script>

<style scoped lang="scss">
:deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
