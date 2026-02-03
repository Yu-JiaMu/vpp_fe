<template>
  <div class="bg-white device-diagnosis">
    <div class="network-diagnosis-container">
      <!-- 头部状态区域 -->
      <!-- 连接中 -->
      <template v-if="approved === '连接中'">
        <div class="status-header">
          <img src="@/assets/images/deviceAccess/21.png" class="w-[100%] h-[100%]" />
        </div>
      </template>
      <!-- 连接状态正常 -->
      <template v-else-if="approved === '连接正常'">
        <div class="status-header">
          <img src="@/assets/images/deviceAccess/16.png" class="w-[100%] h-[100%]" />
          <div class="c-x-z-d-z-c" @click="removeCheck">重新诊断</div>
        </div>
      </template>
      <!-- 连接状态异常 -->
      <template v-else-if="approved === '连接异常'">
        <div class="status-header">
          <img src="@/assets/images/deviceAccess/15.png" class="w-[100%] h-[100%]" />
          <div class="c-x-z-d" @click="removeCheck">重新诊断</div>
        </div>
      </template>
    </div>
    <div class="flex gap-2 mt-[20px] mb-[20px]">
      <div
        class="cursor-pointer tag"
        :class="{ 'active-tag': activeTag === tag.value }"
        v-for="(tag, index) in tagList"
        :key="index"
        @click="handleTagClick(tag)"
        >{{ tag.label }}</div
      >
    </div>
    <template v-if="activeTag === 'connectionStatus'">
      <div class="flex items-center justify-between">
        <div class="font-scBold text-g-131617 flex-c">
          <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
          基本信息
        </div>
      </div>
      <div
        class="flex items-center justify-between l-j-info"
        v-for="(item, index) in infoList"
        :key="index"
        :class="{ 'opacity-1': index === infoList.length - 1 }"
      >
        <div class="flex items-center gap-5">
          <img
            src="@/assets/images/deviceAccess/17.png"
            v-if="item.approved"
            class="w-[40px] h-[40px]"
          />
          <img src="@/assets/images/deviceAccess/18.png" v-else class="w-[40px] h-[40px]" />
          <div class="flex flex-col">
            <span class="text-[15px] text-[#303537] font-bold">{{ item.childTitle }}</span>
            <span class="text-[13px] text-[#505658] font-normal">{{ item.childContent }}</span>
          </div>
        </div>
        <span class="text-[15px] text-[#2ECB63] font-medium" v-if="item.approved">正常</span>
        <span class="text-[15px] text-[#F8345C] font-medium" v-else>错误</span>
      </div>
    </template>
    <template v-if="activeTag === 'notification'">
      <div class="flex gap-5">
        <div class="flex-[1]">
          <div class="flex gap-2.5 mb-[30px]">
            <div class="card-list bg-[#E9F3FF]">
              <div class="round-1 bg-[#298AF9]"></div>
              <div class="text-[12px] text-[#303537]">上行消息诊断中</div>
            </div>
            <div class="card-list bg-[#FFF0F3]">
              <div class="round-1 bg-[#F8345C]"></div>
              <div class="text-[12px] text-[#303537]">下行消息通信异常</div>
            </div>
          </div>
          <div class="font-scBold text-g-131617 flex-c mb-[15px]">
            <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
            <span>调试</span>
          </div>
          <div
            class="min-h-[333px]"
            style="border: 1px solid #ebecf1; border-radius: 6px; padding: 10px 5px"
          >
            <MonacoEditor
              v-model="editorContent"
              class="w-[100%] h-[100%]"
              theme="vs"
              lang="json"
            />
          </div>
        </div>
        <div class="flex-[1]">
          <div class="font-scBold text-g-131617 flex-c mb-[15px]">
            <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
            <span>日志</span>
          </div>
          <div
            class="h-[100%] flex items-center justify-center flex-col"
            style="border: 1px solid #ebecf1; border-radius: 6px"
          >
            <img src="@/assets/images/deviceAccess/19.png" class="w-[150px] h-[150px]" alt="" />
            <span class="text-[#767c80] font-normal">— 暂无数据 —</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import { useFetchSSE } from '@/hooks'
  const props = defineProps({
    deviceDetail: {
      type: Object,
      default: () => {}
    }
  })
  const tagList = ref([
    {
      label: '连接状态',
      value: 'connectionStatus'
    }
    // {
    //   label: '消息通知',
    //   value: 'notification'
    // }
  ])
  const activeTag = ref('connectionStatus')
  const handleTagClick = (tag) => {
    activeTag.value = tag.value
    console.log(activeTag.value)
  }
  const infoList = ref([])
  const editorContent = ref('')
  //状态连接是否异常 true正常 false异常
  const approved = ref('连接中')
  //是否连接状态中
  // const childCheckNumObj = reactive({
  //   childCheckTotal: 10,
  //   childCheckNum: 1
  // })
  async function startCheck() {
    const { stop, onMessage } = useFetchSSE(
      '/stage-api/model/device/checker/check?deviceIdentifier=' + props.deviceDetail.identifier
    )
    onMessage((data) => {
      // childCheckNumObj.childCheckTotal = data.childCheckTotal
      // childCheckNumObj.childCheckNum = data.childCheckNum
      console.log('data', data)
      const keyList = []
      Object.keys(data).forEach((key) => {
        keyList.push(key)
      })
      if (keyList.length === 2) {
        // if()
        if (data.approved) {
          approved.value = '连接正常'
        } else {
          approved.value = '连接异常'
        }
      }
      // infoList.value = []
      infoList.value.push(data)
      // console.log(infoList.value)
    })
  }
  const removeCheck = async () => {
    approved.value = '连接中'
    infoList.value = []
    startCheck()
  }
  onMounted(() => {
    console.log(props.deviceDetail)
    startCheck()
  })
</script>

<style scoped lang="scss">
  .device-diagnosis {
    padding: 30px 68px 30px 20px;
    .round-1 {
      border-radius: 50%;
      width: 3px;
      height: 3px;
    }
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
      .c-x-z-d-z-c {
        background: #ffffff;
        border-radius: 2px;
        padding: 6px 24px;
        font-size: 14px;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Medium;
        font-weight: 500;
        color: #0bced5;
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
    .card-list {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      // background: #e9f3ff;
      border-radius: 0px 1px 1px 1px;
      padding: 7px 25px;
      position: relative;
      &::before {
        content: ''; // 必须添加这个
        width: 2px;
        height: 100%;
        background-color: var(--card-line-color, #f8345c); // 默认黑色 #f8345c;
        position: absolute;
        left: 1px;
        top: 0;
      }
    }
    .card-list:nth-child(1) {
      --card-line-color: #298af9;
    }

    // 第二个
    .card-list:nth-child(2) {
      --card-line-color: #f8345c;
    }
    .opacity-1 {
      display: none;
    }
  }
  // 第一个
</style>
