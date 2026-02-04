<template>
  <div class="bg-white device-function">
    <div class="flex items-center p-5 border-b border-[#e5e6ec]">
      <div class="flex items-center gap-2 cursor-pointer">
        <div
          class="tag"
          :class="{ 'active-tag': activeTag === tag.value }"
          v-for="(tag, index) in tagList"
          :key="index"
          @click="handleTagClick(tag)"
          >{{ tag.label }}</div
        >
      </div>
      <div class="flex items-center ml-4 bg-[#f7f8fa] rounded-2xl px-2.5 py-1.5">
        <el-icon color="#505658"><Warning /></el-icon>
        <span class="text-[13px] ml5" style="color: #505658"
          >精简模式下参数只支持输入框的方式录入</span
        >
      </div>
    </div>

    <template v-if="functions.length">
      <SimpleMode
        v-if="activeTag === 'simple'"
        :functions="functions"
        :deviceDetail="deviceDetail"
      />

      <AdvancedMode v-else :functions="functions" :deviceDetail="deviceDetail" />
    </template>
  </div>
</template>

<script setup>
  import AdvancedMode from './advanced-mode.vue'
  import SimpleMode from './simple-mode.vue'

  const props = defineProps({
    deviceDetail: {
      type: Object,
      default: () => {}
    }
  })

  const functions = computed(() => {
    return props.deviceDetail?.thingModelJson?.modules[0]?.functions ?? []
  })

  const tagList = ref([
    {
      label: '精简模式',
      value: 'simple'
    },
    {
      label: '高级模式',
      value: 'advanced'
    }
  ])
  const activeTag = ref(tagList.value[0].value)

  const handleTagClick = (tag) => {
    activeTag.value = tag.value
  }

  async function handleExecute(payload) {
    console.log('最终提交参数', payload)
  }
</script>

<style lang="scss" scoped>
  .device-function {
    .tag {
      padding: 6px 15px;
      border: 1px solid #e5e6ec;
      border-radius: 2px;
      font-size: 13px;
      font-family:
        Source Han Sans SC,
        Source Han Sans SC-Medium;
      color: #303537;
    }
    .active-tag {
      background: #eefeff !important;
      border: 1px solid #38ecf2 !important;
      font-weight: 500;
    }
  }
</style>
