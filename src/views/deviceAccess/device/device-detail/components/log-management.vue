<template>
  <div class="min-h-full pb-5 bg-white">
    <!-- 顶部搜索区 -->
    <div class="flex items-center justify-between p-5 search-con">
      <div class="flex flex-wrap items-center">
        <el-form :model="form" inline class="">
          <el-form-item>
            <el-select
              v-model="form.logType"
              placeholder="请选择类型"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="item in LOG_TYPES.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-date-picker
              v-model="form.dateRange"
              type="daterange"
              range-separator="到"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="DATE_PICKER_DEFAULT_TIME"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>

          <el-form-item>
            <el-button @click="getTableData"> 搜索 </el-button>
            <ArtResetBtn class="" @click="handleReset" />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border height="520" show-overflow-tooltip>
      <el-table-column prop="name" label="类型" min-width="140">
        <template #default="{ row }">
          {{ LOG_TYPES.getLabel(row.logType) }}
        </template>
      </el-table-column>

      <el-table-column prop="ts" label="时间" min-width="200" />

      <el-table-column prop="logContent" label="内容" min-width="160" />

      <el-table-column label="操作" fixed="right" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetailDialog(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ArtPagination v-model="pagination" @change="getTableData" />

    <!-- 绑定弹窗 -->
    <el-dialog v-model="dialogVisible" title="详情" width="742px">
      <MonacoEditor v-model="editorContent" theme="vs" class="h-[378px]" lang="json" readOnly />
    </el-dialog>
  </div>
</template>

<script setup>
  import { NODE_TYPES, LOG_TYPES, DATE_PICKER_DEFAULT_TIME } from '@/enums'
  import * as api from '@/api/iot'

  const router = useRouter()

  const props = defineProps({
    deviceDetail: {
      type: Object,
      default: () => ({})
    }
  })

  const dialogVisible = ref(false)

  /** 查询条件 */
  const form = reactive({
    // 默认按设备上报时间倒序
    isAsc: 'desc',
    orderByColumn: 'ts',
    logType: '',
    dateRange: null
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })

  /** 表格数据 */
  const tableData = ref([])

  const getTableData = async () => {
    // 拆分日期范围到 startTime / endTime
    const [startTime, endTime] = Array.isArray(form.dateRange) ? form.dateRange : [null, null]

    const queryParams = {
      deviceIdentifier: props.deviceDetail?.identifier,
      pageNum: pagination.current,
      pageSize: pagination.size,
      isAsc: form.isAsc,
      orderByColumn: form.orderByColumn,
      logType: form.logType,
      startTime,
      endTime
    }

    const response = await api.apiDevLog(queryParams)
    if (response) {
      tableData.value = response.rows || []
      pagination.total = response.total || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  }

  const handleReset = () => {
    Object.assign(form, {
      logType: '',
      dateRange: null
    })
    getTableData()
  }

  const editorContent = ref('')
  const openDetailDialog = (item) => {
    editorContent.value = item.logContent || JSON.stringify(item, null, 2)
    dialogVisible.value = true
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
