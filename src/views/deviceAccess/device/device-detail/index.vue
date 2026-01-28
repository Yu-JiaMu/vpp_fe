<template>
  <div class="device-detail">
    <!-- 设备详情 -->
    <ArtButtonBack class="mb-2.5 mt20" is-back> 返回 </ArtButtonBack>
    <!-- 顶部设备信息 -->
    <div class="bg-white rounded-md px-4 py-5 mb-2.5 flex items-center gap-4">
      <!-- 设备图 -->
      <div class="w-[70px] h-[70px]">
        <img src="@/assets/images/icon/icon-empty-pic.webp" alt="" />
      </div>

      <!-- 设备名称 -->
      <div class="flex-1">
        <div class="flex items-center gap-4 mb-1.5">
          <span class="text-base text-gray-800 font-scMedium">{{ deviceDetail.name }} </span>
          <div class="flex items-center">
            <span class="text-sm text-g-505658">状态：</span>
            <el-tag
              :type="
                deviceDetail.devState === DEVICE_STATUS_TYPES.values.ONLINE
                  ? 'success'
                  : deviceDetail.devState === DEVICE_STATUS_TYPES.values.OFFLINE
                    ? 'danger'
                    : 'warning'
              "
              size="small"
            >
              {{ DEVICE_STATUS_TYPES.getLabel(deviceDetail.devState) }}
            </el-tag>
          </div>
        </div>
        <div class="text-sm text-g-505658">
          <span>设备ID：</span>
          <span>
            {{ deviceDetail.id }}
          </span>
        </div>
        <div class="text-sm text-g-505658">
          <span>所属产品：</span>
          <span class="underline text-primary">
            {{ deviceDetail.productName }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex h-12 bg-white tab-con w-fit">
      <div
        v-for="item in TABS"
        :key="item.value"
        class="tab-item w-[135px] flex-cc cursor-pointer"
        :class="{ active: activeTab === item.value }"
        @click="activeTab = item.value"
      >
        <div class="tab-btn w-[118px] h-8 rounded-sm">{{ item.label }}</div>
      </div>
    </div>
    <!-- 多个子组件 -->
    <InstanceMessage
      :deviceDetail="deviceDetail"
      v-if="activeTab === 'instanceMessage'"
      @eidt-success="getDeviceDetail(deviceDetail.id)"
    ></InstanceMessage>
    <OperateStatus v-if="activeTab === 'operateStatus'"></OperateStatus>
    <DeviceFunction v-if="activeTab === 'deviceFunction'"></DeviceFunction>
    <DeviceDiagnosis v-if="activeTab === 'deviceDiagnosis'"></DeviceDiagnosis>
    <LogManagement v-if="activeTab === 'logManagement'"></LogManagement>
    <SubDeviceManagement v-if="activeTab === 'subDeviceManagement'"></SubDeviceManagement>

    <!-- 拓展字段 -->
    <ExtendedField v-if="activeTab === 'extend'"></ExtendedField>
  </div>
</template>

<script setup>
  import InstanceMessage from './components/instance-message.vue'
  import OperateStatus from './components/operate-status.vue'
  import DeviceFunction from './components/device-function/index.vue'
  import DeviceDiagnosis from './components/device-diagnosis.vue'
  import LogManagement from './components/log-management.vue'
  import SubDeviceManagement from './components/sub-device-management/index.vue'
  import ExtendedField from './components/extended-field.vue'
  import * as api from '@/api/iot'
  import { NODE_TYPES, DEVICE_STATUS_TYPES } from '@/enums'
  const route = useRoute()
  const deviceDetail = ref({})
  const getDeviceDetail = async (deviceId) => {
    const result = await api.apiDevDetail(deviceId)
    deviceDetail.value = result
  }
  const activeTab = ref('instanceMessage')
  const TABS = [
    {
      label: '实例信息',
      value: 'instanceMessage'
    },
    {
      label: '运行状态',
      value: 'operateStatus'
    },
    {
      label: '设备功能',
      value: 'deviceFunction'
    },
    //设备诊断，日志管理，子设备管理，拓展字段
    {
      label: '设备诊断',
      value: 'deviceDiagnosis'
    },
    {
      label: '日志管理',
      value: 'logManagement'
    },
    {
      label: '子设备管理',
      value: 'subDeviceManagement'
    },
    {
      label: '拓展字段',
      value: 'extend'
    }
  ]
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
