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
          v-model.trim="form.key"
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
              <el-option label="设备名称" value="name" />
              <el-option label="设备标识符" value="identifier" />
            </el-select>
          </template>
        </el-input>

        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <ArtResetBtn class="!ml-0" @click="handleReset" />
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        show-overflow-tooltip
        border
        height="360"
        @selection-change="handleSelectionChange"
        class="w-full"
        v-loading="loading"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column prop="name" label="设备名称" min-width="160" />

        <el-table-column prop="identifier" label="设备标识符" min-width="220" />

        <el-table-column prop="productName" label="所属产品" min-width="160" />

        <el-table-column prop="devState" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="DEVICE_STATUS_TYPES.getItem(row.devState)?.tag">{{
              DEVICE_STATUS_TYPES.getLabel(row.devState)
            }}</el-tag>
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
  import * as api from '@/api/iot'
  import { NODE_TYPES, DEVICE_STATUS_TYPES } from '@/enums'
  import { ElMessage } from 'element-plus'

  const route = useRoute()

  const emits = defineEmits(['refresh'])

  /** 弹窗显示 */
  const dialogVisible = ref(false)

  /** 查询条件 */
  const form = reactive({
    mode: 'name',
    key: ''
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })

  /** 表格数据 */
  const tableData = ref([])

  /** 加载状态 */
  const loading = ref(false)

  /** 选中行 */
  const selectedRows = ref([])

  const handleSelectionChange = (rows) => {
    selectedRows.value = rows
  }

  /** 获取设备列表数据 */
  const getDeviceList = async () => {
    try {
      loading.value = true
      const queryParams = {
        nodeType: NODE_TYPES.values.SUB_DEVICE,
        isAsc: 'desc',
        orderByColumn: 'updateTime',
        pageNum: pagination.current,
        pageSize: pagination.size,
        unBind: true
      }

      // 添加搜索条件
      if (form.key.trim()) {
        queryParams[form.mode] = form.key
      }

      const response = await api.apiGetDeviceList(queryParams)
      if (response && response.rows) {
        // 映射API返回字段到表格显示字段
        tableData.value = response.rows
        pagination.total = response.total || 0
      }
    } catch (error) {
      ElMessage.error('获取设备列表失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  /** 搜索 */
  const handleSearch = () => {
    pagination.current = 1
    getDeviceList()
  }

  /** 重置 */
  const handleReset = () => {
    form.key = ''
    form.mode = 'name'
    pagination.current = 1
    getDeviceList()
  }

  /** 取消 */
  const handleCancel = () => {
    dialogVisible.value = false
  }

  /** 确认绑定 */
  const handleConfirm = async () => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请选择要绑定的设备')
      return
    }
    console.log('绑定设备', selectedRows.value)
    await api.apiDevBatchBind({
      parentId: route.query.id,
      childIds: selectedRows.value.map((item) => item.id)
    })
    ElMessage.success('绑定成功')
    dialogVisible.value = false
    emits('refresh')
  }

  const open = (row) => {
    dialogVisible.value = true
    selectedRows.value = []
    pagination.current = 1
    getDeviceList()
  }

  defineExpose({ open })
</script>

<style lang="scss" scoped>
  .bind-device-dialog {
  }
</style>
