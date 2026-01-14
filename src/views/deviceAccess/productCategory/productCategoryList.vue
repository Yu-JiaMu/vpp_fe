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
          <div class="flex flex-cz-center flex-sp-center add-container mr10">
            <img
              src="~@/assets/images/deviceAccess/2.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>删除</span>
          </div>
          <div class="flex flex-cz-center flex-sp-center add-container">
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
        v-loading="loading"
        element-loading-text="加载中..."
        element-loading-background="rgba(0, 0, 0, 0.1)"
      >
        <el-table-column prop="date" label="产品类别" width="180" />
        <el-table-column prop="name" label="产品品类" width="150" />
        <el-table-column prop="address" label="所属行业" width="120" />
        <el-table-column prop="tag" label="所属场景" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="120">
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
    <ProductCategoryDialog v-model="dialogVisible" @success="handleSuccess" />

    <!-- 成功弹窗 -->
    <ProductCategorySuccessDialog v-model="showSuccessDialog" @confirm="handleConfirm" />
  </div>
</template>
<script setup>
  import { router } from '@/router'
  import ProductCategoryDialog from './dialog/ProductCategoryDialog.vue'
  import ProductCategorySuccessDialog from './dialog/ProductCategorySuccessDialog.vue'
  // 从iot.js全部导入
  import * as productCategoryApi from '@/api/iot/productCategory.js'
  import { ElMessage } from 'element-plus'

  // 搜索条件
  const form = reactive({
    name: '',
    categoryType: '', // 品内类型
    industryCode: '', // 所属行业
    sceneCode: '' // 所属场景
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
      label: '品内类型',
      key: 'categoryType',
      type: 'select',
      props: {
        placeholder: '请选择品内类型',
        filterable: true,
        options: [
          { label: '类型1', value: '1' },
          { label: '类型2', value: '2' },
          { label: '类型3', value: '3' }
        ]
      }
    },
    {
      label: '所属行业',
      key: 'industryCode',
      type: 'select',
      props: {
        placeholder: '请选择所属行业',
        filterable: true,
        options: [
          { label: '工业制造', value: '1' },
          { label: '智能家居', value: '2' },
          { label: '智慧农业', value: '3' },
          { label: '智慧城市', value: '4' }
        ]
      }
    },
    {
      label: '所属场景',
      key: 'sceneCode',
      type: 'select',
      props: {
        placeholder: '请选择所属场景',
        filterable: true,
        options: [
          { label: '生产监控', value: '1' },
          { label: '环境监测', value: '2' },
          { label: '设备管理', value: '3' },
          { label: '数据分析', value: '4' }
        ]
      }
    }
  ])

  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)

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
    currentPage.value = page
    fetchTableData()
  }

  const handleClick = () => {
    console.log('click detail', router)
    router.push({ name: 'ProductCategoryDetail' })
  }

  // 获取表格数据
  const tableData = ref([])

  // 获取表格数据函数
  const fetchTableData = async () => {
    try {
      loading.value = true

      // 构建请求参数
      const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value
        // ...form
      }

      // 调用 API
      const response = await productCategoryApi.apiGetProductCategoryList(params)

      if (response.code === 200) {
        tableData.value = response.data.records || response.data.list || response.data
        pagination.total = response.data.total || response.data.totalCount || 0
        pagination.current = currentPage.value
        pagination.size = pageSize.value
      } else {
        ElMessage.error(response.message || '获取数据失败')
        tableData.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('获取表格数据失败:', error)
      ElMessage.error('网络错误，请稍后重试')
      tableData.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  // 如果没有相应的API，这里提供一个模拟数据函数
  const fetchMockData = async () => {
    try {
      loading.value = true

      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 模拟数据
      const mockData = Array.from({ length: pageSize.value }, (_, index) => {
        const startIndex = (currentPage.value - 1) * pageSize.value + index + 1
        return {
          id: startIndex,
          date: `产品类别${startIndex}`,
          name: `品类${startIndex}`,
          address: '工业制造',
          tag: '生产监控',
          updateTime: '2024-01-15 10:30:00',
          status: index % 3 === 0 ? '启用' : '禁用'
        }
      })

      tableData.value = mockData
      pagination.total = 50
      pagination.current = currentPage.value
      pagination.size = pageSize.value
    } catch (error) {
      console.error('获取模拟数据失败:', error)
      tableData.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  // 新增
  const dialogVisible = ref(false)
  const openDialog = () => {
    dialogVisible.value = true
  }

  // 成功弹窗
  const showSuccessDialog = ref(false)

  // 处理提交成功
  const handleSuccess = async (formData) => {
    console.log('表单提交成功:', formData)
    try {
      // 这里调用新增API
      // const response = await productCategoryApi.addProductCategory(formData)
      // if (response.code === 200) {
      ElMessage.success('新增成功')
      showSuccessDialog.value = true
      // 刷新表格数据
      fetchTableData()
      // } else {
      //   ElMessage.error(response.message || '新增失败')
      // }
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
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
      // ...form
    }
    productCategoryApi.apiGetProductCategoryList(params)
    // fetchTableData()
    // 如果API未就绪，先使用模拟数据
    // fetchMockData()
  })

  // 监听搜索条件变化
  watch(
    () => [currentPage.value, pageSize.value],
    () => {
      fetchTableData()
    },
    { immediate: false }
  )
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
