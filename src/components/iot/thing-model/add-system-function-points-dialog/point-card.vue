<template>
  <div
    class="point-card w-full relative p-3 border border-[#ebecf1] rounded-md hover:border-primary bg-white"
  >
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="font-scMedium">{{ info.name }}</span>
        <el-tag size="small" type="success">{{ info.type }}</el-tag>
      </div>
      <div class="mt-1 text-g-505658">
        <span class="mr-4"> 标识符: {{ info.identifier }}</span>
        <span>读写类型: {{ info.accessMode }}</span>
      </div>
    </div>

    <div v-if="!hasClose" class="op-btn bg-[#e9f3ff]" @click="openCustomFunctionDialog()">
      <ArtSvgIcon icon="ri:eye-fill" class="text-sm text-[#298AF9] mr-1" />
      查看
    </div>

    <div v-else class="op-btn bg-[#FFF3F6]" @click="removeFunctionPoint">
      <ArtSvgIcon icon="ri:close-fill" class="mr-1 text-sm text-[#F8345C]" />
      关闭
    </div>

    <!-- 添加自定义功能点 -->
    <AddCustomFunctionPointDialog ref="addCustomFunctionPointDialogRef" />
  </div>
</template>

<script setup>
  const props = defineProps({
    info: {
      type: Object,
      default: () => ({})
    },
    hasClose: {
      type: Boolean,
      default: false
    }
  })

  const isReadOnly = ref(false)
  provide('isReadOnly', isReadOnly)

  const emits = defineEmits(['removeFunctionPoint'])

  function removeFunctionPoint() {
    emits('removeFunctionPoint', props.info)
  }

  const addCustomFunctionPointDialogRef = useTemplateRef('addCustomFunctionPointDialogRef')
  const openCustomFunctionDialog = () => {
    isReadOnly.value = true
    addCustomFunctionPointDialogRef.value.open(props.info, -1, 'look')
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .point-card {
    .op-btn {
      @apply flex-c absolute top-0 right-0 text-xs px-2 py-0.5 rounded-sm cursor-pointer text-g-303537;
    }
  }
</style>

<style lang="scss" scoped>
  .point-card {
  }
</style>
