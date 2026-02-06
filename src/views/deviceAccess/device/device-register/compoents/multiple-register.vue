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
  const nextStep = async (productId, isSubDevice) => {
    productIds.value = productId
    activeStep.value = 2
    await nextTick()
    if (multipleFileUpload.value) {
      multipleFileUpload.value.setProductIds(productIds.value)
      multipleFileUpload.value.getwzSubDevice(isSubDevice)
    }
  }
  //上一步
  const previousStep = async () => {
    activeStep.value = 1
  }
  const sumbitForm = async (submitData) => {
    const formData = new FormData()
    formData.append('file', submitData.pendingFile.raw)
    formData.append('devEnable', submitData.devEnable)
    formData.append('productIds', productIds.value)
    console.log(formData)
    // return
    const data = await api.apiDevBatchRegister(formData)
    if (multipleFileUpload.value) {
      multipleFileUpload.value.setExportNum(data)
    }
    ElMessage.success('批量导入成功')
    // router.back()
  }
</script>

<style lang="scss" scoped>
  .multiple-register {
    padding: 30px;
  }
</style>
