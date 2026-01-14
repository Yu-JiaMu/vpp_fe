<template>
  <div class="bg-white rounded-md thing-model">
    <!-- 顶部搜索区 -->
    <div
      class="flex p-5"
      :class="{
        'items-center justify-between': !isSettingModel,
        'flex-col': isSettingModel
      }"
    >
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

      <div v-if="!isSettingModel" class="flex items-center">
        <el-button text class="!text-g-303537" @click="handleExportModel">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-export-eye.png" alt="" />
          导出物模型
        </el-button>
        <el-button text class="!text-g-303537 !ml-0" @click="handleSetModel">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-setting-blue.png" alt="" />
          设置物模型
        </el-button>
      </div>

      <div v-else class="flex items-center justify-end mt-1">
        <el-button text class="!text-g-303537" @click="handleExportModel">
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
          <el-button @click="handleSearch"> 保存 </el-button>
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
          <!-- 属性 -->
          <template v-if="row.functionMode === FUNCTION_MODE_MAP.values.PROPERTY">
            <!-- int,float,double -->
            <div v-if="['int', 'float', 'double'].includes(row.define.type)">
              取值范围：{{ row.define.specs.min }} ~ {{ row.define.specs.max }}；
              <br />
              步长：{{ row.define.specs.step }}；
              <!-- <br />
            单位：{{ row.define.unit }} -->
            </div>

            <!-- text -->
            <div v-if="row.define.type === 'text'"> 数据长度：{{ row.define.specs.length }} </div>

            <!-- date -->
            <div v-if="row.define.type === 'date'"> 整数类型Int64的UTC时间戳(毫秒) </div>

            <!-- boolean/enum -->
            <div v-if="['boolean', 'enum'].includes(row.define.type)" class="gap-2 flex-c">
              <el-tag
                class="enum-tag"
                v-for="(value, label) in row.define.specs"
                :key="value"
                size="small"
                type="primary"
              >
                {{ label }}-{{ value }}
              </el-tag>
            </div>

            <!-- array -->
            <div v-if="row.define.type === 'array'">
              数组个数：{{ row.define.specs.maxItemsCount }}
            </div>

            <!-- object -->
            <div v-if="row.define.type === 'object'"> - </div>

            <!-- password -->
            <div v-if="row.define.type === 'password'">
              最大长度：{{ row.define.specs.length }}
            </div>

            <!-- geo_point -->
            <div v-if="row.define.type === 'geo_point'"> 地址位置数据，以经纬度显示 </div>
          </template>

          <!-- 事件 -->
          <template v-if="row.functionMode === FUNCTION_MODE_MAP.values.EVENT">
            <div class="flex-c">
              事件级别：
              <el-tag :type="levelTagType(row.originData.eventType)" size="small">
                {{ EVENT_TYPE_MAP.getLabel(row.originData.eventType) }}
              </el-tag>
            </div>
          </template>

          <!-- 功能 -->
          <template v-if="row.functionMode === FUNCTION_MODE_MAP.values.SERVICE">
            调用方式：{{ CALL_TYPE_MAP.getLabel(row.originData.callType) }}
          </template>
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
  </div>
</template>

<script setup>
  import ExportModelDialog from './export-model-dialog/index.vue'
  import ImportModelDialog from './import-model-dialog/index.vue'
  import AddSystemFunctionPointsDialog from './add-system-function-points-dialog/index.vue'
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

  const addFunctionPoint = (data) => {
    console.log(data)
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
  }
</style>
