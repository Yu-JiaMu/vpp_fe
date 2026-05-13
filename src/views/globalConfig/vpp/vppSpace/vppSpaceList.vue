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
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="VPP_STATUS.getItem(row.vppStatusFlag)?.tag">
            {{ VPP_STATUS.getLabel(row.vppStatusFlag) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="accessCapacity" label="接入容量(MW)" width="120" align="center" />
      <el-table-column prop="region" label="所在地区" min-width="120" />
      <el-table-column prop="createdAt" label="创建时间" sortable="custom" width="180" />
      <el-table-column prop="expireDate" label="到期时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.expireDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click.prevent="viewDetail(row)">详情</el-button>
          <el-button
            link
            :type="row.vppStatusFlag === VPP_STATUS.values.DISABLED ? 'success' : 'warning'"
            :disabled="row.vppStatusFlag === VPP_STATUS.values.EXPIRED"
            @click.prevent="toggleStatus(row)"
          >
            {{ row.vppStatusFlag === VPP_STATUS.values.DISABLED ? '启用' : '禁用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <ArtPagination v-model="pagination" @change="getTableData" />
  </ElCard>
</template>

<script setup>
import * as api from '@/api/vpp'
import { VPP_STATUS } from '@/enums/vppEnum'
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateMockVppSpaces } from './vppSpaceMockData.js'

const router = useRouter()

const form = reactive({
  vppName: '',
  vppCode: '',
  operatorName: '',
  vppStatusFlag: undefined,
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
    label: '状态',
    key: 'vppStatusFlag',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    props: {
      options: [
        { label: '正常', value: 1 },
        { label: '已过期', value: 2 },
        { label: '已禁用', value: 3 }
      ]
    }
  }
])

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const useMockData = true // 开发阶段使用 mock 数据，联调时改为 false

const getTableData = async () => {
  try {
    if (useMockData) {
      const allData = generateMockVppSpaces(15)
      let filtered = allData
      if (form.vppName) {
        filtered = filtered.filter(item => item.vppName.includes(form.vppName))
      }
      if (form.vppCode) {
        filtered = filtered.filter(item => item.vppCode.includes(form.vppCode))
      }
      if (form.operatorName) {
        filtered = filtered.filter(item => item.operatorName.includes(form.operatorName))
      }
      if (form.vppStatusFlag !== undefined && form.vppStatusFlag !== '') {
        filtered = filtered.filter(item => item.vppStatusFlag === form.vppStatusFlag)
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

async function toggleStatus(row) {
  const action = row.vppStatusFlag === VPP_STATUS.values.DISABLED ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确认${action}该虚拟电厂吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const newStatus =
      row.vppStatusFlag === VPP_STATUS.values.DISABLED
        ? VPP_STATUS.values.NORMAL
        : VPP_STATUS.values.DISABLED

    await api.changeVppSpaceStatus({
      id: row.id,
      vppStatusFlag: newStatus
    })
    ElMessage.success(`${action}成功`)
    getTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error)
      ElMessage.error(`${action}失败`)
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
