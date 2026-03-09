<template>
  <div class="multiple-file-upload">
    <div class="tip">
      <div class="flex flex-cz-center">
        <el-icon color="#298AF9" size="22"><Warning /></el-icon>
        <span class="ml10" v-if="productIds.length > 1">
          导入系统已存在的设备数据，不会更改已存在设备的所属产品信息。请注意:您选择了多个产品，模板中将以sheet方式区分。
        </span>
        <span class="ml10" v-if="productIds.length === 1">
          导入系统已存在的设备数据，不会更改已存在设备的所属产品信息。
        </span>
      </div>
      <!-- <div class="ml30 mt5 font-primary-color" v-if="isSubDevice">
        系统识别到您选择的多个产品间存在网关设备与子设备节点拓扑关系，如需绑定子设备管理关系，请在模板中录入。
      </div> -->
    </div>
    <div class="file-upload-box">
      <div class="title-box flex items-center gap-2">
        <img src="@/assets/images/deviceAccess/6.png" class="img6" />
        <span class="title-font">文件上传</span>
      </div>
      <el-upload
        ref="uploadRef"
        class="w-full"
        drag
        :limit="1"
        accept=".xlsx"
        show-file-list
        :auto-upload="false"
        :on-exceed="handleExceed"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <!-- <img src="@/assets/images/deviceAccess/7.png" alt="" /> -->
        <div class="upload-text mt10">
          <div>将文件拖到此处，或<em class="font-primary-color">点击上传</em></div>
          <div>（格式：xlsx）</div>
        </div>
      </el-upload>
      <div class="flex items-center" :class="exportSuccess ? 'justify-between' : 'justify-end'">
        <div class="flex items-center" v-if="exportNum.successNum || exportNum.failNum">
          <div class="export-success mr-[20px] flex items-center">
            <el-icon class="mr-[2px]"><CircleCheck /></el-icon>
            导入完成
          </div>
          <!--   <span class="text-[#192936] font-[Source Han Sans SC] font-normal mr-[5px]"
            >导入成功：{{ exportNum.successNum }}个</span
          >
          <span class="text-[#192936] font-[Source Han Sans SC] font-normal"
            >导入失败：{{ exportNum.failNum }}个</span
          > -->
        </div>
        <div>
          <el-switch v-model="form.devEnable" />
          <span class="ml-[10px] text-[14px] text-[#192936]">导入并启用</span>
        </div>
      </div>
    </div>
    <div class="file-upload-box">
      <div class="title-box flex items-center gap-2">
        <img src="@/assets/images/deviceAccess/7.png" class="img6" />
        <span class="title-font">下载模板</span>
      </div>
      <div class="gs-box">
        <div
          class="gs-content-item flex flex-cz-center flex-sp-center cursor-pointer"
          @click="downloadDevTemplate"
        >
          <img src="@/assets/images/deviceAccess/8.png" alt="" style="width: 35px; height: 35px" />
          <span>模版格式 . xlsx</span>
        </div>
      </div>
    </div>
    <div class="col-span-2 flex justify-center gap-5 mt-[30px] rounded-t-md">
      <el-button size="large" type="info" class="w-80" v-ripple @click="previousStep"
        >上一步</el-button
      >
      <el-button size="large" type="primary" class="w-80" v-ripple @click="submitForm">
        确认
      </el-button>
    </div>
  </div>
</template>

<script setup>
  import * as api from '@/api/iot'
  import { downloadFile } from '@/utils'
  import { useUploadBefore } from '@/components/core/Upload/composables/useUploadBefore'
  import { ElMessage, genFileId } from 'element-plus'
  const downloadDevTemplate = async () => {
    const result = await api.apiDevdownloadExcelTemplate(productIds.value)
    downloadFile(result, '多产品注册模板', 'xlsx')
  }
  const beforeUpload = useUploadBefore({
    fileSize: 10,
    accept: '.xlsx'
  })
  /** JSON 导入 */
  const handleFileChange = (file) => {
    form.pendingFile = file
    console.log('file', file)
  }
  const uploadRef = useTemplateRef('uploadRef')
  const handleExceed = (files) => {
    console.log(files)
    uploadRef.value?.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    uploadRef.value?.handleStart(file)
  }
  const emit = defineEmits(['previousStep', 'submitForm'])
  const previousStep = async () => {
    emit('previousStep')
  }
  const form = reactive({
    pendingFile: '',
    devEnable: true
  })
  const submitForm = async () => {
    console.log(form, 'formformformform')
    emit('submitForm', form)
  }
  const productIds = ref([])
  const setProductIds = async (ids) => {
    productIds.value = ids
    console.log(productIds.value, 'productIds.valueproductIds.value')
  }
  const isSubDevice = ref(false)
  //网关子设备
  const getwzSubDevice = (status) => {
    isSubDevice.value = status
  }
  const exportNum = reactive({
    successNum: 0,
    failNum: 0
  })
  const setExportNum = (data) => {
    exportNum.successNum = data.successCount
    exportNum.failNum = data.failCount
  }
  const exportSuccess = computed(() => {
    if (exportNum.successNum || exportNum.failNum) {
      return true
    } else {
      return false
    }
  })
  defineExpose({ setProductIds, setExportNum, getwzSubDevice })
</script>

<style lang="scss" scoped>
  .multiple-file-upload {
    .font-primary-color {
      color: #298af9;
    }
    .tip {
      padding: 10px 12px;
      border-radius: 20px;
      background: #f7f8fa;
      font-size: 15px;
      color: #303537;
      font-weight: 400;
      max-width: 888px;
      .t-c {
        font-size: 15px;
        font-weight: 500;
        color: #303537;
      }
    }
    .file-upload-box {
      margin-top: 41px;
      .title-box {
        .img6 {
          width: 20px;
          height: 20px;
        }
        .title-font {
          font-size: 16px;
          font-family:
            Source Han Sans SC,
            Source Han Sans SC-Bold;
          font-weight: 700;
          color: #131617;
        }
      }
      .file-upload-content {
        padding-left: 30px;
        .upload-text {
          font-size: 14px;
          font-family:
            Source Han Sans SC,
            Source Han Sans SC-Regular;
          font-weight: 400;
          color: #303537;
        }
      }
    }
    .gs-box {
      margin-top: 20px;
      .gs-content-item {
        width: 327px;
        height: 35px;
        box-sizing: border-box;
        background: #f7f8fa;
        // border: 1px solid #5b77ff;
        border-radius: 6px;
      }
    }
    .export-success {
      background: #dcffe8;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 13px;
      font-family:
        Source Han Sans SC,
        Source Han Sans SC-Regular;
      font-weight: 400;
      color: #2ecb63;
    }
  }
</style>
