<template>
  <el-dialog v-model="dialogVisible" align-center title="新增产品" :show-close="false" width="598">
    <div class="product-create-success-dialog">
      <!-- 成功提示 -->
      <div class="flex items-center mb-5 ml-[-34px]">
        <img class="w-6 h-6 mr-2.5" src="@/assets/images/icon/icon-success.png" alt="" />
        <span class="text-base font-scMedium text-g-303537"> 产品创建成功 </span>
      </div>

      <!-- 产品 ID -->
      <div class="mb-5 text-base text-g-505658"> 产品标识符为： {{ identifier || productId }} </div>

      <!-- 引导说明 -->
      <div class="mb-5 text-base text-g-505658"> 接下来您可以： </div>

      <!-- 操作项 1 -->
      <div class="mb-7">
        <div class="mb-1 text-base font-scMedium text-g-303537"> 1. 定义产品物模型 </div>
        <div class="text-sm text-g-505658 mb-2.5">
          通过定义模型，在平台构建一款设备的抽象模型，使平台理解该款设备支持的功能
        </div>
        <el-button class="plain-btn" @click="handleDefineModel"> 去定义物模型 </el-button>
      </div>

      <!-- 操作项 2 -->
      <div>
        <div class="mb-1 text-base font-scMedium text-g-303537"> 2. 注册设备并激活调试 </div>
        <div class="text-sm text-g-505658 mb-2.5">
          您可以添加产品下的某个设备，并通过“设备诊断”进行调试。
        </div>
        <el-button class="plain-btn" @click="handleRegisterDevice"> 去注册设备 </el-button>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button size="large" type="info" class="w-[177px]" v-ripple @click="onCancel"
          >关闭</el-button
        >
        <el-button type="primary" @click="handleViewDetail" class="w-[177px]" v-ripple>
          查看详情
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  const router = useRouter()
  const dialogVisible = ref(false)

  const productId = ref('')

  const handleDefineModel = () => {
    console.log('去定义物模型')
    router.replace({
      name: 'productDetail',
      query: {
        id: productId.value,
        tab: 'model'
      }
    })
  }

  const handleRegisterDevice = () => {
    console.log('去注册设备')
  }

  const handleViewDetail = () => {
    console.log('查看产品详情')
    router.replace({
      name: 'productDetail',
      query: {
        id: productId.value
      }
    })
  }

  const identifier = ref('')
  const open = (data) => {
    productId.value = data.id
    identifier.value = data.identifier
    dialogVisible.value = true
  }

  const onCancel = () => {
    dialogVisible.value = false
    router.replace({
      name: 'product'
    })
  }

  defineExpose({ open })
</script>

<style lang="scss">
  .product-create-success-dialog {
    padding: 0 calc(80px - var(--el-dialog-padding-y));
    .plain-btn {
      border: 1px solid #e5e6ec;
    }
  }
</style>
