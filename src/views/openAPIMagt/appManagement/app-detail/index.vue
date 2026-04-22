<template>
  <div class="min-h-full p-5 product-detail">
    <ArtButtonBack class="mb-2.5" is-back> 返回 </ArtButtonBack>

    <!-- 顶部应用信息 -->
    <div class="bg-white rounded-md px-4 py-5 mb-2.5 flex items-center gap-4">
      <!-- 应用名称 -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-base text-gray-800 font-scMedium">
            {{ appInfo.appName }}
          </span>
          <el-switch :model-value="appInfo.appStatus===APP_STATUS.map.ENABLE.value" @change="toggleEnable(appInfo)" />
        </div>
        <div class="text-sm">
          Key：
          <span class="text-g-505658">
            {{ appInfo.id }}
          </span>
          <span class="secret-label">
            Secret：
          </span>
          <span class="text-g-505658">
            *******************
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
        @click="handleTabClick(item.value)"
      >
        <div class="tab-btn w-[118px] h-8 rounded-sm">{{ item.label }}</div>
      </div>
    </div>

    <!-- 基础信息 -->
    <BaseInfo v-if="activeTab === 'info'" :appInfo="appInfo" @refresh="getDetail"></BaseInfo>

    <!-- 调用记录 -->
    <ReqRecord
        v-if="activeTab === 'reqRecord'"
    ></ReqRecord>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import BaseInfo from './components/base-info.vue'
  import {ElMessage, ElMessageBox} from 'element-plus'
  import { onBeforeRouteLeave } from 'vue-router'
  import ReqRecord from "@views/openAPIMagt/appManagement/app-detail/components/req-record.vue";
  import {APP_STATUS} from "@/enums/index.js";

  const route = useRoute()
  const router = useRouter()

  const activeTab = ref('info')
  const modelDirty = ref(false)
  const appInfo = ref({
    id: '',
    appStatus: 'enable',
    appName: '',
    validityPeriod: '',
    endTime: '',
    remark: ''
  })

  const product = ref({
    id: '',
    name: '',
    enabled: true,
    deviceCount: 0,
    categoryId: '',
    nodeType: '',
    applyLayerProtocol: '',
    networkWay: '',
    dataFormat: '',
    authType: '',
    manufactory: '',
    productModel: '',
    identifier: '',
    imgUrl: '',
    remark: '',
    thingModelJson: {},
    expandInfoList: []
  })

  const TABS = [
    {
      label: '基本信息',
      value: 'info'
    },
    {
      label: '调用记录',
      value: 'reqRecord'
    },
  ]

  const confirmDiscard = async () => {
    await ElMessageBox.confirm('还未保存当前物模型，离开会丢失，确定继续吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      closeOnHashChange: false
    })
  }

  const handleTabClick = async (nextTab) => {
    if (nextTab === activeTab.value) return
    activeTab.value = nextTab
  }

  const getDetail = async () => {
    try {
      const id = route.query.id
      if (!id) return
      const res = await api.detailApiApplication({ id: id})
      if (res) {
        appInfo.value = res
      }
    } catch (error) {
      console.error('获取应用详情失败:', error)
      ElMessage.error('获取应用详情失败')
    }
  }
  /**
   * @Description 修改状态
   * @author Huang Jialin
   * @date 2026/4/14 16:03
   */
  async function toggleEnable(row) {
    // 先记录当前状态，用于失败回滚
    const oldStatus = row.appStatus;
    try {
      // 计算要切换成的新状态
      const newStatus = row.appStatus === APP_STATUS.map.DISABLED.value
          ? APP_STATUS.map.ENABLE.value
          : APP_STATUS.map.DISABLED.value;

      await ElMessageBox.confirm(
          `请确认${newStatus === APP_STATUS.map.ENABLE.value ? '启用' : '禁用'}该应用吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      );

      // 调用接口
      await api.updateApiApplication({
        ...row,
        appStatus: newStatus
      });
      // 接口成功 → 更新状态
      row.appStatus = newStatus;
      ElMessage.success('更新成功');
    } catch (error) {
      // 接口失败 / 取消弹窗 → 都会进这里
      console.error('更新失败', error);
      // 回滚状态
      row.appStatus = oldStatus;
      // 如果是用户取消弹窗，不提示错误
      if (error !== 'cancel') {
        ElMessage.error('更新失败');
      }
    }
  }

  const init = () => {
    if (route.query.id) {
      getDetail()
    }
    if (route.query.tab) {
      activeTab.value = route.query.tab
    }
  }
  onMounted(() => {
    init()
  })

  onBeforeRouteLeave(async (to, from, next) => {
    if (!modelDirty.value) return next()
    try {
      await confirmDiscard()
      modelDirty.value = false
      next()
    } catch (error) {
      next(false)
    }
  })
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
  .secret-label {
    margin-left: 100px;
  }
</style>
