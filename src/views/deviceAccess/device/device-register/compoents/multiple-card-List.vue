<template>
  <div class="single-card-list">
    <div class="tip flex flex-cz-center">
      <el-icon color="#298AF9" size="22"><Warning /></el-icon>
      <span class="ml10">
        请先选择产品，本次注册的设备将继承产品定义的内容，成为该产品的所属设备。
        <span class="t-c">批量注册支持多个产品选择!</span>
      </span>
    </div>
    <ArtSearchBar
      class="mt30"
      ref="searchBarRef"
      v-model="form"
      :items="formItems"
      :labelWidth="80"
      defaultExpanded
      :showExpand="false"
      @reset="onReset"
      @search="onSearch"
    />
    <div class="device-card-list flex gap-5 flex-wrap">
      <div
        class="device-card cursor-pointer flex items-center gap-5"
        v-for="(item, index) in tableData"
        :key="index"
        :class="{ 'active-card': item.flag }"
        @click="changeCard(item)"
      >
        <!-- 活跃的竖线 -->
        <img class="shu" src="@/assets/images/deviceAccess/5.webp" />
        <div class="device-icon-container">
          <img v-if="item.imgUrl" :src="item.imgUrl" alt="" class="w-[100%] h-[100%]" />
          <img
            src="@/assets/images/icon/icon-empty-pic.webp"
            alt=""
            v-else
            class="w-[100%] h-[100%]"
          />
        </div>
        <div class="device-info flex-1">
          <div class="devive-title flex flex-cz-center">
            <div class="device-kuai"></div>
            <h3 class="device-name">{{ item.name }}</h3>
          </div>

          <div class="info-row mt10">
            <div class="info-label flex flex-cz-center">
              <div class="device-kuai"></div>
              <div class="d-h">节点类型</div>
            </div>
            <div class="info-label flex flex-cz-center">
              <div class="device-kuai"></div>
              <div class="d-h flex1">协议类型</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label flex flex-cz-center">
              <div class="device-kuai display-none"></div>
              <div class="d-h">{{ NODE_TYPES.getLabel(item.nodeType) }}</div>
            </div>
            <div class="info-label flex flex-cz-center">
              <div class="device-kuai display-none"></div>
              <div class="d-h flex1">{{ item.applyLayerProtocol }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ArtPagination v-model="pagination" @change="getTableData" />
    <div class="col-span-2 flex justify-center gap-5 mt-[50px] rounded-t-md">
      <el-button size="large" type="info" class="w-80" v-ripple @click="goback">取消</el-button>
      <el-button size="large" type="primary" class="w-80" @click="nextForm" v-ripple>
        下一步
      </el-button>
    </div>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import { NODE_TYPES } from '@/enums'
  const router = useRouter()
  const form = reactive({
    name: '',
    enabled: true,
    isAsc: 'desc',
    orderByColumn: 'updateTime'
  })
  const formItems = computed(() => [
    {
      label: '产品名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入产品名称',
      clearable: true
    }
  ])
  const onReset = () => {
    console.log('重置搜索')
    pagination.current = 1
    pagination.size = 10
    getTableData()
  }
  const onSearch = () => {
    console.log('搜索条件：', form)
    getTableData()
  }
  //分页数据
  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })

  //表格数据

  const tableData = ref([])
  // 获取产品列表
  const getTableData = async () => {
    try {
      const queryParams = {
        pageNum: pagination.current,
        pageSize: pagination.size,
        ...form
      }

      const response = await api.apiGetProductList(queryParams)
      if (response) {
        tableData.value = response.rows.map((item) => {
          return {
            ...item,
            flag: false
          }
        })
        tableData.value.forEach((a) => {
          selectedProduct.value.forEach((b) => {
            if (a.id === b.id) {
              a.flag = true
            }
          })
        })
        pagination.total = response.total || 0
      }
    } catch (error) {
      console.error('获取产品列表失败:', error)
      ElMessage.error('获取产品列表失败')
    }
  }
  const selectedProduct = ref([])
  //切换card
  const changeCard = async (item) => {
    item.flag = !item.flag
    // if(item)
    console.log(item.flag)
    if (item.flag) {
      selectedProduct.value.push(item)
    } else {
      const index = selectedProduct.value.findIndex((find) => find.id === item.id)
      selectedProduct.value.splice(index, 1)
    }
    console.log(selectedProduct.value)
  }
  //下一步
  const nextForm = () => {
    console.log('下一步')
    // 收集已选产品，避免多次遍历 tableData
    // const selected = tableData.value.filter((item) => item.flag)
    if (selectedProduct.value.length === 0) {
      return ElMessage.warning('请先选择一个产品')
    }
    const productIds = selectedProduct.value.map((item) => item.id)
    const hasDirectConnectDevice = selectedProduct.value.some(
      (item) => item.nodeType === 'gateway-device'
    )
    const hasGatewayDevice = selectedProduct.value.some(
      (item) => item.nodeType === 'gateway-sub-device'
    )
    const isSubDevice = hasDirectConnectDevice && hasGatewayDevice
    console.log(isSubDevice)
    // debugger
    // return
    emit('next-step', productIds, isSubDevice)
  }
  const goback = () => {
    router.back()
  }
  const emit = defineEmits(['next-step'])
  onMounted(() => {
    getTableData()
  })
</script>

<style lang="scss" scoped>
  .single-card-list {
    .tip {
      // padding: 10px 0;
      border-radius: 20px;
      background: #f7f8fa;
      font-size: 15px;
      color: #303537;
      font-weight: 400;
      max-width: 800px;
      .t-c {
        font-size: 15px;
        font-weight: 500;
        color: #303537;
      }
    }
    .device-card-list {
      //gird布局 一行排列3个间距20px
      box-sizing: border-box;

      .device-card {
        border: 1px solid #ebecf1;
        border-radius: 6px;
        padding: 24px;
        position: relative;
        &.active-card,
        &:hover {
          border: 1px solid #1464ee !important;
          .shu {
            display: block;
          }
        }
        .shu {
          position: absolute;
          left: 0;
          top: 0;
          width: 10px;
          height: 100%;
          background: #1464ee;
          border-radius: 6px;
          display: none;
        }
        .device-icon-container {
          width: 93px;
          height: 93px;
        }
        .device-info {
          flex: 1;
          .device-kuai {
            width: 5px;
            height: 5px;
            background: #ced1d9;
            margin-right: 10px;
          }
          .display-none {
            opacity: 0;
          }
          .devive-title {
            .device-name {
              font-size: 22px;
              font-weight: 300;
              color: #303537;
              font-family:
                Source Han Sans SC,
                Source Han Sans SC-Light;
              max-width: 260px;
              overflow: hidden; /* 隐藏溢出内容 */
              text-overflow: ellipsis; /* 显示省略号 */
              white-space: nowrap; /* 不换行 */
            }
          }
          .info-row {
            display: flex;
            // gap: 10px;
            align-items: center;
            //单行超出省略

            .info-label {
              width: 150px;
              font-size: 16px;
              font-weight: 400;
              text-align: left;
              color: #505658;
            }
          }
        }
      }
    }
    .d-h {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
