<template>
  <div>
    <ElCard class="art-table-card" shadow="never">
      <div>便携式电源</div>
      <el-row class="mt20">
        <el-col :span="6">
          <span>所属行业/场景:</span>
          <span>所属行业</span>
        </el-col>
        <el-col :span="6">
          <span>描述:</span>
          <span>无</span>
        </el-col>
        <div></div>
      </el-row>
      <el-row class="mt10">
        <el-col :span="6">
          <span>创建时间:</span>
          <span>无</span>
        </el-col>
        <el-col :span="6">
          <span>更新时间:</span>
          <span>2024-06-10 14:20:00</span>
        </el-col>
      </el-row>
    </ElCard>
    <div class="w-m-x flex flex-cz-center flex-sp-center mt20">
      <el-button type="primary" class="btn-width-118">物模型</el-button>
    </div>
    <ElCard class="art-table-card" shadow="never">
      <div class="flex flex-cz-center flex-space-between mb20">
        <div class="flex flex-cz-center">
          <div class="input-container">
            <span class="fixed-label">功能名称</span>
            <input v-model="inputValue" type="text" class="inner-input" placeholder="请输入" />
          </div>
          <div class="flex flex-cz-center ml10">
            <el-button class="mr10 btn-height-45" style="width: 145px">搜索</el-button>
            <div class="btn-rest flex flex-cz-center flex-sp-center">
              <img
                src="~@/assets/images/deviceAccess/4.png"
                style="width: 20px; height: 20px"
                class="mr5"
              />
              <span>重置</span>
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="flex flex-cz-center flex-sp-center add-container mr10">
            <img
              src="~@/assets/images/deviceAccess/2.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>删除</span>
          </div>
          <div class="flex flex-cz-center flex-sp-center add-container">
            <img
              src="~@/assets/images/deviceAccess/3.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>设置物模型</span>
          </div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup></script>

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
</style>
