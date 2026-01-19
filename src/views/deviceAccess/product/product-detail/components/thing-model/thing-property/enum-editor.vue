<!-- 枚举编辑 -->
<template>
  <div>
    <el-form-item label="枚举型" prop="dataType.config.list">
      <template #label="{ label }">
        <div class="flex-col">
          <p>{{ label }}</p>
          <p class="text-xs text-g-afb2b8">(最多100项)</p>
        </div>
      </template>

      <div class="w-full space-y-2">
        <div class="flex gap-2 mb-2 text-sm text-g-505658">
          <div class="w-1/3">参数值</div>
          <div class="flex-1">参数描述</div>
          <div class="w-8"></div>
        </div>

        <div v-for="(item, index) in modelValue" :key="index" class="flex items-center gap-2 mb-0">
          <div class="w-1/3">
            <el-form-item :prop="`dataType.config.list.${index}.value`" :rules="valueRules(index)">
              <el-input-number
                v-model.number="item.value"
                :precision="0"
                :controls="false"
                placeholder="请输入参数值(整数)"
                align="left"
                style="width: 100%"
              />
            </el-form-item>
          </div>

          <div class="flex-1">
            <el-form-item :prop="`dataType.config.list.${index}.label`" :rules="labelRules">
              <el-input v-model="item.label" placeholder="请输入参数名称" class="w-full" />
            </el-form-item>
          </div>

          <div v-if="!(hasRegisterDevice || isReadOnly)" class="flex justify-center w-8 h-9">
            <div v-if="index === 0" :disabled="modelValue.length >= 100" @click="add">
              <img
                class="w-4.5 h-4.5 cursor-pointer"
                src="@/assets/images/icon/icon-add.png"
                alt=""
              />
            </div>

            <div v-else @click="remove(index)">
              <img
                class="w-4.5 h-4.5 cursor-pointe"
                src="@/assets/images/icon/icon-subtract.png"
                alt=""
              />
            </div>
          </div>
        </div>

        <div
          v-if="modelValue.length === 0 || !hasRegisterDevice"
          class="text-sm text-gray-400 cursor-pointer hover:text-blue-500"
          @click="add"
        >
          + 点击添加一项
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
  import { validateParamDesc, createUniqueValidator } from '@/utils'
  const modelValue = defineModel()

  const isReadOnly = inject('isReadOnly', false)
  const hasRegisterDevice = inject('hasRegisterDevice', false)

  const createUniqueValueValidator = (index) => {
    return (rule, value, callback) => {
      // 空值交给 required 规则处理
      if (value === null || value === undefined || value === '') {
        callback()
        return
      }

      const list = modelValue.value || []

      const duplicate = list.some((item, i) => {
        if (i === index) return false
        return item.value === value
      })

      if (duplicate) {
        callback(new Error('参数值不能重复'))
      } else {
        callback()
      }
    }
  }

  const valueRules = (index) => [
    {
      required: true,
      message: '参数值不能为空',
      trigger: 'blur'
    },
    {
      validator: createUniqueValueValidator(index),
      trigger: 'blur'
    }
  ]

  const labelRules = [
    {
      required: true,
      message: '参数描述不能为空',
      trigger: 'blur'
    },
    {
      validator: validateParamDesc,
      trigger: 'blur'
    }
  ]

  const add = () => {
    if (modelValue.value.length >= 100) return
    modelValue.value.push({ value: null, label: '' })
  }

  const remove = (i) => modelValue.value.splice(i, 1)
</script>
