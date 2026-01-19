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
        <div class="card-value-simple">0</div>
      </div>

      <!-- 直连设备数卡片（默认选中样式） -->
      <div class="stat-card-simple active-card">
        <div class="card-header-simple">
          <div class="label-block blue-block"></div>
          <div class="card-label-simple active-label">直连设备数</div>
        </div>
        <div class="card-value-simple">0</div>
        <!-- 蓝色下划线 -->
        <div class="active-underline"></div>
      </div>

      <!-- 直连网关数卡片 -->
      <div class="stat-card-simple">
        <div class="card-header-simple">
          <div class="label-block orange-block"></div>
          <div class="card-label-simple">直连网关数</div>
        </div>
        <div class="card-value-simple">0</div>
      </div>

      <!-- 网关子设备数卡片 -->
      <div class="stat-card-simple">
        <div class="card-header-simple">
          <div class="label-block purple-block"></div>
          <div class="card-label-simple">网关子设备数</div>
        </div>
        <div class="card-value-simple">0</div>
      </div>

      <!-- 在线设备数卡片 -->
      <div class="stat-card-simple">
        <div class="card-header-simple">
          <div class="label-block red-block"></div>
          <div class="card-label-simple">在线设备数（0%）</div>
        </div>
        <div class="card-value-simple">0</div>
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
            <span class="el-dropdown-label cursor-pointer">
              <el-icon color="#FFA500" class="mr5" size="14"><Grid /></el-icon>
              批量操作
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>批量导出设备</el-dropdown-item>
                <el-dropdown-item>启用全部设备</el-dropdown-item>
                <el-dropdown-item>批量禁用设备</el-dropdown-item>
                <el-dropdown-item>批量删除设备</el-dropdown-item>
                <el-dropdown-item>同步设备状态</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div>
          <el-dropdown>
            <span class="el-dropdown-label cursor-pointer">
              <el-icon color="#246EF6" class="mr5" size="14"><Setting /></el-icon>
              批量操作
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
      <el-table :data="tableData" border style="width: 100%">
        <!-- 选择列 -->
        <el-table-column type="selection" width="55" />

        <!-- 设备名称列 -->
        <el-table-column prop="name" label="设备名称" />

        <!-- 设备ID列 -->
        <el-table-column prop="deviceId" label="设备ID" />

        <!-- 所属产品列 -->
        <el-table-column prop="product" label="所属产品" />

        <!-- 状态列 -->
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 节点类型列 -->
        <el-table-column prop="nodeType" label="节点类型" />

        <!-- 上级设备列 -->
        <el-table-column prop="parentDevice" label="上级设备" />

        <!-- 操作列（固定显示） -->
        <el-table-column fixed="right" label="操作">
          <template #header>
            <div class="flex flex-cz-center">
              <span class="mr15">操作</span>
              <!-- <el-icon size="18" class="cursor-pointer setting-icon">
                <Setting />
              </el-icon> -->
              <el-dropdown>
                <el-icon size="18" class="cursor-pointer setting-icon">
                  <Setting />
                </el-icon>
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
          </template>

          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleDetail(row)"> 详情 </el-button>
              <el-button link type="primary" @click="handleSubDevice(row)"> 子设备 </el-button>
              <el-button link type="danger" @click="handleDelete(row)"> 删除 </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <ArtPagination
        :pagination="pagination"
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </ElCard>
  </div>
</template>

<script setup>
  const router = useRouter()
  // 这是一个静态展示组件，不需要响应式数据
  // 只包含图片中展示的卡片列表
  const form = reactive({})
  // 表单配置
  const formItems = computed(() => [
    {
      label: '产品品类',
      key: 'name',
      type: 'input',
      placeholder: '请输入产品品类',
      clearable: true
    }
  ])
  const onReset = () => {
    console.log('重置')
  }
  const onSearch = () => {
    console.log('搜索')
  }
  // 表格数据
  const tableData = ref([
    {
      name: 'AI中心-展厅-电表1',
      deviceId: 'DEV001',
      product: '标准电表',
      status: '在线',
      nodeType: '终端设备',
      parentDevice: '网关-001'
    },
    {
      name: '易电桥边缘网关',
      deviceId: 'GW001',
      product: '边缘网关',
      status: '离线',
      nodeType: '网关设备',
      parentDevice: '-'
    },
    {
      name: '温度传感器1',
      deviceId: 'SENSOR001',
      product: '温度传感器',
      status: '在线',
      nodeType: '子设备',
      parentDevice: '易电桥边缘网关'
    },
    {
      name: '智能照明控制器',
      deviceId: 'LIGHT001',
      product: '照明控制器',
      status: '离线',
      nodeType: '终端设备',
      parentDevice: '网关-002'
    }
  ])

  // 分页数据
  const currentPage = ref(1)
  const pageSize = ref(10)
  const tableRef = ref()
  const selectedRows = ref([])
  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  function onSizeChange(size) {
    pageSize.value = size
    currentPage.value = 1
    // fetchTableData()
  }

  function onPageChange(page) {
    console.log(page)
    currentPage.value = page
    // fetchTableData()
  }
  // 操作按钮处理函数
  const handleDetail = (row) => {
    console.log('查看详情:', row)
    // ElMessage.info(`查看 ${row.name} 详情`)
    router.push({ name: 'DeviceDetail', query: { deviceId: row.deviceId } })
  }

  const handleSubDevice = (row) => {
    console.log('查看子设备:', row)
    ElMessage.info(`查看 ${row.name} 子设备`)
  }

  const handleDelete = (row) => {
    console.log('删除设备:', row)
    ElMessage.warning(`确认删除 ${row.name} 吗？`)
  }
  // 设备注册跳转
  const goDeviceRegister = (type) => {
    router.push({ name: 'DeviceRegister', query: { registerType: type } })
  }
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
</style>
