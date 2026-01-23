<template>
  <div>
    <!-- 数据类型 -->
    <el-form-item :label="parentType === 'array' ? '元素类型' : '数据类型'" prop="dataType.type">
      <el-select
        v-model="model.type"
        class="w-full"
        :disabled="isReadOnly || hasRegisterDevice"
        @change="onTypeChange"
      >
        <el-option
          v-for="item in dataTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <!-- 数据长度 -->
    <template v-if="model.type === 'text'">
      <el-form-item label="数据长度" :prop="`${propPath}.config.length`">
        <el-input-number
          v-model="model.config.length"
          placeholder="不超过10240字节"
          :min="1"
          :max="10240"
          :precision="0"
          class="flex-1"
          align="left"
          :controls="false"
          :disabled="isReadOnly || hasRegisterDevice"
        >
          <template #suffix>
            <div class="pl-3 border-l-1 border-[#dcdfe6] text-g-505658">字节</div>
          </template>
        </el-input-number>
      </el-form-item>
    </template>

    <!-- 密码 -->
    <template v-if="model.type === 'password'">
      <el-form-item label="数据长度" :prop="`${propPath}.config.length`" :rules="passwordRules">
        <el-input-number
          v-model="model.config.length"
          placeholder="请输入最大长度"
          :min="1"
          :max="20"
          :precision="0"
          class="flex-1"
          align="left"
          :controls="false"
          :disabled="isReadOnly || hasRegisterDevice"
        >
          <template #suffix>
            <div class="pl-3 border-l-1 border-[#dcdfe6] text-g-505658">字节</div>
          </template>
        </el-input-number>
      </el-form-item>
    </template>

    <!-- 时间格式 -->
    <template v-if="model.type === 'date'">
      <el-form-item label="时间格式">
        <div class="flex items-center gap-1 mt-1 text-xs text-g-afb2b8">
          <ArtSvgIcon icon="ri:error-warning-line" class="text-sm" />
          默认格式为String类型的UTC时间戳，单位:秒。
        </div>
      </el-form-item>
    </template>

    <!-- 数字 -->
    <template v-if="isNumber">
      <!-- 取值范围 -->
      <el-form-item label="取值范围" required class="!mb-0">
        <div class="flex items-center w-full gap-2">
          <el-form-item :prop="`${propPath}.config.min`" :rules="minRules" class="flex-1">
            <el-input-number
              :disabled="isReadOnly || hasRegisterDevice"
              v-model="model.config.min"
              placeholder="最小值"
              :precision="precision"
              class="flex-1"
              align="left"
              :controls="false"
              @blur="handleMinChange"
            />
          </el-form-item>
          <span class="self-start text-gray-400 h-9">—</span>
          <el-form-item :prop="`${propPath}.config.max`" :rules="maxRules" class="flex-1">
            <el-input-number
              :disabled="isReadOnly || hasRegisterDevice"
              v-model="model.config.max"
              :precision="precision"
              class="flex-1"
              align="left"
              :controls="false"
              placeholder="最大值"
            />
          </el-form-item>
        </div>
      </el-form-item>

      <!-- 步长 -->
      <el-form-item label="步长">
        <el-input-number
          :disabled="isReadOnly || hasRegisterDevice"
          v-model="model.config.step"
          :precision="precision"
          class="flex-1"
          align="left"
          :controls="false"
        />
      </el-form-item>

      <!-- 单位 -->
      <el-form-item label="单位">
        <el-select
          v-model="model.config.unit"
          class="w-full"
          :disabled="isReadOnly || hasRegisterDevice"
        >
          <el-option
            v-for="item in unitList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </template>

    <!-- enum -->
    <EnumEditor v-if="model.type === 'enum'" v-model="model.config.list" />

    <!-- boolean -->
    <template v-if="model.type === 'boolean'">
      <el-form-item label="布尔值" required>
        <div class="w-full space-y-2">
          <el-form-item prop="dataType.config.true">
            <div class="flex items-center w-full gap-2">
              <span class="w-14 text-g-505658">True &nbsp;-</span>
              <el-input
                v-model="model.config.true"
                placeholder="请输入"
                :disabled="isReadOnly || hasRegisterDevice"
              />
            </div>
          </el-form-item>

          <el-form-item prop="dataType.config.false">
            <div class="flex items-center w-full gap-2">
              <span class="w-14 text-g-505658">False&nbsp;-</span>
              <el-input
                v-model="model.config.false"
                placeholder="请输入"
                :disabled="isReadOnly || hasRegisterDevice"
              />
            </div>
          </el-form-item>
        </div>
      </el-form-item>
    </template>

    <!-- 坐标 -->
    <el-form-item v-if="model.type === 'geo_point'" label="数据格式">
      <div class="px-4 py-2 bg-[#edeef3] text-g-505658 w-full rounded-full">
        ·地址位置数据，以经纬度显示
      </div>
    </el-form-item>

    <!-- array -->
    <template v-if="isArray">
      <!-- 元素个数 -->
      <el-form-item label="元素个数" prop="dataType.config.maxItemsCount">
        <el-input-number
          v-model="model.config.maxItemsCount"
          :min="1"
          :max="512"
          placeholder="元素最大支持512个"
          :controls="false"
          align="left"
          style="width: 100%"
          :disabled="isReadOnly || hasRegisterDevice"
        />
      </el-form-item>
      <DataTypeEditor
        v-model="model.element"
        :parentType="model.type"
        :formRef="formRef"
        :prop-path="`${propPath}.element`"
        :tableData="tableData"
      />
    </template>

    <!-- 结构体 -->
    <StructTable
      v-if="isObject"
      v-model="model.children"
      :formRef="formRef"
      :prop-path="`${propPath}`"
    />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { DATA_TYPE_MAP } from '@/enums'
  import StructTable from './struct-table.vue'
  import EnumEditor from './enum-editor.vue'
  import { apiGetDictData } from '@/api/system'

  const model = defineModel()

  const props = defineProps({
    tableData: {
      type: Array,
      default: () => []
    },
    isAddStruct: {
      type: Boolean,
      default: false
    },
    parentType: {
      type: String,
      default: ''
    },
    formRef: Object,
    propPath: {
      type: String,
      required: true
    }
  })

  const isReadOnly = inject('isReadOnly', false)
  const hasRegisterDevice = inject('hasRegisterDevice', false)

  const isArray = computed(() => model.value.type === 'array')
  const isObject = computed(() => model.value.type === 'object')
  const isNumber = computed(() => ['int', 'float', 'double'].includes(model.value.type))

  const precision = computed(() => {
    return model.value.type === 'int' ? 0 : undefined
  })
  /**
   * 处理数据类型列表，动态变化
   */
  const dataTypeList = computed(() => {
    const { parentType } = props
    let list = DATA_TYPE_MAP.options
    list = list.map((item) => {
      return {
        label: `${item.value}(${item.label})`,
        value: item.value
      }
    })
    if (parentType === 'object') {
      const targets = ['int', 'float', 'double', 'boolean', 'enum', 'text', 'geo_point', 'date']
      list = list.filter((item) => targets.includes(item.value))
    }
    if (parentType === 'array') {
      const targets = ['int', 'float', 'text', 'object', 'date']
      list = list.filter((item) => targets.includes(item.value))
    }
    return list
  })

  const onTypeChange = (type) => {
    if (type === 'array') {
      model.value = {
        type: 'array',
        config: { maxItemsCount: null },
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

  const minRules = [
    {
      required: true,
      message: '请输入最小值',
      trigger: 'blur'
    }
  ]
  const maxRules = [
    {
      required: true,
      message: '请输入最大值',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        const min = model.value.config.min
        const max = value

        // 任一为空，不校验
        if (min === '' || min === null || max === '' || max === null) {
          return callback()
        }

        if (Number(min) > Number(max)) {
          return callback(new Error('最大值不能小于最小值'))
        }

        callback()
      },
      trigger: 'blur'
    }
  ]
  const passwordRules = [
    {
      required: true,
      message: '请输入最大长度',
      trigger: 'blur'
    },
    {
      type: 'number',
      min: 1,
      max: 20,
      message: '数据长度需在1-20之间',
      trigger: 'blur'
    }
  ]

  const handleMinChange = () => {
    props.formRef?.validateField(`${props.propPath}.config.max`)
  }

  const unitList = ref([])
  const getUnits = async () => {
    const data = await apiGetDictData('iot_model_unit')
    unitList.value = data.map((item) => ({ label: item.dictLabel, value: item.dictLabel }))
  }

  onMounted(() => {
    getUnits()
  })
</script>
