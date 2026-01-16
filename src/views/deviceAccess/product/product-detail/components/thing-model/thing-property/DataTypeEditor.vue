<template>
  <div>
    <!-- 数据类型 -->
    <el-form-item label="数据类型" prop="dataType">
      <el-select v-model="model.type" class="w-full" @change="onTypeChange">
        <el-option
          v-for="item in dataTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <!-- 数据长度 -->
    <template v-if="isText">
      <el-form-item label="数据长度" prop="length">
        <el-input-number
          v-model="model.config.length"
          placeholder="不超过10240字节"
          :min="1"
          :max="10240"
          :precision="0"
          class="flex-1"
          align="left"
          :controls="false"
        >
          <template #suffix>
            <div class="pl-3 border-l-1 border-[#dcdfe6] text-g-505658">字节</div>
          </template>
        </el-input-number>
      </el-form-item>
    </template>

    <!-- 数字 -->
    <template v-if="isNumber">
      <!-- 取值范围 -->
      <el-form-item label="取值范围">
        <div class="flex items-center gap-2 w-full">
          <el-input v-model="model.config.min" placeholder="最小值" />
          <span class="text-gray-400">—</span>
          <el-input v-model="model.config.max" placeholder="最大值" />
        </div>
      </el-form-item>

      <!-- 步长 -->
      <el-form-item label="步长">
        <el-input v-model="model.config.step" />
      </el-form-item>

      <!-- 单位 -->
      <el-form-item label="单位">
        <el-select v-model="model.config.unit" class="w-full">
          <el-option label="百分比（%）" value="%" />
          <el-option label="秒（s）" value="s" />
          <el-option label="毫秒（ms）" value="ms" />
        </el-select>
      </el-form-item>
    </template>

    <!-- enum -->
    <EnumEditor v-if="model.type === 'enum'" v-model="model.config.list" />

    <!-- boolean -->
    <template v-if="model.type === 'boolean'">
      <el-input v-model="model.config.true" placeholder="True 描述" />
      <el-input v-model="model.config.false" placeholder="False 描述" />
    </template>

    <!-- array -->
    <template v-if="isArray">
      <el-input-number
        v-model="model.config.maxItemsCount"
        :min="1"
        :max="512"
        :controls="false"
        style="width: 100%"
      />
      <DataTypeEditor v-model="model.element" />
    </template>

    <!-- object -->
    <StructTable v-if="isObject" v-model="model.children" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { DATA_TYPE_MAP } from '@/enums'
  import StructTable from './StructTable.vue'
  import EnumEditor from './EnumEditor.vue'

  const model = defineModel()

  const props = defineProps({
    isAddStruct: {
      type: Boolean,
      default: false
    }
  })

  const isArray = computed(() => model.value.type === 'array')
  const isObject = computed(() => model.value.type === 'object')
  const isNumber = computed(() => ['int', 'float', 'double'].includes(model.value.type))
  const isText = computed(() => ['text', 'password'].includes(model.value.type))
  /**
   * 处理数据类型列表，动态变化
   */
  const dataTypeList = computed(() => {
    let list = DATA_TYPE_MAP.options
    list = list.map((item) => {
      return {
        label: `${item.value}(${item.label})`,
        value: item.value
      }
    })
    if (props.isAddStruct) {
      const targets = ['int', 'float', 'double', 'boolean', 'enum', 'text', 'geo_point', 'date']
      list = list.filter((item) => targets.includes(item.value))
    }
    return list
  })

  const onTypeChange = (type) => {
    if (type === 'array') {
      model.value = {
        type: 'array',
        config: { maxItemsCount: 100 },
        element: { type: 'int', config: {} }
      }
    } else if (type === 'object') {
      model.value = {
        type: 'object',
        children: []
      }
    } else if (type === 'enum') {
      model.value = {
        type: 'enum',
        config: { list: [] }
      }
    } else if (type === 'boolean') {
      model.value = {
        type: 'boolean',
        config: {}
      }
    } else {
      model.value = {
        type,
        config: {}
      }
    }
  }
</script>
