<template>
  <div class="flex justify-start pt-5">
    <el-pagination
      background
      layout="prev, pager, next, jumper, ->, total, sizes"
      :page-sizes="[10, 20, 30, 50, 100]"
      :page-size="pagination?.pageSize"
      :current-page="pagination?.current"
      :total="pagination?.total"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
  </div>
</template>

<script setup>
  const props = defineProps({
    pagination: {
      type: Object,
      default: () => {}
    }
  })

  const emit = defineEmits(['size-change', 'page-change'])
  const onSizeChange = (val) => {
    props.pagination.current = 1
    emit('size-change', val)
  }
  const onPageChange = (val) => {
    emit('page-change', val)
  }
</script>

<style lang="scss" scoped>
  .index {
  }
</style>
