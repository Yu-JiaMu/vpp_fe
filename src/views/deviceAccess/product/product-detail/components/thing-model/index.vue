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
        <el-button text class="!text-g-303537" @click="openCustomFunctionDialog">
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
        <el-button text class="!text-g-303537 !ml-0" @click="handleSetModel">
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
    <el-table :data="tableData" border stripe class="w-full">
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
        <template #default>
          <el-button type="primary" link> 详情 </el-button>
          <template v-if="isSettingModel">
            <el-button type="primary" link> 编辑 </el-button>
            <el-button type="danger" link> 删除 </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 导出物模型弹窗 -->
    <ExportModelDialog ref="exportModelDialogRef" />

    <!-- 导入物模型弹窗 -->
    <ImportModelDialog ref="importModelDialogRef" />

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
  import ExportModelDialog from './export-model-dialog/index.vue'
  import ImportModelDialog from './import-model-dialog/index.vue'
  import AddSystemFunctionPointsDialog from './add-system-function-points-dialog/index.vue'
  import AddCustomFunctionPointDialog from './add-custom-function-point-dialog/index.vue'
  import FunctionDefinePreview from './function-define-preview/index.vue'
  import { ref } from 'vue'
  import thingJson from './thing.json'
  import { transformThingJsonToTable } from '@/utils'
  import {
    FUNCTION_MODE_MAP,
    THING_SOURCE_MAP,
    ACCESS_MODE_MAP,
    CALL_TYPE_MAP,
    EVENT_TYPE_MAP,
    DATA_TYPE_MAP
  } from '@/enums'

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

  const originTableData = ref(transformThingJsonToTable(thingJson))
  const tableData = ref([])

  const handleSearch = () => {
    const { name, functionMode } = form.value
    console.log(name, functionMode)

    tableData.value = originTableData.value.filter((row) => {
      const matchName = !name || row.name?.includes(name)
      const matchMode = !functionMode || row.functionMode === functionMode

      return matchName && matchMode
    })
  }

  const handleReset = () => {
    form.value.name = ''
  }

  const levelTagType = (level) => {
    switch (level) {
      case 'info':
        return 'info'
      case 'warn':
        return 'warning'
      case 'error':
        return 'danger'
      default:
        return 'info'
    }
  }

  const exportModelDialogRef = useTemplateRef('exportModelDialogRef')
  const handleExportModel = () => {
    exportModelDialogRef.value.open()
  }

  const importModelDialogRef = useTemplateRef('importModelDialogRef')
  const handleImportModel = () => {
    importModelDialogRef.value.open()
  }

  const addSystemFunctionPointsDialogRef = useTemplateRef('addSystemFunctionPointsDialogRef')

  const openSystemFunctionDialog = () => {
    addSystemFunctionPointsDialogRef.value.open()
  }

  const addCustomFunctionPointDialogRef = useTemplateRef('addCustomFunctionPointDialogRef')
  const openCustomFunctionDialog = () => {
    addCustomFunctionPointDialogRef.value.open()
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

  const handleSubmit = () => {
    isChange.value = false
  }
  onMounted(() => {
    tableData.value = [...originTableData.value]
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
