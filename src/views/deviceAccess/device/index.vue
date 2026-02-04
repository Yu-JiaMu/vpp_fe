<template>
  <div class="device-statistics-simple">
    <!-- 页面标题 -->
    <div class="page-title">设备统计</div>

    <!-- 统计卡片区域 -->
    <div class="statistics-cards-simple">
      <!-- 设备数卡片 -->
      <div class="stat-card-simple">
        <div class="card-header-simple">
          <div class="label-block gray-block"></div>
          <div class="card-label-simple">设备数</div>
        </div>
        <div class="card-value-simple">{{ staticstics.deviceNum || 0 }}</div>
      </div>

      <!-- 直连设备数卡片（默认选中样式） -->
      <div class="stat-card-simple active-card">
        <div class="card-header-simple">
          <div class="label-block blue-block"></div>
          <div class="card-label-simple active-label">直连设备数</div>
        </div>
        <div class="card-value-simple">{{ staticstics.directDeviceNum || 0 }}</div>
        <!-- 蓝色下划线 -->
        <div class="active-underline"></div>
      </div>

      <!-- 直连网关数卡片 -->
      <div class="stat-card-simple">
        <div class="card-header-simple">
          <div class="label-block orange-block"></div>
          <div class="card-label-simple">直连网关数</div>
        </div>
        <div class="card-value-simple">{{ staticstics.directGatewayNum || 0 }}</div>
      </div>

      <!-- 网关子设备数卡片 -->
      <div class="stat-card-simple">
        <div class="card-header-simple">
          <div class="label-block purple-block"></div>
          <div class="card-label-simple">网关子设备数</div>
        </div>
        <div class="card-value-simple">{{ staticstics.gatewaySubDeviceNum || 0 }}</div>
      </div>

      <!-- 在线设备数卡片 -->
      <div class="stat-card-simple">
        <div class="card-header-simple">
          <div class="label-block red-block"></div>
          <div class="card-label-simple">在线设备数（{{ onlineDeviceBFB }}）</div>
        </div>
        <div class="card-value-simple">{{ staticstics.onlineDeviceNum || 0 }}</div>
      </div>
    </div>
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
      <div class="flex mb10" style="justify-content: flex-end">
        <!-- <div class="flex flex-cz-center flex-sp-center add-container">
         
        </div> -->
        <div class="mr30">
          <el-dropdown>
            <span class="cursor-pointer el-dropdown-label">
              <el-icon color="#FFA500" class="mr5" size="14"><Grid /></el-icon>
              批量操作
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="batchExport">批量导出设备</el-dropdown-item>
                <el-dropdown-item @click="batchHandleDeviceEnableChange(true)"
                  >启用全部设备</el-dropdown-item
                >
                <el-dropdown-item @click="batchHandleDeviceEnableChange(false)"
                  >批量禁用设备</el-dropdown-item
                >
                <el-dropdown-item @click="batchDelete">批量删除设备</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div>
          <el-dropdown>
            <span class="cursor-pointer el-dropdown-label">
              <el-icon color="#246EF6" class="mr5" size="14"><Setting /></el-icon>
              设备注册
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goDeviceRegister('single')"
                  >单个设备注册</el-dropdown-item
                >
                <el-dropdown-item @click="goDeviceRegister('multiple')"
                  >多个设备注册</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <el-table
        :data="tableData"
        border
        show-overflow-tooltip
        style="width: 100%"
        ref="tableRef"
        @sort-change="handleSort"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列 -->
        <el-table-column type="selection" width="55" />

        <!-- 设备名称列 -->
        <el-table-column
          prop="name"
          label="设备名称"
          v-if="visibleColumns.includes('name')"
          width="200"
        />

        <!-- 设备ID列 -->
        <el-table-column
          prop="identifier"
          label="设备ID"
          v-if="visibleColumns.includes('identifier')"
          width="200"
        />

        <!-- 所属产品列 -->
        <el-table-column
          prop="productName"
          label="所属产品"
          v-if="visibleColumns.includes('productName')"
          width="200"
        />

        <!-- 状态列 -->
        <el-table-column
          prop="devState"
          label="状态"
          v-if="visibleColumns.includes('devState')"
          width="120"
        >
          <template #default="{ row }">
            <el-tag
              :type="
                row.devState === DEVICE_STATUS_TYPES.values.ONLINE
                  ? 'success'
                  : row.devState === DEVICE_STATUS_TYPES.values.OFFLINE
                    ? 'danger'
                    : 'warning'
              "
              size="small"
            >
              {{ DEVICE_STATUS_TYPES.getLabel(row.devState) }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 节点类型列 -->
        <el-table-column
          prop="nodeType"
          label="节点类型"
          min-width="100"
          v-if="visibleColumns.includes('nodeType')"
          width="200"
        >
          <template #default="{ row }"> {{ NODE_TYPES.getLabel(row.nodeType) }} </template>
        </el-table-column>

        <!-- 上级设备列 -->
        <el-table-column
          prop="parentDevice"
          label="上级节点设备"
          v-if="visibleColumns.includes('parentDevice')"
          width="200"
        />
        <!-- 启用/禁用列 -->
        <el-table-column
          prop="devEnable"
          label="启用/禁用"
          v-if="visibleColumns.includes('devEnable')"
          width="150"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.devEnable"
              :active-value="true"
              :inactive-value="false"
              @change="handleDeviceEnableChange(row)"
            />
          </template>
        </el-table-column>

        <!-- 标签列 -->
        <el-table-column
          prop="tagArray"
          label="标签"
          v-if="visibleColumns.includes('tagArray')"
          width="200"
        >
          <template #default="{ row }">
            <div class="flex flex-wrap gap-2">
              <el-tag type="primary" v-for="(tag, index) in row.tagArray" :key="index">
                {{ tag }}</el-tag
              >
            </div>
          </template>
        </el-table-column>

        <!-- 最后在线时间列 -->
        <el-table-column
          prop="lastOnlineTime"
          label="最后在线时间"
          v-if="visibleColumns.includes('lastOnlineTime')"
          width="200"
        />
        <!-- 创建时间列 -->
        <el-table-column
          prop="createTime"
          label="创建时间"
          v-if="visibleColumns.includes('createTime')"
          width="200"
          sortable="custom"
        />
        <!-- 操作列（固定显示） -->
        <el-table-column fixed="right" label="操作" :width="200">
          <template #header>
            <div class="flex items-center">
              <span class="mr15">操作</span>
              <!-- <el-icon size="18" class="cursor-pointer setting-icon">
                <Setting />
              </el-icon> -->
              <el-popover placement="bottom" trigger="hover" :width="200" :show-arrow="false">
                <template #reference>
                  <el-button link class="column-setting-btn">
                    <el-icon size="18"><Setting /></el-icon>
                  </el-button>
                </template>

                <!-- 列设置菜单 -->
                <div class="column-setting-menu">
                  <div class="flex items-center gap-5 menu-header">
                    <span>显示/隐藏列</span>
                    <el-button link size="small" @click="handleResetColumns"> 重置 </el-button>
                  </div>
                  <!-- <el-divider /> -->
                  <div class="column-list">
                    <div v-for="column in allColumns" :key="column.prop" class="column-item">
                      <el-checkbox
                        v-model="column.visible"
                        :label="column.label"
                        @change="handleColumnChange"
                      />
                    </div>
                  </div>
                </div>
              </el-popover>
            </div>
          </template>

          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)"> 详情 </el-button>
            <el-button link type="danger" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <ArtPagination v-model="pagination" @change="getTableData" />
    </ElCard>
  </div>
</template>

<script setup>
  import * as deviceApi from '@/api/iot'
  import { NODE_TYPES, DEVICE_STATUS_TYPES } from '@/enums'
  import { downloadFile } from '@/utils'
  import { ElMessageBox } from 'element-plus'
  const router = useRouter()
  // 这是一个静态展示组件，不需要响应式数据
  // 只包含图片中展示的卡片列表
  const staticstics = reactive({})
  const getStatistics = async () => {
    const result = await deviceApi.apiDevStatistics()
    Object.keys(result).forEach((key) => {
      staticstics[key] = result[key]
    })
  }
  const onlineDeviceBFB = computed(() => {
    return ((staticstics.onlineDeviceNum / staticstics.deviceNum) * 100).toFixed(2) + '%'
  })
  const form = reactive({
    isAsc: 'desc',
    orderByColumn: '',
    name: '',
    id: '',
    productId: '',
    devState: '',
    nodeType: ''
  })
  // 表单配置
  const formItems = computed(() => [
    {
      label: '设备名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入产品品类',
      clearable: true
    },
    {
      label: '设备ID',
      key: 'identifier',
      type: 'input',
      placeholder: '请输入设备id',
      clearable: true
    },
    {
      label: '所属产品',
      key: 'productId',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        filterable: true,
        clearable: true,
        options: produceList.value
      }
    },
    {
      label: '状态',
      key: 'devState',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        filterable: true,
        clearable: true,
        options: DEVICE_STATUS_TYPES.options
      }
    },
    {
      label: '节点类型',
      key: 'nodeType',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        filterable: true,
        clearable: true,
        options: NODE_TYPES.options
      }
    }
  ])
  //获取产品列表
  const produceList = ref([])
  const getProduceList = async () => {
    const response = await deviceApi.apiGetProductList({ pageSize: 999 })

    produceList.value = response.rows.map((item) => {
      return {
        label: item.name,
        value: item.id
      }
    })
    console.log(produceList.value)
  }
  const onReset = () => {
    pagination.current = 1
    tableRef.value?.clearSort()
    getTableData()
  }
  const onSearch = () => {
    pagination.current = 1
    tableRef.value?.clearSort()
    getTableData()
  }
  // 表格数据
  // 所有列配置
  const allColumns = reactive([
    { prop: 'name', label: '设备名称', visible: true },
    { prop: 'identifier', label: '设备ID', visible: true },
    { prop: 'productId', label: '所属产品', visible: true },
    { prop: 'devState', label: '状态', visible: true },
    { prop: 'nodeType', label: '节点类型', visible: true },
    { prop: 'parentDevice', label: '上级节点设备', visible: true },
    { prop: 'devEnable', label: '启用/禁用', visible: true },
    { prop: 'tagArray', label: '标签', visible: true },
    { prop: 'lastOnlineTime', label: '最后在线时间', visible: true },
    { prop: 'createTime', label: '创建时间', visible: true }
  ])

  // 计算属性：可见的列
  const visibleColumns = computed(() => {
    return allColumns.filter((column) => column.visible).map((column) => column.prop)
  })
  // 列设置相关方法
  const handleColumnChange = () => {
    // 保存列显示状态到本地存储
    localStorage.setItem('deviceTableColumns', JSON.stringify(allColumns))
  }
  const handleResetColumns = () => {
    allColumns.forEach((column) => {
      column.visible = true
    })
    localStorage.removeItem('deviceTableColumns')
  }
  // 加载保存的列设置
  const loadColumnSettings = () => {
    const savedColumns = localStorage.getItem('deviceTableColumns')
    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns)
        allColumns.forEach((column, index) => {
          if (parsedColumns[index]) {
            column.visible = parsedColumns[index].visible
          }
        })
      } catch (error) {
        console.error('加载列设置失败:', error)
      }
    }
  }
  const tableData = ref([])
  const selectedRows = ref([])
  // 分页数据
  const tableRef = ref(null)
  const pagination = reactive({
    size: 10,
    current: 1,
    total: 10
  })
  const handleSort = ({ order, prop }) => {
    // console.log('更新时间', value)
    console.log(order, prop)
    form.orderByColumn = prop
    form.isAsc = order
    getTableData()
  }
  const handleQueryParams = () => {
    const queryParams = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...Object.keys(form).reduce((acc, key) => {
        if (form[key] !== '' && form[key] !== undefined && form[key] !== null) {
          acc[key] = form[key]
        }
        return acc
      }, {})
    }
    return queryParams
  }
  const getTableData = async () => {
    // deviceApi
    try {
      const QueryParamsRes = handleQueryParams()
      const response = await deviceApi.apiGetDeviceList(QueryParamsRes)
      if (response) {
        tableData.value = response.rows
        pagination.total = response.total || 0
      }
    } catch (error) {
      console.error('列表失败:', error)
      ElMessage.error('设备列表失败')
    }
  }
  // 处理表格选择变化
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
    console.log('选中了', selectedRows.value.length, '条记录')
  }
  //单个设备状态
  const handleDeviceEnableChange = async (row) => {
    await deviceApi.apiDevUpdateStatus(row.devEnable, [row.id])
    ElMessage.success('状态修改成功')
    getTableData()
  }
  //批量设备状态 type 启用或禁用
  const batchHandleDeviceEnableChange = async (type = true) => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择操作的设备')
      return
    }
    const deviceIds = selectedRows.value.map((item) => item.id)
    await deviceApi.apiDevUpdateStatus(type, deviceIds)
    ElMessage.success('状态修改成功')
    getTableData()
  }
  //批量导出
  const batchExport = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择操作的设备')
      return
    }
    // const QueryParamsRes = handleQueryParams()
    const deviceIds = selectedRows.value.map((item) => item.id)
    const result = await deviceApi.apiDevExport(deviceIds)
    downloadFile(result, '设备列表', 'xlsx')
  }
  //批量删除
  const batchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择操作的设备')
      return
    }
    const deviceIds = selectedRows.value.map((item) => item.id)
    await deviceApi.apiDevDelete(deviceIds)
    ElMessage.success('状态修改成功')
    getTableData()
  }
  // 操作按钮处理函数
  const handleDetail = (row) => {
    console.log('查看详情:', row)
    // ElMessage.info(`查看 ${row.name} 详情`)
    router.push({ name: 'DeviceDetail', query: { id: row.id } })
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
      await deviceApi.apiDevDelete([row.id])
      ElMessage.success('删除成功')
      getTableData() // 刷新表格
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }
  // 设备注册跳转
  const goDeviceRegister = (type) => {
    router.push({ name: 'DeviceRegister', query: { registerType: type } })
  }

  onActivated(() => {
    getStatistics()
    loadColumnSettings()
    getProduceList()
    getTableData()
  })
</script>

<style lang="scss" scoped>
  .device-statistics-simple {
    padding: 20px;
    background-color: #f0f2f5; /* 浅灰色背景 */
    min-height: calc(100vh - 40px);
    box-sizing: border-box;

    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: #333;
      margin-bottom: 10px;
    }

    .statistics-cards-simple {
      display: flex;
      gap: 16px;

      .stat-card-simple {
        flex: 1;
        background-color: #ffffff;
        border-radius: 8px; /* 圆角 */
        padding: 20px 16px;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        .card-header-simple {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .label-block {
            width: 8px;
            height: 8px;
            border-radius: 2px; /* 小方块的圆角 */
            margin-right: 8px;
            flex-shrink: 0;
          }

          .gray-block {
            background-color: #8c8c8c; /* 灰色小块 */
          }

          .blue-block {
            background-color: #38ecf2; /* 蓝色小块 */
          }

          .orange-block {
            background-color: #fa8c16; /* 橙色小块 */
          }

          .purple-block {
            background-color: #722ed1; /* 紫色小块 */
          }

          .red-block {
            background-color: #f5222d; /* 红色小块 */
          }

          .card-label-simple {
            font-size: 15px;
            color: #303537;
            font-weight: 400;
            line-height: 1.4;
          }
        }

        .card-value-simple {
          font-size: 42px;
          font-weight: 400;
          color: #303537;
          margin-top: auto; /* 将数字推到卡片底部 */
          padding-top: 20px;
          margin-left: 10px;
        }

        .active-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #38ecf2; /* 蓝色下划线 */
          border-radius: 0 0 8px 8px;
        }
      }
    }
  }

  /* 设置图标样式 */
  .setting-icon {
    color: #409eff;
    // transition: all 0.3s;
  }

  // .setting-icon:hover {
  //   color: #66b1ff;
  //   transform: rotate(90deg);
  // }

  /* 下拉菜单项样式 */
  .dropdown-item-content {
    display: flex;
    align-items: center;
    min-width: 120px;
  }

  .dropdown-item-content .el-checkbox {
    margin-right: 8px;
  }

  .dropdown-item-content span {
    color: #606266;
  }

  /* 操作按钮样式 */
  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .action-buttons .el-button {
    padding: 0 4px;
    height: 24px;
    min-height: 24px;
  }

  /* 表头样式优化 */
  :deep(.el-table__header-wrapper) {
    .el-table__header th {
      background-color: #f5f7fa;
    }

    .el-table__cell {
      padding: 8px 0;
    }
  }

  /* 复选框选中样式 */
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #409eff;
    border-color: #409eff;
  }

  /* 表格行悬停效果 */
  :deep(.el-table__body tr:hover > td) {
    background-color: #f5f7fa;
  }
  .el-dropdown-label {
    color: #303537;
    font-size: 13px;
    display: flex;
    align-items: center;
  }
  .column-item {
    border-bottom: 1px solid #edeef3;
    padding: 3px 0;
    &:last-child {
      border-bottom: none !important;
    }
  }
</style>
