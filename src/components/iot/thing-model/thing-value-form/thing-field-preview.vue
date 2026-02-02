<template>
  <div class="text-sm leading-6 text-gray-800">
    <!-- enum -->
    <span v-if="type === 'enum'" class="enum-tag" size="small"
      >{{ fieldValue }} - {{ enumLabel }}
    </span>

    <!-- boolean -->
    <el-tag v-else-if="type === 'boolean'" size="small" :type="booleanTagType">
      {{ fieldValue }} - {{ booleanLabel }}
    </el-tag>

    <!-- array / object -->
    <pre
      v-else-if="['array', 'object'].includes(type)"
      class="bg-gray-50 border rounded px-3 py-2 text-xs overflow-auto max-w-[420px]"
      >{{ prettyJson }}
    </pre>

    <!-- 其他类型 -->
    <span v-else>
      {{ displayValue }}
    </span>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    item: {
      type: Object,
      required: true
    }
  })

  /** schema 元信息 */
  const identifier = computed(() => props.item.identifier)
  const type = computed(() => props.item.dataType?.type)
  const specs = computed(() => props.item.dataType?.specs || {})

  /** ⭐ 当前字段真实值 */
  const fieldValue = computed(() => {
    return props.item?.[identifier.value]
  })

  /** enum label */
  const enumLabel = computed(() => {
    if (fieldValue.value == null) return '-'
    return specs.value[fieldValue.value] ?? fieldValue.value
  })

  /** boolean label */
  const booleanLabel = computed(() => {
    if (fieldValue.value === true) return specs.value.true ?? '是'
    if (fieldValue.value === false) return specs.value.false ?? '否'
    return '-'
  })

  /** boolean tag 类型 */
  const booleanTagType = computed(() => {
    if (fieldValue.value === true) return 'success'
    if (fieldValue.value === false) return 'danger'
    return 'info'
  })

  /** array / object → JSON */
  const prettyJson = computed(() => {
    if (!fieldValue.value) return '{}'

    try {
      const v =
        typeof fieldValue.value === 'string' ? JSON.parse(fieldValue.value) : fieldValue.value

      return JSON.stringify(v, null, 2)
    } catch (e) {
      return String(fieldValue.value)
    }
  })

  /** 普通文本展示 */
  const displayValue = computed(() => {
    if (fieldValue.value === null || fieldValue.value === undefined || fieldValue.value === '') {
      return '-'
    }

    const unit = specs.value.unit
    return unit ? `${fieldValue.value} ${unit}` : fieldValue.value
  })
</script>
