<template>
  <div>
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
      </ArtSearchBar>
      <div class="flex flex-space-between mb10">
        <div class="flex flex-cz-center flex-sp-center add-container" @click="openDialog">
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
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="categoryType" label="品类类别">
          <template #default="{ row }">
            {{ formatCategoryType(row.categoryType) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="产品品类">
          <template #default="{ row }">
            <div class="flex flex-cz-center text-theme cursor-pointer">
              <span class="mr5">{{ row.name }}</span>
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
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="industryCode" label="所属行业" />
        <el-table-column prop="sceneCode" label="所属场景" />
        <el-table-column prop="updateTime" label="更新时间" />
        <el-table-column fixed="right" label="操作">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>

            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <ArtPagination
        :pagination="pagination"
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ProductCategoryDialog
      ref="productCategoryDialogRef"
      v-model="dialogVisible"
      @success="handleSuccess"
    />

    <!-- 成功弹窗 -->
    <ProductCategorySuccessDialog v-model="showSuccessDialog" @confirm="handleConfirm" />
  </div>
</template>

<script setup>
  import { router } from '@/router'
  import ProductCategoryDialog from './dialog/ProductCategoryDialog.vue'
  import ProductCategorySuccessDialog from './dialog/ProductCategorySuccessDialog.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  // 从iot.js全部导入
  import * as productCategoryApi from '@/api/iot/productCategory.js'
  import { Warning } from '@element-plus/icons-vue'

  // 搜索条件
  const form = reactive({
    name: '',
    categoryType: '', // 品内类型
    industryCode: '', // 所属行业
    sceneCode: '', // 所属场景
    industryCodeAndsceneCode: []
  })

  // 搜索
  function onSearch() {
    currentPage.value = 1
    fetchTableData()
  }

  // 重置
  function onReset() {
    // 重置表单
    Object.keys(form).forEach((key) => {
      form[key] = ''
    })
    currentPage.value = 1
    fetchTableData()
  }

  // 品类类型选项
  const categoryTypeOptions = [
    { label: '内设', value: 'inner' },
    { label: '自定义', value: 'define' }
  ]

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
      label: '品类类型',
      key: 'categoryType',
      type: 'select',
      props: {
        placeholder: '请选择品类类型',
        filterable: true,
        options: categoryTypeOptions
      }
    },
    {
      label: '所属行业',
      key: 'industryCodeAndsceneCode',
      type: 'cascader',
      width: '300px',
      props: {
        placeholder: '请选择所属行业',
        filterable: true,
        options: industryOptions.value
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

  const currentPage = ref(1)
  const pageSize = ref(10)
  const tableRef = ref()
  const selectedRows = ref([])

  // 分页数据
  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })

  function onSizeChange(size) {
    pageSize.value = size
    currentPage.value = 1
    fetchTableData()
  }

  function onPageChange(page) {
    console.log(page)
    currentPage.value = page
    fetchTableData()
  }

  // 处理表格选择变化
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
    console.log('选中了', selectedRows.value.length, '条记录')
  }

  // 获取表格数据
  const tableData = ref([])

  // 格式化品类类型显示
  const formatCategoryType = (type) => {
    const map = {
      inner: '内设',
      define: '自定义'
    }
    return map[type] || type
  }

  // 格式化物模型状态
  const formatThingModelStatus = (thingModelJson) => {
    return thingModelJson ? true : false
  }

  const handleIndustryChange = (type = 'industryCode') => {
    if (form.industryCodeAndsceneCode.length === 0) {
      form.industryCode = ''
      form.sceneCode = ''
      return undefined
    }
    if (type === 'industryCode') return form.industryCodeAndsceneCode[0] || ''
    if (type === 'sceneCode') return form.industryCodeAndsceneCode[1] || ''
  }

  // 获取表格数据函数
  const fetchTableData = async () => {
    try {
      // 构建请求参数
      const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        // 搜索条件
        name: form.name || undefined,
        categoryType: form.categoryType || undefined,
        industryCode: handleIndustryChange('industryCode'),
        sceneCode: handleIndustryChange('sceneCode')
      }
      console.log('请求参数:', params)

      // 调用 API
      const response = await productCategoryApi.apiGetProductCategoryList(params)
      console.log(response, 'responseresponseresponseresponse')

      if (response.code === 200) {
        // API返回的数据是 response.rows
        const apiData = response.rows || []
        // 转换数据格式以匹配表格列
        tableData.value = apiData.map((item) => ({
          id: item.id,
          name: item.name, // 产品品类
          categoryType: item.categoryType, // 品类类型
          industryCode: item.industryCode, // 所属行业
          sceneCode: item.sceneCode, // 所属场景
          updateTime: item.updateTime, // 更新时间
          thingModelStatus: formatThingModelStatus(item.thingModelJson), // 物模型状态
          createBy: item.createBy, // 创建人
          // 保留原始数据
          rawData: item
        }))
        pagination.total = response.total || 0
        pagination.current = currentPage.value
        pagination.size = pageSize.value
      } else {
        ElMessage.error(response.msg || '获取数据失败')
        tableData.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('获取表格数据失败:123', error)
      ElMessage.error('网络错误，请稍后重试')
      tableData.value = []
      pagination.total = 0
    }
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
      fetchTableData() // 刷新表格
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
          fetchTableData() // 刷新表格
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

  // 单个导出物模型
  const handleExportSingle = (row) => {
    if (!row.rawData?.thingModelJson) {
      ElMessage.warning('该产品品类未配置物模型')
      return
    }

    try {
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    }
  }

  // 批量导出物模型
  const handleExportThingModel = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要导出的产品品类')
      return
    }

    const hasThingModelRows = selectedRows.value.filter((row) => row.rawData?.thingModelJson)
    if (hasThingModelRows.length === 0) {
      ElMessage.warning('选中的产品品类均未配置物模型')
      return
    }

    try {
      // 如果只选择了一个且有物模型，导出单个
      if (hasThingModelRows.length === 1) {
        handleExportSingle(hasThingModelRows[0])
        return
      }

      // 批量导出多个
      ElMessageBox.confirm(
        `将导出选中的 ${hasThingModelRows.length} 个物模型，是否继续？`,
        '批量导出确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
        .then(async () => {
          // 批量导出接口调用
          const categoryIds = hasThingModelRows.map((row) => row.id)

          try {
            // 调用批量导出接口
            const response = await productCategoryApi.batchExportThingModel(categoryIds)

            if (response.code === 200) {
              if (response.data && response.data.downloadUrl) {
                // 如果有下载链接，直接下载
                window.open(response.data.downloadUrl, '_blank')
                ElMessage.success('批量导出成功，开始下载')
              } else if (response.data && response.data.fileContent) {
                // 如果有文件内容，创建下载
                const blob = new Blob([response.data.fileContent], { type: 'application/zip' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `物模型批量导出_${new Date().getTime()}.zip`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                ElMessage.success('批量导出成功，开始下载')
              } else {
                ElMessage.success('批量导出请求已提交，请稍后查看下载')
              }
            } else {
              ElMessage.error(response.msg || '批量导出失败')
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
    if (type === 'add') return
    await nextTick()
    if (productCategoryDialogRef.value && productCategoryDialogRef.value.initFormData) {
      console.log(data)
      productCategoryDialogRef.value.initFormData(data)
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
  const handleSuccess = async (formData) => {
    console.log('表单提交成功:', formData)
    if (formData.id) return
    try {
      // 这里调用新增API
      const response = await productCategoryApi.addProductCategory(formData)
      if (response.code === 200) {
        ElMessage.success('新增成功')
        showSuccessDialog.value = true
        // 刷新表格数据
        fetchTableData()
      } else {
        ElMessage.error(response.msg || '新增失败')
      }
    } catch (error) {
      console.error('新增失败:', error)
      ElMessage.error('新增失败，请稍后重试')
    }
  }

  const handleConfirm = () => {
    console.log('确认操作')
    showSuccessDialog.value = false
  }

  // 页面加载时获取数据
  onMounted(() => {
    getIndustryList()
    fetchTableData()
  })
</script>

<style lang="scss" scoped>
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
