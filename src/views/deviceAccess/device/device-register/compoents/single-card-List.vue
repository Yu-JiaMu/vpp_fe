<template>
  <div class="single-card-list">
    <div class="tip flex flex-cz-center">
      <el-icon color="#298AF9" size="22"><Warning /></el-icon>
      <span class="ml10">
        请先选择产品，本次注册的设备将继承产品定义的内容，成为该产品的所属设备。
        <span class="t-c">单个注册仅支持单选产品!</span>
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
    <div class="device-card-list">
      <div
        class="device-card cursor-pointer"
        v-for="(item, index) in 8"
        :key="index"
        :class="{ 'active-card': index === activeCardIndex }"
        @click="changeCard(item, index)"
      >
        <!-- 活跃的竖线 -->
        <img
          class="shu"
          src="@/assets/images/deviceAccess/5.webp"
          v-if="index === activeCardIndex"
        />
        <div class="device-icon-container mr30">
          <img src="@/assets/images/user/avatar.webp" alt="" class="device-icon" />
        </div>
        <div class="device-info">
          <div class="devive-title flex flex-cz-center">
            <div class="device-kuai"></div>
            <h3 class="device-name">ADW300电表</h3>
          </div>

          <div class="info-row mt10">
            <div class="info-label flex flex-cz-center mr30">
              <div class="device-kuai"></div>
              <div class="d-h">节点类型</div>
            </div>
            <div class="info-label flex flex-cz-center">
              <div class="device-kuai"></div>
              <div class="d-h flex1">节点类型节</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label flex flex-cz-center mr30">
              <div class="device-kuai display-none"></div>
              <div class="d-h">网关子设备</div>
            </div>
            <div class="info-label flex flex-cz-center">
              <div class="device-kuai display-none"></div>
              <div class="d-h flex1">ModbusTCP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ArtPagination
      v-model="pagination"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
    <div class="col-span-2 flex justify-center gap-5 mt-[50px] rounded-t-md">
      <el-button size="large" type="info" class="w-80" v-ripple>取消</el-button>
      <el-button size="large" type="primary" class="w-80" @click="nextForm" v-ripple>
        下一步
      </el-button>
    </div>
  </div>
</template>

<script setup>
  const form = reactive({
    name: ''
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
  }
  const onSearch = () => {
    console.log('搜索条件：', form)
  }
  //分页数据
  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  const onSizeChange = (size) => {
    console.log('每页条数改变：', size)
  }
  const onPageChange = (page) => {
    console.log('当前页改变：', page)
  }
  //表格数据

  const tableData = ref([])

  //切换card
  const activeCardIndex = ref(null)
  const changeCard = (item, index) => {
    console.log('选择的卡片：', item, index)
    activeCardIndex.value = index
  }
  //下一步
  const nextForm = () => {
    console.log('下一步')
    //通过activeCardIndex判断是否选择了卡片
    if (activeCardIndex.value === null) return ElMessage.warning('请先选择一个产品')
    emit('next-step')
  }
  const emit = defineEmits(['next-step'])
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
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      box-sizing: border-box;
      .active-card {
        border: 1px solid #2a4dfc !important;
      }
      .device-card {
        border: 1px solid #ebecf1;
        border-radius: 6px;
        padding: 24px 24px 24px 24px;
        display: flex;
        position: relative;
        .shu {
          position: absolute;
          left: 0;
          top: 0;
          width: 10px;
          height: 100%;
          background: #2a4dfc;
          border-radius: 6px;
        }
        .device-icon-container {
          img {
            width: 93px;
            height: 93px;
          }
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
            }
          }
          .info-row {
            display: flex;
            align-items: center;
            //单行超出省略

            .info-label {
              width: 150px;
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
