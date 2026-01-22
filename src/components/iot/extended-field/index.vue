<template>
  <div class="bg-white rounded-md thing-model">
    <!-- 顶部搜索区 -->
    <div class="flex items-center justify-between p-5 search-con">
      <div class="flex items-center gap-2.5">
        <el-input
          v-model="form.identifier"
          placeholder="请输入标识符"
          clearable
          class="input-with-prepend"
          style="width: 248px"
          @change="handleSearch"
        >
          <template #prepend> 标识符 </template>
        </el-input>
        <span class="ml-2.5 text-xs text-theme"
          >* 为设备添加自定义业务标签与属性，满足设备特殊属性需求
        </span>
        <!-- <el-button @click="handleSearch"> 搜索 </el-button>
        <ArtResetBtn class="!ml-0" @click="handleReset" /> -->
      </div>

      <div class="flex items-center op-con">
        <el-button text class="!text-g-303537" @click="openCustomFunctionDialog()">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-001.png" alt="" />
          添加功能点
        </el-button>

        <el-button text class="!text-g-303537 !ml-0" @click="handlePatchRemove">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-004.png" alt="" />
          删除
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      border
      stripe
      class="w-full"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="功能名称" width="120" />
      <el-table-column prop="identifier" label="标识符" width="160" />
      <el-table-column prop="dataType" label="数据类型" width="140">
        <template #default="{ row }">
          {{ handleDataType(row) }}
        </template>
      </el-table-column>
      <!-- 数据定义 -->
      <el-table-column label="数据定义" min-width="260">
        <template #default="{ row }">
          <FunctionDefinePreview :row="row" functionMode="property" />
        </template>
      </el-table-column>
      <el-table-column prop="required" label="是否必填项" width="100">
        <template #default="{ row }">
          {{ REQUIRED_MAP.getLabel(row.required) }}
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row, $index }">
          <el-button type="primary" link @click="openCustomFunctionDialog(row, $index, 'look')">
            查看
          </el-button>

          <el-button type="primary" link @click="openCustomFunctionDialog(row, $index, 'edit')">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleRemove($index)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加功能点 -->
    <ParamsDialog ref="dialogRef" v-model="originTableData" @submit="handleSubmit()" />
  </div>
</template>

<script setup>
  import { ref, computed, watchEffect, provide } from 'vue'
  import ParamsDialog from '@/components/iot/thing-model/thing-function/params-dialog.vue'
  import FunctionDefinePreview from '@/components/iot/thing-model/function-define-preview/index.vue'
  import { handleDataType } from '@/utils'
  import { REQUIRED_MAP } from '@/enums'
  import { buildThingModel, parseThingModel } from '@/components/iot/thing-model/adapters'

  const props = defineProps({
    info: {
      type: Object,
      default: () => ({})
    },
    module: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['submit'])

  const isEdit = ref(false)
  const isReadOnly = ref(false)
  provide('isReadOnly', isReadOnly)

  const form = ref({
    identifier: ''
  })

  const originTableData = ref([])

  /* ====================== props → 本地数据初始化 ====================== */

  watchEffect(() => {
    const list = props.info?.expandInfoList ?? []
    originTableData.value = list.map((item) => parseThingModel(item))
  })

  /* ====================== 派生数据 ====================== */

  const searchKeyword = ref('')
  const handleSearch = () => {
    searchKeyword.value = form.value.identifier?.trim() || ''
  }
  const tableData = computed(() => {
    if (!searchKeyword.value) {
      return originTableData.value
    }

    return originTableData.value.filter((row) => row.identifier?.includes(searchKeyword.value))
  })

  /* ====================== Dialog ====================== */

  const dialogRef = useTemplateRef('dialogRef')

  const openCustomFunctionDialog = (row, index, type) => {
    isReadOnly.value = type === 'look'
    isEdit.value = type === 'edit'
    dialogRef.value.open(row, index, type)
  }

  const tableRef = useTemplateRef('tableRef')
  const selectedItems = ref([])

  const handleSelectionChange = (selection) => {
    selectedItems.value = selection
  }

  const handleRemove = async (index) => {
    try {
      await ElMessageBox.confirm('此操作将删除该项目，是否继续？', '提示', { type: 'warning' })

      originTableData.value.splice(index, 1)
      handleSubmit('删除成功')
    } catch (error) {
      if (error.message !== 'cancel') {
        console.error('删除出错:', error)
      }
    }
  }

  const handlePatchRemove = async () => {
    if (!selectedItems.value.length) {
      ElMessage.warning('请先选择要删除的项目')
      return
    }

    try {
      await ElMessageBox.confirm('此操作将删除选中的项目，是否继续？', '提示', { type: 'warning' })

      originTableData.value = originTableData.value.filter(
        (item) => !selectedItems.value.includes(item)
      )

      tableRef.value?.clearSelection()
      selectedItems.value = []

      handleSubmit('批量删除成功')
    } catch (error) {
      if (error.message !== 'cancel') {
        console.error('删除出错:', error)
      }
    }
  }

  const handleSubmit = (msg = '添加成功') => {
    const data = originTableData.value.map((item) => buildThingModel(item))

    emits('submit', { data, msg })
  }
</script>

<style lang="scss" scoped>
  .thing-model {
    .enum-tag {
      background: #eefeff;
      border: 1px solid #38ecf2;
      // border-radius: 7px;
      color: #505658;
      // padding: 2px 10px;
    }
    .dividing-line {
      height: 20px;
      width: 1px;
      background-color: #ced1d9;
    }
    .btn-setting-back {
      background: #ffffff;
      border: 1px solid #e5e6ec;
      color: #ced1d9;
      &:hover {
        color: var(--art-gray-4);
        border: 1px solid var(--art-gray-4);
      }
    }

    @media screen and (max-width: 1200px) {
      .search-con {
        flex-direction: column;
        align-items: flex-start;
      }
      .op-con {
        margin-top: 4px;
        align-self: flex-end;
      }
    }
  }
</style>
