<template>
  <div class="flex h-full bg-white advanced-mode">
    <!-- 左侧功能列表 -->
    <FunctionList :list="functions" v-model="activeFunction" @change="handleFunctionChange" />

    <div class="flex flex-1 gap-10 py-10 px-9">
      <!-- 中间参数配置 -->
      <div class="rounded-md shrink-0 w-[744px]">
        <MonacoEditor v-model="editorContent" theme="vs-dark" class="h-[378px]" lang="json" />
        <!-- 操作按钮 -->
        <div class="flex justify-end gap-3 mt-4">
          <el-button class="w-[95px]" type="info" @click="handleReset">清空</el-button>
          <el-button class="w-[95px]" type="primary" @click="handleExecute">执行</el-button>
        </div>
      </div>

      <!-- 执行结果 -->
      <ExecuteResult :result="result" />
    </div>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import FunctionList from './function-list.vue'
  import ExecuteResult from './execute-result.vue'

  const props = defineProps({
    deviceDetail: {
      type: Object,
      default: () => {}
    },
    functions: {
      type: Array,
      default: () => [],
      required: true
    }
  })

  const emits = defineEmits(['execute'])

  const editorContent = ref('')
  /**
   * 当前激活的 function
   */
  const activeFunction = ref(props.functions[0])

  function init() {
    let input = activeFunction.value.input
    let res = {}
    input.forEach((item) => {
      if (['int', 'float', 'double'].includes(item.dataType.type)) {
        res[item.identifier] = item[item.identifier] ?? 0
      } else if (item.dataType.type === 'boolean') {
        res[item.identifier] = item[item.identifier] ?? false
      } else {
        res[item.identifier] = item[item.identifier] ?? ''
      }
    })
    editorContent.value = JSON.stringify(res, null, 2)
  }

  watch(
    () => activeFunction.value?.input,
    (input) => {
      if (input) init()
    },
    { immediate: true }
  )

  const handleReset = () => {
    init()
    result.value = ''
  }

  /**
   * 执行
   */
  const result = ref('')
  const handleFunctionChange = () => {
    result.value = ''
  }

  async function handleExecute() {
    try {
      const data = await api.apiDevExecute({
        deviceIdentifier: props.deviceDetail.identifier,
        functionIdentifier: activeFunction.value.identifier,
        inputParameters: JSON.parse(editorContent.value)
      })
      console.log(data)

      // mock
      result.value = JSON.stringify(data, null, 2)
    } catch (error) {
      result.value = JSON.stringify(error.message, null, 2)
    }
  }
</script>

<style lang="scss" scoped>
  .advanced-mode {
  }
</style>
