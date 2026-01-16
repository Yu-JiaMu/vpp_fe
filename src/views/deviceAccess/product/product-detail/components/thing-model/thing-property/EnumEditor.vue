<!-- 枚举编辑 -->
<template>
  <div>
    <div v-for="(item, i) in modelValue" :key="i" class="flex gap-2 mb-2">
      <el-input-number v-model="item.value" />
      <el-input v-model="item.label" />
      <el-button @click="remove(i)">-</el-button>
    </div>
    <el-button @click="add">+ 添加枚举</el-button>
  </div>
</template>

<script setup>
  const modelValue = defineModel()

  const add = () => modelValue.value.push({ value: null, label: '' })
  const remove = (i) => modelValue.value.splice(i, 1)
</script>
