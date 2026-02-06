<template>
  <div class="product-category-list">
    <ElCard class="art-table-card" shadow="never">
      <ArtSearchBar
        ref="searchBarRef"
        v-model="form"
        :items="formItems"
        :labelWidth="80"
        defaultExpanded
        :showExpand="false"
        @reset="onReset"
        @search="onSearch"
      >
        <!-- <el-cascader
          style="width: 100%"
          v-model="form.industryCodeAndsceneCode"
          :options="industryOptions"
          :props="{
            expandTrigger: 'hover'
          }"
        /> -->
      </ArtSearchBar>
      <div class="flex flex-space-between mb10">
        <div class="flex flex-cz-center flex-sp-center add-container" @click="openDialog('add')">
          <img
            src="~@/assets/images/deviceAccess/1.png"
            style="width: 20px; height: 20px"
            class="mr5"
          />
          <span>新增产品品类</span>
        </div>
        <div class="flex">
          <div
            class="flex flex-cz-center flex-sp-center add-container mr10"
            @click="handleBatchDelete"
          >
            <img
              src="~@/assets/images/deviceAccess/2.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>删除</span>
          </div>
          <div
            class="flex flex-cz-center flex-sp-center add-container"
            @click="handleExportThingModel"
          >
            <img
              src="~@/assets/images/deviceAccess/3.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>导出物模型</span>
          </div>
        </div>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        border
        show-overflow-tooltip
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSort"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="categoryType" label="品类类别">
          <template #default="{ row }">
            {{ INTERNAL_DEVICE_TYPES.getLabel(row.categoryType) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="产品品类" min-width="120">
          <template #default="{ row }">
            <span class="cursor-pointer text-theme">
              <span class="mr5" @click="handleDetail(row)">{{ row.name }}</span>
              <template v-if="!row.thingModelStatus">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="该产品品类还未定义物模型。"
                  placement="top"
                >
                  <el-icon :size="18"><Warning /></el-icon>
                </el-tooltip>
              </template>
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="industry" label="所属行业" />
        <el-table-column prop="scene" label="所属场景" />
        <el-table-column prop="updateTime" label="更新时间" sortable="custom" />
        <el-table-column fixed="right" label="操作">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)"> 详情 </el-button>
            <template v-if="INTERNAL_DEVICE_TYPES.values.DEFINE === row.categoryType">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <ArtPagination v-model="pagination" @change="getTableData" />
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ProductCategoryDialog
      ref="productCategoryDialogRef"
      v-model="dialogVisible"
      @add-success="handleSuccess"
      @edit-success="handleEditSuccess"
    />

    <!-- 成功弹窗 -->
    <ProductCategorySuccessDialog
      ref="productCategorySuccessDialogRef"
      v-model="showSuccessDialog"
      @confirm="handleConfirm"
      @goToModelDefinition="goToModelDefinition"
    />
  </div>
</template>

<script setup>
  import ProductCategoryDialog from './dialog/ProductCategoryDialog.vue'
  import ProductCategorySuccessDialog from './dialog/ProductCategorySuccessDialog.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  // 从iot.js全部导入
  import * as productCategoryApi from '@/api/iot/productCategory.js'
  import { Warning } from '@element-plus/icons-vue'
  import { INTERNAL_DEVICE_TYPES } from '@/enums'
  import { downloadFile } from '@/utils'
  const router = useRouter()
  // 搜索条件
  const form = reactive({
    isAsc: 'desc',
    orderByColumn: 'updateTime',
    name: '',
    categoryType: '', // 品内类型
    industryCode: '', // 所属行业
    sceneCode: '', // 所属场景
    industryCodeAndsceneCode: []
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: '产品品类',
      key: 'name',
      type: 'input',
      placeholder: '请输入产品品类',
      clearable: true
    },
    {
      label: '品类类别',
      key: 'categoryType',
      type: 'select',
      props: {
        placeholder: '请选择品类类别',
        filterable: true,
        options: INTERNAL_DEVICE_TYPES.options,
        clearable: true
      }
    },
    {
      label: '所属行业',
      key: 'industryCodeAndsceneCode',
      type: 'cascader',
      width: '100%',
      props: {
        placeholder: '请选择所属行业',
        filterable: true,
        options: industryOptions.value,
        clearable: true
      }
    }
  ])

  // 行业选项（根据实际数据动态生成）
  const industryOptions = ref([])

  // 场景选项（根据实际数据动态生成）
  const sceneOptions = ref([])

  //获取行业 场景选项
  async function getIndustryList(params) {
    try {
      const response = await productCategoryApi.apiGetIndustryList(params)

      // 数据处理：为子项添加 value 属性
      const processedData = response.map((industry) => ({
        ...industry,
        children: (industry.children || []).map((child) => ({
          ...child,
          value: child.code
        }))
      }))

      // 设置行业选项
      industryOptions.value = processedData.map((industry) => ({
        label: industry.label,
        value: industry.code,
        children: industry.children || []
      }))

      // 设置场景选项（从所有子项中提取）
      sceneOptions.value = processedData.reduce((scenes, industry) => {
        const industryScenes = (industry.children || []).map((child) => ({
          label: child.label,
          value: child.code
        }))
        return [...scenes, ...industryScenes]
      }, [])

      return processedData
    } catch (error) {
      console.error('获取行业列表失败:', error)
      industryOptions.value = []
      sceneOptions.value = []
      throw error
    }
  }
  // 分页数据
  const tableRef = useTemplateRef('tableRef')
  const selectedRows = ref([])
  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  function onSearch() {
    pagination.current = 1
    getTableData()
  }

  function onReset() {
    pagination.current = 1
    tableRef.value?.clearSort()
    getTableData()
  }
  // 处理表格选择变化
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
    console.log('选中了', selectedRows.value.length, '条记录')
  }

  // 获取表格数据
  const tableData = ref([])

  // 获取表格数据函数
  const getTableData = async () => {
    try {
      const queryParams = {
        pageNum: pagination.current,
        pageSize: pagination.size,
        ...form
      }
      if (queryParams.industryCodeAndsceneCode?.length > 0) {
        queryParams.industryCode = queryParams.industryCodeAndsceneCode[0]
        queryParams.sceneCode = queryParams.industryCodeAndsceneCode[1]
      }
      delete queryParams.industryCodeAndsceneCode
      const response = await productCategoryApi.apiGetProductCategoryList(queryParams)
      if (response) {
        tableData.value = response.rows
        tableData.value = tableData.value.map((table) => {
          return {
            ...table,
            thingModelStatus: formatThingModelStatus(table.thingModelJson) // 物模型状态
          }
        })
        pagination.total = response.total || 0
      }
    } catch (error) {
      console.error('获取产品列表失败:', error)
      ElMessage.error('获取产品列表失败')
    }
  }
  const handleSort = ({ order, prop }) => {
    // console.log('更新时间', value)
    form.orderByColumn = prop
    form.isAsc = order
    getTableData()
  }
  // 格式化物模型状态
  const formatThingModelStatus = (thingModelJson) => {
    if (!thingModelJson) {
      return false
    }

    // 支持传入字符串或对象
    let model = thingModelJson
    if (typeof thingModelJson === 'string') {
      try {
        model = JSON.parse(thingModelJson)
      } catch (e) {
        console.log(e)
        return false
      }
    }

    const modules = Array.isArray(model.modules) ? model.modules : []
    if (modules.length === 0) return false

    // 如果任一模块中 events/functions/properties 有数据，则认为已定义物模型
    for (const m of modules) {
      const hasEvents = Array.isArray(m.events) && m.events.length > 0
      const hasFunctions = Array.isArray(m.functions) && m.functions.length > 0
      const hasProperties = Array.isArray(m.properties) && m.properties.length > 0
      if (hasEvents || hasFunctions || hasProperties) return true
    }

    return false
  }

  // 处理详情
  const handleDetail = (row) => {
    console.log('查看详情:', row)
    router.push({
      name: 'ProductCategoryDetail',
      query: { id: row.id }
      // params: { id: row.id }
    })
  }
  const goToModelDefinition = (e) => {
    handleDetail(e)
  }
  // 处理删除
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(`确定要删除产品品类 "${row.name}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 调用删除API
      await productCategoryApi.apiProductCategoryDelete([row.id])
      ElMessage.success('删除成功')
      getTableData() // 刷新表格
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的产品品类')
      return
    }
    //包含内置
    const isInner = selectedRows.value.some(
      (item) => item.categoryType === INTERNAL_DEVICE_TYPES.values.INNER
    )
    if (isInner) {
      ElMessage.warning('内置产品品类不能删除')
      return
    }
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          // 调用批量删除API
          const ids = selectedRows.value.map((row) => row.id)
          await productCategoryApi.apiProductCategoryDelete(ids)
          ElMessage.success(`成功删除 ${selectedRows.value.length} 条记录`)
          getTableData() // 刷新表格
          // 清空选中状态
          tableRef.value.clearSelection()
          selectedRows.value = []
        } catch (error) {
          console.error('批量删除失败:', error)
          ElMessage.error('批量删除失败')
        }
      })
      .catch(() => {
        // 用户取消
      })
  }
  // 批量导出物模型
  const handleExportThingModel = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要导出的产品品类')
      return
    }

    const hasThingModelRows = selectedRows.value.every((row) => row.thingModelJson)
    if (!hasThingModelRows) {
      ElMessage.warning('选中的产品品类中未配置物模型')
      return
    }

    try {
      // 如果只选择了一个且有物模型，导出单个
      // 批量导出多个
      ElMessageBox.confirm(
        `将导出选中的 ${selectedRows.value.length} 个物模型，是否继续？`,
        '批量导出确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
        .then(async () => {
          // 批量导出接口调用
          const categoryIds = selectedRows.value.map((row) => row.id)

          try {
            // 调用批量导出接口
            const response = await productCategoryApi.apiProductCategoryExport(categoryIds)
            if (categoryIds.length === 1) {
              const name = selectedRows.value.map((row) => row.name) || []
              downloadFile(response, name[0])
            } else {
              downloadFile(response, '产品品类-物模型', 'zip')
            }
          } catch (error) {
            console.error('批量导出失败:', error)
            ElMessage.error('批量导出失败')
          }
        })
        .catch(() => {
          // 用户取消
        })
    } catch (error) {
      console.error('批量导出失败:', error)
      ElMessage.error('批量导出失败')
    }
  }

  // 新增
  // 1. 为子组件添加 ref
  const productCategoryDialogRef = ref(null)
  const dialogVisible = ref(false)
  const openDialog = async (type = 'add', data = null) => {
    dialogVisible.value = true
    await nextTick()
    if (type === 'add') return
    if (productCategoryDialogRef.value && productCategoryDialogRef.value.initFormData) {
      await productCategoryDialogRef.value.initFormData(data)
    }
  }

  // 处理编辑
  const handleEdit = async (row) => {
    console.log('编辑:', row)
    const res = await productCategoryApi.apiProductCategoryDetail(row.id)
    console.log(res)
    openDialog('edit', res)
  }

  // 成功弹窗
  const showSuccessDialog = ref(false)

  // 处理提交成功
  const productCategorySuccessDialogRef = ref(null)
  const handleSuccess = async (formData) => {
    console.log('表单提交成功:', formData)
    try {
      // 这里调用新增API
      // await productCategoryApi.addProductCategory(formData)
      showSuccessDialog.value = true
      await nextTick()
      console.log(productCategorySuccessDialogRef.value.setId)
      if (productCategorySuccessDialogRef.value && productCategorySuccessDialogRef.value.setId) {
        productCategorySuccessDialogRef.value.setId(formData.id)
      }
      // 刷新表格数据
      pagination.current = 1
      getTableData()
    } catch (error) {
      console.error('新增失败:', error)
      ElMessage.error('新增失败，请稍后重试')
    }
  }
  const handleEditSuccess = async () => {
    // 刷新表格数据
    pagination.current = 1
    getTableData()
  }
  const handleConfirm = () => {
    console.log('确认操作')
    showSuccessDialog.value = false
  }

  // 页面加载时获取数据
  onActivated(() => {
    getIndustryList()
    getTableData()
  })
</script>

<style lang="scss" scoped>
  .product-category-list {
    :deep(.el-cascader) {
      width: 298px !important;
    }
  }
  .add-container {
    cursor: pointer;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background: #e4e7ed;
    }

    span {
      color: #606266;
      font-size: 14px;
    }
  }

  .flex {
    display: flex;
  }

  .flex-space-between {
    justify-content: space-between;
  }

  .flex-cz-center {
    align-items: center;
  }

  .flex-sp-center {
    justify-content: center;
  }

  .mb10 {
    margin-bottom: 10px;
  }

  .mr5 {
    margin-right: 5px;
  }

  .mr10 {
    margin-right: 10px;
  }
</style>
