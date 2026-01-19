<template>
  <div class="min-h-full p-5 product-detail">
    <ArtButtonBack class="mb-2.5" is-back> 返回 </ArtButtonBack>

    <!-- 顶部产品信息 -->
    <div class="bg-white rounded-md px-4 py-5 mb-2.5 flex items-center gap-4">
      <!-- 产品图 -->
      <div class="w-[70px] h-[70px]">
        <img src="@/assets/images/icon/icon-empty-pic.webp" alt="" />
      </div>

      <!-- 产品名称 -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-base text-gray-800 font-scMedium"> 产品名称：{{ product.name }} </span>
          <el-switch v-model="product.enabled" size="small" />
        </div>
        <div class="text-sm text-g-505658">
          设备数量：
          <span class="underline text-primary" @click="handleViewDevices">
            {{ product.deviceCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
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

    <!-- 基础信息 -->
    <BaseInfo v-if="activeTab === 'info'" :product="product" @refresh="getDetail"></BaseInfo>

    <!-- 物模型 -->
    <ThingModel v-if="activeTab === 'model'" :product="product" @refresh="getDetail"></ThingModel>

    <!-- 拓展字段 -->
    <ExtendedField
      v-if="activeTab === 'extend'"
      :product="product"
      @refresh="getDetail"
    ></ExtendedField>
  </div>
</template>

<script setup>
  import BaseInfo from './components/base-info.vue'
  import ThingModel from './components/thing-model/index.vue'
  import ExtendedField from './components/extended-field/index.vue'

  const activeTab = ref('extend')

  const product = ref({
    id: '1955073219080001',
    name: '计量电表001',
    enabled: true,
    deviceCount: 41,
    category: '能源电力 / 电表 / 表计',
    nodeType: '网关设备',
    protocol: 'MQTT',
    network: 'WIFI',
    dataFormat: 'JSON',
    authType: '设备序列号',
    vendor: '安科瑞',
    productType: '104表计',
    createdAt: '2025-08-31 12:00:00',
    updatedAt: '2025-08-31 12:00:00',
    desc: '用于MQTT协议相关产品'
  })

  const TABS = [
    {
      label: '产品信息',
      value: 'info'
    },
    {
      label: '物模型',
      value: 'model'
    },
    /*    {
      label: 'Topic管理',
      value: 'topic'
    }, */
    {
      label: '拓展字段',
      value: 'extend'
    }
  ]

  const handleViewDevices = () => {
    console.log('查看设备列表')
  }

  const getDetail = () => {}
</script>

<style lang="scss" scoped>
  :deep(.el-descriptions__cell) {
    padding: 8px 12px;
  }
  :deep(.el-descriptions__label) {
    color: #6b7280; /* gray-500 */
    width: 140px;
  }
  .product-detail {
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
