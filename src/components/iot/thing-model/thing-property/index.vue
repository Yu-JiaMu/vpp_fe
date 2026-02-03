<template>
  <div class="thing-property">
    <el-scrollbar max-height="650">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" class="pr-8">
        <!-- 功能名称 -->
        <el-form-item :label="labelName" prop="name">
          <el-input
            v-model="form.name"
            :placeholder="`请输入${labelName}`"
            :disabled="isReadOnly"
          />
        </el-form-item>

        <!-- 标识符 -->
        <el-form-item label="标识符" prop="identifier">
          <el-input
            v-model="form.identifier"
            placeholder="请输入标识符"
            :disabled="isReadOnly || hasRegisterDevice"
          />
          <!--  <div class="flex items-center gap-1 mt-1 text-xs text-[#298AF9]">
          <ArtSvgIcon icon="ri:error-warning-line" class="text-sm" />
          标识符唯一性
        </div> -->
        </el-form-item>

        <el-form-item v-if="isShowRequired" :label="constraintLabel" prop="required" required>
          <el-select
            v-model="form.required"
            class="w-full"
            :disabled="isReadOnly || hasRegisterDevice"
          >
            <el-option
              v-for="item in REQUIRED_MAP.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 读写类型 -->
        <el-form-item v-if="!isAddStruct && !isShowRequired" label="读写类型" prop="accessMode">
          <el-radio-group v-model="form.accessMode" :disabled="isReadOnly || hasRegisterDevice">
            <el-radio v-for="item in ACCESS_MODE_MAP.options" :value="item.value">{{
              item.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <DataTypeEditor
          v-model="form.dataType"
          :parentType="parentType"
          :form-ref="formRef"
          prop-path="dataType"
          :tableData="tableData"
          :track="track"
        />

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="5"
            maxlength="200"
            :disabled="isReadOnly"
          />
          <div class="w-full mt-1 text-xs text-right text-gray-400">
            {{ getByteLength(form.desc) }}/200
          </div>
        </el-form-item>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import DataTypeEditor from './data-type-editor.vue'
  import { buildThingModel, parseThingModel } from '../adapters'
  import {
    validateIdentifier,
    validateNameLength,
    validateDescLength,
    validateCommon,
    createUniqueValidatorByValue,
    validateBooleanDesc,
    validateEnumList,
    getByteLength
  } from '@/utils'
  import { ACCESS_MODE_MAP, DATA_TYPE_MAP, REQUIRED_MAP } from '@/enums'

  const props = defineProps({
    tableData: {
      type: Array,
      default: () => []
    },
    parentType: {
      type: String,
      default: ''
    },
    track: {
      // 'normal' | 'function' | 'extended'
      // normal: 常规属性模式
      // function: 来自功能的参数模式
      // extended: 来自拓展字段
      type: String,
      default: 'normal'
    },
    currentIndex: {
      type: Number,
      default: -1
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  })

  const formRef = useTemplateRef('formRef')
  const isReadOnly = inject('isReadOnly', false)
  const hasRegisterDevice = inject('hasRegisterDevice', false)

  const form = reactive({
    name: '',
    identifier: '',
    accessMode: 'rw',
    desc: '',
    dataType: {
      type: '',
      config: {}
    }
  })

  const EXTENDED_RESERVED_KEYS = ['identifier', 'name', 'required', 'dataType']
  const validateExtendedIdentifier = (rule, value, callback) => {
    // 仅在 extended 模式下校验
    if (props.track !== 'extended') {
      return callback()
    }

    if (!value) {
      return callback()
    }

    if (EXTENDED_RESERVED_KEYS.includes(value)) {
      return callback(new Error('该标识符为系统保留关键字，请更换'))
    }

    callback()
  }

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateNameLength, trigger: 'blur' }
    ],
    identifier: [
      { required: true, message: '请输入标识符', trigger: 'blur' },
      {
        validator: validateExtendedIdentifier,
        trigger: 'blur'
      },
      { validator: validateIdentifier, trigger: 'blur' },
      {
        validator: createUniqueValidatorByValue(
          props.tableData,
          'identifier',
          () => props.currentRow?.identifier
        ),
        trigger: 'blur'
      }
    ],
    'dataType.type': [{ required: true, message: '请选择类型', trigger: 'change' }],
    'dataType.config.length': [{ required: true, message: '请输入数据长度', trigger: 'blur' }],
    'dataType.config.maxItemsCount': [
      { required: true, message: '请输入元素个数', trigger: 'blur' }
    ],
    'dataType.config.list': [
      {
        validator: validateEnumList,
        trigger: 'submit'
      }
    ],
    'dataType.config.true': [
      {
        validator: (rule, value, callback) => {
          // 仅在 boolean 类型时校验
          if (form.dataType.type === 'boolean') {
            return validateBooleanDesc(rule, value, callback)
          }
          callback()
        },
        trigger: 'blur'
      }
    ],
    'dataType.config.false': [
      {
        validator: (rule, value, callback) => {
          // 仅在 boolean 类型时校验
          if (form.dataType.type === 'boolean') {
            return validateBooleanDesc(rule, value, callback)
          }
          callback()
        },
        trigger: 'blur'
      }
    ],
    accessMode: [{ required: true }],
    required: [{ required: true, message: '请选择约束类型' }],
    desc: [{ validator: validateDescLength, trigger: 'blur' }]
  }

  const isAddStruct = computed(() => props.parentType === 'object')

  const isShowRequired = computed(() => ['function', 'extended'].includes(props.track))

  const labelName = computed(() => {
    if (isAddStruct.value || props.parentType === 'function') {
      return '参数名称'
    }
    return '功能名称'
  })

  const constraintLabel = computed(() => {
    return props.track === 'extended' ? '是否必填' : '填写约束'
  })

  watch(
    () => form.dataType.config?.list?.length,
    (len) => {
      if (len > 0) {
        formRef.value?.clearValidate('dataType.config.list')
      }
    }
  )

  const getThingJson = () => {
    return buildThingModel(form, 'property')
  }

  const initForm = (json) => {
    const data = parseThingModel(json)
    console.log('解析后的数据', data)

    if (data) {
      Object.assign(form, data)
    }
  }

  const submit = async () => {
    const valid = await formRef.value?.validate()
    if (!valid) return null
    return getThingJson()
  }

  defineExpose({
    formRef,
    form,
    getThingJson,
    submit,
    initForm
  })
</script>
