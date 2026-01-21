<template>
  <div class="bg-white rounded-md thing-model">
    <!-- 顶部搜索区 -->
    <div class="flex items-center justify-between p-5 search-con">
      <div class="flex items-center gap-2.5">
        <el-input
          v-model="form.name"
          placeholder="请输入功能名称"
          clearable
          class="input-with-prepend"
          style="width: 248px"
          @keyup.enter="handleSearch"
        >
          <template #prepend> 功能名称 </template>
        </el-input>

        <ArtSelectPrepend>
          <template #label> 功能类型 </template>
          <el-select
            v-model="form.functionMode"
            placeholder="请选择功能类型"
            style="width: 149px"
            clearable
          >
            <el-option
              v-for="item in FUNCTION_MODE_MAP.options"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </ArtSelectPrepend>

        <el-button @click="handleSearch"> 搜索 </el-button>
        <ArtResetBtn class="!ml-0" @click="handleReset" />
      </div>

      <div v-if="!isSettingModel" class="flex items-center op-con">
        <el-button text class="!text-g-303537" @click="handleExportModel">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-export-eye.png" alt="" />
          导出物模型
        </el-button>
        <el-button text class="!text-g-303537 !ml-0" @click="handleSetModel">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-setting-blue.png" alt="" />
          设置物模型
        </el-button>
      </div>

      <div v-else class="flex items-center op-con">
        <el-button text class="!text-g-303537" @click="openCustomFunctionDialog()">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-001.png" alt="" />
          添加自定义功能点
        </el-button>
        <div class="dividing-line"></div>
        <el-button text class="!text-g-303537 !ml-0" @click="openSystemFunctionDialog">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-002.png" alt="" />
          添加系统功能点
        </el-button>
        <div class="dividing-line"></div>
        <el-button text class="!text-g-303537 !ml-0" @click="handleImportModel">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-003.png" alt="" />
          导入物模型
        </el-button>
        <div class="dividing-line"></div>
        <el-button
          :disabled="hasRegisterDevice || selectedItems.length === 0"
          text
          class="!text-g-303537 !ml-0"
          @click="handleBatchDelete"
        >
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-004.png" alt="" />
          删除
        </el-button>
        <div class="dividing-line"></div>
        <div class="flex ml-4">
          <el-button color="#ffffff" class="btn-setting-back" @click="handleCancelSetting">
            返回
          </el-button>
          <el-button @click="handleSubmit"> 保存 </el-button>
        </div>
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
      <el-table-column type="selection" />
      <el-table-column prop="type" label="功能类型" width="100" />
      <el-table-column prop="source" label="功能来源" width="100" />
      <el-table-column prop="name" label="功能名称" width="120" />
      <el-table-column prop="identifier" label="标识符" width="160" />
      <el-table-column prop="dataType" label="数据类型" width="140" />

      <!-- 数据定义 -->
      <el-table-column label="数据定义" min-width="260">
        <template #default="{ row }">
          <FunctionDefinePreview :row="row" />
        </template>
      </el-table-column>

      <el-table-column prop="accessMode" label="读写类型" width="100" />

      <!-- 操作 -->
      <el-table-column label="操作" :width="isSettingModel ? 160 : 80" fixed="right">
        <template #default="{ row, $index }">
          <el-button type="primary" link @click="openCustomFunctionDialog(row, $index, 'look')">
            详情
          </el-button>
          <template v-if="isSettingModel">
            <el-button type="primary" link @click="openCustomFunctionDialog(row, $index, 'edit')">
              编辑
            </el-button>
            <el-button
              :disabled="hasRegisterDevice"
              type="danger"
              link
              @click="handleRemove($index)"
            >
              删除
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 导出物模型弹窗 -->
    <ExportModelDialog
      ref="exportModelDialogRef"
      :info="info"
      :thingJson="thingJson"
      :module="module"
    />

    <!-- 导入物模型弹窗 -->
    <ImportModelDialog
      ref="importModelDialogRef"
      :info="info"
      :module="module"
      @refresh="handleRefresh"
    />

    <!-- 添加系统功能点 -->
    <AddSystemFunctionPointsDialog
      ref="addSystemFunctionPointsDialogRef"
      @addFunctionPoint="addFunctionPoint"
    />

    <!-- 添加自定义功能点 -->
    <AddCustomFunctionPointDialog
      ref="addCustomFunctionPointDialogRef"
      :tableData="tableData"
      @addFunctionPoint="addCustomPoint"
    />
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import ExportModelDialog from './export-model-dialog/index.vue'
  import ImportModelDialog from './import-model-dialog/index.vue'
  import AddSystemFunctionPointsDialog from './add-system-function-points-dialog/index.vue'
  import AddCustomFunctionPointDialog from './add-custom-function-point-dialog/index.vue'
  import FunctionDefinePreview from './function-define-preview/index.vue'
  import { ref } from 'vue'
  // import thingJson from './thing.json'
  import { transformThingJsonToTable, transformTableToThingJson } from '@/utils'
  import { FUNCTION_MODE_MAP } from '@/enums'
  import { differenceBy } from 'lodash-es'

  const props = defineProps({
    info: {
      type: Object,
      default: () => {}
    },
    thingJson: {
      type: [Object],
      default: () => {}
    },
    module: {
      type: String,
      default: ''
    }
  })
  const emits = defineEmits(['refresh'])

  let thingJson = {}
  const originTableData = ref([])
  const tableData = ref([])

  const isEdit = ref(false)
  const hasRegisterDevice = ref(false)
  // const isEditAndHasRegisterDevice = computed(() => isEdit.value && hasRegisterDevice.value)

  provide('hasRegisterDevice', hasRegisterDevice)

  const isReadOnly = ref(false)

  provide('isReadOnly', isReadOnly)

  const isSettingModel = ref(true)
  const handleSetModel = () => {
    isSettingModel.value = true
  }

  const handleCancelSetting = () => {
    isSettingModel.value = false
  }

  const form = ref({
    name: ''
  })

  const handleSearch = () => {
    const { name, functionMode } = form.value
    // console.log(name, functionMode)

    tableData.value = originTableData.value.filter((row) => {
      const matchName = !name || row.name?.includes(name)
      const matchMode = !functionMode || row.functionMode === functionMode

      return matchName && matchMode
    })
  }

  const handleReset = () => {
    form.value.name = ''
  }

  const exportModelDialogRef = useTemplateRef('exportModelDialogRef')
  const handleExportModel = () => {
    exportModelDialogRef.value.open(props.thingJson)
  }

  const importModelDialogRef = useTemplateRef('importModelDialogRef')
  const handleImportModel = async () => {
    if (isChange.value) {
      await ElMessageBox.confirm(`还未保存当前物模型，导入会丢失，确定导入吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    }
    importModelDialogRef.value.open()
  }

  const addSystemFunctionPointsDialogRef = useTemplateRef('addSystemFunctionPointsDialogRef')

  const openSystemFunctionDialog = () => {
    addSystemFunctionPointsDialogRef.value.open()
  }

  const addCustomFunctionPointDialogRef = useTemplateRef('addCustomFunctionPointDialogRef')
  const openCustomFunctionDialog = (row, index, type) => {
    console.log(row, index, type)
    isReadOnly.value = type === 'look'
    isEdit.value = type === 'edit'
    addCustomFunctionPointDialogRef.value.open(row, index, type)
  }

  const tableRef = useTemplateRef('tableRef')
  const selectedItems = ref([])

  const handleSelectionChange = (selection) => {
    selectedItems.value = selection
  }

  const handleRemove = async (index) => {
    console.log(index)
    try {
      await ElMessageBox.confirm('此操作将删除该物模型，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      isChange.value = true
      originTableData.value.splice(index, 1)
      handleSearch()
      ElMessage.success('删除成功')
    } catch (error) {
      if (error.message !== 'cancel') {
        console.log(error)
      }
    }
  }

  const handleBatchDelete = async () => {
    if (selectedItems.value.length === 0) {
      ElMessage.warning('请先选择要删除的项目')
      return
    }

    try {
      await ElMessageBox.confirm('此操作将删除该物模型，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      isChange.value = true
      console.log(selectedItems.value)

      // 删除选中的项目
      originTableData.value = differenceBy(originTableData.value, selectedItems.value, 'id')

      handleSearch()

      // 清空选中状态
      tableRef.value.clearSelection()
      selectedItems.value = []

      ElMessage.success('批量删除成功')
    } catch (error) {
      if (error.message !== 'cancel') {
        console.log(error)
      }
    }
  }

  const isChange = ref(false) // 已修改未保存

  const addFunctionPoint = (data) => {
    console.log(data)
    isChange.value = true
    const model = thingJson.modules[0]

    data.forEach((item) => {
      // 模型已存在
      const existModel = originTableData.value.find(
        (modelItem) => modelItem.identifier === item.identifier
      )
      if (existModel) return

      let key = FUNCTION_MODE_MAP.getItem(item.functionMode).pKey

      model[key].push(item.originData)
    })

    originTableData.value = transformThingJsonToTable(thingJson)
    handleSearch()
  }

  const addCustomPoint = ({ data, functionMode }) => {
    isChange.value = true
    const model = thingJson.modules[0]
    let key = FUNCTION_MODE_MAP.getItem(functionMode).pKey
    model[key].push(data)
    originTableData.value = transformThingJsonToTable(thingJson)
    handleSearch()
  }

  const handleSubmit = async () => {
    const newThingJson = transformTableToThingJson(originTableData.value, thingJson)
    console.log('转换后的物模型', newThingJson)
    try {
      switch (props.module) {
        case 'product':
          await api.updateProductThingModel({ id: props.info.id, thingModel: newThingJson })
          break
        case 'productCategory':
          await api.updateProductCategoryThingModel({ id: props.info.id, thingModel: newThingJson })
          break
        default:
          break
      }
      ElMessage.success('更新成功')

      isChange.value = false
    } catch (error) {
      console.log(error)
    }
  }

  const handleRefresh = () => {
    isChange.value = false
    emits('refresh')
  }

  function init() {
    console.log('初始化')
    originTableData.value = transformThingJsonToTable(thingJson)
    console.log('table', originTableData.value)

    handleSearch()
  }

  watch(
    () => props.thingJson,
    (val) => {
      thingJson = val
      console.log('thingJson', val)
      init()
    },
    {
      immediate: true
    }
  )

  onMounted(() => {
    // tableData.value = [...originTableData.value]
    // init()
    // handleSubmit()
  })
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
  }
</style>
