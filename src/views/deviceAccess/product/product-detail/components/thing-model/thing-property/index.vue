<template>
  <div class="thing-property">
    <el-scrollbar height="650">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="pr-8">
        <!-- 功能名称 -->
        <el-form-item :label="isAddStruct ? '参数名称' : '功能名称'" prop="name">
          <el-input v-model="form.name" placeholder="请输入属性名称" maxlength="50" />
        </el-form-item>

        <!-- 标识符 -->
        <el-form-item label="标识符" prop="identifier">
          <el-input v-model="form.identifier" placeholder="请输入标识符" />
          <!--  <div class="flex items-center gap-1 mt-1 text-xs text-[#298AF9]">
          <ArtSvgIcon icon="ri:error-warning-line" class="text-sm" />
          标识符唯一性
        </div> -->
        </el-form-item>

        <!-- 读写类型 -->
        <el-form-item v-if="!isAddStruct" label="读写类型" prop="accessMode">
          <el-radio-group v-model="form.accessMode">
            <el-radio v-for="item in ACCESS_MODE_MAP.options" :value="item.value">{{
              item.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <DataTypeEditor v-model="form.dataType" :isAddStruct="isAddStruct" />

        <el-form-item label="描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="5" maxlength="200" />
        </el-form-item>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import DataTypeEditor from './DataTypeEditor.vue'
  import { buildThingModel } from './adapters/build-thing'
  import {
    validateIdentifier,
    validateNameLength,
    validateDescLength,
    validateCommon,
    createUniqueValidator
  } from '@/utils'
  import { ACCESS_MODE_MAP, DATA_TYPE_MAP } from '@/enums'

  const props = defineProps({
    tableData: {
      type: Array,
      default: () => []
    },
    isAddStruct: {
      type: Boolean,
      default: false
    }
  })

  const formRef = useTemplateRef('formRef')

  const form = reactive({
    name: '',
    identifier: '',
    accessMode: 'r',
    desc: '',
    dataType: {
      type: 'text',
      config: {}
    }
  })

  const rules = {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { validator: validateNameLength, trigger: 'blur' }
    ],
    identifier: [
      { validator: validateIdentifier, trigger: 'blur' },
      {
        validator: createUniqueValidator(props.tableData, 'identifier', {
          currentValue: () => form.identifier
        }),
        trigger: 'blur'
      }
    ],
    accessMode: [{ required: true }],
    'dataType.type': [{ required: true }],
    desc: [
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateDescLength, trigger: 'blur' }
    ]
  }

  defineExpose({
    formRef,
    getThingJson: () => buildThingModel(form, props.isAddStruct)
  })
</script>
