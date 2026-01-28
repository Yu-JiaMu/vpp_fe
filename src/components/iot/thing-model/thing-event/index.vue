<template>
  <div class="thing-property">
    <el-scrollbar max-height="650">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" class="pr-8">
        <el-form-item label="功能名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入功能名称" :disabled="isReadOnly" />
        </el-form-item>

        <el-form-item label="标识符" prop="identifier">
          <el-input
            v-model="form.identifier"
            placeholder="请输入标识符"
            :disabled="isReadOnly || hasRegisterDevice"
          />
        </el-form-item>

        <el-form-item label="事件级别" prop="eventType">
          <el-select v-model="form.eventType" class="w-full" :disabled="isReadOnly">
            <el-option
              v-for="item in EVENT_TYPE_MAP.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="输出参数" class="relative">
          <div
            v-if="!(hasRegisterDevice || isReadOnly)"
            class="add-btn absolute top-4 right-[-22px] z-10"
            @click="open('output')"
          >
            <img class="w-4.5 h-4.5" src="@/assets/images/icon/icon-add.png" alt="" />
          </div>
          <el-table :data="form.output" border>
            <el-table-column prop="name" label="参数名称" />
            <el-table-column prop="identifier" label="参数标识符" width="120" />
            <el-table-column label="填写约束">
              <template #default="{ row }">
                {{ row.required ? '必填' : '选填' }}
              </template>
            </el-table-column>

            <el-table-column label="数据类型">
              <template #default="{ row }">
                {{ row.dataType.type }}
              </template>
            </el-table-column>

            <el-table-column label="数据定义">
              <template #default="{ row }">
                <FunctionDefinePreview :row="row" functionMode="property" />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120">
              <template #default="{ row, $index }">
                <el-button
                  :disabled="isReadOnly || hasRegisterDevice"
                  type="primary"
                  link
                  @click="edit(row, $index, 'output')"
                  >编辑</el-button
                >
                <el-button
                  :disabled="isReadOnly || hasRegisterDevice"
                  type="danger"
                  link
                  @click="remove($index, 'output')"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

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

    <ParamsDialog ref="dialogRef" v-model="form[paramsType]" />
  </div>
</template>

<script setup>
  import { EVENT_TYPE_MAP } from '@/enums'
  import { buildThingModel, parseThingModel } from '../adapters'
  import {
    validateIdentifier,
    validateNameLength,
    validateDescLength,
    validateCommon,
    createUniqueValidatorByValue,
    getByteLength
  } from '@/utils'
  import ParamsDialog from '../params-dialog/index.vue'
  import FunctionDefinePreview from '../function-define-preview/index.vue'

  const props = defineProps({
    tableData: {
      type: Array,
      default: () => []
    },
    parentType: {
      type: String,
      default: ''
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  })

  const isReadOnly = inject('isReadOnly', false)
  const hasRegisterDevice = inject('hasRegisterDevice', false)

  const formRef = useTemplateRef('formRef')
  const form = reactive({
    name: '',
    identifier: '',
    eventType: '',
    desc: '',

    output: [
      //   {
      //     name: '',
      //     identifier: '',
      //     dataType: {
      //       type: 'enum',
      //       specs: {}
      //     }
      //   }
    ]
  })

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { validator: validateNameLength, trigger: 'blur' }
    ],
    identifier: [
      { required: true, message: '请输入标识符', trigger: 'blur' },
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
    eventType: [{ required: true, message: '请选择事件级别', trigger: 'change' }],
    desc: [
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateDescLength, trigger: 'blur' }
    ]
  }

  const dialogRef = ref()
  const paramsType = ref('')

  const open = (type) => {
    paramsType.value = type
    dialogRef.value.open()
  }

  const edit = (row, index, type) => {
    paramsType.value = type
    dialogRef.value.open(row, index)
  }

  function remove(index, type) {
    paramsType.value = type
    form[paramsType.value].splice(index, 1)
  }

  const getThingJson = () => {
    // console.log('form', form)

    return buildThingModel(form, 'event')
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
<style lang="scss" scoped>
  .thing-property {
  }
</style>
