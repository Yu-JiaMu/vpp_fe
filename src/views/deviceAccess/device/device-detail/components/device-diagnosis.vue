<template>
  <div class="device-diagnosis bg-white">
    <div class="network-diagnosis-container">
      <!-- 头部状态区域 -->
      <div class="status-header">
        <!-- <img src="@/assets/images/deviceAccess/15.png" class="w-[100%] h-[100%]" /> -->
        <img src="@/assets/images/deviceAccess/16.png" class="w-[100%] h-[100%]" />
        <div class="c-x-z-d">重新诊断</div>
      </div>
    </div>
    <div class="flex gap-2 cursor-pointer mt-[20px] mb-[20px]">
      <div
        class="tag"
        :class="{ 'active-tag': activeTag === tag.value }"
        v-for="(tag, index) in tagList"
        :key="index"
        @click="handleTagClick(tag)"
        >{{ tag.label }}</div
      >
    </div>
    <div class="flex justify-between items-center">
      <div class="font-scBold text-g-131617 flex-c">
        <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
        基本信息
      </div>
    </div>
    <div
      class="flex justify-between items-center l-j-info"
      v-for="(item, index) in infoList"
      :key="index"
    >
      <div class="flex items-center gap-5">
        <img src="@/assets/images/deviceAccess/17.png" class="w-[40px] h-[40px]" />
        <!-- <img src="@/assets/images/deviceAccess/18.png" class="w-[40px] h-[40px]" /> -->
        <div class="flex flex-col">
          <span class="text-[15px] text-[#303537] font-bold">网络组建</span>
          <span class="text-[13px] text-[#505658] font-normal"
            >诊断网络组件配置是否正确，配置错误将导致设备连接失败。</span
          >
        </div>
      </div>
      <span class="text-[15px] text-[#2ECB63] font-medium">正常</span>
      <!-- <span class="text-[15px] text-[#F8345C] font-medium">错误</span> -->
    </div>
  </div>
</template>

<script setup>
  const tagList = ref([
    {
      label: '连接状态',
      value: 'connectionStatus'
    },
    {
      label: '消息通知',
      value: 'notification'
    }
  ])
  const activeTag = ref('connectionStatus')
  const handleTagClick = (tag) => {
    activeTag.value = tag.value
    console.log(activeTag.value)
  }
  const infoList = ref([1, 2, 3])
</script>

<style scoped lang="scss">
  .device-diagnosis {
    padding: 30px 68px 30px 20px;
    .status-header {
      min-height: 94px;
      position: relative;

      .c-x-z-d {
        background: #ffffff;
        border-radius: 2px;
        padding: 6px 24px;
        font-size: 14px;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Medium;
        font-weight: 500;
        color: #f8345c;
        cursor: pointer;
        position: absolute;
        right: 40px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
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
    .l-j-info {
      border: 1px solid #e5e6ec;
      border-radius: 2px;
      padding: 15px 30px;
      margin-top: 10px;
      font-family: Source Han Sans SC;
      &:first-child {
        margin-top: 20px !important;
      }
    }
  }
</style>
