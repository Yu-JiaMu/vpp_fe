<template>
  <div class="flex h-full bg-white thing-model-executor">
    <!-- 左侧功能列表 -->
    <FunctionList :list="functions" v-model="activeFunction" @change="handleFunctionChange" />

    <div class="flex flex-1 gap-10 py-10 px-9">
      <!-- 中间参数配置 -->
      <div class="rounded-md shrink-0 w-[744px]">
        <ThingValueForm ref="valueFormRef" :schema="activeFunction?.input || []" />

        <div class="flex justify-end gap-3 mt-4">
          <el-button class="w-[95px]" type="info" @click="handleReset"> 清空 </el-button>
          <el-button class="w-[95px]" type="primary" @click="handleExecute"> 执行 </el-button>
        </div>
      </div>

      <!-- 执行结果 -->
      <ExecuteResult :result="result" />
    </div>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import ExecuteResult from './execute-result.vue'
  import FunctionList from './function-list.vue'

  const props = defineProps({
    deviceDetail: {
      type: Object,
      default: () => {}
    },
    functions: {
      type: Array,
      default: () => []
    }
  })

  const emits = defineEmits(['execute'])

  const activeFunction = ref(props.functions[0])
  const valueFormRef = ref()
  const result = ref('')

  function handleFunctionChange() {
    handleReset()
  }

  /**
   * 清空
   */
  function handleReset() {
    result.value = ''
    valueFormRef.value?.reset()
  }

  /**
   * 执行
   */
  async function handleExecute() {
    const valid = await valueFormRef.value?.validate()
    if (!valid) return

    const params = valueFormRef.value.getValues()

    const request = {
      identifier: activeFunction.value.identifier,
      params: params.reduce((acc, { identifier, value }) => {
        acc[identifier] = value
        return acc
      }, {})
    }

    try {
      const data = await api.apiDevExecute({
        deviceIdentifier: props.deviceDetail.identifier,
        functionIdentifier: request.identifier,
        inputParameters: request.params
      })
      console.log(data)

      // mock
      result.value = JSON.stringify(data, null, 2)
    } catch (error) {
      result.value = JSON.stringify(error.message, null, 2)
    }
  }
</script>
