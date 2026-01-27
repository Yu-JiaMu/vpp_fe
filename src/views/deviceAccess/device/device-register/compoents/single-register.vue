<template>
  <div class="single-register bg-white">
    <!-- 第一步选择 -->
    <SingleCardList @next-step="nextStep" v-if="activeStep === 1" />
    <!-- 第二步表单 -->
    <SingleForm
      ref="singleForm"
      v-if="activeStep === 2"
      @previousStep="previousStep"
      @sumbitForm="sumbitForm"
    />
  </div>
</template>

<script setup>
  import SingleCardList from './single-card-List.vue'
  import SingleForm from './sigle-form.vue'
  import * as api from '@/api/iot'
  const router = useRouter()
  const form = reactive({
    productId: ''
  })
  const activeStep = ref(1)
  const nextStep = async (productId) => {
    console.log('进入第二步表单')
    form.productId = productId
    activeStep.value = 2
    await nextTick()
    singleForm.value.getProductDetail(productId)
  }
  //上一步
  const singleForm = ref(null)
  const previousStep = async () => {
    activeStep.value = 1
  }
  const sumbitForm = async (submitData) => {
    const data = {
      ...submitData,
      productId: form.productId
    }
    await api.apiDevAdd(data)
    ElMessage.success('创建成功')
    router.back()
  }
</script>

<style lang="scss" scoped>
  .single-register {
    background: #fff;
    padding: 30px;
  }
</style>
