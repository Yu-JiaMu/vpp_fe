<template>
  <div class="thing-value-form">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-position="top">
      <el-table :data="schema" border>
        <el-table-column prop="name" label="参数名称" width="180" />
        <el-table-column prop="dataType.type" label="输入类型" width="120" />
        <el-table-column label="值">
          <template #default="{ row }">
            <div class="py-5">
              <el-form-item :prop="row.identifier" class="!mb-0">
                <ThingModelEditItem :item="row" v-model="formModel[row.identifier]" />
              </el-form-item>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script setup>
  import { reactive, watch, computed } from 'vue'
  import { buildThingModelValueRules } from '@/utils'
  import ThingModelEditItem from './thing-model-edit-item.vue'

  const props = defineProps({
    schema: {
      type: Array,
      default: () => []
    }
  })

  const formRef = ref()

  /**
   * 表单数据
   */
  const formModel = reactive({})

  function buildFormModel(schema = []) {
    // 清空旧值（保证 schema 切换干净）
    Object.keys(formModel).forEach((key) => delete formModel[key])

    schema.forEach((item) => {
      const key = item.identifier
      formModel[key] = item[key] ?? null
    })
  }

  const rules = computed(() => {
    return buildThingModelValueRules(props.schema)
  })

  /**
   * schema 变化时重建表单
   */
  watch(
    () => props.schema,
    (schema) => {
      buildFormModel(schema)
      formRef.value?.clearValidate()
    },
    { immediate: true }
  )

  async function validate() {
    return formRef.value?.validate()
  }

  /**
   * 获取参数值
   */
  function getValues() {
    return Object.entries(formModel).map(([identifier, value]) => ({
      identifier,
      value
    }))
  }

  /**
   * 重置表单
   */
  async function reset() {
    await new Promise((r) => requestAnimationFrame(r))
    Object.keys(formModel).forEach((key) => {
      formModel[key] = null
    })
    formRef.value?.clearValidate()
  }

  defineExpose({
    validate,
    getValues,
    reset
  })
</script>

<style lang="scss" scoped>
  .thing-value-form {
    :deep(.el-table--default td) {
      padding: 0 !important;
    }
  }
</style>
