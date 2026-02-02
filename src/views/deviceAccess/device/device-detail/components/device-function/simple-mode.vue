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
      default: () => []
    }
  })

  const emits = defineEmits(['execute'])

  const activeFunction = ref(props.functions[0])
  const valueFormRef = ref()
  const result = ref('')

  function handleFunctionChange() {
    result.value = ''
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
      functionMode: activeFunction.value.functionMode,
      params
    }

    emits('execute', request)

    // mock
    result.value = JSON.stringify(request, null, 2)
  }
</script>
