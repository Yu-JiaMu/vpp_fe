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
        <el-button v-if="!isInner" text class="!text-g-303537 !ml-0" @click="handleSetModel">
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
          :disabled="hasRegisterDevice"
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
      <el-table-column v-if="isSettingModel" type="selection" />
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
              @click="handleRemove(row, $index)"
            >
              删除
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 导出物模型弹窗 -->
    <ExportModelDialog ref="exportModelDialogRef" :info="info" :module="module" />

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
      :tableData="originTableData"
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
  import { ref, computed, watchEffect, provide } from 'vue'
  import { transformThingJsonToTable, transformTableToThingJson } from '@/utils'
  import { FUNCTION_MODE_MAP, INTERNAL_DEVICE_TYPES } from '@/enums'
  import { differenceBy } from 'lodash-es'

  /* ====================== props / emits ====================== */

  const props = defineProps({
    info: {
      type: Object,
      default: () => ({})
    },
    thingJson: {
      type: Object,
      default: () => ({})
    },
    module: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['refresh'])

  /* ====================== 状态 ====================== */

  let thingJson = {
    version: '1.0',
    identifier: 'pid',
    name: '产品物模型',
    modules: [
      { identifier: 'default', name: '默认模块', properties: [], events: [], functions: [] }
    ]
  }

  const originTableData = ref([])

  const isEdit = ref(false)
  const hasRegisterDevice = ref(false)
  provide('hasRegisterDevice', hasRegisterDevice)

  const isReadOnly = ref(false)
  provide('isReadOnly', isReadOnly)

  const isSettingModel = ref(false)
  const isChange = ref(false) // 已修改未保存

  /* ====================== 搜索 ====================== */

  const form = ref({
    name: '',
    functionMode: ''
  })

  // 搜索确认态（关键）
  const searchCondition = ref({
    name: '',
    functionMode: ''
  })

  const handleSearch = () => {
    searchCondition.value = { ...form.value }
  }

  const handleReset = () => {
    form.value.name = ''
    form.value.functionMode = ''
    searchCondition.value = { name: '', functionMode: '' }
  }

  /* ====================== tableData（派生） ====================== */

  const tableData = computed(() => {
    const { name, functionMode } = searchCondition.value

    return originTableData.value.filter((row) => {
      const matchName = !name || row.name?.includes(name)
      const matchMode = !functionMode || row.functionMode === functionMode
      return matchName && matchMode
    })
  })

  /* ====================== 初始化（props → 本地） ====================== */

  watchEffect(() => {
    hasRegisterDevice.value = (props.info?.deviceCount ?? 0) > 0 && isEdit.value
  })

  watchEffect(() => {
    if (!props.thingJson?.modules) return

    thingJson = props.thingJson
    originTableData.value = transformThingJsonToTable(thingJson)
  })

  /* ====================== 设置模式 ====================== */

  const handleSetModel = () => {
    isSettingModel.value = true
  }

  const handleCancelSetting = async () => {
    if (isChange.value) {
      await ElMessageBox.confirm(`还未保存当前物模型，返回会丢失，确定返回吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      handleRefresh()
    }
    isSettingModel.value = false
  }

  // 产品品类是否是内置物模型，不可修改
  const isInner = computed(() => {
    return (
      props.info.categoryType === INTERNAL_DEVICE_TYPES.values.INNER &&
      props.module === 'productCategory'
    )
  })
  /* ====================== Dialog ====================== */

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
  const originalIdentifier = ref(null) // 保存原始identifier
  const openCustomFunctionDialog = (row, index, type) => {
    isReadOnly.value = type === 'look'
    isEdit.value = type === 'edit'
    originalIdentifier.value = row?.identifier || null // 保存原始identifier
    addCustomFunctionPointDialogRef.value.open(row, index, type)
  }

  /* ====================== 表格选择 ====================== */

  const tableRef = useTemplateRef('tableRef')
  const selectedItems = ref([])

  const handleSelectionChange = (selection) => {
    selectedItems.value = selection
  }

  /* ====================== 删除 ====================== */
  const removeFromModelByIdentifier = (model, identifier) => {
    if (!identifier) return

    Object.keys(model).forEach((key) => {
      const list = model[key]
      if (!Array.isArray(list)) return

      const index = list.findIndex(
        (item) => item.identifier?.toLocaleLowerCase() === identifier.toLocaleLowerCase()
      )

      if (index > -1) {
        list.splice(index, 1)
      }
    })
  }

  const handleRemove = async (row, index) => {
    const model = thingJson.modules[0]

    try {
      await ElMessageBox.confirm('此操作将删除该功能点，是否继续？', '提示', {
        type: 'warning'
      })

      isChange.value = true

      // 删除 model 中对应的项
      removeFromModelByIdentifier(model, row.identifier)

      originTableData.value.splice(index, 1)

      ElMessage.success('删除成功')
    } catch (err) {}
  }

  const handleBatchDelete = async () => {
    if (!selectedItems.value.length) {
      ElMessage.warning('请先选择要删除的项目')
      return
    }

    const model = thingJson.modules[0]

    try {
      await ElMessageBox.confirm('此操作将批量删除该功能点，是否继续？', '提示', {
        type: 'warning'
      })

      isChange.value = true

      // 先删 model
      selectedItems.value.forEach((item) => {
        removeFromModelByIdentifier(model, item.identifier)
      })

      // 再删表格
      originTableData.value = differenceBy(originTableData.value, selectedItems.value, 'id')

      tableRef.value?.clearSelection()
      selectedItems.value = []

      ElMessage.success('批量删除成功')
    } catch (err) {}
  }

  /* ====================== 添加功能点 ====================== */

  const addFunctionPoint = (data) => {
    isChange.value = true
    const model = thingJson.modules[0]

    data.forEach((item) => {
      const key = FUNCTION_MODE_MAP.getItem(item.functionMode).pKey
      const list = model[key]

      const index = list.findIndex(
        (row) => row.identifier?.toLocaleLowerCase() === item.identifier?.toLocaleLowerCase()
      )

      if (index > -1) {
        list.splice(index, 1, item.originData)
        ElMessage.success('更新成功')
      } else {
        list.push(item.originData)
        ElMessage.success('添加成功')
      }
    })

    originTableData.value = transformThingJsonToTable(thingJson)
  }

  const addCustomPoint = ({ data, functionMode }) => {
    isChange.value = true

    const model = thingJson.modules[0]
    const key = FUNCTION_MODE_MAP.getItem(functionMode).pKey

    if (!Array.isArray(model[key])) {
      model[key] = []
    }

    // 使用原始identifier查找记录（如果有原始identifier，说明是编辑操作）
    let index = -1
    if (originalIdentifier.value) {
      index = model[key].findIndex(
        (row) => row.identifier.toLocaleLowerCase() === originalIdentifier.value.toLocaleLowerCase()
      )
    } else {
      // 如果没有原始identifier，用新identifier查找（新增操作）
      index = model[key].findIndex(
        (row) => row.identifier.toLocaleLowerCase() === data.identifier.toLocaleLowerCase()
      )
    }

    if (index > -1) {
      model[key][index] = data
    } else {
      model[key].push(data)
    }

    // 清空原始identifier引用
    originalIdentifier.value = null

    originTableData.value = transformThingJsonToTable(thingJson)
  }

  /* ====================== 提交 ====================== */

  const handleSubmit = async () => {
    const newThingJson = transformTableToThingJson(originTableData.value, thingJson)

    try {
      switch (props.module) {
        case 'product':
          await api.updateProductThingModel({
            id: props.info.id,
            thingModel: newThingJson
          })
          break
        case 'productCategory':
          await api.updateProductCategoryThingModel({
            id: props.info.id,
            thingModel: newThingJson
          })
          break
      }

      ElMessage.success('更新成功')
      handleRefresh()
    } catch (err) {
      console.log(err)
    }
  }

  const handleRefresh = () => {
    isChange.value = false
    emits('refresh')
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
