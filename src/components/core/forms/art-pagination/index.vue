<template>
  <div class="flex justify-start pt-5">
    <el-pagination
      background
      layout="prev, pager, next, jumper, ->, total, sizes"
      :page-sizes="[10, 20, 30, 50, 100]"
      :page-size="pagination?.size"
      :current-page="pagination?.current"
      :total="pagination.total"
      @size-change="onSizeChange"
      @current-change="onPageChange"
      @change="onChange"
    />
  </div>
</template>

<script setup>
  const pagination = defineModel()

  const emit = defineEmits(['size-change', 'current-change', 'change'])
  const onSizeChange = (val) => {
    pagination.value.current = 1
    pagination.value.size = val
    emit('size-change', val)
  }
  const onPageChange = (val) => {
    console.log('size change')
    pagination.value.current = val
    emit('current-change', val)
  }

  const onChange = (val) => {
    emit('change', val)
  }
</script>

<style lang="scss" scoped>
  .index {
  }
</style>
