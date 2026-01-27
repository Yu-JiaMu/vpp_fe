<template>
  <div class="multiple-register bg-white">
    <!-- 第一步选择 -->
    <MultipleCardList ref="" @next-step="nextStep" v-if="activeStep === 1" />
    <!-- 第二步表单 -->
    <MultipleFileUpload
      @previousStep="previousStep"
      @sumbitForm="sumbitForm"
      ref="multipleFileUpload"
      v-if="activeStep === 2"
    />
  </div>
</template>

<script setup>
  import MultipleCardList from './multiple-card-List.vue'
  import MultipleFileUpload from './multiple-file-upload.vue'
  import * as api from '@/api/iot'
  const router = useRouter()
  // const form = reactive({
  //   productId: ''
  // })
  const productIds = ref([])
  const activeStep = ref(1)
  const multipleFileUpload = ref(null)
  const nextStep = async (productId) => {
    productIds.value = productId
    activeStep.value = 2
  }
  //上一步
  const previousStep = async () => {
    activeStep.value = 1
  }
  const sumbitForm = async (submitData) => {
    const data = {
      ...submitData,
      productIds: productIds.value
    }
    await api.apiDevBatchRegister(data)
    ElMessage.success('创建成功')
    router.back()
  }
</script>

<style lang="scss" scoped>
  .multiple-register {
    padding: 30px;
  }
</style>
