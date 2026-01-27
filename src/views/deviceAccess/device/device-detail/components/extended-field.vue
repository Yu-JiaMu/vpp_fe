<template>
  <div class="bg-white rounded-md thing-model">
    <!-- 顶部搜索区 -->
    <div class="flex items-center justify-between p-5 search-con">
      <div class="flex items-center gap-2.5">
        <el-input
          v-model="form.identifier"
          placeholder="请输入功能名称搜索"
          clearable
          class="input-with-prepend"
          style="width: 248px"
          @change="handleSearch"
        >
          <template #prepend> 功能名称 </template>
        </el-input>

        <el-button @click="handleSearch"> 搜索 </el-button>
        <ArtResetBtn class="!ml-0" @click="handleReset" />
      </div>
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="tableData" border show-overflow-tooltip stripe class="w-full">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="功能名称" width="120" />
      <el-table-column prop="identifier" label="标识符" width="160" />

      <!-- 数据定义 -->
      <el-table-column label="值" min-width="260">
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
          <el-button type="primary" link @click="openDialog(row, $index, 'edit')"> 编辑 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加功能点 -->
    <el-dialog v-model="dialogVisible" align-center title="编辑" :show-close="false" width="598">
      <ThingValueForm ref="valueFormRef" :schema="[]" />
      <!-- 底部按钮 -->
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
          <el-button type="primary" class="w-[177px]" v-ripple @click="handleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import FunctionDefinePreview from '@/components/iot/thing-model/function-define-preview/index.vue'
  import { REQUIRED_MAP } from '@/enums'
  import { buildThingModel, parseThingModel } from '@/components/iot/thing-model/adapters'
  import * as api from '@/api/iot'

  const route = useRoute()

  const emits = defineEmits(['submit'])

  const form = ref({
    identifier: ''
  })

  const originTableData = ref([])

  const handleReset = () => {
    form.value.identifier = ''
    handleSearch()
  }

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
  const dialogVisible = ref(false)
  const schema = ref([])
  const openDialog = (row, index, type) => {
    dialogVisible.value = true
    schema.value = [row]
  }

  const valueFormRef = useTemplateRef('valueFormRef')
  const handleSubmit = async () => {
    const valid = await valueFormRef.value?.validate()
    if (!valid) return

    const params = valueFormRef.value.getValues()
    console.log(params)

    // emits('submit')
  }

  const getTableData = async () => {
    const data = await api.apiDevExpandInfo({ id: route.query.id })
    console.log(data)

    originTableData.value = list.map((item) => parseThingModel(item))
  }

  onMounted(() => {
    getTableData()
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
