<template>
  <div class="grid grid-cols-[1fr_516px] gap-5">
    <div class="min-w-0">
      <div class="flex items-center mb-2.5 text-g-303537 text-lg font-scBold">
        <img src="@/assets/images/dashboard/icon-006.png" class="w-[22px] h-7.5 mr-1.5" alt="" />
        设备接入推荐步骤
      </div>

      <div class="flex gap-5">
        <div
          v-for="(item, index) in steps"
          :key="index"
          class="group flex-1 bg-white rounded-md py-10 px-7.5 relative border border-[#ebecf1] min-h-[298px]"
        >
          <!-- 标题 -->
          <div class="relative flex items-center mb-5 justify-between">
            <span class="absolute left-[-12px] w-1 h-1 bg-[#38ECF2]"></span>
            <span class="font-scBold text-lg text-gray-800">{{ item.title }}</span>

            <img
              src="@/assets/images/dashboard/icon-008.png"
              class="pointer-events-none h-5 group-last:hidden"
              alt=""
            />
          </div>

          <!-- 内容 -->
          <div class="text-g-505658 text-lg font-scLight">
            {{ item.desc }}
          </div>

          <!-- 底部高亮线 -->
          <div class="absolute bottom-0 left-0 w-full h-[3px] bg-[#38ECF2]"></div>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center mb-2.5 text-g-303537 text-lg font-scBold">
        <img src="@/assets/images/dashboard/icon-007.png" class="w-[22px] h-7.5 mr-1.5" alt="" />
        <span>物联网引导</span>
      </div>

      <div
        class="guide-card relative flex items-center justify-between bg-white rounded-md border border-[#ebecf1] px-[52px] py-10 h-[298px]"
      >
        <template v-for="(item, i) in guide" :key="i">
          <!-- 卡片 -->
          <div
            class="relative flex flex-col w-[90px] items-center cursor-pointer"
            @click="handleJump(item)"
          >
            <img :src="item.img" class="w-[90px] mb-1.5 pointer-events-auto" />

            <div class="text-lg text-g-505658">
              {{ item.title }}
            </div>
          </div>

          <!-- 👇 箭头（最后一个不显示） -->
          <img
            v-if="i !== guide.length - 1"
            src="@/assets/images/dashboard/icon-009.png"
            class="w-5 h-5 mx-3 mt-[124px]"
            alt=""
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
  const router = useRouter()
  const steps = [
    {
      title: '创建产品',
      desc: '产品是一类具有相同功能设备的集合。'
    },
    {
      title: '配置物模型',
      desc: '物模型是设备在云端的描述，从属性、功能事件、拓展信息定义一个真实的物联网设备。'
    },
    {
      title: '功能调试',
      desc: '注册单个设备，并对其进行功能调试，验证设备是否能接入云端及功能是否正常。'
    },
    {
      title: '批量注册设备',
      desc: '批量注册同一产品下的设备。'
    }
  ]

  const guide = [
    {
      title: '创建产品',
      routeName: 'addProduct',
      img: new URL('@/assets/images/dashboard/icon-010.png', import.meta.url).href
    },
    {
      title: '创建设备',
      routeName: 'DeviceRegister',
      img: new URL('@/assets/images/dashboard/icon-011.png', import.meta.url).href
    },
    {
      title: '规则引擎',
      routeName: '',
      img: new URL('@/assets/images/dashboard/icon-012.png', import.meta.url).href
    } // 占位
  ]

  const handleJump = (step) => {
    if (!step.routeName) {
      console.log('暂未开放')
      return
    }

    router.push({ name: step.routeName })
  }
</script>

<style lang="scss" scoped>
  .guide-card {
    background:
      url('@/assets/images/dashboard/icon-014.png') no-repeat right top / 237px 47px,
      url('@/assets/images/dashboard/icon-013.png') no-repeat 52% 86px / 241px 62px,
      #fff;
  }
</style>
