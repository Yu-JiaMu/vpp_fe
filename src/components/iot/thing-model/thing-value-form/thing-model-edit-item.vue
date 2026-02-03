<template>
  <!-- int / float / double -->
  <div v-if="isNumber" class="flex items-center">
    <el-input-number
      v-model="modelValue"
      :min="toNumber(specs.min)"
      :max="toNumber(specs.max)"
      placeholder="请输入"
      align="left"
      :controls="false"
      :precision="precision"
      clearable
      style="width: 208px"
    />
    <span v-if="specs.unit" class="ml-2 text-xs text-gray-400">
      {{ specs.unit }}
    </span>
  </div>

  <!-- text -->
  <el-input
    v-else-if="type === 'text'"
    v-model="modelValue"
    :maxlength="specs.length"
    show-word-limit
    style="width: 208px"
    :rows="2"
    placeholder="请输入"
    clearable
    type="textarea"
  />

  <!-- 密码 -->
  <el-input
    v-else-if="type === 'password'"
    v-model="modelValue"
    :maxlength="specs.length"
    style="width: 208px"
    clearable
    placeholder="请输入"
  />

  <!-- date -->
  <el-date-picker
    v-else-if="type === 'date'"
    v-model="modelValue"
    type="date"
    value-format="YYYY-MM-DD"
    placeholder="请选择时间"
    clearable
    style="width: 208px"
  />

  <!-- boolean -->
  <el-radio-group v-else-if="type === 'boolean'" v-model="modelValue" style="width: 208px">
    <el-radio :value="true">{{ specs.true }}</el-radio>
    <el-radio :value="false">{{ specs.false }}</el-radio>
  </el-radio-group>

  <!-- enum -->
  <el-select
    v-else-if="type === 'enum'"
    v-model="modelValue"
    placeholder="请选择"
    clearable
    style="width: 208px"
  >
    <el-option v-for="(label, value) in specs" :key="value" :label="label" :value="value" />
  </el-select>

  <!-- array / object ：JSON 字符串 -->
  <el-input
    v-else-if="['array', 'object'].includes(type)"
    v-model="modelValue"
    placeholder="请输入"
    clearable
    style="width: 208px"
  >
    <template #append>
      <div @click="openJsonEditDialog">
        <ArtSvgIcon icon="ri:edit-box-line" class="text-lg cursor-pointer text-g-4" />
      </div>
    </template>
  </el-input>

  <!-- geo_point -->
  <el-input
    v-else-if="type === 'geo_point'"
    v-model="modelValue"
    placeholder="经度,纬度 例如 123.193123,121.324565"
    clearable
    style="width: 208px"
  />

  <!-- json修改弹窗 -->
  <el-dialog
    v-model="jsonEditDialogVisible"
    title="编辑"
    width="742px"
    append-to-body
    :close-on-click-modal="false"
  >
    <MonacoEditor v-model="editorContent" theme="vs" class="h-[378px]" lang="json" />
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button
          size="large"
          type="info"
          class="w-[177px]"
          v-ripple
          @click="jsonEditDialogVisible = false"
          >取消</el-button
        >
        <el-button type="primary" class="w-[177px]" v-ripple @click="handleConfirm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  const modelValue = defineModel()

  const jsonEditDialogVisible = ref(false)
  const editorContent = ref('')

  const props = defineProps({
    item: { type: Object, required: true }
  })

  const type = computed(() => props.item.dataType.type)
  const specs = computed(() => props.item.dataType.specs || {})

  const isNumber = computed(() => ['int', 'float', 'double'].includes(type.value))

  const precision = computed(() => {
    return type.value === 'int' ? 0 : undefined
  })

  function toNumber(val) {
    return val === undefined ? undefined : Number(val)
  }

  function openJsonEditDialog() {
    jsonEditDialogVisible.value = true
    editorContent.value = modelValue.value ?? ''
  }

  function handleConfirm() {
    modelValue.value = editorContent.value
    jsonEditDialogVisible.value = false
  }
</script>
