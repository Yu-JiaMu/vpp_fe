<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加系统功能点"
    width="672px"
    :close-on-click-modal="false"
  >
    <div class="add-system-function-points-dialog">
      <div class="mb-2.5 text-sm text-g-303537">功能列表</div>
      <el-input
        v-model="keyword"
        placeholder="请输入物模型名称/标识符进行搜索"
        clearable
        class="mb-6"
      >
        <template #prefix>
          <ArtSvgIcon icon="ri:search-line" class="text-g-303537" />
        </template>
      </el-input>

      <div class="flex gap-2 h-[405px]">
        <!-- 左侧：可选功能点 -->
        <div class="flex flex-col w-1/2 p-2.5 pr-0 border border-[#e4e5ef] rounded-md">
          <el-scrollbar height="330px">
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
            </div>
          </el-scrollbar>
          <div class="pr-3 text-right">
            <el-button class="btn-select-all" size="small" @click="addAllFunctionPoints">
              全选
            </el-button>
          </div>
        </div>

        <!-- 中间箭头 -->
        <div class="flex items-center justify-center center-arrow"> </div>

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
  import { ref, computed } from 'vue'
  import * as api from '@/api/iot'
  import PointCard from './point-card.vue'
  import { transformThingJsonToTable } from '@/utils'

  const emits = defineEmits(['addFunctionPoint'])
  /** 弹窗状态 */
  const dialogVisible = ref(false)

  /** 搜索关键字 */
  const keyword = ref('')

  /** 模拟数据（后续可直接换 thingJson 转换结果） */
  const allFunctionPoints = ref([])

  /** 已选功能点 */
  const selectedList = ref([])

  /** 是否已选 */
  const isSelected = (id) => selectedList.value.some((item) => item.id === id)

  /** 左侧可选列表（自动排除已选） */
  const filteredAvailableList = computed(() => {
    return allFunctionPoints.value.filter((item) => {
      if (isSelected(item.id)) return false
      if (!keyword.value) return true
      return item.name.includes(keyword.value) || item.identifier.includes(keyword.value)
    })
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

  async function getSystemPoint() {
    const res = await api.getSystemFunctionPoint()
    const data = transformThingJsonToTable(res)
    allFunctionPoints.value = data
  }
  const open = (row) => {
    dialogVisible.value = true
  }

  defineExpose({ open })

  onMounted(() => {
    getSystemPoint()
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
