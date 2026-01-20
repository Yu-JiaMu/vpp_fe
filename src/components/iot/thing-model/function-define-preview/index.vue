<template>
  <!-- 属性 -->
  <template v-if="isProperty">
    <!-- int,float,double -->
    <div v-if="['int', 'float', 'double'].includes(rowData.define.type)">
      取值范围：{{ rowData.define.specs.min }} ~ {{ rowData.define.specs.max }}；
      <br />
      步长：{{ rowData.define.specs.step }}；
      <!-- <br />
            单位：{{ rowData.define.unit }} -->
    </div>

    <!-- text -->
    <div v-if="rowData.define.type === 'text'"> 数据长度：{{ rowData.define.specs.length }} </div>

    <!-- date -->
    <div v-if="rowData.define.type === 'date'"> 整数类型Int64的UTC时间戳(毫秒) </div>

    <!-- boolean/enum -->
    <div v-if="['boolean', 'enum'].includes(rowData.define.type)" class="flex-col gap-2">
      <el-tag
        class="enum-tag"
        v-for="(value, label) in rowData.define.specs"
        :key="value"
        size="small"
        type="primary"
      >
        {{ label }}-{{ value }}
      </el-tag>
    </div>

    <!-- array -->
    <div v-if="rowData.define.type === 'array'">
      数组个数：{{ rowData.define.specs.maxItemsCount }}
    </div>

    <!-- object -->
    <div v-if="rowData.define.type === 'object'"> - </div>

    <!-- password -->
    <div v-if="rowData.define.type === 'password'">
      最大长度：{{ rowData.define.specs.length }}
    </div>

    <!-- geo_point -->
    <div v-if="rowData.define.type === 'geo_point'"> 地址位置数据，以经纬度显示 </div>
  </template>

  <!-- 事件 -->
  <template v-else-if="isEvent">
    <div class="flex-c">
      事件级别：
      <el-tag :type="levelTagType(rowData.originData.eventType)" size="small">
        {{ EVENT_TYPE_MAP.getLabel(rowData.originData.eventType) }}
      </el-tag>
    </div>
  </template>

  <!-- 功能 -->
  <template v-else-if="isService">
    调用方式：{{ CALL_TYPE_MAP.getLabel(rowData.originData.callType) }}
  </template>
</template>

<script setup>
  import { computed, h } from 'vue'
  import { FUNCTION_MODE_MAP, CALL_TYPE_MAP, EVENT_TYPE_MAP } from '@/enums'
  import { buildRow } from '@/utils'
  import { buildThingModel } from '../adapters/build-thing'
  const props = defineProps({
    row: {
      type: Object,
      default: () => ({}),
      required: true
    },
    functionMode: {
      type: String,
      default: ''
    }
  })

  const rowData = computed(() => {
    if (!props.row.define) {
      return buildRow(buildThingModel(props.row, 'property'))
    }
    return props.row
  })
  /* ===== mode 判断 ===== */
  const isProperty = computed(
    () => props.row.functionMode === 'property' || props.functionMode === 'property'
  )
  const isEvent = computed(
    () => props.row.functionMode === 'event' || props.functionMode === 'event'
  )
  const isService = computed(
    () => props.row.functionMode === 'service' || props.functionMode === 'service'
  )

  const levelTagType = (level) => {
    switch (level) {
      case 'info':
        return 'info'
      case 'warn':
        return 'warning'
      case 'error':
        return 'danger'
      default:
        return 'info'
    }
  }
</script>
