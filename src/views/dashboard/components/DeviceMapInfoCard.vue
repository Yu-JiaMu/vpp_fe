<template>
  <div class="map-dialog absolute z-50" :style="style">
    <div class="bg-white rounded-md shadow-xl w-[196px] relative">
      <!-- <div class="absolute top-2 right-2 cursor-pointer text-gray-400" @click="$emit('close')">
        ✕
      </div> -->

      <!-- 标题 -->
      <div
        class="flex justify-between items-center text-g-303537 py-2 px-3 border-b border-[#dde1e9]"
      >
        <span>
          {{ data.name }}
        </span>
        <div class="text-blue-500 cursor-pointer text-xs" @click="goDetail"> 详情 → </div>
      </div>

      <!-- 内容 -->
      <div class="text-xs text-[#767c80] py-2 px-3 border-b border-[#dde1e9]">
        <div class="flex items-start">
          <div class="circle mt-[6px] mr-2 shrink-0"></div> 所属产品： {{ data.productName }}
        </div>
        <div class="flex items-start">
          <div class="circle mt-[6px] mr-2 shrink-0"></div> 节点类型：
          {{ NODE_TYPES.getLabel(data.nodeType) }}
        </div>

        <div class="flex items-start">
          <div class="circle mt-[6px] mr-2 shrink-0"></div>
          状态：
          <div
            class="rounded-lg px-1.5"
            :class="data.devState === DEVICE_STATUS_TYPES.values.ONLINE ? 'online' : 'offline'"
          >
            {{ DEVICE_STATUS_TYPES.getLabel(data.devState) }}
          </div>
        </div>
      </div>

      <div class="text-xs text-[#767c80] py-2 px-3 border-b border-[#dde1e9]">
        <div class="text-g-303537 mb-1"> 位置信息</div>
        <div> 经度：{{ data?.lnglat[0] }} </div>
        <div> 纬度：{{ data?.lnglat[1] }} </div>
        <div>{{ data.address }}</div>
      </div>
    </div>
    <div class="triangle absolute z-1"></div>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { DEVICE_STATUS_TYPES, NODE_TYPES } from '@/enums'
  const props = defineProps({
    data: Object,
    style: Object
  })

  const router = useRouter()

  const goDetail = () => {
    router.push({
      name: 'DeviceDetail',
      query: {
        id: props.data.id
      }
    })
  }
</script>

<style scoped lang="scss">
  .triangle {
    left: -12px;
    top: 10px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 15px solid #fff;
  }

  .map-dialog {
    .circle {
      width: 4px;
      height: 4px;
      background: #ced1d9;
      border-radius: 50%;
    }
    .online {
      border: 1px solid #2ecb63;
      background-color: rgba($color: #cbffdc, $alpha: 0.27);

      color: #2ecb63;
    }
    .offline {
      border: 1px solid #ced1d9;
      background-color: #ebebeb;
      color: #86898b;
    }
  }
</style>
