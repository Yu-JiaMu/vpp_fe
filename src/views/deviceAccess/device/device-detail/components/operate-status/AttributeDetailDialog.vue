<template>
  <el-dialog
    v-model="dialogVisible"
    align-center
    title="详情"
    :show-close="false"
    width="742"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="flex items-center">
      <!-- 时间选择区域 - 保持原有布局 -->
      <el-radio-group
        class="w-[341px]"
        @change="timeDateTypeChange"
        v-model="timeDateType"
        text-color="#fff"
        fill="#38ECF2"
      >
        <el-radio-button label="今日" value="today" />
        <el-radio-button label="最近一周" value="week" />
        <el-radio-button label="最近一个月" value="month" />
      </el-radio-group>

      <el-date-picker
        v-model="datetime"
        type="datetimerange"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD HH:mm:ss"
        clearable
        class="flex-1"
        @change="dateTimeChange"
        :default-time="DATE_PICKER_DEFAULT_TIME"
      />
    </div>

    <el-tabs v-model="tabsActive" class="mt20" @tab-click="handleTabsClick">
      <el-tab-pane label="列表" name="first">
        <el-table :data="dialogTableData" border style="width: 100%">
          <el-table-column prop="ts" label="时间" width="400" />
          <el-table-column prop="val" label="值" />
        </el-table>

        <ArtPagination
          v-model="dialogPagination"
          @change="getDialogTableData"
          layout="prev, pager, next, jumper"
        />
      </el-tab-pane>
      <!-- <el-tab-pane label="图表" name="second">
        <div class="w-[300px]">
          <ArtSelectPrepend>
            <template #label> 统计周期 </template>
            <el-select v-model="TJZQ" placeholder="请选择" style="width: 300px" clearable>
              <el-option
                v-for="item in ZQlist"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              />
            </el-select>
          </ArtSelectPrepend>
        </div>
      </el-tab-pane> -->
    </el-tabs>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button size="large" type="info" class="w-[177px]" @click="handleCancel">
          取消
        </el-button>
        <el-button type="primary" class="w-[177px]" @click="handleCancel"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, reactive, watch, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import dayjs from 'dayjs'
  import * as deviceApi from '@/api/iot'
  import { DATE_PICKER_DEFAULT_TIME } from '@/enums'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    deviceDetail: {
      type: Object,
      default: () => ({})
    },
    selectedRow: {
      type: Object,
      default: () => ({})
    }
  })

  const emit = defineEmits(['update:modelValue', 'cancel'])

  // 控制弹窗显示
  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  // 时间类型
  const timeDateType = ref('today')
  // 日期时间范围
  const datetime = ref([])

  // 标签页
  const tabsActive = ref('first')

  // 表格数据
  const dialogTableData = ref([])

  // 分页配置
  const dialogPagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })

  // 查询参数 - 保持原有结构
  const dialogForm = reactive({
    deviceIdentifier: '',
    pointIdentifier: '',
    startTime: '',
    endTime: ''
  })

  // 图表相关
  const TJZQ = ref('')
  const ZQlist = [
    {
      label: '实际值',
      value: 'ss'
    }
  ]

  // 获取时间范围函数 - 保持原有逻辑
  const getTimeRange = (type = 'today', includeToday = true) => {
    const now = dayjs()
    let start, end

    switch (type) {
      case 'today':
        start = now.startOf('day')
        end = now.endOf('day')
        break
      case 'week':
        if (includeToday) {
          start = now.subtract(6, 'day').startOf('day')
          end = now.endOf('day')
        } else {
          start = now.subtract(7, 'day').startOf('day')
          end = now.subtract(1, 'day').endOf('day')
        }
        break
      case 'month':
        if (includeToday) {
          start = now.subtract(29, 'day').startOf('day')
          end = now.endOf('day')
        } else {
          start = now.subtract(30, 'day').startOf('day')
          end = now.subtract(1, 'day').endOf('day')
        }
        break
      default:
        start = now.startOf('day')
        end = now.endOf('day')
    }

    return [start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss')]
  }

  // 时间类型变化 - 保持原有逻辑
  const timeDateTypeChange = (value) => {
    const timeDateTypeArr = getTimeRange(value)
    datetime.value = timeDateTypeArr
    dialogForm.startTime = timeDateTypeArr[0]
    dialogForm.endTime = timeDateTypeArr[1]
    dialogPagination.current = 1
    getDialogTableData()
  }

  // 日期时间变化 - 保持原有逻辑
  const dateTimeChange = async (e) => {
    if (e) {
      dialogForm.startTime = e[0]
      dialogForm.endTime = e[1]
    } else {
      dialogForm.startTime = ''
      dialogForm.endTime = ''
    }
    timeDateType.value = ''
    dialogPagination.current = 1
    getDialogTableData()
  }

  // 构建查询参数 - 保持原有逻辑
  const handleDialogFormQueryParams = () => {
    const queryParams = {
      pageNum: dialogPagination.current,
      pageSize: dialogPagination.size,
      ...Object.keys(dialogForm).reduce((acc, key) => {
        if (dialogForm[key] !== '' && dialogForm[key] !== undefined && dialogForm[key] !== null) {
          acc[key] = dialogForm[key]
        }
        return acc
      }, {})
    }
    return queryParams
  }

  // 获取表格数据 - 保持原有逻辑
  const getDialogTableData = async () => {
    try {
      const QueryParamsRes = handleDialogFormQueryParams()
      const response = await deviceApi.apiHistoryPropertyList(QueryParamsRes)
      if (response) {
        dialogTableData.value = response.rows || []
        dialogPagination.total = response.total || 0
      }
    } catch (error) {
      console.error('获取详情列表失败:', error)
      ElMessage.error('获取详情数据失败')
    }
  }

  // 标签页点击
  const handleTabsClick = async () => {
    // 原有逻辑
  }

  // 初始化数据
  const initDialogData = () => {
    dialogPagination.size = 10
    dialogPagination.current = 1
    dialogPagination.total = 0
    timeDateType.value = ''
    datetime.value = []
    Object.keys(dialogForm).forEach((key) => {
      dialogForm[key] = ''
    })
  }

  // 取消
  const handleCancel = async () => {
    dialogVisible.value = false
    emit('cancel')
    initDialogData()
  }

  // 监听弹窗打开
  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        // 初始化查询参数
        dialogForm.deviceIdentifier = props.deviceDetail.identifier
        dialogForm.pointIdentifier = props.selectedRow.identifier

        // 设置默认时间范围（今日）
        timeDateTypeChange('today')

        // 获取数据
        getDialogTableData()
      } else {
        // 弹窗关闭时重置数据
        initDialogData()
      }
    }
  )

  // 监听选中的行变化
  watch(
    () => props.selectedRow,
    (newRow) => {
      if (newRow && newRow.identifier) {
        dialogForm.pointIdentifier = newRow.identifier
        if (props.modelValue) {
          dialogPagination.current = 1
          getDialogTableData()
        }
      }
    }
  )

  onMounted(() => {
    // 初始化数据
    initDialogData()
  })
</script>

<style lang="scss" scoped>
  // 保持原有样式结构
  .detail-tabs {
    margin-top: 20px;
  }

  .pagination-container {
    margin-top: 20px;
  }
</style>
