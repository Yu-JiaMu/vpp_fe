<template>
  <div class="index pb-[150px]">
    <DeviceStats />

    <div class="grid grid-cols-2 gap-4 mb-5">
      <div>
        <div class="flex items-center mb-2.5 text-g-303537 text-lg font-scBold">
          <img src="@/assets/images/dashboard/icon-002.png" class="w-[22px] h-7.5 mr-1.5" alt="" />
          设备分布统计
        </div>
        <DevicePie />
      </div>

      <div>
        <div class="flex items-center mb-2.5 text-g-303537 text-lg font-scBold">
          <img src="@/assets/images/dashboard/icon-003.png" class="w-[22px] h-7.5 mr-1.5" alt="" />
          设备状态统计
        </div>
        <DeviceBar />
      </div>
    </div>

    <div class="grid grid-cols-[1fr_516px] gap-5 mb-5">
      <div class="min-w-0">
        <div class="flex items-center mb-2.5 text-g-303537 text-lg font-scBold">
          <img src="@/assets/images/dashboard/icon-004.png" class="w-[22px] h-7.5 mr-1.5" alt="" />
          设备分布地图
        </div>
        <DeviceMap />
      </div>

      <div>
        <div class="flex items-center mb-2.5 text-g-303537 text-lg font-scBold">
          <img src="@/assets/images/dashboard/icon-005.png" class="w-[22px] h-7.5 mr-1.5" alt="" />
          <span>设备消息数</span>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="·统计并展示最近7天的每日上行、下行消息数
"
            placement="right"
          >
            <ArtSvgIcon
              icon="ri:question-line"
              class="w-3.5 h-3.5 text-[#B2BAC4] text-sm ml-4 mt-1"
            />
          </el-tooltip>
        </div>
        <DeviceMessage />
      </div>
    </div>

    <BottomGuide />
  </div>
</template>

<script setup>
  import DeviceStats from './components/DeviceStats.vue'
  import DevicePie from './components/DevicePie.vue'
  import DeviceBar from './components/DeviceBar.vue'
  import DeviceMessage from './components/DeviceMessage.vue'
  import BottomGuide from './components/BottomGuide.vue'
  import DeviceMap from './components/DeviceMap.vue'
</script>

<style lang="scss" scoped>
  .index {
  }
</style>
