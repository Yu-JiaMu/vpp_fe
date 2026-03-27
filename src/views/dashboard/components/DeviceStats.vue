<template>
  <section class="py-5">
    <div class="flex items-center mb-2.5 text-g-303537 text-lg font-scBold">
      <img src="@/assets/images/icon/icon-008.png" class="w-[22px] h-7.5 mr-1.5" alt="" />
      <h2 class="font-bold tracking-wider">设备统计</h2>
    </div>

    <div class="flex flex-wrap gap-5">
      <StatCard v-for="(item, index) in stats" :key="index" :item="item" />
    </div>
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import StatCard from './StatCard.vue'

  const activeIndex = ref(1) // 默认选中第二个（启用产品数）

  const stats = ref([
    { title: '产品数', value: 9, tooltip: '统计平台上所有的产品总数。' },
    {
      title: '启用产品数',
      value: 12,
      dotColor: 'bg-cyan-400',
      badge: '2',
      tooltip: '统计状态为已启用的产品数量总和。'
    },
    { title: '设备数', value: 433, tooltip: '统计平台在线、离线、未激活的设备总数。' },
    { title: '在线设备数', value: 1314, subValue: '68.7%', tooltip: '统计当前在线的设备数量。' },
    {
      title: '今日消息总数',
      value: 999,
      suffix: '条',
      tooltip: '数据为今日设备上报云端与云端下发指令的消息数量累计总和'
    },
    {
      title: '实时消息TPS',
      value: 128,
      tooltip: '实时统计设备上报数据与平台下发指令的总和（每5秒刷新）'
    }
  ])
</script>
