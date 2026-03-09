<template>
  <div class="multiple-register bg-white">
    <!-- 第一步选择 -->
    <MultipleCardList ref="" @next-step="nextStep" v-if="activeStep === 1" />
    <!-- 第二步表单 -->
    <MultipleFileUpload
      @previousStep="previousStep"
      @submitForm="submitForm"
      ref="multipleFileUpload"
      v-if="activeStep === 2"
    />
    <ImportResultDialog ref="importResultDialogRef" />
  </div>
</template>

<script setup>
  import MultipleCardList from './multiple-card-List.vue'
  import MultipleFileUpload from './multiple-file-upload.vue'
  import ImportResultDialog from './import-result-dialog.vue'
  import * as api from '@/api/iot'
  import { downloadFile } from '@/utils'

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

  async function handleImportResult(promise) {
    const res = await promise
    console.log('@@@', res)

    const headers = res.headers || {}

    const successCount = Number(headers['success-number'] || 0)
    const failCount = Number(headers['fail-number'] || 0)

    const blob = res.data

    if (failCount > 0 && blob) {
      const filename =
        headers['content-disposition']?.match(/filename=(.*)/)?.[1] || 'fail_list.xlsx'

      downloadFile(blob, filename)
    }

    return {
      successCount,
      failCount
    }
  }

  const importResultDialogRef = useTemplateRef('importResultDialogRef')
  const submitForm = async (submitData) => {
    const formData = new FormData()
    formData.append('file', submitData.pendingFile.raw)
    formData.append('devEnable', submitData.devEnable)
    formData.append('productIds', productIds.value)
    console.log(formData)
    // return
    const data = await handleImportResult(api.apiDevBatchRegister(formData))
    /*  if (multipleFileUpload.value) {
      multipleFileUpload.value.setExportNum(data)
    }
    if (data.successCount) {
      ElMessage.success('批量导入成功')
    } */
    importResultDialogRef.value.open({ successCount: data.successCount, failCount: data.failCount })

    // router.back()
  }
</script>

<style lang="scss" scoped>
  .multiple-register {
    padding: 30px;
  }
</style>
