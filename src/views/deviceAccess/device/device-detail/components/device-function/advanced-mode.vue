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

      <!-- 右侧执行结果 -->
      <div class="bg-white h-fit rounded-md border border-[#EEEFF1] flex-1">
        <div class="text-g-303537 border-b border-[#EEEFF1] px-5 py-4.5 font-scBold">执行结果</div>
        <div
          class="text-g-505658 whitespace-pre-line px-5 py-4.5 max-h-[500px] min-h-25 overflow-y-auto"
        >
          {{ result }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import FunctionList from './function-list.vue'
  const props = defineProps({
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
    emits('execute', request)

    // mock 执行结果
    result.value = JSON.stringify(request, null, 2)
  }
</script>

<style lang="scss" scoped>
  .advanced-mode {
  }
</style>
