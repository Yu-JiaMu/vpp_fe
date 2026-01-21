<template>
  <div class="product-category-detail">
    <ElCard class="art-table-card" shadow="never">
      <div>便携式电源</div>
      <el-row class="mt20">
        <el-col :span="6">
          <span class="mr5">所属行业/场景:</span>
          <span
            >{{ productCategoryDetail.industryCode }}/{{ productCategoryDetail.sceneCode }}</span
          >
        </el-col>
        <el-col :span="6">
          <span class="mr5">描述:</span>
          <span>{{ productCategoryDetail.remark }}</span>
        </el-col>
        <div></div>
      </el-row>
      <el-row class="mt10">
        <el-col :span="6">
          <span class="mr5">创建时间:</span>
          <span>{{ productCategoryDetail.createTime }}</span>
        </el-col>
        <el-col :span="6">
          <span class="mr5">更新时间:</span>
          <span>{{ productCategoryDetail.updateTime }}</span>
        </el-col>
      </el-row>
    </ElCard>
    <div class="flex h-12 bg-white mt10 tab-con w-fit">
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
    <!-- 物模型 -->
    <ThingModel
      v-if="activeTab === 'model'"
      module="productCategory"
      :info="product"
      :thingJson="productCategoryDetail.thingModel"
      @refresh="getDetail"
    ></ThingModel>
  </div>
</template>

<script setup>
  import * as productCategoryApi from '@/api/iot/productCategory.js'
  const inputValue = ref('')
  const route = useRoute()
  const productCategoryId = route.query.id
  const productCategoryDetail = reactive({})
  //获取详情
  const getProductCategoryDetail = async () => {
    const res = await productCategoryApi.apiProductCategoryDetail(productCategoryId)
    Object.keys(res).forEach((key) => {
      productCategoryDetail[key] = res[key]
    })
    console.log(productCategoryDetail)
  }
  //tab切换
  const activeTab = ref('model')
  const TABS = [
    {
      label: '物模型',
      value: 'model'
    }
  ]
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
  const getDetail = () => {}
  onMounted(() => {
    getProductCategoryDetail()
  })
</script>

<style lang="scss" scoped>
  .w-m-x {
    width: 134px;
    height: 48px;
    background: #ffffff;
    border: 1px solid #eeeff1;
    border-radius: 6px 6px 0px 0px;
  }
  .art-table-card {
    margin-top: 0 !important;
    border-radius: 0px 6px 6px 6px !important;
  }
  .product-category-detail {
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
