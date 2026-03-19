<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加系统功能点"
    width="672px"
    :close-on-click-modal="false"
  >
    <div class="add-system-function-points-dialog">
      <div class="mb-2.5 text-sm text-g-303537">功能列表</div>
      <div class="flex-b gap-2.5 mb-6">
        <el-input
          v-model="form.key"
          placeholder="请输入搜索内容"
          class="input-with-select"
          clearable
          @input="debouncedSearch"
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <el-select
              v-model="form.mode"
              placeholder="请选择"
              style="width: 116px"
              @change="form.key = ''"
            >
              <el-option label="功能名称" value="name" />
              <el-option label="标识符" value="identifier" />
            </el-select>
          </template>
        </el-input>
        <el-button @click="handleSearch">搜索</el-button>
      </div>
      <div class="flex gap-2 h-[405px]">
        <!-- 左侧：可选功能点 -->
        <div class="flex flex-col w-1/2 p-2.5 pr-0 border border-[#e4e5ef] rounded-md">
          <el-scrollbar height="330px" @end-reached="loadMore">
            <div class="flex-1 pr-3 space-y-2">
              <div
                v-for="item in filteredAvailableList"
                :key="item.id"
                class="flex items-start gap-3"
              >
                <el-checkbox
                  class="transfer-checkbox"
                  :model-value="false"
                  @change="() => addFunctionPoint(item)"
                />
                <PointCard :info="item" />
              </div>
              <div v-if="isLoading" class="flex justify-center py-4">
                <el-icon class="is-loading text-blue-500">
                  <Loading />
                </el-icon>
              </div>
              <div v-if="isAllLoaded && !isLoading" class="flex justify-center py-4">
                <span class="text-sm text-gray-400">已加载全部</span>
              </div>
            </div>
          </el-scrollbar>
          <div class="pr-3 text-right">
            <el-button class="btn-select-all" size="small" @click="addAllFunctionPoints">
              全选
            </el-button>
          </div>
        </div>

        <!-- 中间箭头 -->
        <div class="m-auto center-arrow"> </div>

        <!-- 右侧：已选功能点 -->
        <div class="flex flex-col w-1/2 p-2.5 pr-0 border border-[#e4e5ef] rounded-md bg-[#f7f7f9]">
          <el-scrollbar height="330px">
            <div class="flex-1 pr-3 space-y-2">
              <div v-for="item in selectedList" :key="item.id" class="">
                <PointCard :info="item" hasClose @removeFunctionPoint="removeFunctionPoint" />
              </div>
            </div>
          </el-scrollbar>
          <div class="pr-3 text-right">
            <el-button class="btn-clean-all" @click="removeAllFunctionPoints"> 清空 </el-button>
          </div>
        </div>
      </div>
    </div>
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
        <el-button type="primary" class="w-[177px]" v-ripple @click="handleAddPoint">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import { debounce } from 'lodash-es'
  import * as api from '@/api/iot'
  import PointCard from './point-card.vue'
  import { buildRow } from '@/utils'
  import { THING_SOURCE_MAP } from '@/enums'

  const emits = defineEmits(['addFunctionPoint'])

  const props = defineProps({
    /** 父组件表格数据（用于过滤已存在的功能点） */
    tableData: {
      type: Array,
      default: () => []
    }
  })

  const existingIdentifiers = computed(() => {
    return props.tableData.map((row) => row.identifier)
  })

  /** 弹窗状态 */
  const dialogVisible = ref(false)

  /** 搜索表单 */
  const form = ref({
    mode: 'name', // 默认搜索功能名称
    key: ''
  })

  const allFunctionPoints = ref([])

  /** 已选功能点 */
  const selectedList = ref([])

  /** 加载状态 */
  const isLoading = ref(false)

  /** 分页 */
  const pagination = ref({
    current: 1,
    size: 20,
    total: 0
  })

  /** 是否已选 */
  const isSelected = (id) => selectedList.value.some((item) => item.id === id)

  /** 左侧可选列表（自动排除已选和已存在的） */
  const filteredAvailableList = computed(() => {
    return allFunctionPoints.value.filter((item) => {
      if (isSelected(item.id)) return false
      // // 过滤掉父组件已经存在的功能点
      // if (item.identifier && existingIdentifiers.value.includes(item.identifier)) return false
      return true
    })
  })

  /** 是否全部加载完 */
  const isAllLoaded = computed(() => {
    return (
      allFunctionPoints.value.length > 0 && allFunctionPoints.value.length >= pagination.value.total
    )
  })

  /** 添加单个 */
  const addFunctionPoint = (item) => {
    if (!isSelected(item.id)) {
      selectedList.value.push(item)
    }
  }

  /** 移除单个 */
  const removeFunctionPoint = (item) => {
    selectedList.value = selectedList.value.filter((i) => i.id !== item.id)
  }

  /** 全选添加 */
  const addAllFunctionPoints = () => {
    filteredAvailableList.value.forEach((item) => {
      if (!isSelected(item.id)) {
        selectedList.value.push(item)
      }
    })
  }

  /** 全部移除 */
  const removeAllFunctionPoints = () => {
    selectedList.value = []
  }

  /** 提交 */
  const handleAddPoint = () => {
    console.log('Selected Function Points:', selectedList.value)
    emits('addFunctionPoint', selectedList.value)
    dialogVisible.value = false
  }

  /** 防抖搜索 */
  const debouncedSearch = debounce(() => {
    handleSearch()
  }, 500)

  /** 搜索 */
  const handleSearch = () => {
    pagination.value.current = 1
    getSystemPoint()
  }

  const getSystemPoint = async () => {
    try {
      isLoading.value = true
      const queryParams = {
        pageNum: pagination.value.current,
        pageSize: pagination.value.size,
        filterIdentifierList: existingIdentifiers.value
      }

      // 添加搜索参数
      if (form.value.key) {
        queryParams[form.value.mode] = form.value.key
      }

      const response = await api.apiThingModelList(queryParams)
      if (response) {
        const data = response.rows.map((item) => {
          item.functionType = THING_SOURCE_MAP.values.SYSTEM // 物模型库添加的全部为系统功能点
          return buildRow(item)
        })
        console.log('@@', response, data)

        if (pagination.value.current === 1) {
          allFunctionPoints.value = data
        } else {
          allFunctionPoints.value = [...allFunctionPoints.value, ...data]
        }
        pagination.value.total = response.total || 0
      }
    } catch (error) {
      console.error('获取系统功能点失败:', error)
      ElMessage.error('获取系统功能点失败')
    } finally {
      isLoading.value = false
    }
  }

  /** 滚动加载更多 */
  const loadMore = () => {
    if (isLoading.value) return // 正在加载时不处理
    if (allFunctionPoints.value.length < pagination.value.total) {
      pagination.value.current += 1
      getSystemPoint()
    }
  }

  const open = (row) => {
    // 重置搜索
    form.value.key = ''
    form.value.mode = 'name'
    selectedList.value = []
    allFunctionPoints.value = []
    pagination.value.current = 1
    dialogVisible.value = true
    getSystemPoint()
  }

  defineExpose({ open })

  onMounted(() => {
    // 初始加载已在 open 中处理
  })
</script>

<style lang="scss" scoped>
  .add-system-function-points-dialog {
    :deep(.transfer-checkbox) {
      .el-checkbox__inner {
        width: 28px;
        height: 28px;
      }
    }
    .btn-select-all {
      height: 25px;
      padding: 4px 15px;
      color: #505658;
      background: #ffffff;
      border: 1px solid #ebecf1;
      border-radius: 6px;
    }
    .btn-clean-all {
      height: 25px;
      padding: 4px 15px;
      color: #505658;
      background: #ffffff;
      border: none;
      border-radius: 6px;
    }
    .center-arrow {
      width: 0;
      height: 0;
      border-top: 14px solid transparent;
      border-bottom: 14px solid transparent;

      border-left: 14px solid #ebecf1;
    }
  }
</style>
