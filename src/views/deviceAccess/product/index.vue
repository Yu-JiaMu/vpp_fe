<template>
  <div class="product">
    <ElCard class="art-table-card" shadow="never">
      <!-- <div class="art-search-from"> -->
      <ArtSearchBar
        ref="searchBarRef"
        v-model="form"
        :items="formItems"
        :labelWidth="80"
        defaultExpanded
        :showExpand="false"
        @search="onSearch"
        @reset="onReset"
      >
      </ArtSearchBar>
      <!-- </div> -->

      <ArtAddBtn class="mb-4" @click="onNew">新增产品</ArtAddBtn>

      <el-table
        :data="tableData"
        ref="tableRef"
        border
        show-overflow-tooltip
        style="width: 100%"
        @sort-change="handleSort"
      >
        <el-table-column prop="name" label="产品名称" min-width="180">
          <template #default="{ row }">
            <span class="cursor-pointer text-theme" @click.prevent="viewDetails(row)">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="identifier" label="产品ID" min-width="180" />
        <el-table-column prop="productCategoryName" label="产品品类" min-width="120" />
        <el-table-column prop="nodeType" label="节点类型" min-width="100">
          <template #default="{ row }"> {{ NODE_TYPES.getLabel(row.nodeType) }} </template>
        </el-table-column>
        <el-table-column prop="applyLayerProtocol" label="协议类型" min-width="120" />
        <el-table-column label="启用/禁用" width="120">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="toggleEnable(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" sortable="custom" />
        <el-table-column label="操作" fixed="right" width="245">
          <template #default="{ row }">
            <el-button link type="primary" @click.prevent="viewDetails(row)">详情</el-button>
            <el-button link type="primary" @click.prevent="manageDevices(row)">管理设备</el-button>
            <el-button link type="danger" @click.prevent="deleteProduct(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <ArtPagination v-model="pagination" @change="getTableData" />
    </ElCard>
  </div>
</template>

<script setup>
  import { NODE_TYPES, PROTOCOL_TYPES_MAP } from '@/enums'
  import * as api from '@/api/iot'

  const router = useRouter()

  const form = reactive({
    isAsc: 'desc',
    orderByColumn: 'updateTime',
    name: '',
    identifier: '',
    categoryId: undefined,
    nodeType: '',
    applyLayerProtocol: '',
    enabled: undefined
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  const tableData = ref([])
  const statusOptions = ref([])

  const productCategoryList = ref([])
  // 获取产品品类列表
  const initProductCategoryList = async () => {
    try {
      const { rows } = await api.apiGetProductCategoryList({ pageNum: 1, pageSize: 1000 })
      if (rows && Array.isArray(rows)) {
        productCategoryList.value = rows.map((item) => ({
          label: item.name || item.label,
          value: item.id || item.value
        }))
        productCategoryList.value.unshift({ label: '未分类', value: -1 })
      }
    } catch (error) {
      console.error('获取产品品类列表失败:', error)
    }
  }

  // 获取产品列表
  const getTableData = async () => {
    try {
      const queryParams = {
        pageNum: pagination.current,
        pageSize: pagination.size,
        ...form
      }

      const response = await api.apiGetProductList(queryParams)
      if (response) {
        tableData.value = response.rows
        pagination.total = response.total || 0
      }
    } catch (error) {
      console.error('获取产品列表失败:', error)
      ElMessage.error('获取产品列表失败')
    }
  }

  // 表单配置
  const formItems = computed(() => [
    {
      label: '产品名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入产品名称',
      clearable: true
    },
    {
      label: '产品ID',
      key: 'identifier',
      type: 'input',
      placeholder: '请输入产品ID',
      clearable: true
    },
    {
      label: '产品品类',
      key: 'categoryId',
      type: 'select',
      props: {
        placeholder: '请选择产品品类',
        filterable: true,
        clearable: true,
        options: productCategoryList.value
      }
    },
    {
      label: '节点类型',
      key: 'nodeType',
      type: 'select',
      props: {
        placeholder: '请选择节点类型',
        filterable: true,
        clearable: true,
        options: NODE_TYPES.options
      }
    },
    {
      label: '协议类型',
      key: 'applyLayerProtocol',
      type: 'select',
      props: {
        placeholder: '请选择协议类型',
        filterable: true,
        clearable: true,
        options: PROTOCOL_TYPES_MAP.options
      }
    },
    {
      label: '启用/禁用',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '请选择',
        filterable: true,
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ])

  function onSearch() {
    pagination.current = 1
    getTableData()
  }

  const tableRef = useTemplateRef('tableRef')
  function onReset() {
    pagination.current = 1
    tableRef.value?.clearSort()
    getTableData()
  }

  function handleSort({ order, prop }) {
    // console.log('更新时间', value)
    form.orderByColumn = prop
    form.isAsc = order
    getTableData()
  }

  function onNew() {
    router.push({
      name: 'addProduct'
    })
  }

  function viewDetails(row) {
    router.push({
      name: 'productDetail',
      query: {
        id: row.id
      }
    })
  }

  function manageDevices(row) {
    console.log('管理设备', row)
    router.push({
      name: 'Device',
      query: {
        productId: row.id
      }
    })
  }

  async function deleteProduct(row) {
    try {
      await ElMessageBox.confirm('确定删除该产品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await api.apiDeleteProduct([row.id])
      ElMessage.success('删除成功')
      getTableData()
    } catch (error) {
      if (error === 'cancel') {
        console.log('已取消删除')
      } else {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  async function toggleEnable(row) {
    try {
      await ElMessageBox.confirm(`请确认${!row.enabled ? '禁用' : '启用'}该产品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await api.apiEditProduct({ ...row, enabled: row.enabled })
      ElMessage.success('更新成功')
    } catch (error) {
      row.enabled = !row.enabled // 回滚状态
      // ElMessage.error('更新失败')
    }
  }

  /*   function onPageChange(page) {
    pagination.current = page
    getTableData()
  }

  function onSizeChange(size) {
    pagination.size = size
    pagination.current = 1
    getTableData()
  } */

  onActivated(() => {
    initProductCategoryList()
    getTableData()
  })

  onMounted(() => {})
</script>

<style lang="scss" scoped>
  .action-column {
    flex: 1;
    max-width: 100%;

    .action-buttons-wrapper {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 12px;
    }

    .form-buttons {
      display: flex;
      gap: 8px;
    }

    .filter-toggle {
      display: flex;
      align-items: center;
      margin-left: 10px;
      line-height: 32px;
      color: var(--theme-color);
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: var(--ElColor-primary);
      }

      span {
        font-size: 14px;
        user-select: none;
      }

      .icon-wrapper {
        display: flex;
        align-items: center;
        margin-left: 4px;
        font-size: 14px;
        transition: transform 0.2s ease;
      }
    }
  }
</style>
