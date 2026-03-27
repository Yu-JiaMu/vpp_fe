<template>
  <div
    :class="[
      'group relative bg-white  p-4 w-[248px] min-h-[110px] border border-[#ebecf1] rounded-md cursor-pointer transition-all duration-200 select-none hover:border-b-[#38ECF2] hover:border-b-2'
    ]"
  >
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center text-g-303537 truncate mr-2">
        <span class="w-1.5 h-1.5 mr-2 flex-shrink-0 bg-[#CED1D9] group-hover:bg-[#38ECF2]"></span>
        <span class="font-medium tracking-wide">{{ item.title }}</span>
      </div>
      <el-tooltip class="box-item" effect="dark" :content="item.tooltip" placement="top">
        <ArtSvgIcon icon="ri:question-line" class="w-3.5 h-3.5 text-[#B2BAC4] text-sm" />
      </el-tooltip>
    </div>

    <!-- <div class="flex items-end overflow-hidden group-hover:font-scBold">
      <span class="text-[42px] text-g-303537">{{ value }}</span> -->
    <!-- <ArtCountTo
        class="text-[42px] text-g-303537"
        :target="value"
        :duration="1300"
        easing="easeInOutCubic"
      /> -->
    <!-- <div v-if="suffix" class="ml-1.5 text-3xl text-[#131617] pb-2.5"> {{ suffix }}</div>
      <div v-if="subValue" class="ml-1.5 text-3xl text-[#131617] pb-2.5"> ({{ subValue }})</div>
    </div> -->

    <div class="overflow-hidden font-scLight group-hover:font-scRegular align-text-bottom">
      <span class="text-[42px] text-g-303537">{{ item.value }}</span>
      <span v-if="item.suffix" class="ml-1.5 text-3xl text-[#131617]"> {{ item.suffix }}</span>
      <span v-if="item.subValue" class="text-3xl text-[#131617]"> ({{ item.subValue }})</span>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    item: {
      type: Object,
      default: () => ({})
    }
  })

  defineEmits(['select'])
</script>
