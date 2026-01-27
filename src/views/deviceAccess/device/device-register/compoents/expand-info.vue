<template>
  <div class="grid grid-cols-2 gap-x-12 gap-y-2">
    <template v-for="(item, index) in expandInfoList" :key="index">
      <!-- 整数类型 -->
      <el-form-item
        v-if="item.dataType.type === 'int'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getIntRules(item)"
      >
        <el-input-number
          v-model="expandData[item.identifier]"
          :placeholder="`请输入${item.name}`"
          controls-position="right"
          style="width: 100%"
        />
        <!--  :min="item.dataType.specs?.min"
          :max="item.dataType.specs?.max" -->
        <span v-if="item.dataType.specs?.unit" class="text-gray-500 ml-2">
          {{ item.dataType.specs.unit }}
        </span>
      </el-form-item>

      <!-- float单精度浮点数 -->
      <el-form-item
        v-else-if="item.dataType.type === 'float'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getFloatRules(item)"
      >
        <el-input-number
          v-model="expandData[item.identifier]"
          :placeholder="`请输入${item.name}`"
          controls-position="right"
          style="width: 100%"
        />
        <!--  :min="item.dataType.specs?.min"
          :max="item.dataType.specs?.max"
          :step="item.dataType.specs?.step || 0.1"
          :precision="item.dataType.specs?.precision || 7"-->
        <span v-if="item.dataType.specs?.unit" class="text-gray-500 ml-2">
          {{ item.dataType.specs.unit }}
        </span>
      </el-form-item>

      <!-- double双精度浮点数 -->
      <el-form-item
        v-else-if="item.dataType.type === 'double'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getDoubleRules(item)"
      >
        <el-input-number
          v-model="expandData[item.identifier]"
          :placeholder="`请输入${item.name}`"
          controls-position="right"
          style="width: 100%"
        />
        <!--  :min="item.dataType.specs?.min"
          :max="item.dataType.specs?.max"
          :step="item.dataType.specs?.step || 0.01"
          :precision="item.dataType.specs?.precision || 15" -->
        <span v-if="item.dataType.specs?.unit" class="text-gray-500 ml-2">
          {{ item.dataType.specs.unit }}
        </span>
      </el-form-item>

      <!-- 文本类型 -->
      <el-form-item
        v-else-if="item.dataType.type === 'text'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getTextRules(item)"
        class="col-span-2"
      >
        <el-input
          v-model="expandData[item.identifier]"
          :placeholder="`请输入${item.name}`"
          type="textarea"
          :rows="item.dataType.specs?.rows || 3"
          :maxlength="item.dataType.specs?.maxLength"
        />
        <!-- <div class="w-full text-right text-xs text-gray-400 mt-1">
          {{ getByteLength(expandData[item.identifier]) }}/{{ item.dataType.specs.length }}
        </div> -->
      </el-form-item>

      <!-- 日期类型 -->
      <el-form-item
        v-else-if="item.dataType.type === 'date'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getDateRules(item)"
      >
        <el-date-picker
          v-model="expandData[item.identifier]"
          type="date"
          :placeholder="`请选择${item.name}`"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 布尔类型（下拉选择） -->
      <el-form-item
        v-else-if="item.dataType.type === 'boolean'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getBooleanRules(item)"
      >
        <el-select
          v-model="expandData[item.identifier]"
          :placeholder="`请选择${item.name}`"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="(label, value) in getBooleanOptions(item.dataType.specs)"
            :key="value"
            :label="label"
            :value="value === 'true' || value === true"
          />
        </el-select>
      </el-form-item>

      <!-- 枚举类型 -->
      <el-form-item
        v-else-if="item.dataType.type === 'enum'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getEnumRules(item)"
      >
        <el-select
          v-model="expandData[item.identifier]"
          :placeholder="`请选择${item.name}`"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="(label, value) in getEnumOptions(item.dataType.specs)"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </el-form-item>

      <!-- 密码类型 -->
      <el-form-item
        v-else-if="item.dataType.type === 'password'"
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getPasswordRules(item)"
      >
        <el-input
          v-model="expandData[item.identifier]"
          :placeholder="`请输入${item.name}`"
          type="text"
        />
      </el-form-item>

      <!-- 默认文本输入框（string类型） -->
      <el-form-item
        v-else
        :label="item.name"
        :prop="`expandData.${item.identifier}`"
        :rules="getDefaultRules(item)"
      >
        <el-input
          v-model="expandData[item.identifier]"
          :placeholder="`请输入${item.name}`"
          :maxlength="item.dataType.specs?.maxLength"
          show-word-limit
        />
      </el-form-item>
    </template>
  </div>
</template>

<script setup>
  import { reactive, watch, computed } from 'vue'
  import { getByteLength } from '@/utils'
  const props = defineProps({
    expandInfoList: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['update:modelValue'])

  // 使用 reactive 存储所有扩展字段的值
  const expandData = reactive({})

  // ========== 辅助函数 ==========
  // 获取枚举选项
  const getEnumOptions = (specs) => {
    if (!specs) return {}

    // 如果是对象格式 { "1": "枚举1", "2": "枚举2" }
    if (typeof specs === 'object' && !Array.isArray(specs)) {
      return specs
    }

    // 如果是数组格式 [{ label: "枚举1", value: "1" }]，转换为对象
    if (Array.isArray(specs)) {
      const result = {}
      specs.forEach((option) => {
        result[option.value] = option.label
      })
      return result
    }

    return {}
  }

  // 获取布尔选项
  const getBooleanOptions = (specs) => {
    if (!specs) {
      // 默认选项
      return { true: '是', false: '否' }
    }

    // 如果是对象格式 { "true": "是", "false": "否" }
    if (typeof specs === 'object' && !Array.isArray(specs)) {
      return specs
    }

    // 如果是数组格式 [{ label: "是", value: true }, { label: "否", value: false }]
    if (Array.isArray(specs)) {
      const result = {}
      specs.forEach((option) => {
        result[option.value] = option.label
      })
      return result
    }

    return { true: '是', false: '否' }
  }

  // ========== 初始化数据 ==========
  const initData = () => {
    // 先清空已有数据
    Object.keys(expandData).forEach((key) => {
      delete expandData[key]
    })

    // 初始化新数据
    props.expandInfoList.forEach((item) => {
      const { identifier, dataType } = item

      // 如果 modelValue 中已有该字段的值，使用已有值
      const existingValue = props.modelValue.find((v) => v.identifier === identifier)
      if (existingValue && existingValue[identifier] !== undefined) {
        expandData[identifier] = existingValue[identifier]
        return
      }

      // 根据数据类型设置默认值
      switch (dataType.type) {
        case 'int':
        case 'float':
        case 'double':
          expandData[identifier] = null
          break
        case 'text':
        case 'password':
          expandData[identifier] = ''
          break
        case 'boolean':
          // 布尔类型默认选择第一个选项
          const boolOptions = getBooleanOptions(dataType.specs)
          const boolKeys = Object.keys(boolOptions)
          expandData[identifier] = boolKeys.length > 0 ? boolKeys[0] === 'true' : false
          break
        case 'date':
          expandData[identifier] = ''
          break
        case 'enum':
          // 枚举类型默认选择第一个选项
          const enumOptions = getEnumOptions(dataType.specs)
          const enumKeys = Object.keys(enumOptions)
          expandData[identifier] = enumKeys.length > 0 ? enumKeys[0] : ''
          break
        default:
          expandData[identifier] = ''
      }
    })
  }

  // ========== 通用验证器 ==========
  const getCommonValidator = (item) => {
    return (rule, value, callback) => {
      const currentValue = expandData[item.identifier]
      const { required, name, dataType } = item
      const specs = dataType.specs || {}

      // 必填验证
      if (required) {
        if (
          currentValue === null ||
          currentValue === undefined ||
          currentValue === '' ||
          (Array.isArray(currentValue) && currentValue.length === 0)
        ) {
          return callback(new Error(`${name}不能为空`))
        }
      }

      // 非必填且为空，直接通过
      if (
        !required &&
        (currentValue === null || currentValue === undefined || currentValue === '')
      ) {
        return callback()
      }

      // 类型特定验证
      switch (dataType.type) {
        case 'int':
          console.log(typeof currentValue, currentValue, Number.isInteger(currentValue))
          if (typeof currentValue !== 'number' || isNaN(currentValue)) {
            return callback(new Error(`${name}必须为数字`))
          }
          if (!Number.isInteger(currentValue)) {
            return callback(new Error(`${name}必须为整数`))
          }

          if (specs.min !== undefined && currentValue < specs.min) {
            return callback(new Error(`${name}不能小于${specs.min}`))
          }
          if (specs.max !== undefined && currentValue > specs.max) {
            return callback(new Error(`${name}不能大于${specs.max}`))
          }
          break

        case 'float':
          if (typeof currentValue !== 'number' || isNaN(currentValue)) {
            return callback(new Error(`${name}必须为数字`))
          }

          // 验证必须为小数
          if (Number.isInteger(currentValue)) {
            return callback(new Error(`${name}必须为小数`))
          }

          // 验证范围
          if (specs.min !== undefined && currentValue < specs.min) {
            return callback(new Error(`${name}不能小于${specs.min}`))
          }
          if (specs.max !== undefined && currentValue > specs.max) {
            return callback(new Error(`${name}不能大于${specs.max}`))
          }
          break

        case 'double':
          if (typeof currentValue !== 'number' || isNaN(currentValue)) {
            return callback(new Error(`${name}必须为数字`))
          }

          // 验证必须为小数
          if (Number.isInteger(currentValue)) {
            return callback(new Error(`${name}必须为小数`))
          }

          // 验证范围
          if (specs.min !== undefined && currentValue < specs.min) {
            return callback(new Error(`${name}不能小于${specs.min}`))
          }
          if (specs.max !== undefined && currentValue > specs.max) {
            return callback(new Error(`${name}不能大于${specs.max}`))
          }
          break

        case 'text':
        case 'password':
          if (specs.length && currentValue.length > specs.length) {
            return callback(new Error(`${name}长度不能超过${specs.length}个字符`))
          }
          break

        case 'boolean':
          // 验证布尔值是否在有效选项中
          const boolOptions = getBooleanOptions(specs)
          const boolKeys = Object.keys(boolOptions)
          if (boolKeys.length > 0) {
            const isValid = boolKeys.some((key) => {
              const boolValue = key === 'true' || key === true
              return boolValue === currentValue
            })
            if (!isValid) {
              return callback(new Error(`${name}必须选择有效的选项`))
            }
          }
          break

        case 'enum':
          // 验证枚举值是否有效
          const enumOptions = getEnumOptions(specs)
          const enumKeys = Object.keys(enumOptions)
          if (enumKeys.length > 0) {
            const isValid = enumKeys.includes(currentValue)
            if (!isValid) {
              return callback(new Error(`${name}必须选择有效的选项`))
            }
          }
          break

        case 'password':
          if (specs.pattern) {
            const regex = new RegExp(specs.pattern)
            if (!regex.test(currentValue)) {
              return callback(new Error(specs.patternMessage || `${name}格式不正确`))
            }
          }
          break
      }

      callback()
    }
  }

  // 验证单精度浮点数精度
  const isFloatPrecisionValid = (value, maxPrecision = 7) => {
    if (value === 0) return true
    const str = Math.abs(value).toString()
    // 科学计数法处理
    if (str.includes('e')) {
      const parts = str.split('e')
      const coefficient = parts[0].replace('.', '')
      return coefficient.length <= maxPrecision
    }
    // 普通数字处理
    const parts = str.split('.')
    if (parts.length === 1) {
      return parts[0].replace(/^0+/, '').length <= maxPrecision
    }
    const integerPart = parts[0].replace(/^0+/, '')
    const decimalPart = parts[1]
    return integerPart.length + decimalPart.length <= maxPrecision
  }

  // 验证双精度浮点数精度
  const isDoublePrecisionValid = (value, maxPrecision = 15) => {
    if (value === 0) return true
    const str = Math.abs(value).toString()
    // 科学计数法处理
    if (str.includes('e')) {
      const parts = str.split('e')
      const coefficient = parts[0].replace('.', '')
      return coefficient.length <= maxPrecision
    }
    // 普通数字处理
    const parts = str.split('.')
    if (parts.length === 1) {
      return parts[0].replace(/^0+/, '').length <= maxPrecision
    }
    const integerPart = parts[0].replace(/^0+/, '')
    const decimalPart = parts[1]
    return integerPart.length + decimalPart.length <= maxPrecision
  }

  // ========== 各类型验证规则 ==========
  const getIntRules = (item) => {
    return [
      {
        required: item.required,
        // message: `${item.name}不能为空1`,
        trigger: ['blur', 'change'],
        validator: getCommonValidator(item)
      }
    ]
  }

  const getFloatRules = (item) => {
    return [
      {
        required: item.required,
        // message: `${item.name}不能为空`,
        trigger: ['blur', 'change'],
        validator: getCommonValidator(item)
      }
    ]
  }

  const getDoubleRules = (item) => {
    return [
      {
        required: item.required,
        // message: `${item.name}不能为空`,
        trigger: ['blur', 'change'],
        validator: getCommonValidator(item)
      }
    ]
  }

  const getTextRules = (item) => {
    return [
      {
        required: item.required,
        // message: `${item.name}不能为空`,
        trigger: ['blur', 'change'],
        validator: getCommonValidator(item)
      }
    ]
  }

  const getDateRules = (item) => {
    return [
      {
        required: item.required,
        // message: `请选择${item.name}`,
        trigger: 'change',
        validator: getCommonValidator(item)
      }
    ]
  }

  const getBooleanRules = (item) => {
    return [
      {
        required: item.required,
        // message: `请选择${item.name}`,
        trigger: 'change',
        validator: getCommonValidator(item)
      }
    ]
  }

  const getEnumRules = (item) => {
    return [
      {
        required: item.required,
        // message: `请选择${item.name}`,
        trigger: 'change',
        validator: getCommonValidator(item)
      }
    ]
  }

  const getPasswordRules = (item) => {
    return [
      {
        required: item.required,
        // message: `${item.name}不能为空`,
        trigger: ['blur', 'change'],
        validator: getCommonValidator(item)
      }
    ]
  }

  const getDefaultRules = (item) => {
    return [
      {
        required: item.required,
        // message: `${item.name}不能为空`,
        trigger: ['blur', 'change'],
        validator: getCommonValidator(item)
      }
    ]
  }

  // ========== 计算属性：组装接口格式 ==========
  const expandInfoData = computed(() => {
    return props.expandInfoList
      .filter((item) => item.dataType.type) // 过滤有数据类型的项
      .map((item) => {
        const { name, identifier, dataType, required } = item
        const value = expandData[identifier]

        // 处理枚举和布尔类型的specs格式
        let processedDataType = { ...dataType }
        if (dataType.type === 'enum' && dataType.specs) {
          processedDataType = {
            ...dataType,
            specs: getEnumOptions(dataType.specs)
          }
        } else if (dataType.type === 'boolean' && dataType.specs) {
          processedDataType = {
            ...dataType,
            specs: getBooleanOptions(dataType.specs)
          }
        }

        return {
          name,
          identifier,
          dataType: processedDataType,
          required,
          [identifier]: value
        }
      })
  })

  // ========== 监听变化 ==========
  // 监听 expandInfoList 变化，初始化数据
  watch(
    () => props.expandInfoList,
    () => {
      initData()
    },
    { immediate: true, deep: true }
  )

  // 监听 expandData 变化，通知父组件
  watch(
    () => expandData,
    () => {
      emit('update:modelValue', expandInfoData.value)
    },
    { deep: true }
  )

  // ========== 暴露方法 ==========
  defineExpose({
    // 获取原始数据
    getExpandData: () => ({ ...expandData }),

    // 获取组装后的接口格式数据
    getExpandInfo: () => expandInfoData.value,

    // 手动验证
    validate: () => {
      return new Promise((resolve, reject) => {
        const errors = []

        props.expandInfoList.forEach((item) => {
          const { required, name, identifier } = item
          const value = expandData[identifier]

          if (required) {
            if (
              value === null ||
              value === undefined ||
              value === '' ||
              (Array.isArray(value) && value.length === 0)
            ) {
              errors.push(`${name}不能为空`)
            }
          }
        })

        if (errors.length > 0) {
          reject(errors)
        } else {
          resolve(expandInfoData.value)
        }
      })
    },

    // 重置表单
    resetFields: () => {
      initData()
    },

    // 设置值
    setFields: (values) => {
      Object.keys(values).forEach((key) => {
        if (key in expandData) {
          expandData[key] = values[key]
        }
      })
    }
  })
</script>

<style scoped>
  .text-gray-500 {
    color: #6b7280;
    font-size: 12px;
    margin-left: 8px;
  }
</style>
