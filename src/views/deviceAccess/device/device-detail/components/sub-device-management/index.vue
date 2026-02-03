<template>
  <div class="min-h-full pb-5 bg-white">
    <!-- 顶部搜索区 -->
    <div class="flex items-center justify-between p-5 search-con">
      <div class="flex flex-wrap items-center">
        <el-form :model="form" inline class="" @keyup.enter="getTableData">
          <el-form-item>
            <el-input
              v-model="form.name"
              placeholder="请输入设备名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.productName"
              placeholder="请输入产品名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item>
            <el-select
              v-model="form.devState"
              placeholder="请选择状态"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="item in DEVICE_STATUS_TYPES.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-select
              v-model="form.nodeType"
              placeholder="请选择节点类型"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="item in NODE_TYPES.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button @click="getTableData"> 搜索 </el-button>
            <ArtResetBtn class="" @click="handleReset" />
          </el-form-item>
        </el-form>
      </div>

      <div class="flex items-center gap-2 op-con">
        <div
          class="text-[#767C80] bg-[#F6F7F9] rounded-md p-1.5 cursor-pointer flex-cc"
          @click="handleBatchRemove"
        >
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-unbind.png" alt="" />
          批量解绑
        </div>
        <div class="dividing-line"></div>
        <div
          text
          class="text-g-131617 bg-[#EBF4FF] rounded-md p-1.5 cursor-pointer flex-cc"
          @click="openBindDeviceDialog"
        >
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-bind.png" alt="" />
          绑定
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-md">
      <el-table
        :data="tableData"
        border
        show-overflow-tooltip
        height="520"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column prop="name" label="设备名称" min-width="140" />

        <el-table-column prop="identifier" label="设备ID" min-width="200" />

        <el-table-column prop="productName" label="所属产品" min-width="160" />

        <el-table-column prop="devState" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="DEVICE_STATUS_TYPES.getItem(row.devState)?.tag">
              {{ DEVICE_STATUS_TYPES.getLabel(row.devState) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="nodeType" label="节点类型" width="120">
          <template #default="{ row }">
            {{ NODE_TYPES.getLabel(row.nodeType) }}
          </template>
        </el-table-column>

        <el-table-column label="启用/禁用" width="120">
          <template #default="{ row }">
            <el-switch v-model="row.devEnable" @change="toggleEnable(row)" />
          </template>
        </el-table-column>

        <el-table-column prop="lastOnlineTime" label="最后上线时间" width="180" />
        <el-table-column prop="createTime" label="注册时间" width="180" />

        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="gotoDetail(row)">详情</el-button>
            <el-button link type="danger" @click="handleSingleRemove(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <ArtPagination v-model="pagination" @change="getTableData" />
    </div>

    <!-- 绑定弹窗 -->
    <BindDeviceDialog ref="bindDeviceDialogRef" @refresh="getTableData" />
  </div>
</template>

<script setup>
  import { NODE_TYPES, DEVICE_STATUS_TYPES } from '@/enums'
  import BindDeviceDialog from './bind-device-dialog.vue'
  import * as api from '@/api/iot'

  const router = useRouter()
  const route = useRoute()

  /** 查询条件 */
  const form = reactive({
    isAsc: 'desc',
    orderByColumn: 'updateTime',
    name: '',
    productName: '',
    devState: '',
    nodeType: ''
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  /** 表格数据 */
  const tableData = ref([])

  /** 分页 */
  const page = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  /** 勾选 */
  const selectedRows = ref([])

  const getTableData = async () => {
    console.log('搜索')

    const queryParams = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      parentId: route.query.id,
      ...form
    }
    const response = await api.apiGetDeviceList(queryParams)
    if (response) {
      tableData.value = response.rows
      pagination.total = response.total || 0
    }
  }

  const handleReset = () => {
    Object.assign(form, {
      name: '',
      productName: '',
      devState: '',
      nodeType: ''
    })
    getTableData()
  }

  const handleSelectionChange = (rows) => {
    selectedRows.value = rows
  }

  /** 启用禁用 */
  const toggleEnable = (row) => {
    console.log('切换状态', row)
  }

  const bindDeviceDialogRef = useTemplateRef('bindDeviceDialogRef')
  const openBindDeviceDialog = () => {
    bindDeviceDialogRef.value.open()
  }

  const gotoDetail = (item) => {
    router.push({
      name: 'DeviceDetail',
      query: {
        id: item.id
      }
    })
  }

  /** 批量移除 */
  const handleBatchRemove = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要移除的设备')
      return
    }
    ElMessageBox.confirm(
      `您本次将批量移除${selectedRows.value.length}个设备。子设备移除后，可重新进行绑定。`,
      '确定批量移除?',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        // 调用API移除设备
        const ids = selectedRows.value.map((item) => item.id)
        // 实际项目：这里换成接口
        await api.apiDevBatchUnbind({ childIds: ids })
        console.log('批量移除设备:', ids)
        ElMessage.success('批量移除成功')
        selectedRows.value = []
        getTableData()
      })
      .catch(() => {
        // 用户取消操作
      })
  }

  /** 单个移除 */
  const handleSingleRemove = (row) => {
    ElMessageBox.confirm('子设备移除后，可重新进行绑定。', '确定移除?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await api.apiDevBatchUnbind({ childIds: [row.id] })
        console.log('移除设备:', row.id)
        ElMessage.success('移除成功')
        getTableData()
      })
      .catch(() => {
        // 用户取消操作
      })
  }

  onMounted(() => {
    getTableData()
  })
</script>

<style lang="scss" scoped>
  .sub-device-management {
  }
  .dividing-line {
    height: 20px;
    width: 1px;
    background-color: #ced1d9;
  }

  @media screen and (max-width: 1600px) {
    .search-con {
      flex-direction: column;
      align-items: flex-start;
    }
    .op-con {
      margin-top: 4px;
      align-self: flex-end;
    }
  }
</style>
