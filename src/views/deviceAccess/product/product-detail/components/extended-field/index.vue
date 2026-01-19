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
          @keyup.enter="handleSearch"
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
    <el-table :data="tableData" border stripe class="w-full">
      <el-table-column prop="name" label="功能名称" width="120" />
      <el-table-column prop="identifier" label="标识符" width="160" />
      <el-table-column prop="dataType" label="数据类型" width="140" />
      <!-- 数据定义 -->
      <el-table-column label="数据定义" min-width="260">
        <template #default="{ row }">
          <FunctionDefinePreview :row="row" />
        </template>
      </el-table-column>
      <el-table-column prop="required" label="是否必填项" width="100" />
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
    <ParamsDialog ref="dialogRef" v-model="form.input" />
  </div>
</template>

<script setup>
  import ParamsDialog from '../thing-model/thing-function/params-dialog.vue'
  import FunctionDefinePreview from '../thing-model/function-define-preview/index.vue'
  import { ref } from 'vue'
  import thingJson from '../thing-model/thing.json'
  import { transformThingJsonToTable } from '@/utils'
  import { FUNCTION_MODE_MAP } from '@/enums'

  const isEdit = ref(false)

  const isReadOnly = ref(false)

  provide('isReadOnly', isReadOnly)

  const form = reactive({
    identifier: '',
    input: []
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

  const addCustomFunctionPointDialogRef = useTemplateRef('dialogRef')
  const openCustomFunctionDialog = (row, index, type) => {
    console.log(row, index, type)
    isReadOnly.value = type === 'look'
    isEdit.value = type === 'edit'
    addCustomFunctionPointDialogRef.value.open(row, index, type)
  }

  const handleRemove = (index) => {}

  const addCustomPoint = ({ data, functionMode }) => {
    isChange.value = true
    const model = thingJson.modules[0]
    let key = FUNCTION_MODE_MAP.getItem(functionMode).pKey
    model[key].push(data)
    originTableData.value = transformThingJsonToTable(thingJson)
    handleSearch()
  }

  const handlePatchRemove = () => {}
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
