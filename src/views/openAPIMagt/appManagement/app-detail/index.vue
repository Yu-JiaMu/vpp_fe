<template>
  <div class="min-h-full p-5 product-detail">
    <ArtButtonBack class="mb-2.5" is-back> 返回 </ArtButtonBack>

    <!-- 顶部应用信息 -->
    <div class="bg-white rounded-md px-4 py-5 mb-2.5 flex items-center gap-4">
      <!-- 应用名称 -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-base text-gray-800 font-scMedium">
            <!--todo 替换-->
            {{ product.name }}
          </span>
          <!--todo 替换-->
          <el-switch v-model="product.enabled" size="small" @change="toggleEnable(product)" />
        </div>
        <div class="text-sm">
          Key：
          <span class="text-g-505658">
            <!--todo 替换-->
            ACEbxcvdfa9527
          </span>
          <span class="secret-label">
            <!--todo 替换-->
            Secret：
          </span>
          <span class="text-g-505658">
            <!--todo 替换-->
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
  import ExtendedField from './components/extended-field/index.vue'
  import { ElMessageBox } from 'element-plus'
  import { onBeforeRouteLeave } from 'vue-router'
  import ReqRecord from "@views/deviceAccess/product/product-detail/components/req-record.vue";

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

  const handleThingModelChange = (val) => {
    modelDirty.value = val
  }

  const handleTabClick = async (nextTab) => {
    if (nextTab === activeTab.value) return

    if (activeTab.value === 'reqRecord' && modelDirty.value) {
      try {
        await confirmDiscard()
        modelDirty.value = false
        activeTab.value = nextTab
      } catch (err) {}
      return
    }

    activeTab.value = nextTab
  }

  const handleViewDevices = () => {
    console.log('查看设备列表')
    router.push({
      name: 'Device',
      query: {
        productId: product.value.id
      }
    })
  }

  const getDetail = async () => {
    console.log('获取产品详情');
    try {
      const id = route.query.id
      if (!id) return

      // todo 修改接口
      const res = await api.apiGetProductDetail(id)
      if (res) {
        product.value = res
      }
      appInfo.value = {
        appName: "而往往如此111",
        id: "2013452228110716928",
        endTime: "2026-04-14",
        appStatus: "enable",
        lastReqTime: "2026-04-09 16:07:57",
        createTime: "2026-04-01 15:33:30",
        updateTime: "2026-04-01 15:33:30",
        createBy: "管理员",
        appKey: "ACEbxcvdfa9527",
        appSecret: "*******************",
        remark: "获取产品详情失败"
      }
    } catch (error) {
      console.error('获取产品详情失败:', error)
      ElMessage.error('获取产品详情失败')
    }
  }
  async function toggleEnable(row) {
    try {
      await ElMessageBox.confirm(`请确认${!row.enabled ? '禁用' : '启用'}该产品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await api.apiEditProduct({ ...row, enabled: row.enabled })
      ElMessage.success('更新成功')
    } catch (error) {
      row.enabled = !row.enabled // 回滚状态
      // ElMessage.error('更新失败')
    }
  }

  const handleSubmitExtendField = async ({ data, msg = '添加成功' }) => {
    await api.updateProductExpandInfo({ id: product.value.id, expandInfo: data })
    ElMessage.success(msg)
    getDetail()
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
