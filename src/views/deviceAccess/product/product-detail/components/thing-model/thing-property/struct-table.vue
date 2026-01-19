<template>
  <div class="relative">
    <el-form-item
      label="JSON对象"
      class="relative"
      :prop="`${propPath}.children`"
      :rules="childrenRules"
      required
    >
      <div
        v-if="!(hasRegisterDevice || isReadOnly)"
        class="add-btn absolute top-4 right-[-22px] z-10 cursor-pointer"
        @click="open"
      >
        <img class="w-4.5 h-4.5" src="@/assets/images/icon/icon-add.png" alt="" />
      </div>
      <el-table :data="modelValue" border class="w-full">
        <el-table-column prop="name" label="参数名称" />
        <el-table-column prop="identifier" label="标识符" />
        <el-table-column label="数据类型">
          <template #default="{ row }">{{ row.dataType.type }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row, $index }">
            <el-button
              :disabled="isReadOnly || hasRegisterDevice"
              type="primary"
              link
              @click="edit(row, $index)"
              >编辑</el-button
            >
            <el-button
              :disabled="isReadOnly || hasRegisterDevice"
              type="danger"
              link
              @click="remove($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <StructDialog
      ref="dialogRef"
      v-model="modelValue"
      :tableData="modelValue"
      @submitSuccess="handlesubmitSuccess"
    />
  </div>
</template>

<script setup>
  import StructDialog from './struct-dialog.vue'

  const props = defineProps({
    propPath: {
      type: String,
      required: true
    },
    formRef: Object
  })

  const isReadOnly = inject('isReadOnly')
  const hasRegisterDevice = inject('hasRegisterDevice')

  const modelValue = defineModel()
  const dialogRef = ref()
  const open = () => dialogRef.value.open()

  const edit = (row, index) => {
    dialogRef.value.open(row, index)
  }

  const remove = (i) => modelValue.value.splice(i, 1)

  const childrenRules = [{ required: true, message: '必须至少有1项', trigger: 'submit' }]

  const handlesubmitSuccess = () => {
    // 触发父组件验证
    props.formRef?.validateField(`${props.propPath}.children`)
  }
</script>
