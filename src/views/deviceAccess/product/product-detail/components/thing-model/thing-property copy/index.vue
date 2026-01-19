<template>
  <div class="thing-property">
    <el-scrollbar height="650">
      <!-- Form -->
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

        <!-- 数据类型 -->
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="form.dataType" class="w-full" @change="handleDataTypeChange">
            <el-option
              v-for="item in dataTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 数组 START -->
        <template v-if="form.dataType === 'array'">
          <!-- 元素个数 -->
          <el-form-item label="元素个数">
            <el-input-number
              v-model="form.specs.maxItemsCount"
              :min="1"
              :max="512"
              placeholder="元素最大支持512个"
              :controls="false"
              align="left"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 元素类型 -->
          <el-form-item label="元素类型">
            <el-select v-model="form.specs.type" class="w-full" @change="handleArrayDataTypeChange">
              <el-option
                v-for="item in arrayDataTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </template>
        <!-- 数组 END -->

        <template v-if="isNumberType">
          <!-- 取值范围 -->
          <el-form-item label="取值范围">
            <div class="flex items-center gap-2 w-full">
              <el-input v-model="form.specs.min" placeholder="最小值" />
              <span class="text-gray-400">—</span>
              <el-input v-model="form.specs.max" placeholder="最大值" />
            </div>
          </el-form-item>

          <!-- 步长 -->
          <el-form-item label="步长">
            <el-input v-model="form.specs.step" />
          </el-form-item>

          <!-- 单位 -->
          <el-form-item label="单位">
            <el-select v-model="form.specs.unit" class="w-full">
              <el-option label="百分比（%）" value="%" />
              <el-option label="秒（s）" value="s" />
              <el-option label="毫秒（ms）" value="ms" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 数据长度 -->
        <template v-if="isTextType">
          <el-form-item label="数据长度" prop="length">
            <el-input-number
              v-model="form.specs.length"
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

        <!-- 时间格式 -->
        <template v-if="isDateType">
          <el-form-item label="时间格式">
            <div class="flex items-center gap-1 mt-1 text-xs text-g-afb2b8">
              <ArtSvgIcon icon="ri:error-warning-line" class="text-sm" />
              默认格式为String类型的UTC时间戳，单位:秒。
            </div>
          </el-form-item>
        </template>

        <!-- 枚举型 -->
        <el-form-item v-if="form.dataType === 'enum'" label="枚举型">
          <template #label="{ label }">
            <div class="flex-col">
              <p>{{ label }}</p>
              <p class="text-g-afb2b8 text-xs">(最多100项)</p>
            </div>
          </template>

          <div class="w-full space-y-2">
            <div class="flex gap-2 mb-2 text-sm text-g-505658">
              <div class="w-1/3">参数值</div>
              <div class="flex-1">参数描述</div>
              <div class="w-8"></div>
            </div>

            <div
              v-for="(item, index) in form.enumList"
              :key="index"
              class="flex items-center gap-2 mb-3"
            >
              <div class="w-1/3">
                <el-input-number
                  v-model="item.value"
                  :precision="0"
                  :controls="false"
                  placeholder="整数"
                  align="left"
                  style="width: 100%"
                />
              </div>

              <div class="flex-1">
                <el-input v-model="item.label" placeholder="请输入" class="w-full" />
              </div>

              <div class="w-8 flex justify-center">
                <div v-if="index === 0" :disabled="form.enumList.length >= 100" @click="addEnum">
                  <img class="w-4.5 h-4.5" src="@/assets/images/icon/icon-add.png" alt="" />
                </div>

                <div v-else @click="removeEnum(index)">
                  <img class="w-4.5 h-4.5" src="@/assets/images/icon/icon-subtract.png" alt="" />
                </div>
              </div>
            </div>

            <div
              v-if="form.enumList.length === 0"
              class="text-sm text-gray-400 cursor-pointer hover:text-blue-500"
              @click="addItem"
            >
              + 点击添加一项
            </div>
          </div>
        </el-form-item>

        <!-- 布尔值 -->
        <el-form-item v-if="form.dataType === 'boolean'" label="布尔值">
          <div class="w-full space-y-2">
            <div class="flex items-center gap-2">
              <span class="w-14 text-g-505658">True &nbsp;-</span>
              <el-input v-model="form.specs.true" placeholder="请输入" />
            </div>

            <div class="flex items-center gap-2">
              <span class="w-14 text-g-505658">False&nbsp;-</span>
              <el-input v-model="form.specs.false" placeholder="请输入" />
            </div>
          </div>
        </el-form-item>

        <!--结构体 JSON 对象 -->
        <el-form-item v-if="isStructType" label="JSON对象" class="relative">
          <div class="add-btn absolute top-4 right-[-22px] z-10" @click="openAddStruct">
            <img class="w-4.5 h-4.5" src="@/assets/images/icon/icon-add.png" alt="" />
          </div>
          <el-table :data="form.specs.specsArray" border class="w-full">
            <el-table-column prop="name" label="参数名称" />
            <el-table-column prop="identifier" label="标识符" />
            <el-table-column prop="type" label="数据类型" />
            <el-table-column label="操作" width="120">
              <template #default="{ $index }">
                <el-button type="primary" link>编辑</el-button>
                <el-button type="danger" link @click="removeStruct($index)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <!-- 坐标 -->
        <el-form-item v-if="form.dataType === 'geo_point'" label="数据格式">
          <div class="px-4 py-2 bg-[#edeef3] text-g-505658 w-full rounded-full">
            ·地址位置数据，以经纬度显示
          </div>
        </el-form-item>

        <!-- 描述 -->
        <el-form-item label="描述">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="5"
            maxlength="200"
            placeholder="请输入产品说明"
          />
          <div class="w-full text-right text-xs text-gray-400 mt-1">
            {{ getByteLength(form.desc) }}/200
          </div>
        </el-form-item>
      </el-form>
    </el-scrollbar>

    <StructDialog ref="structDialogRef" @addStruct="addStruct" />
  </div>
</template>

<script setup>
  import {
    getByteLength,
    validateIdentifier,
    validateNameLength,
    validateDescLength,
    validateCommon,
    createUniqueValidator
  } from '@/utils'
  import { ACCESS_MODE_MAP, DATA_TYPE_MAP } from '@/enums'
  import StructDialog from './struct-dialog.vue'

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
  const form = reactive({
    name: '',
    identifier: '',
    accessMode: 'r',
    dataType: 'text',
    length: null,
    desc: '',
    enumList: [],
    specs: {
      // specs: {}, // 数组
      // specsArray: [] // 结构体
    }
  })

  const standardFromData = computed(() => {
    let temp = JSON.parse(JSON.stringify(form))
    let thingJson = {}
    if (props.isAddStruct) {
      thingJson = {
        identifier: temp.identifier,
        name: temp.name,
        desc: temp.desc,
        dataType: {
          type: temp.dataType,
          specs: {
            ...temp.specs
          }
        }
      }
    } else {
      thingJson = {
        identifier: temp.identifier,
        name: temp.name,
        functionType: 'custom',
        accessMode: temp.accessMode,
        desc: temp.desc,
        dataType: {
          type: temp.dataType,
          specs: {
            ...temp.specs
          }
        },

        functionMode: 'property'
      }
    }

    // if (Object.keys(temp.specs).length) {
    //   thingJson.dataType.specs = temp.specs
    // }
    switch (form.dataType) {
      case 'array':
        thingJson.dataType = {
          type: 'array',
          specs: {
            type: temp.specs.type,
            maxItemsCount: temp.specs.maxItemsCount,
            specs: {}
          }
        }

        delete temp.specs.maxItemsCount
        delete temp.specs.type
        thingJson.dataType.specs.specs = {
          ...temp.specs
        }

        break
      case 'enum':
        thingJson.dataType.specs = {}
        temp.enumList.forEach((item) => {
          thingJson.dataType.specs[item.value] = item.label
        })
        break

      default:
        break
    }
    return thingJson
  })

  const rules = {
    name: [
      { required: true, message: '请输入功能名称', trigger: 'blur' },
      [{ validator: validateNameLength, trigger: 'blur' }]
    ],
    identifier: [
      { validator: validateIdentifier, trigger: 'blur' },
      {
        validator: createUniqueValidator(props.tableData, 'identifier', {
          message: '标识符已存在',
          currentValue: form.identifier
        }),
        trigger: 'blur'
      }
    ],
    accessMode: [{ required: true }],
    dataType: [{ required: true }],
    desc: [
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateDescLength, trigger: 'blur' }
    ]
  }

  // 是否是数字类型
  const isNumberType = computed(() => {
    let numberFlag = ['int', 'float', 'double'].includes(form.dataType)
    if (form.dataType === 'array' && form.specs && form.specs.type) {
      numberFlag = ['int', 'float', 'double'].includes(form.specs.type)
    }
    return numberFlag
  })

  const isTextType = computed(() => {
    let flag = ['text', 'password'].includes(form.dataType)
    if (form.dataType === 'array' && form.specs && form.specs.type) {
      flag = ['text', 'password'].includes(form.specs.type)
    }
    return flag
  })
  const isDateType = computed(() => {
    let flag = form.dataType === 'date'
    if (form.dataType === 'array' && form.specs && form.specs.type) {
      flag = form.specs.type === 'date'
    }
    return flag
  })

  const isStructType = computed(() => {
    let flag = form.dataType === 'object'
    if (form.dataType === 'array' && form.specs && form.specs.type) {
      flag = form.specs.type === 'object'
    }
    return flag
  })

  // 处理数据类型变更
  const handleDataTypeChange = (dataType) => {
    console.log('dataType', dataType)
    form.specs = {}
    switch (dataType) {
      case 'object':
        if (!form.specs.specsArray) {
          form.specs.specsArray = []
        }
        break
      default:
        break
    }
  }

  const handleArrayDataTypeChange = (dataType) => {
    form.specs = {
      type: form.specs.type,
      maxItemsCount: form.specs.maxItemsCount
    }
  }

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

  const addEnum = () => {
    if (form.enumList.length >= 100) return
    form.enumList.push({ value: null, desc: '' })
  }

  const removeEnum = (index) => {
    form.enumList.splice(index, 1)
  }

  // 过滤数组内元素的数据类型
  const arrayDataTypeList = ref([])
  const handleArrayDataType = () => {
    const targets = ['int', 'float', 'text', 'object', 'date']
    const result = DATA_TYPE_MAP.options.filter((item) => targets.includes(item.value))
    arrayDataTypeList.value = result
  }

  const structDialogRef = useTemplateRef('structDialogRef')
  const openAddStruct = () => {
    const jsonList = form.specs.specsArray
    if (jsonList.length >= 20) return
    jsonList.push({ name: '', key: '', type: '' })
    structDialogRef.value.open()
  }
  const addStruct = (data) => {
    console.log('addStruct', data)

    form.specs.specsArray.push(data)
  }

  const removeStruct = (index) => {
    const jsonList = form.specs.specsArray
    jsonList.splice(index, 1)
  }

  onMounted(() => {
    handleArrayDataType()
  })
  defineExpose({
    standardFromData
  })
</script>

<style lang="scss" scoped>
  .thing-property {
  }
</style>
