<template>
  <div class="bg-white operate-status">
    <div class="flex gap-2 mb20">
      <div
        class="tag cursor-pointer"
        :class="{ 'active-tag': activeTag === tag.value }"
        v-for="(tag, index) in tagList"
        :key="index"
        @click="handleTagClick(tag)"
        >{{ tag.label }}</div
      >
    </div>
    <!-- 属性 -->
    <template v-if="activeTag === 'attributeData'">
      <div class="flex gap-2.5">
        <el-input
          v-model="form.searchIdentifier"
          placeholder="请输入属性名称"
          :prefix-icon="Search"
          style="width: 248px"
          clearable
        />
        <el-button @click="onSearch"> 搜索 </el-button>
        <ArtResetBtn class="!ml-0" @click="onReset" />
      </div>
      <!-- 修改这里：去掉倒计时显示 -->
      <div class="flex items-center justify-end gap-8 search-box">
        <el-switch v-model="form.refresh" active-text="实时刷新" @change="handleRefreshChange" />
        <div class="flex items-center icon-box">
          <div
            class="cursor-pointer icon-item"
            v-for="(icon, index) in iconList"
            :key="index"
            @click="hanldeIconClick(icon)"
          >
            <img
              v-if="index === 0"
              :src="activeIcon === 'table' ? icon.activeImgUrl : icon.imgUrl"
              alt=""
            />
            <img
              v-if="index === 1"
              :src="activeIcon === 'card' ? icon.activeImgUrl : icon.imgUrl"
              alt=""
            />
          </div>
        </div>
      </div>
      <template v-if="activeIcon === 'table'">
        <el-table :data="tableData" border show-overflow-tooltip style="width: 100%">
          <el-table-column prop="name" label="属性名称" width="400" />
          <el-table-column prop="val" label="值" width="400" />
          <el-table-column prop="ts" label="更新时间" width="400" />
          <el-table-column label="操作">
            <template #default="{ row, $index }">
              <el-button type="primary" link @click="handleDetail(row)"> 详情 </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="activeIcon === 'card'">
        <div class="card-container mt20">
          <!-- 卡片1：电压 -->
          <div class="card" v-for="(item, index) in tableData" :key="index">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="kuai"></div>
                <span class="text-[15px] max-w-[180px] truncate">{{ item.name }}</span>
              </div>
              <img
                src="@/assets/images/deviceAccess/13.png"
                @click="handleDetail(item)"
                class="w-[14px] h-[16px] cursor-pointer"
              />
            </div>
            <div class="content-font mt-[4px] mb-[15px] flex items-end">
              <div class="flex items-center gap-2 mr-[4px] flex-1">
                <div class="kuai" style="opacity: 0"></div>
                <el-tooltip :content="item.val" placement="top">
                  <div class="text-2xl max-w-[220px] truncate">
                    {{ item.val }}
                    <span class="text-[16px]">{{ item.unit }}</span>
                  </div>
                </el-tooltip>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="kuai"></div>
              <span class="text-[15px]">更新时间</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="kuai" style="opacity: 0"></div>
              <span class="text-[15px]">{{ item.ts }}</span>
            </div>
          </div>
        </div>
      </template>
      <!-- <ArtPagination v-model="pagination" @change="pageChange" /> -->
    </template>
    <!-- 查看详情弹窗 -->
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
        <!--  :default-time="['00:00:00', '23:59:59']" -->
      </div>
      <el-tabs v-model="tabsActive" class="mt20" @tab-click="handleTabsClick">
        <el-tab-pane label="列表" name="first">
          <el-table :data="dialogTableData" border style="width: 100%" show-overflow-tooltip>
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
          <el-button size="large" type="info" class="w-[177px]" v-ripple @click="handleCancel"
            >取消</el-button
          >
          <el-button type="primary" class="w-[177px]" v-ripple @click="handleCancel">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 事件 -->
    <template v-if="activeTag === 'eventManage'">
      <el-table :data="tableData" border style="width: 100%" show-overflow-tooltip>
        <el-table-column prop="name" label="事件名称" width="300" />
        <el-table-column prop="eventType" label="事件级别" width="300" />
        <el-table-column prop="ts" label="更新时间" width="400" />
        <el-table-column prop="val" label="输出参数" min-width="100" />
        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetailDialog(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <ArtPagination v-model="pagination" @change="getTableData" />
    <!-- 绑定弹窗 -->
    <el-dialog v-model="CSdialogVisible" title="详情" width="742px">
      <MonacoEditor v-model="editorContent" theme="vs" class="h-[378px]" lang="json" readOnly />
    </el-dialog>
  </div>
</template>

<script setup>
  import { Search } from '@element-plus/icons-vue'
  import img1 from '@/assets/images/deviceAccess/9.png'
  import img2 from '@/assets/images/deviceAccess/10.png'
  import img3 from '@/assets/images/deviceAccess/11.png'
  import img4 from '@/assets/images/deviceAccess/12.png'
  import * as deviceApi from '@/api/iot'
  import { DATE_PICKER_DEFAULT_TIME } from '@/enums'
  import dayjs from 'dayjs'
  import { onUnmounted, onDeactivated, onActivated } from 'vue'

  const props = defineProps({
    deviceDetail: {
      type: Object,
      default: () => {}
    }
  })

  const tagList = ref([
    {
      label: '属性数据',
      value: 'attributeData'
    },
    {
      label: '事件管理',
      value: 'eventManage'
    }
  ])
  const activeTag = ref('attributeData')
  const handleTagClick = (tag) => {
    activeTag.value = tag.value
    console.log(activeTag.value)
  }

  // 属性数据 - 简化后的代码
  const form = reactive({
    searchIdentifier: '',
    refresh: false, // 实时刷新开关状态，默认关闭
    autoRefreshTimer: null, // 定时器ID
    isRefreshing: false // 防止重复请求
  })

  const iconList = ref([
    {
      label: '表格',
      value: 'table',
      imgUrl: img1,
      activeImgUrl: img2
    },
    {
      label: '卡片',
      value: 'card',
      imgUrl: img3,
      activeImgUrl: img4
    }
  ])
  const activeIcon = ref('table')
  const hanldeIconClick = (icon) => {
    activeIcon.value = icon.value
  }
  const onReset = () => {
    form.searchIdentifier = ''
    pagination.current = 1
    getTableData()
  }
  const onSearch = () => {
    pagination.current = 1
    getTableData()
  }
  const tableData = ref([])
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
    queryParams.deviceIdentifier = props.deviceDetail.identifier
    return queryParams
  }
  const getTableData = async (showLoading = true) => {
    // 如果正在刷新中，则跳过
    if (form.isRefreshing) return

    form.isRefreshing = true

    try {
      const QueryParamsRes = handleQueryParams()
      const url =
        activeTag.value === 'attributeData' ? `data/snapshot/property` : `data/snapshot/event`
      const response = await deviceApi.apiOperateStatusList(url, QueryParamsRes)
      if (response) {
        tableData.value = response.rows
        pagination.total = response.total || 0
      }
    } catch (error) {
      console.error('列表失败:', error)
      ElMessage.error('设备列表失败')
    } finally {
      form.isRefreshing = false
    }
  }

  // 处理实时刷新开关变化
  const handleRefreshChange = (value) => {
    if (value) {
      // 开启实时刷新
      startAutoRefresh()
    } else {
      // 关闭实时刷新
      stopAutoRefresh()
    }
  }

  // 开始自动刷新
  const startAutoRefresh = () => {
    // 先停止现有的定时器
    stopAutoRefresh()

    // 立即获取一次数据
    getTableData()

    // 设置30秒定时器
    form.autoRefreshTimer = setInterval(() => {
      // 只有在当前标签页是属性数据且刷新开关开启时才刷新
      if (form.refresh && activeTag.value === 'attributeData') {
        getTableData(false) // 自动刷新不显示loading
      }
    }, 30000) // 30秒 = 30000毫秒

    console.log('开启自动刷新，每30秒请求一次')
  }

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (form.autoRefreshTimer) {
      clearInterval(form.autoRefreshTimer)
      form.autoRefreshTimer = null
      console.log('停止自动刷新')
    }
  }

  //切换时搜索参数
  const initQueryParams = async () => {
    pagination.size = 10
    pagination.current = 1 // 修正属性名
  }
  //分页数据
  const pagination = reactive({
    size: 10,
    current: 1,
    total: 100
  })
  // 监听标签切换
  watch(
    () => activeTag.value,
    (newTag) => {
      if (newTag === 'attributeData' && form.refresh) {
        // 切换到属性数据标签且实时刷新开启时，重新开始刷新
        startAutoRefresh()
      } else {
        // 切换到其他标签时，停止刷新
        stopAutoRefresh()
      }

      initQueryParams()
      getTableData()
    },
    { immediate: false }
  )

  // 监听搜索条件变化
  watch(
    () => form.searchIdentifier,
    () => {
      // 搜索条件变化时重置到第一页
      pagination.current = 1
    }
  )

  // 监听视图切换
  watch(
    () => activeIcon.value,
    () => {
      pagination.current = 1
      getTableData()
    }
  )

  // 页面可见性变化处理
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 页面隐藏时暂停刷新
      if (form.refresh && form.autoRefreshTimer) {
        clearInterval(form.autoRefreshTimer)
        form.autoRefreshTimer = null
      }
    } else {
      // 页面显示时恢复刷新
      if (form.refresh && activeTag.value === 'attributeData') {
        startAutoRefresh()
      }
    }
  }

  // 组件生命周期
  onMounted(() => {
    getTableData()
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    // 组件销毁时清理定时器
    stopAutoRefresh()
    // 移除事件监听
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  // 如果使用 Vue Router 的 keep-alive
  onDeactivated(() => {
    // 组件失活时停止刷新
    stopAutoRefresh()
  })

  onActivated(() => {
    // 组件激活时，如果刷新开关开启，重新开始刷新
    if (form.refresh && activeTag.value === 'attributeData') {
      startAutoRefresh()
    }
  })

  //弹窗数据
  const getTimeRange = (type = 'today', includeToday = true) => {
    const now = dayjs()
    let start, end

    switch (type) {
      case 'today':
        // 今天
        start = now.startOf('day')
        end = now.endOf('day')
        break

      case 'week':
        // 最近一周
        if (includeToday) {
          // 包含今天：从7天前到今天
          start = now.subtract(6, 'day').startOf('day')
          end = now.endOf('day')
        } else {
          // 不包含今天：从7天前到昨天
          start = now.subtract(7, 'day').startOf('day')
          end = now.subtract(1, 'day').endOf('day')
        }
        break

      case 'month':
        // 最近一个月
        if (includeToday) {
          // 包含今天：从30天前到今天
          start = now.subtract(29, 'day').startOf('day')
          end = now.endOf('day')
        } else {
          // 不包含今天：从30天前到昨天
          start = now.subtract(30, 'day').startOf('day')
          end = now.subtract(1, 'day').endOf('day')
        }
        break

      default:
        // 默认今天
        start = now.startOf('day')
        end = now.endOf('day')
    }

    return [start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss')]
  }
  const dialogVisible = ref(false)
  const handleDetail = async (row) => {
    dialogForm.deviceIdentifier = props.deviceDetail.identifier
    dialogForm.pointIdentifier = row.identifier
    // timeDateTypeChange(timeDateType.value)
    const timeDateTypeArr = getTimeRange()
    datetime.value = timeDateTypeArr
    dialogForm.startTime = timeDateTypeArr[0]
    dialogForm.endTime = timeDateTypeArr[1]
    await getDialogTableData()
    dialogVisible.value = true
  }

  const timeDateType = ref('today')
  const timeDateTypeChange = (e) => {
    const timeDateTypeArr = getTimeRange(e)
    datetime.value = timeDateTypeArr
    dialogForm.startTime = timeDateTypeArr[0]
    dialogForm.endTime = timeDateTypeArr[1]
    dialogPagination.current = 1
    getDialogTableData()
  }
  const dialogForm = reactive({
    deviceIdentifier: '',
    pointIdentifier: '',
    startTime: '',
    endTime: ''
  })

  const datetime = ref([])
  const dateTimeChange = async (e) => {
    console.log(datetime.value, e, 'current-page 或 page-size 更改时触发')
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

  //弹窗列表
  const tabsActive = ref('first')
  const dialogTableData = ref([])
  const dialogPagination = reactive({
    size: 10,
    current: 1,
    total: 100
  })
  const initDialogData = () => {
    dialogPagination.size = 10
    dialogPagination.current = 1
    timeDateType.value = ''
    datetime.value = []
    Object.keys(dialogForm).forEach((key) => {
      dialogForm[key] = ''
    })
  }
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
  const getDialogTableData = async () => {
    try {
      const QueryParamsRes = handleDialogFormQueryParams()
      const response = await deviceApi.apiHistoryPropertyList(QueryParamsRes)
      if (response) {
        dialogTableData.value = response.rows
        dialogPagination.total = response.total || 0
      }
    } catch (error) {
      console.error('列表失败:', error)
      ElMessage.error('设备列表失败')
    }
  }
  const handleTabsClick = async () => {}
  const handleCancel = async () => {
    dialogVisible.value = false
    initDialogData()
  }

  //弹窗图表
  const TJZQ = ref('')
  const ZQlist = [
    {
      label: '实际值',
      value: 'ss'
    }
  ]
  //属性数据结束
  //事件详情
  const CSdialogVisible = ref(false)
  const editorContent = ref('')
  const openDetailDialog = (item) => {
    editorContent.value = item.val || JSON.stringify(item, null, 2)
    CSdialogVisible.value = true
  }
  onMounted(() => {
    getTableData()
  })
</script>

<style lang="scss" scoped>
  .operate-status {
    padding: 20px;
    .tag {
      padding: 6px 15px;
      border: 1px solid #e5e6ec;
      border-radius: 2px;
      font-size: 13px;
      font-family:
        Source Han Sans SC,
        Source Han Sans SC-Medium;
      color: #303537;
    }
    .active-tag {
      background: #eefeff !important;
      border: 1px solid #38ecf2 !important;
      font-weight: 500;
    }
    .search-box {
      padding-right: 65px;
      .icon-box {
        .icon-item {
          img {
            width: 30px;
            height: 25px;
          }
        }
      }
    }
    /* 卡片容器样式 */
    .card-container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    /* 卡片基础样式 */
    .card {
      width: 288px;
      background: #ffffff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 15px 30px 20px 20px;
      color: #303537;
      .kuai {
        width: 5px;
        height: 5px;
        background: #ced1d9;
      }
      .content-font {
        font-family: DIN, DIN-Light;
        font-weight: 300;
        color: #303537;
        // max-width: 80%;
      }
    }

    /* 卡片悬停效果 */
    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    /* 左侧内容区 */
    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* 标题样式 */
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      line-height: 1.4;
      margin: 0;
    }

    /* 电压数值样式 */
    .voltage-value {
      font-size: 28px;
      font-weight: 400;
      color: #303133;
      line-height: 1.2;
      margin: 4px 0;
    }

    /* 单位样式 */
    .voltage-unit {
      font-size: 12px;
      color: #606266;
      font-weight: 400;
      margin-left: 2px;
    }

    /* 更新时间标签 */
    .update-label {
      font-size: 12px;
      color: #909399;
      font-weight: 400;
      margin: 0;
    }

    /* 更新时间值 */
    .update-time {
      font-size: 12px;
      color: #606266;
      font-weight: 500;
      margin: 0;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }

    /* 右侧虚线框 */
    .card-right-area {
      width: 40px;
      height: 40px;
      border: 1px dashed #409eff; /* 蓝色虚线边框 */
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: auto;
      align-self: flex-start;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    /* 虚线框悬停效果 */
    .card-right-area:hover {
      background: #f0f7ff;
      border-color: #66b1ff;
      border-style: solid;
    }

    /* 虚线框内的加号 */
    .plus-icon {
      color: #409eff;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      transition: all 0.2s ease;
    }

    .card-right-area:hover .plus-icon {
      color: #66b1ff;
      transform: scale(1.1);
    }

    /* 底部浅蓝色下划线 */
    .card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #38ecf2; /* 浅蓝色 */
      border-radius: 0 0 8px 8px;
      opacity: 0.7;
    }
  }
</style>
