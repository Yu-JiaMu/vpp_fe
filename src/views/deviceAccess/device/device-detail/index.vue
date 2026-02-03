<template>
  <div class="device-detail">
    <!-- 返回 -->
    <ArtButtonBack class="mb-2.5 mt20" is-back> 返回 </ArtButtonBack>

    <!-- 设备基础信息 -->
    <div class="bg-white rounded-md px-4 py-5 mb-2.5 flex items-center gap-4">
      <div class="w-[70px] h-[70px]">
        <img src="@/assets/images/icon/icon-empty-pic.webp" alt="" />
      </div>

      <div class="flex-1">
        <div class="flex items-center gap-4 mb-1.5">
          <span class="text-base text-gray-800 font-scMedium">
            {{ deviceDetail.name }}
          </span>
          <div class="flex items-center">
            <span class="text-sm text-g-505658">状态：</span>
            <el-tag :type="statusTagType" size="small">
              {{ DEVICE_STATUS_TYPES.getLabel(deviceDetail.devState) }}
            </el-tag>
          </div>
        </div>

        <div class="text-sm text-g-505658">
          <span>设备ID：</span>{{ deviceDetail.identifier }}
        </div>
        <div class="text-sm text-g-505658">
          <span>所属产品：</span>
          <span class="underline text-primary">{{ deviceDetail.productName }}</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex h-12 bg-white tab-con w-fit">
      <div
        v-for="tab in visibleTabs"
        :key="tab.value"
        class="tab-item w-[135px] flex-cc cursor-pointer"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <div class="tab-btn w-[118px] h-8 rounded-sm">
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- 内容区：统一动态组件 -->
    <component
      :is="activeComponent"
      v-if="activeComponent"
      :deviceDetail="deviceDetail"
      @refresh="getDeviceDetail(deviceDetail.id)"
    />
  </div>
</template>

<script setup>
  import { defineAsyncComponent, computed, ref, onMounted } from 'vue'
  import { useRoute, onBeforeRouteUpdate } from 'vue-router'
  import * as api from '@/api/iot'
  import { NODE_TYPES, DEVICE_STATUS_TYPES } from '@/enums'

  const route = useRoute()
  const deviceDetail = ref({})
  const activeTab = ref('instanceMessage')

  const componentsMap = {
    instanceMessage: defineAsyncComponent(() => import('./components/instance-message.vue')),
    operateStatus: defineAsyncComponent(() => import('./components/operate-status/index.vue')),
    deviceFunction: defineAsyncComponent(() => import('./components/device-function/index.vue')),
    deviceDiagnosis: defineAsyncComponent(() => import('./components/device-diagnosis.vue')),
    logManagement: defineAsyncComponent(() => import('./components/log-management.vue')),
    subDeviceManagement: defineAsyncComponent(
      () => import('./components/sub-device-management/index.vue')
    ),
    extend: defineAsyncComponent(() => import('./components/extended-field.vue'))
  }

  const TABS = [
    { label: '实例信息', value: 'instanceMessage' },
    { label: '运行状态', value: 'operateStatus' },
    { label: '设备功能', value: 'deviceFunction' },
    { label: '设备诊断', value: 'deviceDiagnosis' },
    { label: '日志管理', value: 'logManagement' },
    {
      label: '子设备管理',
      value: 'subDeviceManagement',
      show: () => deviceDetail.value.nodeType === NODE_TYPES.values.GATEWAY
    },
    { label: '拓展字段', value: 'extend' }
  ]

  const visibleTabs = computed(() => TABS.filter((tab) => (tab.show ? tab.show() : true)))

  const activeComponent = computed(() => componentsMap[activeTab.value])

  const statusTagType = computed(() => {
    const { devState } = deviceDetail.value
    if (devState === DEVICE_STATUS_TYPES.values.ONLINE) return 'success'
    if (devState === DEVICE_STATUS_TYPES.values.OFFLINE) return 'danger'
    return 'warning'
  })

  const getDeviceDetail = async (id) => {
    deviceDetail.value = await api.apiDevDetail(id)

    // 防止切到不存在的 tab
    if (!visibleTabs.value.find((t) => t.value === activeTab.value)) {
      activeTab.value = visibleTabs.value[0]?.value
    }
  }

  // 当路由 query.id 发生变化时刷新数据（解决 keep-alive 或同 route 不重新 mount 的情况）
  onBeforeRouteUpdate((to, from) => {
    if (to.query.id && to.query.id !== from.query.id) {
      activeTab.value = TABS[0].value
      getDeviceDetail(to.query.id)
    }
  })

  onMounted(() => {
    if (route.query.id) {
      getDeviceDetail(route.query.id)
    }
  })
</script>

<style lang="scss" scoped>
  .device-detail {
    .tab-con {
      border-radius: 6px 6px 0px 0px;
      border: 1px solid var(--default-border);
      .tab-item {
        position: relative;
        font-size: 15px;
        line-height: 32px;
        text-align: center;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Bold;
        color: var(--color-g-303537);
        &:hover:not(.active) {
          color: var(--art-primary);
        }
        &::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 20px;
          background-color: #ced1d9;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }
        &.active {
          color: #ffffff;
          font-family:
            Source Han Sans SC,
            Source Han Sans SC-Regular;
          .tab-btn {
            background-color: var(--art-primary);
          }
        }
      }
      .tab-item:last-child::after {
        content: none;
      }
    }

    .base-info-table {
      border: 1px solid var(--default-border);
    }
  }
</style>
