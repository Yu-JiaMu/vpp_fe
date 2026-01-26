<template>
  <div class="bind-device-dialog">
    <el-dialog v-model="dialogVisible" title="绑定设备" width="742px">
      <!-- 提示信息 -->
      <div
        class="flex w-fit mb-5 text-sm text-g-505658 py-2 pl-2.5 pr-[94px] bg-[#f7f8fa] rounded-3xl"
      >
        <img src="@/assets/images/icon/icon-notice.png" class="w-6 h-6 mr-2.5" alt="" />
        该页面仅支持绑定子设备，且子设备只允许被一个网关设备绑定！
      </div>

      <!-- 搜索区域 -->
      <div class="flex items-center gap-3 mb-4">
        <el-input
          v-model="form.key"
          placeholder="请输入搜索内容"
          class="input-with-select !w-[248px]"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <el-select
              v-model="form.mode"
              placeholder="请选择"
              style="width: 116px"
              @change="form.key = ''"
            >
              <el-option label="设备名称" value="deviceName" />
              <el-option label="设备ID" value="industryCode" />
            </el-select>
          </template>
        </el-input>

        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <ArtResetBtn class="!ml-0" @click="handleReset" />
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        border
        height="360"
        @selection-change="handleSelectionChange"
        class="w-full"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column prop="name" label="设备名称" min-width="160" />

        <el-table-column prop="id" label="设备ID" min-width="220" />

        <el-table-column prop="product" label="所属产品" min-width="160" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="text-green-600" v-if="row.status === '在线'"> 在线 </span>
            <span class="text-gray-400" v-else> 离线 </span>
          </template>
        </el-table-column>
      </el-table>
      <ArtPagination v-model="pagination" @change="handleSearch" />

      <template #footer>
        <div class="flex justify-center gap-[6px]">
          <el-button
            size="large"
            type="info"
            class="w-[177px]"
            v-ripple
            @click="dialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" class="w-[177px]" v-ripple @click="handleConfirm">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  /** 弹窗显示 */
  const dialogVisible = ref(true)

  /** 查询条件 */
  const form = reactive({
    mode: 'deviceName',
    key: ''
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })

  /** 表格数据（示例） */
  const tableData = ref([
    {
      name: 'AI中心-顶楼-电表1',
      id: '33014a27b4eeb480',
      product: 'ADW300计量电表',
      status: '在线'
    },
    {
      name: 'AI中心-顶楼-电表2',
      id: '33014a27b4eeb481',
      product: 'ADW300计量电表',
      status: '在线'
    }
  ])

  /** 分页 */
  const page = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 16
  })

  /** 选中行 */
  const selectedRows = ref([])

  const handleSelectionChange = (rows) => {
    selectedRows.value = rows
  }

  /** 搜索 */
  const handleSearch = () => {
    console.log('搜索条件', query)
    if (!form.key.trim()) {
      filteredList.value = props.productCategoryList
      return
    }

    const keyword = form.key.toLowerCase()
  }

  /** 重置 */
  const handleReset = () => {
    query.deviceName = ''
    handleSearch()
  }

  /** 分页切换 */
  const handlePageChange = (val) => {
    page.pageNum = val
    handleSearch()
  }

  /** 取消 */
  const handleCancel = () => {
    visible.value = false
  }

  /** 确认绑定 */
  const handleConfirm = () => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请选择要绑定的设备')
      return
    }
    console.log('绑定设备', selectedRows.value)
    visible.value = false
  }

  const open = (row) => {
    dialogVisible.value = true
  }

  defineExpose({ open })
</script>

<style lang="scss" scoped>
  .bind-device-dialog {
  }
</style>
