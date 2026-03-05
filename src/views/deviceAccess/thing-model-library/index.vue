<template>
  <div class="product">
    <ElCard class="art-table-card" shadow="never">
      <!-- <div class="art-search-from"> -->
      <ArtSearchBar
        ref="searchBarRef"
        v-model="form"
        :items="formItems"
        :labelWidth="82"
        defaultExpanded
        :showExpand="false"
        @search="onSearch"
        @reset="onReset"
      >
      </ArtSearchBar>
      <!-- </div> -->

      <div class="flex justify-between items-center">
        <ArtAddBtn class="mb-4" @click="openCustomFunctionDialog()">新增功能点</ArtAddBtn>
        <el-dropdown>
          <span class="cursor-pointer el-dropdown-label flex items-center">
            <ArtSvgIcon
              icon="ri:settings-3-fill"
              class="mr-1.5 text-xl text-[#0E79F3]"
            ></ArtSvgIcon>
            批量操作
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleImportModel">批量导入</el-dropdown-item>
              <el-dropdown-item @click="handleExportModel">批量导出</el-dropdown-item>
              <el-dropdown-item @click="handleBatchDelete">批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        border
        stripe
        class="w-full"
        show-overflow-tooltip
        @selection-change="handleSelectionChange"
        @sort-change="handleSort"
      >
        <el-table-column type="selection" />
        <el-table-column prop="type" label="功能类型" width="100" />
        <el-table-column prop="source" label="功能来源" width="100" />
        <el-table-column prop="name" label="功能名称" width="120" />
        <el-table-column prop="identifier" label="标识符" width="160" />
        <el-table-column prop="dataType" label="数据类型" width="140" />

        <!-- 数据定义 -->
        <el-table-column label="数据定义" min-width="260">
          <template #default="{ row }">
            <FunctionDefinePreview :row="row" />
          </template>
        </el-table-column>

        <el-table-column prop="accessMode" label="读写类型" width="100" />

        <el-table-column
          prop="originData.updateTime"
          label="更新时间"
          width="180"
          sortable="custom"
        />
        <!-- 操作 -->
        <el-table-column label="操作" :width="160" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="primary" link @click="openCustomFunctionDialog(row, $index, 'look')">
              详情
            </el-button>
            <template v-if="row.originData.functionType === THING_SOURCE_MAP.values.CUSTOM">
              <el-button type="primary" link @click="openCustomFunctionDialog(row, $index, 'edit')">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleRemove(row, $index)"> 删除 </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <ArtPagination v-model="pagination" @change="getTableData" />
    </ElCard>

    <!-- 导入物模型弹窗 -->
    <ImportModelDialog ref="importModelDialogRef" :info="{}" module="library" @refresh="onSearch" />

    <!-- 添加自定义功能点 -->
    <AddCustomFunctionPointDialog
      ref="addCustomFunctionPointDialogRef"
      :tableData="tableData"
      module="library"
      @addFunctionPoint="addCustomPoint"
    />
  </div>
</template>

<script setup>
  import { FUNCTION_MODE_MAP, THING_SOURCE_MAP, DATA_TYPE_MAP, ACCESS_MODE_MAP } from '@/enums'
  import { buildRow } from '@/utils'
  import * as api from '@/api/iot'
  import { downloadFile } from '@/utils'

  const router = useRouter()

  const isReadOnly = ref(false)
  provide('isReadOnly', isReadOnly)

  const form = reactive({
    isAsc: 'desc',
    orderByColumn: 'updateTime'
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  const tableData = ref([])

  const getTableData = async () => {
    try {
      const queryParams = {
        pageNum: pagination.current,
        pageSize: pagination.size,
        ...form
      }

      const response = await api.apiThingModelList(queryParams)
      if (response) {
        tableData.value = response.rows.map((item) => buildRow(item))
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
      label: '物模型名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入物模型名称',
      clearable: true
    },
    {
      label: '功能类型',
      key: 'functionMode',
      type: 'select',
      props: {
        placeholder: '请选择功能类型',
        filterable: true,
        clearable: true,
        options: FUNCTION_MODE_MAP.options
      }
    },
    {
      label: '功能类别',
      key: 'functionType',
      type: 'select',
      props: {
        placeholder: '请选择功能类别',
        filterable: true,
        clearable: true,
        options: THING_SOURCE_MAP.options
      }
    },
    {
      label: '数据类型',
      key: 'dataType',
      type: 'select',
      props: {
        placeholder: '请选择数据类型',
        filterable: true,
        clearable: true,
        options: DATA_TYPE_MAP.options
      }
    }
  ])

  function onSearch() {
    pagination.current = 1
    getTableData()
  }

  /* ====================== 表格选择 ====================== */

  const tableRef = useTemplateRef('tableRef')
  const selectedItems = ref([])

  const handleSelectionChange = (selection) => {
    selectedItems.value = selection
  }

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

  const addCustomPoint = async ({ data, functionMode, isAddPoint }) => {
    // console.log('###', data, functionMode)
    if (isAddPoint) {
      await api.apiThingModelAdd(data)
      ElMessage.success('新增成功')
      onReset()
    } else {
      await api.apiThingModelEdit(data)
      ElMessage.success('编辑成功')
      getTableData()
    }
  }

  /* ====================== Dialog ====================== */
  const addCustomFunctionPointDialogRef = useTemplateRef('addCustomFunctionPointDialogRef')
  const originalIdentifier = ref(null) // 保存原始identifier
  const openCustomFunctionDialog = (row, index, type) => {
    isReadOnly.value = type === 'look'
    originalIdentifier.value = row?.identifier || null // 保存原始identifier
    addCustomFunctionPointDialogRef.value.open(row, index, type)
  }

  const importModelDialogRef = useTemplateRef('importModelDialogRef')
  const handleImportModel = async () => {
    importModelDialogRef.value.open()
  }

  const handleExportModel = async () => {
    if (selectedItems.value.length === 0) {
      ElMessage.warning('请先选择要导出的功能点')
      return
    }

    try {
      await ElMessageBox.confirm(
        `将导出选中的 ${selectedItems.value.length} 个功能点，是否继续？`,
        '批量导出确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      const ids = selectedItems.value.map((item) => item.id)
      const response = await api.apiThingModelExport(ids)

      if (ids.length === 1) {
        const name = selectedItems.value[0].name || '物模型'
        downloadFile(response, name)
      } else {
        downloadFile(response, '物模型', 'zip')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量导出失败:', error)
        ElMessage.error('批量导出失败')
      }
    }
  }

  const handleBatchDelete = async () => {
    if (selectedItems.value.length === 0) {
      return ElMessage.warning('请先选择要删除的功能点')
    }

    // 分离系统和自定义功能点
    const customItems = selectedItems.value.filter(
      (item) => item.originData.functionType === THING_SOURCE_MAP.values.CUSTOM
    )

    if (customItems.length === 0) {
      return ElMessage.warning('选中的全是系统功能点，无法删除')
    }

    try {
      await ElMessageBox.confirm(
        '内置功能点不允许删除，仅支持删除自定义功能点，您确定要删除所有勾选的自定义功能点吗?',
        '提示',
        {
          type: 'warning'
        }
      )

      // 执行删除
      const ids = customItems.map((item) => item.id)
      await api.apiThingModelDelete(ids)

      ElMessage.success(`删除成功`)

      // 清空选择并刷新列表
      tableRef.value?.clearSelection()
      getTableData()
    } catch (err) {
      // 用户取消操作
    }
  }

  const handleRemove = async (row, index) => {
    if (row.source === THING_SOURCE_MAP.values.SYSTEM) {
      return ElMessage.error('系统功能点不可删除')
    }
    try {
      await ElMessageBox.confirm('此操作将删除该功能点，是否继续？', '提示', {
        type: 'warning'
      })

      await api.apiThingModelDelete([row.id])
      ElMessage.success('删除成功')
      getTableData()
    } catch (err) {}
  }

  onActivated(() => {
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
