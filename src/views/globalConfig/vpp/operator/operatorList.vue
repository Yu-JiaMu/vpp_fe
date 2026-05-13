<template>
  <ElCard class="art-table-card" shadow="never">
    <ArtSearchBar
      ref="searchBarRef"
      v-model="form"
      :items="formItems"
      label-width="85px"
      @search="onSearch"
      @reset="onReset"
    />
    <ArtAddBtn class="mb-4" @click="handleAdd">新增运营商</ArtAddBtn>
    <el-table
      :data="tableData"
      ref="tableRef"
      border
      show-overflow-tooltip
      style="width: 100%"
      @sort-change="handleSort"
    >
      <el-table-column prop="operatorName" label="运营商名称/企业名称" min-width="160" />
      <el-table-column prop="operatorCode" label="运营商编号" min-width="160" />
      <el-table-column label="运营商状态" width="100">
        <template #default="{ row }">
          <el-tag :type="OPERATOR_STATUS.getItem(row.operatorStatusFlag)?.tag">
            {{ OPERATOR_STATUS.getLabel(row.operatorStatusFlag) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="vppCount" label="虚拟电厂数" width="100" align="center" />
      <el-table-column prop="createdAt" label="创建时间" sortable="custom" width="180" />
      <el-table-column prop="expireDate" label="到期时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.expireDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="230">
        <template #default="{ row }">
          <el-button link type="primary" @click.prevent="viewDetail(row)">详情</el-button>
          <el-button
            link
            :type="row.operatorStatusFlag === OPERATOR_STATUS.values.DISABLED ? 'success' : 'warning'"
            :disabled="row.operatorStatusFlag === OPERATOR_STATUS.values.EXPIRED"
            @click.prevent="toggleStatus(row)"
          >
            {{ row.operatorStatusFlag === OPERATOR_STATUS.values.DISABLED ? '启用' : '禁用' }}
          </el-button>
          <el-button link type="danger" @click.prevent="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ArtPagination v-model="pagination" @change="getTableData" />
  </ElCard>
</template>

<script setup>
import * as api from '@/api/vpp'
import { OPERATOR_STATUS } from '@/enums/vppEnum'
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateMockOperators } from './operatorMockData.js'

const router = useRouter()

const form = reactive({
  operatorName: '',
  operatorCode: '',
  operatorStatusFlag: undefined,
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
    label: '运营商名称',
    key: 'operatorName',
    type: 'input',
    placeholder: '请输入运营商名称',
    clearable: true
  },
  {
    label: '运营商编号',
    key: 'operatorCode',
    type: 'input',
    placeholder: '请输入运营商编号',
    clearable: true
  },
  {
    label: '运营商状态',
    key: 'operatorStatusFlag',
    type: 'select',
    placeholder: '请选择运营商状态',
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

const deletedIds = ref(new Set())

const getTableData = async () => {
  try {
    if (useMockData) {
      const allData = generateMockOperators(15)
      let filtered = allData.filter(item => !deletedIds.value.has(item.id))
      if (form.operatorName) {
        filtered = filtered.filter(item => item.operatorName.includes(form.operatorName))
      }
      if (form.operatorCode) {
        filtered = filtered.filter(item => item.operatorCode.includes(form.operatorCode))
      }
      if (form.operatorStatusFlag !== undefined && form.operatorStatusFlag !== '') {
        filtered = filtered.filter(item => item.operatorStatusFlag === form.operatorStatusFlag)
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
    const response = await api.getOperatorList(queryParams)
    if (response) {
      tableData.value = response.rows
      pagination.total = response.total || 0
    }
  } catch (error) {
    console.error('获取运营商列表失败:', error)
    ElMessage.error('获取运营商列表失败')
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
    name: 'VppOperatorAdd'
  })
}

function viewDetail(row) {
  router.push({
    name: 'VppOperatorDetail',
    query: { id: row.id }
  })
}

async function toggleStatus(row) {
  const action = row.operatorStatusFlag === OPERATOR_STATUS.values.DISABLED ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确认${action}该运营商吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const newStatus =
      row.operatorStatusFlag === OPERATOR_STATUS.values.DISABLED
        ? OPERATOR_STATUS.values.NORMAL
        : OPERATOR_STATUS.values.DISABLED

    await api.changeOperatorStatus({
      id: row.id,
      operatorStatusFlag: newStatus
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

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除运营商「${row.operatorName}」吗？删除后不可恢复。`, '删除确认', {
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

    await api.deleteOperator({ id: row.id })
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
