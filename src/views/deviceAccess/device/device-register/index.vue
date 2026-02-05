<template>
  <div class="device-register">
    <!-- 注册页面 -->
    <ArtButtonBack class="mb-2.5 mt20" is-back> 设备注册 </ArtButtonBack>
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
    <!-- 单个 -->
    <SingleRegister v-if="activeTab === 'single'"></SingleRegister>
    <!-- 多个 -->
    <MultipleRegister v-if="activeTab === 'multiple'"></MultipleRegister>
  </div>
</template>

<script setup>
  import MultipleRegister from './compoents/multiple-register.vue'
  import SingleRegister from './compoents/single-register.vue'
  const route = useRoute()
  const activeTab = ref('')
  const TABS = [
    {
      label: '单个注册',
      value: 'single'
    },
    {
      label: '批量注册',
      value: 'multiple'
    }
  ]
  onMounted(() => {
    if (route.query.registerType) {
      activeTab.value = route.query.registerType
    }
  })
</script>

<style lang="scss" scoped>
  .device-register {
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
