<template>
  <el-dialog v-model="dialogVisible" align-center title="查看物模型" width="680">
    <div class="thing-model-detail-dialog">
      <h4 class="font-scMedium text-g-4 text-base flex-c mb-1.5">
        <img class="w-4 h-4 mr-2" src="@/assets/images/icon/icon-instrument.png" alt="" />
        智能仪表
      </h4>
      <h5 class="text-g-4 text-sm mb-5">
        此产品分类包含了 31 项标准功能定义
        <span v-show="!isSelected"> ，选择后系统将为您自动创建物模型 </span>
      </h5>

      <el-table :data="tableData" border max-height="580" style="width: 100%">
        <el-table-column prop="type" label="功能类型" width="150" />
        <el-table-column prop="name" label="功能名称" min-width="150" />
        <el-table-column prop="symbol" label="标识符" width="150" />
        <el-table-column prop="dataType" label="数据类型" width="150" />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
  const dialogVisible = ref(false)
  const isSelected = ref(false)
  const open = (row, status) => {
    console.log('open', row, status)
    isSelected.value = !!status
    dialogVisible.value = true
  }
  const tableData = ref([
    { type: '属性', name: '电压', symbol: 'voltage', dataType: 'float(单精度浮点型)' },
    { type: '属性', name: '电流', symbol: 'electriccurrent', dataType: 'float(单精度浮点型)' },
    { type: '属性', name: '电能', symbol: 'electricity', dataType: 'float(单精度浮点型)' },
    { type: '属性', name: '开关', symbol: 'Switch', dataType: 'float(单精度浮点型)' },
    { type: '属性', name: '电压（修改）', symbol: 'voltage', dataType: 'float(单精度浮点型)' },
    { type: '功能', name: '电流修改', symbol: 'electriccurrent', dataType: 'float(单精度浮点型)' },
    { type: '功能', name: '公共服务', symbol: 'Switch', dataType: 'float(单精度浮点型)' },
    { type: '功能', name: '公共服务', symbol: 'lizhi', dataType: 'float(单精度浮点型)' },
    { type: '功能', name: '公共服务', symbol: 'zuobiao', dataType: '选择' },
    { type: '功能', name: '公共服务', symbol: '智慧城市', dataType: '选择' }
  ])
  defineExpose({ open })
</script>

<style lang="scss" scoped>
  .thing-model-detail-dialog {
  }
</style>
