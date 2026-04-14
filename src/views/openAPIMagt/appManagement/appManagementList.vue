<template>
  <div class="product">
    <ElCard class="art-table-card" shadow="never">
      <ArtSearchBar
        ref="searchBarRef"
        v-model="form"
        :items="formItems"
        @search="onSearch"
        @reset="onReset"
      >
      </ArtSearchBar>
      <ArtAddBtn class="mb-4" @click="openDialog('add')">新增应用</ArtAddBtn>
      <el-table
        :data="tableData"
        ref="tableRef"
        border
        show-overflow-tooltip
        style="width: 100%"
        @sort-change="handleSort"
      >
        <el-table-column prop="appName" label="应用名称" min-width="180">
          <template #default="{ row }">
            <span class="cursor-pointer" @click.prevent="viewDetails(row)">
              {{ row.appName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="应用编号" min-width="180" />
        <el-table-column prop="endTime" label="有效期" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }} 至 {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-switch :model-value="row.appStatus===APP_STATUS.map.ENABLE.value" @change="toggleEnable(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastReqTime" label="最后调用时间" width="180" sortable="custom" />
        <el-table-column prop="createTime" label="创建时间" width="180" sortable="custom" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click.prevent="viewDetails(row)">详情</el-button>
            <el-button link type="danger" @click.prevent="deleteProduct(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <ArtPagination v-model="pagination" @change="getTableData" />
      <AppMangementDialog
        ref="productCategoryDialogRef"
        v-model="dialogVisible"
        @add-success="handleSuccess"
        @edit-success="handleEditSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import AppMangementDialog from "@views/openAPIMagt/appManagement/dialog/AppMangementDialog.vue";
  import {ElMessage} from "element-plus";
  import {APP_STATUS} from "@/enums/index.js";

  const router = useRouter()

  const form = reactive({
    isAsc: 'desc',
    orderByColumn: 'updateTime',
    appName: '',
    id: ''
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  const tableData = ref([])
  const dialogVisible = ref(false); // 记录弹窗是否显示

  const productCategoryList = ref([])

  /**
   * @Description 时间格式化 YYYY-MM-DD
   * @author Huang Jialin
   * @date 2026/4/14 15:09
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  /**
   * @Description 获取列表
   * @author Huang Jialin
   * @date 2026/4/14 14:58
   */
  const getTableData = async () => {
    try {
      const queryParams = {
        pageNum: pagination.current,
        pageSize: pagination.size,
        ...form
      }
      // todo 修改接口
      const response = await api.apiGetProductList(queryParams)
      if (response) {
        tableData.value = [
          {
            "appName": "而往往如此111",
            "id": "2013532097922338816",
            "endTime": "2026-04-14 15:33:30",
            "appStatus": "enable",
            "lastReqTime": "2026-04-09 16:07:57",
            "createTime": "2026-04-01 15:33:30"
          },
          {
            "appName": "而往往如此111",
            "id": "2013532097922338816",
            "endTime": "2026-04-14 15:33:30",
            "appStatus": "disable",
            "lastReqTime": "2026-04-09 16:07:57",
            "createTime": "2026-04-01 15:33:30"
          },
        ]
        pagination.total = response.total || 0
      }
    } catch (error) {
      console.error('获取应用列表失败:', error)
      ElMessage.error('获取应用列表失败')
    }
  }

  // 表单配置
  const formItems = computed(() => [
    {
      label: '应用名称',
      key: 'appName',
      type: 'input',
      placeholder: '请输入应用名称',
      clearable: true
    },
    {
      label: '应用编号',
      key: 'id',
      type: 'input',
      placeholder: '请输入应用编号',
      clearable: true
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

  /**
   * @Description 打开弹窗
   * @author Huang Jialin
   * @date 2026/4/14 13:23
   */
  const openDialog = async (type = 'add', data = null) => {
    dialogVisible.value = true
    await nextTick()
    if (type === 'add') return
  }

  /**
   * @Description 表单提交成功后回调内容
   * @author Huang Jialin
   * @date 2026/4/14 13:23
   */
  const handleSuccess = async (formData) => {
    console.log('表单提交成功:', formData)
    try {
      dialogVisible.value = false
      await nextTick()
      pagination.current = 1
      getTableData()
    } catch (error) {
      console.error('新增失败:', error)
      ElMessage.error('新增失败，请稍后重试')
    }
  }

  /**
   * @Description 编辑成功后回调内容。
   * @author Huang Jialin
   * @date 2026/4/14 13:30
   */
  const handleEditSuccess = async () => {
    // 刷新表格数据
    pagination.current = 1
    getTableData()
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

  /**
   * @Description 修改状态
   * @author Huang Jialin
   * @date 2026/4/14 16:03
   */
  async function toggleEnable(row) {
    // 先记录当前状态，用于失败回滚
    const oldStatus = row.appStatus;
    try {
      // 计算要切换成的新状态
      const newStatus = row.appStatus === APP_STATUS.map.DISABLED.value
          ? APP_STATUS.map.ENABLE.value
          : APP_STATUS.map.DISABLED.value;

      await ElMessageBox.confirm(
          `请确认${newStatus === APP_STATUS.map.ENABLE.value ? '启用' : '禁用'}该应用吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      );

      // 调用接口
      await api.apiEditProduct({
        ...row,
        appStatus: newStatus
      });
      // 接口成功 → 更新状态
      row.appStatus = newStatus;
      ElMessage.success('更新成功');

    } catch (error) {
      // 接口失败 / 取消弹窗 → 都会进这里
      console.error('更新失败', error);
      // 回滚状态
      row.appStatus = oldStatus;
      // 如果是用户取消弹窗，不提示错误
      if (error !== 'cancel') {
        ElMessage.error('更新失败');
      }
    }
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
