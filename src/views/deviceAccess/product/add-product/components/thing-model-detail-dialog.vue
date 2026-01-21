<template>
  <el-dialog v-model="dialogVisible" align-center title="新增产品" :show-close="false" width="680">
    <div class="thing-model-detail-dialog">
      <h4 class="font-scMedium text-g-4 text-base flex-c mb-1.5">
        <img class="w-4 h-4 mr-2" src="@/assets/images/icon/icon-instrument.png" alt="" />
        {{ info.name }}
      </h4>
      <h5 class="mb-5 text-sm text-g-4">
        此产品分类包含了 {{ tableData.length }} 项标准功能定义
        <span v-show="!isSelected"> ，选择后系统将为您自动创建物模型 </span>
      </h5>

      <el-table :data="tableData" border max-height="580" style="width: 100%">
        <el-table-column prop="type" label="功能类型" width="150" />
        <el-table-column prop="name" label="功能名称" min-width="150" />
        <el-table-column prop="identifier" label="标识符" width="150" />
        <el-table-column prop="dataType" label="数据类型" width="150" />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
  import { transformThingJsonToTable } from '@/utils'
  const dialogVisible = ref(false)
  const isSelected = ref(false)

  const info = shallowRef('')

  const open = (row, status) => {
    console.log('open', row, status)
    info.value = row
    tableData.value = transformThingJsonToTable(row.thingModelJson)
    isSelected.value = !!status
    dialogVisible.value = true
  }

  const tableData = ref([])
  defineExpose({ open })
</script>

<style lang="scss" scoped>
  .thing-model-detail-dialog {
  }
</style>
