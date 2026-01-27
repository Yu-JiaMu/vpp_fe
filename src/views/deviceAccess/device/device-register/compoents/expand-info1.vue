<template>
  <div class="device-expandInfoList-form">
    <!-- 属性表单区域 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      label-position="right"
      size="medium"
    >
      <!-- 遍历属性列表 -->
      <div
        v-for="expandInfo in expandInfoList"
        :key="expandInfo.identifier"
        class="expandInfo-field"
      >
        <!-- 整数类型 (int) -->
        <el-form-item
          v-if="expandInfo.dataType.type === 'int'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
          :rules="getNumberRules(expandInfo)"
        >
          <div class="field-container">
            <el-input-number
              v-model="formData[expandInfo.identifier]"
              :placeholder="getPlaceholder(expandInfo)"
              :min="getNumberMin(expandInfo)"
              :max="getNumberMax(expandInfo)"
              :step="getNumberStep(expandInfo)"
              :controls="false"
              style="width: 100%"
              :disabled="expandInfo.accessMode === 'r'"
            />
            <span v-if="expandInfo.dataType.specs?.unit" class="field-unit">
              {{ expandInfo.dataType.specs.unit }}
            </span>
          </div>
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 浮点数类型 (float/double) -->
        <el-form-item
          v-else-if="expandInfo.dataType.type === 'float' || expandInfo.dataType.type === 'double'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
          :rules="getNumberRules(expandInfo)"
        >
          <div class="field-container">
            <el-input-number
              v-model="formData[expandInfo.identifier]"
              :placeholder="getPlaceholder(expandInfo)"
              :min="getNumberMin(expandInfo)"
              :max="getNumberMax(expandInfo)"
              :step="getNumberStep(expandInfo)"
              :precision="expandInfo.dataType.type === 'double' ? 2 : 1"
              :controls="false"
              style="width: 100%"
              :disabled="expandInfo.accessMode === 'r'"
            />
            <span v-if="expandInfo.dataType.specs?.unit" class="field-unit">
              {{ expandInfo.dataType.specs.unit }}
            </span>
          </div>
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 文本类型 (text) -->
        <el-form-item
          v-else-if="expandInfo.dataType.type === 'text'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
          :rules="getTextRules(expandInfo)"
        >
          <el-input
            v-model="formData[expandInfo.identifier]"
            :placeholder="getPlaceholder(expandInfo)"
            :maxlength="expandInfo.dataType.specs?.length || 255"
            show-word-limit
            clearable
            :disabled="expandInfo.accessMode === 'r'"
          />
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 日期类型 (date) -->
        <el-form-item
          v-else-if="expandInfo.dataType.type === 'date'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
          :rules="[{ required: expandInfo.required, message: `请选择${expandInfo.name}` }]"
        >
          <el-date-picker
            v-model="formData[expandInfo.identifier]"
            type="date"
            :placeholder="getPlaceholder(expandInfo)"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled="expandInfo.accessMode === 'r'"
          />
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 布尔类型 (boolean) -->
        <el-form-item
          v-else-if="expandInfo.dataType.type === 'boolean'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
        >
          <el-switch
            v-model="formData[expandInfo.identifier]"
            :active-text="expandInfo.dataType.specs?.true || '是'"
            :inactive-text="expandInfo.dataType.specs?.false || '否'"
            :disabled="expandInfo.accessMode === 'r'"
          />
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 枚举类型 (enum) -->
        <el-form-item
          v-else-if="expandInfo.dataType.type === 'enum'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
          :rules="[{ required: expandInfo.required, message: `请选择${expandInfo.name}` }]"
        >
          <el-select
            v-model="formData[expandInfo.identifier]"
            :placeholder="getPlaceholder(expandInfo)"
            clearable
            style="width: 100%"
            :disabled="expandInfo.accessMode === 'r'"
          >
            <el-option
              v-for="(label, value) in expandInfo.dataType.specs"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 密码类型 (password) -->
        <el-form-item
          v-else-if="expandInfo.dataType.type === 'password'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
          :rules="getPasswordRules(expandInfo)"
        >
          <el-input
            v-model="formData[expandInfo.identifier]"
            type="password"
            :placeholder="getPlaceholder(expandInfo)"
            :maxlength="expandInfo.dataType.specs?.length || 20"
            show-password
            clearable
            :disabled="expandInfo.accessMode === 'r'"
          />
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 经纬度类型 (geo_point) -->
        <el-form-item
          v-else-if="expandInfo.dataType.type === 'geo_point'"
          :label="expandInfo.name"
          :prop="expandInfo.identifier"
        >
          <div class="geo-point-container">
            <div class="geo-inputs">
              <el-input
                v-model="formData[`${expandInfo.identifier}_lng`]"
                placeholder="经度"
                style="margin-bottom: 8px"
                :disabled="expandInfo.accessMode === 'r'"
              >
                <template #suffix>
                  <span>°</span>
                </template>
              </el-input>
              <el-input
                v-model="formData[`${expandInfo.identifier}_lat`]"
                placeholder="纬度"
                :disabled="expandInfo.accessMode === 'r'"
              >
                <template #suffix>
                  <span>°</span>
                </template>
              </el-input>
            </div>
            <el-button
              v-if="expandInfo.accessMode !== 'r'"
              type="primary"
              link
              @click="showMapPicker(expandInfo.identifier)"
            >
              在地图上选择
            </el-button>
          </div>
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 结构体类型 (object) -->
        <el-form-item v-else-if="expandInfo.dataType.type === 'object'" :label="expandInfo.name">
          <div class="object-container">
            <div
              v-for="item in expandInfo.dataType.specs?.specsArray || []"
              :key="item.identifier"
              class="object-field"
            >
              <div class="object-label">{{ item.name }}:</div>
              <el-input-number
                v-if="
                  item.dataType.type === 'int' ||
                  item.dataType.type === 'double' ||
                  item.dataType.type === 'float'
                "
                v-model="formData[`${expandInfo.identifier}_${item.identifier}`]"
                :placeholder="item.desc"
                :min="item.dataType.specs?.min"
                :max="item.dataType.specs?.max"
                :step="item.dataType.specs?.step"
                :precision="item.dataType.type === 'double' ? 2 : 0"
                :controls="false"
                style="flex: 1"
                :disabled="expandInfo.accessMode === 'r'"
              >
                <template #append>
                  <span>{{ item.dataType.specs?.unit || '' }}</span>
                </template>
              </el-input-number>
              <el-input
                v-else
                v-model="formData[`${expandInfo.identifier}_${item.identifier}`]"
                :placeholder="item.desc"
                style="flex: 1"
                :disabled="expandInfo.accessMode === 'r'"
              />
            </div>
          </div>
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 数组类型 (array) -->
        <el-form-item v-else-if="expandInfo.dataType.type === 'array'" :label="expandInfo.name">
          <div class="array-container">
            <div class="array-items">
              <div
                v-for="(item, index) in formData[expandInfo.identifier] || []"
                :key="index"
                class="array-item"
              >
                <el-input-number
                  v-if="expandInfo.dataType.specs.type === 'int'"
                  v-model="formData[expandInfo.identifier][index]"
                  :placeholder="`第${index + 1}项`"
                  :min="expandInfo.dataType.specs.specs?.min"
                  :max="expandInfo.dataType.specs.specs?.max"
                  :step="expandInfo.dataType.specs.specs?.step"
                  :controls="false"
                  style="flex: 1"
                  :disabled="expandInfo.accessMode === 'r'"
                />
                <span v-if="expandInfo.dataType.specs.specs?.unit" class="field-unit">
                  {{ expandInfo.dataType.specs.specs.unit }}
                </span>
                <el-button
                  v-if="expandInfo.accessMode !== 'r'"
                  type="text"
                  class="array-remove-btn"
                  @click="removeArrayItem(expandInfo.identifier, index)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button
              v-if="expandInfo.accessMode !== 'r'"
              type="primary"
              link
              :disabled="isArrayFull(expandInfo)"
              @click="addArrayItem(expandInfo.identifier, expandInfo.dataType.specs)"
            >
              添加项
            </el-button>
          </div>
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>

        <!-- 未知类型 -->
        <el-form-item v-else :label="expandInfo.name" :prop="expandInfo.identifier">
          <el-input
            v-model="formData[expandInfo.identifier]"
            :placeholder="getPlaceholder(expandInfo)"
            :disabled="expandInfo.accessMode === 'r'"
          />
          <div v-if="expandInfo.desc" class="field-desc">
            {{ expandInfo.desc }}
          </div>
        </el-form-item>
      </div>
    </el-form>

    <!-- 地图选择器对话框 -->
    <el-dialog v-model="mapDialogVisible" title="选择位置" width="800px" destroy-on-close>
      <div id="mapContainer" style="height: 400px"></div>
      <template #footer>
        <el-button @click="mapDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmLocation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { Close } from '@element-plus/icons-vue'

  const props = defineProps({
    expandInfoList: {
      type: Array,
      default: () => []
    },
    initialData: {
      type: Object,
      default: () => ({})
    },
    // 模式：edit(编辑) 或 view(查看)
    mode: {
      type: String,
      default: 'edit',
      validator: (value) => ['edit', 'view'].includes(value)
    }
  })

  const emit = defineEmits(['submit', 'reset'])

  // 表单引用
  const formRef = ref()
  // 表单数据
  const formData = reactive({})
  // 表单验证规则
  const formRules = ref({})
  // 地图对话框
  const mapDialogVisible = ref(false)
  const currentGeoProperty = ref('')
  let mapInstance = null

  // 初始化表单数据
  const initFormData = () => {
    // 遍历所有属性，初始化表单数据
    props.expandInfoList.forEach((expandInfo) => {
      // 根据数据类型设置默认值
      const defaultValue = getDefaultValue(expandInfo)

      // 如果有初始数据，使用初始数据
      if (props.initialData[expandInfo.identifier] !== undefined) {
        formData[expandInfo.identifier] = props.initialData[expandInfo.identifier]
      } else {
        formData[expandInfo.identifier] = defaultValue
      }

      // 特殊处理结构体
      if (expandInfo.dataType.type === 'object' && expandInfo.dataType.specs?.specsArray) {
        expandInfo.dataType.specs.specsArray.forEach((item) => {
          const fieldName = `${expandInfo.identifier}_${item.identifier}`
          formData[fieldName] = props.initialData[fieldName] || getDefaultValue(item)
        })
      }

      // 特殊处理经纬度
      if (expandInfo.dataType.type === 'geo_point') {
        const lngField = `${expandInfo.identifier}_lng`
        const latField = `${expandInfo.identifier}_lat`
        formData[lngField] = props.initialData[lngField] || ''
        formData[latField] = props.initialData[latField] || ''
      }

      // 特殊处理数组
      if (expandInfo.dataType.type === 'array') {
        if (!Array.isArray(formData[expandInfo.identifier])) {
          formData[expandInfo.identifier] = []
        }
      }
    })
  }

  // 获取默认值
  const getDefaultValue = (expandInfo) => {
    const type = expandInfo.dataType?.type

    switch (type) {
      case 'int':
      case 'float':
      case 'double':
        return 0
      case 'text':
      case 'password':
        return ''
      case 'boolean':
        return false
      case 'date':
        return ''
      case 'enum':
        return ''
      case 'array':
        return []
      case 'object':
        return {}
      case 'geo_point':
        return ''
      default:
        return ''
    }
  }

  // 获取数字类型的最小值
  const getNumberMin = (expandInfo) => {
    return parseFloat(expandInfo.dataType.specs?.min) || 0
  }

  // 获取数字类型的最大值
  const getNumberMax = (expandInfo) => {
    return parseFloat(expandInfo.dataType.specs?.max) || 999999
  }

  // 获取数字类型的步长
  const getNumberStep = (expandInfo) => {
    return parseFloat(expandInfo.dataType.specs?.step) || 1
  }

  // 获取占位符文本
  const getPlaceholder = (expandInfo) => {
    const accessMode = expandInfo.accessMode
    if (accessMode === 'r') {
      return '只读字段'
    }
    return `请输入${expandInfo.name}`
  }

  // 获取数字验证规则
  const getNumberRules = (expandInfo) => {
    const rules = []

    if (expandInfo.required) {
      rules.push({ required: true, message: `请输入${expandInfo.name}`, trigger: 'blur' })
    }

    rules.push({
      validator: (rule, value, callback) => {
        if (value === undefined || value === null || value === '') {
          callback()
          return
        }

        const min = getNumberMin(expandInfo)
        const max = getNumberMax(expandInfo)

        if (value < min || value > max) {
          callback(new Error(`${expandInfo.name}应在${min}到${max}之间`))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    })

    return rules
  }

  // 获取文本验证规则
  const getTextRules = (expandInfo) => {
    const rules = []

    if (expandInfo.required) {
      rules.push({ required: true, message: `请输入${expandInfo.name}`, trigger: 'blur' })
    }

    const maxLength = expandInfo.dataType.specs?.length
    if (maxLength) {
      rules.push({ max: maxLength, message: `最多${maxLength}个字符`, trigger: 'blur' })
    }

    return rules
  }

  // 获取密码验证规则
  const getPasswordRules = (expandInfo) => {
    const rules = []

    if (expandInfo.required) {
      rules.push({ required: true, message: `请输入${expandInfo.name}`, trigger: 'blur' })
    }

    const maxLength = expandInfo.dataType.specs?.length
    if (maxLength) {
      rules.push({ max: maxLength, message: `最多${maxLength}个字符`, trigger: 'blur' })
    }

    return rules
  }

  // 检查数组是否已满
  const isArrayFull = (expandInfo) => {
    const maxItems = expandInfo.dataType.specs?.maxItemsCount || 100
    const currentItems = formData[expandInfo.identifier]?.length || 0
    return currentItems >= maxItems
  }

  // 添加数组项
  const addArrayItem = (identifier, specs) => {
    if (!Array.isArray(formData[identifier])) {
      formData[identifier] = []
    }

    // 获取数组项的类型
    const itemType = specs.type
    let defaultValue

    switch (itemType) {
      case 'int':
        defaultValue = specs.specs?.min || 0
        break
      case 'float':
      case 'double':
        defaultValue = 0.0
        break
      default:
        defaultValue = ''
    }

    formData[identifier].push(defaultValue)
  }

  // 移除数组项
  const removeArrayItem = (identifier, index) => {
    if (Array.isArray(formData[identifier])) {
      formData[identifier].splice(index, 1)
    }
  }

  // 显示地图选择器
  const showMapPicker = (identifier) => {
    currentGeoProperty.value = identifier
    mapDialogVisible.value = true

    // 初始化地图
    nextTick(() => {
      initMapPicker()
    })
  }

  // 确认位置选择
  const confirmLocation = () => {
    if (mapInstance && mapInstance.getCenter) {
      const center = mapInstance.getCenter()
      const lngField = `${currentGeoProperty.value}_lng`
      const latField = `${currentGeoProperty.value}_lat`

      formData[lngField] = center.lng.toFixed(6)
      formData[latField] = center.lat.toFixed(6)
    }

    mapDialogVisible.value = false
  }

  // 处理提交
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 处理数据，移除只读字段（如果需要）
      const submitData = {}
      Object.keys(formData).forEach((key) => {
        const expandInfo = props.expandInfoList.find(
          (p) => key === p.identifier || key.startsWith(`${p.identifier}_`)
        )

        if (expandInfo && expandInfo.accessMode !== 'r') {
          submitData[key] = formData[key]
        }
      })

      emit('submit', submitData)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 处理重置
  const handleReset = () => {
    Object.keys(formData).forEach((key) => {
      delete formData[key]
    })
    initFormData()
    emit('reset')
  }

  // 初始化表单
  onMounted(() => {
    initFormData()
  })

  // 监听属性变化
  watch(
    () => props.expandInfoList,
    () => {
      initFormData()
    },
    { deep: true }
  )

  // 监听初始数据变化
  watch(
    () => props.initialData,
    () => {
      initFormData()
    },
    { deep: true }
  )

  // 暴露方法给父组件
  defineExpose({
    getFormData: () => ({ ...formData }),
    validateForm: () => {
      if (!formRef.value) return Promise.reject(new Error('表单未初始化'))
      return formRef.value.validate()
    },
    resetForm: handleReset
  })
</script>

<style lang="scss" scoped>
  .device-expandInfoList-form {
    padding: 20px;
    max-height: 600px;
    overflow-y: auto;

    .expandInfo-field {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .field-container {
      display: flex;
      align-items: center;
      gap: 8px;

      .field-unit {
        color: #909399;
        font-size: 14px;
        white-space: nowrap;
      }
    }

    .field-desc {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.4;
    }

    .geo-point-container {
      .geo-inputs {
        margin-bottom: 8px;
      }
    }

    .object-container {
      background: #fafafa;
      border-radius: 4px;
      padding: 16px;

      .object-field {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .object-label {
          width: 80px;
          font-size: 14px;
          color: #606266;
          margin-right: 12px;
          flex-shrink: 0;
        }
      }
    }

    .array-container {
      .array-items {
        margin-bottom: 8px;
      }

      .array-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .array-remove-btn {
          color: #f56c6c;
          padding: 0;
          width: 24px;
          height: 24px;

          &:hover {
            background: #fee;
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 20px;
      margin-top: 20px;
      border-top: 1px solid #e8e8e8;
    }
  }

  // 只读字段样式
  :deep(.el-input.is-disabled .el-input__wrapper),
  :deep(.el-input-number.is-disabled .el-input__wrapper),
  :deep(.el-select.is-disabled .el-input__wrapper),
  :deep(.el-date-editor.is-disabled .el-input__wrapper) {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-form-item.is-required .el-form-item__label:before) {
    color: #f56c6c;
  }
</style>
