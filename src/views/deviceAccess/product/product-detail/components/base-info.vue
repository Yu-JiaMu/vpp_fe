<template>
  <div class="base-info bg-white base-info-table">
    <div class="flex justify-between items-center p-5">
      <div class="font-scBold text-g-131617 flex-c">
        <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
        基本信息
      </div>
      <div class="text-g-303537 flex-c cursor-pointer">
        <img src="@/assets/images/icon/icon-edit.png" class="w-5 h-5 mr-1" alt="" />
        编辑
      </div>
    </div>

    <!-- 信息表格 -->
    <el-descriptions :column="3" border label-width="133px" class="">
      <el-descriptions-item label="ID">
        {{ product.id }}
      </el-descriptions-item>

      <el-descriptions-item label="产品名称">
        {{ product.name }}
      </el-descriptions-item>

      <el-descriptions-item label="产品品类">
        {{ product.category }}
      </el-descriptions-item>

      <el-descriptions-item label="节点类型">
        {{ product.nodeType }}
      </el-descriptions-item>

      <el-descriptions-item label="协议类型">
        {{ product.protocol }}
      </el-descriptions-item>

      <el-descriptions-item label="联网方式">
        {{ product.network }}
      </el-descriptions-item>

      <el-descriptions-item label="数据格式">
        {{ product.dataFormat }}
      </el-descriptions-item>

      <el-descriptions-item label="认证方式">
        {{ product.authType }}
      </el-descriptions-item>

      <el-descriptions-item label="产品厂商">
        {{ product.vendor }}
      </el-descriptions-item>

      <el-descriptions-item label="产品类型">
        {{ product.productType }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ product.createdAt }}
      </el-descriptions-item>

      <el-descriptions-item label="更新时间">
        {{ product.updatedAt }}
      </el-descriptions-item>

      <el-descriptions-item label="产品描述" :span="2">
        {{ product.desc }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
  const props = defineProps({
    product: {
      type: Object,
      default: () => {}
    }
  })
</script>

<style lang="scss" scoped>
  .base-info {
  }
</style>
