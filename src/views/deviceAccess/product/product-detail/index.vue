<template>
  <div class="min-h-full p-5 product-detail">
    <ArtButtonBack class="mb-2.5" is-back> 返回 </ArtButtonBack>

    <!-- 顶部产品信息 -->
    <div class="bg-white rounded-md px-4 py-5 mb-2.5 flex items-center gap-4">
      <!-- 产品图 -->
      <div class="w-[70px] h-[70px]">
        <img
          v-if="product.imgUrl"
          :src="product.imgUrl"
          class="w-[70px] h-[70px] object-contain"
          alt=""
        />
        <img v-else src="@/assets/images/icon/icon-empty-pic.webp" alt="" />
      </div>

      <!-- 产品名称 -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-base text-gray-800 font-scMedium"> 产品名称：{{ product.name }} </span>
          <el-switch v-model="product.enabled" size="small" @change="toggleEnable(product)" />
        </div>
        <div class="text-sm text-g-505658">
          设备数量：
          <span class="underline cursor-pointer text-primary" @click="handleViewDevices">
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
    <ThingModel
      v-if="activeTab === 'model'"
      module="product"
      :info="product"
      :thingJson="product.thingModelJson"
      @refresh="getDetail"
    ></ThingModel>

    <!-- 拓展字段 -->
    <ExtendedField
      v-if="activeTab === 'extend'"
      :info="product"
      @submit="handleSubmitExtendField"
    ></ExtendedField>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import BaseInfo from './components/base-info.vue'
  import ExtendedField from './components/extended-field/index.vue'

  const route = useRoute()
  const router = useRouter()

  const activeTab = ref('info')

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
    router.push({
      name: 'Device',
      query: {
        productId: product.value.id
      }
    })
  }

  const getDetail = async () => {
    try {
      const id = route.query.id
      if (!id) return

      const res = await api.apiGetProductDetail(id)
      if (res) {
        product.value = res
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
