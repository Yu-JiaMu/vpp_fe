<template>
  <div class="relative">
    <el-table :data="modelValue" border>
      <el-table-column prop="name" label="参数名称" />
      <el-table-column prop="identifier" label="标识符" />
      <el-table-column label="数据类型">
        <template #default="{ row }">{{ row.dataType.type }}</template>
      </el-table-column>
      <el-table-column width="120">
        <template #default="{ $index }">
          <el-button link type="danger" @click="remove($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="add-btn absolute top-4 right-[-22px]" @click="open">
      <img src="@/assets/images/icon/icon-add.png" class="w-4.5 h-4.5" />
    </div>
    <StructDialog ref="dialogRef" @addStruct="add" />
  </div>
</template>

<script setup>
  import StructDialog from './struct-dialog.vue'
  const modelValue = defineModel()
  const dialogRef = ref()
  const open = () => dialogRef.value.open()
  const add = (item) => modelValue.value.push(item)

  const remove = (i) => modelValue.value.splice(i, 1)
</script>
