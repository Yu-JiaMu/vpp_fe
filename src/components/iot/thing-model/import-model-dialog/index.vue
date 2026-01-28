<template>
  <el-dialog
    v-model="dialogVisible"
    align-center
    title="导入物模型"
    :show-close="false"
    width="710"
    :close-on-click-modal="false"
  >
    <div class="export-model-dialog">
      <!-- 导入方式 -->
      <el-form label-width="90px" label-position="top">
        <el-form-item label="导入方式" required>
          <el-select v-model="importType">
            <el-option v-if="module !== 'productCategory'" label="拷贝产品" value="product" />
            <el-option label="JSON导入" value="json" />
          </el-select>
        </el-form-item>

        <!-- 接入产品 -->
        <template v-if="importType === 'product'">
          <el-form-item label="选择产品" required>
            <el-select v-model="productId" @change="handleProductSelect">
              <el-option v-for="item in productList" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-table :data="tableData" border class="mt-4" height="320">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="type" label="功能类型" />
            <el-table-column prop="name" label="功能名称" />
            <el-table-column prop="identifier" label="标识符" />
            <el-table-column prop="dataType" label="数据类型" />
          </el-table>
        </template>

        <!-- JSON 导入 -->
        <template v-else>
          <el-form-item label="文件上传" required>
            <el-upload
              ref="uploadRef"
              class="w-full"
              drag
              :limit="1"
              accept=".json"
              show-file-list
              :auto-upload="false"
              :on-exceed="handleExceed"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
            >
              <img class="w-12 h-12 mx-auto" src="@/assets/images/icon/icon-005.png" alt="" />
              <div class="mt-2 text-sm text-gray-600">
                将文件拖到此处，或 <span class="cursor-pointer text-primary">点击上传</span>
              </div>
              <div class="mt-1 text-xs text-gray-400"> 支持 json 格式，大小不超过 2M </div>
            </el-upload>
          </el-form-item>

          <!-- <div class="mt-2 text-sm text-gray-600">
            此处显示已上传的文件名：<span class="text-primary">{{ fileName || '-' }}</span>
          </div> -->

          <div class="mt-5">
            <div class="mb-5 text-sm text-gray-600">下载模板</div>
            <el-button
              class="w-[382px] !bg-[#f7f8fa] rounded-md"
              link
              type="primary"
              @click="downloadThingModelTemplate"
            >
              <img class="w-9 h-9" src="@/assets/images/icon/icon-006.png" alt="" />
              物模型模板.json
            </el-button>
          </div>
        </template>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button
          size="large"
          type="info"
          class="w-[177px]"
          v-ripple
          @click="dialogVisible = false"
          >取消</el-button
        >
        <el-button type="primary" class="w-[177px]" v-ripple @click="handleConfirm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { transformThingJsonToTable, downloadFile } from '@/utils'
  // import thingJson from '../thing.json'
  import { ElMessage, ElMessageBox, genFileId } from 'element-plus'
  import * as api from '@/api/iot'
  import { useUploadBefore } from '@/components/core/Upload/composables/useUploadBefore'

  const props = defineProps({
    info: {
      type: Object,
      default: () => {}
    },
    module: {
      type: String,
      default: ''
    }
  })

  const beforeUpload = useUploadBefore({
    fileSize: 2,
    accept: '.json'
  })

  const emits = defineEmits(['refresh'])

  const dialogVisible = ref(false)

  /** 导入方式 */
  const importType = ref('json')

  /** 接入产品 */
  const productId = ref('')
  const tableData = ref([])

  const productList = ref([])

  /** JSON 导入 */
  let pendingFile

  const handleFileChange = (file) => {
    pendingFile = file
    console.log('file', file)
  }

  const uploadRef = useTemplateRef('uploadRef')
  const handleExceed = (files) => {
    uploadRef.value?.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    uploadRef.value?.handleStart(file)
  }

  const handleConfirm = async () => {
    if (importType.value === 'product') {
      console.log('接入产品导入', productId.value)

      switch (props.module) {
        case 'product':
          await api.importProductThingModel({ destId: props.info.id, srcId: productId.value })
          break

        default:
          break
      }
      ElMessage.success('更新成功')
    } else {
      console.log('JSON导入')
      const formData = new FormData()
      formData.append('file', pendingFile.raw)
      formData.append('name', pendingFile.name)

      try {
        switch (props.module) {
          case 'product':
            await api.importProductThingModelJson({ file: formData, id: props.info.id })
            break
          case 'productCategory':
            await api.importProductCategoryThingModelJson({ file: formData, id: props.info.id })
            break
          default:
            break
        }
        ElMessage.success('更新成功')
      } catch (error) {
        throw error
      }
    }

    emits('refresh')
    dialogVisible.value = false
  }

  const open = (row) => {
    dialogVisible.value = true
  }

  const downloadThingModelTemplate = async () => {
    const result = await api.downloadThingModelTemplate()
    downloadFile(result, `物模型模版`)
  }

  const getProductList = async () => {
    const { rows } = await api.apiGetProductList({ pageNum: 1, pageSize: 1000 })
    if (rows && Array.isArray(rows)) {
      productList.value = rows
        .map((item) => ({
          label: item.name,
          value: item.id
        }))
        .filter((item) => item.value !== props.info.id)
    }
  }

  const getProductDetail = async () => {
    try {
      const id = productId.value
      if (!id) return

      const res = await api.apiGetProductDetail(id)
      if (res) {
        tableData.value = transformThingJsonToTable(res.thingModelJson)
      }
    } catch (error) {}
  }

  const handleProductSelect = () => {
    getProductDetail()
  }

  const init = async () => {
    if (props.module !== 'ProductCategory') {
      getProductList()
    }
  }

  onMounted(() => {
    init()
  })

  defineExpose({ open })
</script>

<style lang="scss">
  .export-model-dialog {
  }
</style>
