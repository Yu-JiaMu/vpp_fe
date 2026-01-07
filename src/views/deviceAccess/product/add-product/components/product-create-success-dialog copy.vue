<template>
  <el-dialog
    v-model="dialogVisible"
    align-center
    title="新增产品"
    :show-close="false"
    width="640px"
    class="custom-dialog"
  >
    <div class="product-create-success-dialog px-8 py-4">
      <div class="flex items-start mb-6">
        <el-icon class="text-green-500 text-3xl mr-3">
          <CircleCheckFilled />
        </el-icon>
        <div>
          <h3 class="text-xl font-medium text-gray-900 leading-tight">产品创建成功</h3>
          <p class="text-gray-500 mt-4 text-sm tracking-wide">
            产品ID为：<span class="font-mono text-gray-700">689d7b55d582f20018456cd6</span>
          </p>
        </div>
      </div>

      <div class="mt-8">
        <p class="text-gray-800 font-medium mb-6">接下来您可以：</p>

        <div class="mb-8">
          <div class="flex items-baseline">
            <span class="text-lg font-bold text-gray-800 mr-2">1、</span>
            <div class="flex-1">
              <h4 class="text-base font-bold text-gray-800">定义产品物模型</h4>
              <p class="text-sm text-gray-500 mt-1">
                您需自定义产品品类物模型，基于品类模板即可快速创建产品。
              </p>
              <el-button
                class="mt-3 !border-blue-100 !text-blue-500 !bg-blue-50/30 hover:!bg-blue-50"
                size="default"
              >
                去定义物模型
              </el-button>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <div class="flex items-baseline">
            <span class="text-lg font-bold text-gray-800 mr-2">2、</span>
            <div class="flex-1">
              <h4 class="text-base font-bold text-gray-800">注册设备并激活调试</h4>
              <p class="text-sm text-gray-500 mt-1">
                您可以添加产品下的某个设备，并通过“设备诊断”进行调试。
              </p>
              <el-button
                class="mt-3 !border-blue-100 !text-blue-500 !bg-blue-50/30 hover:!bg-blue-50"
                size="default"
              >
                去注册设备
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center gap-4 pb-4">
        <el-button
          class="px-12 !bg-gray-100 !border-none !text-gray-500 hover:!bg-gray-200"
          @click="dialogVisible = false"
        >
          取消
        </el-button>
        <el-button type="primary" class="px-12 !bg-blue-600" @click="handleCheckDetail">
          查看详情
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { CircleCheckFilled } from '@element-plus/icons-vue'

  const dialogVisible = defineModel({ type: Boolean, default: false })

  const handleCheckDetail = () => {
    // 处理查看详情逻辑
    dialogVisible.value = false
  }
</script>

<style lang="scss">
  /* 使用普通 style 去掉 el-dialog 默认的 padding 影响或自定义样式 */
  .custom-dialog {
    .el-dialog__header {
      margin-right: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #f3f4f6;
      .el-dialog__title {
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
</style>
