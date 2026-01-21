<template>
  <div class="bg-white base-info base-info-table">
    <div class="flex items-center justify-between p-5">
      <div class="font-scBold text-g-131617 flex-c">
        <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
        基本信息
      </div>
      <div class="cursor-pointer text-g-303537 flex-c" @click="handleEdit">
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
        {{ product.productCategoryName }}
      </el-descriptions-item>

      <el-descriptions-item label="节点类型">
        {{ NODE_TYPES.getLabel(product.nodeType) }}
      </el-descriptions-item>

      <el-descriptions-item label="协议类型">
        {{ PROTOCOL_TYPES_MAP.getLabel(product.applyLayerProtocol) }}
      </el-descriptions-item>

      <el-descriptions-item label="联网方式">
        {{ CONNECTION_TYPES.getLabel(product.networkWay) }}
      </el-descriptions-item>

      <el-descriptions-item label="数据格式">
        {{ product.dataFormat }}
      </el-descriptions-item>

      <el-descriptions-item label="认证方式">
        {{ AUTH_MODE_MAP.getLabel(product.authType) }}
      </el-descriptions-item>

      <el-descriptions-item label="产品厂商">
        {{ product.manufactory }}
      </el-descriptions-item>

      <el-descriptions-item label="产品类型">
        {{ product.productModel }}
      </el-descriptions-item>

      <el-descriptions-item label="产品标识符">
        {{ product.identifier }}
      </el-descriptions-item>

      <el-descriptions-item label="产品描述" :span="2">
        {{ product.remark }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 基本信息编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      align-center
      title="基本信息编辑"
      :show-close="false"
      width="598"
      :close-on-click-modal="false"
    >
      <div class="p-2">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="82px">
          <!-- 上传 -->
          <el-form-item label="上传">
            <div class="flex items-center gap-4">
              <UploadImg
                v-model="form.imgUrl"
                accept="image/*"
                :fileSize="0.5"
                width="80px"
                height="80px"
              >
                <template #tip>
                  <span class="text-xs text-g-505658"
                    >支持500k以内的图片；支持jpg、png、jpeg；建议尺寸256x256。</span
                  >
                </template>
              </UploadImg>
            </div>
          </el-form-item>

          <!-- 产品名称 -->
          <el-form-item label="产品名称" prop="name" required>
            <el-input v-model="form.name" placeholder="请输入产品名称" />
          </el-form-item>

          <!-- 产品厂商 -->
          <el-form-item label="产品厂商" prop="manufactory">
            <el-input v-model="form.manufactory" placeholder="请输入产品厂商" />
          </el-form-item>

          <!-- 产品型号 -->
          <el-form-item label="产品型号" prop="productModel">
            <el-input v-model="form.productModel" placeholder="请输入产品型号" />
          </el-form-item>

          <!-- 描述 -->
          <el-form-item label="描述" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="请输入产品说明"
              :rows="5"
              maxlength="200"
            />
            <div class="w-full mt-1 text-xs text-right text-gray-400">
              {{ getByteLength(form.remark) }}/200
            </div>
          </el-form-item>
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
          <el-button
            :loading="submitLoading"
            type="primary"
            class="w-[177px]"
            v-ripple
            @click="handleSubmit"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { validateNameLength, validateCommon, validateDescLength, getByteLength } from '@/utils'
  import { NODE_TYPES, PROTOCOL_TYPES_MAP, CONNECTION_TYPES, AUTH_MODE_MAP } from '@/enums'
  import { pick } from 'lodash-es'
  import * as api from '@/api/iot'
  const props = defineProps({
    product: {
      type: Object,
      default: () => {}
    }
  })

  const emits = defineEmits(['refresh'])
  const dialogVisible = ref(false)

  const handleEdit = () => {
    Object.assign(
      form,
      pick(props.product, ['imgUrl', 'name', 'manufactory', 'productModel', 'remark'])
    )
    dialogVisible.value = true
  }

  // 弹窗逻辑
  const formRef = ref(null)

  const form = reactive({
    imgUrl: '',
    name: '',
    manufactory: '',
    productModel: '',
    remark: ''
  })

  const rules = {
    name: [
      {
        required: true,
        validator: validateNameLength,
        trigger: 'blur'
      },
      { validator: validateCommon, trigger: 'blur' }
    ],
    remark: [
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateDescLength, trigger: 'blur' }
    ]
  }

  const handleReset = () => {
    formRef.value?.resetFields()
    form.imgUrl = ''
  }

  const submitLoading = ref(false)
  const handleSubmit = async () => {
    const valid = await formRef.value.validate()
    if (!valid) return
    submitLoading.value = true

    try {
      // 👇 模拟接口请求（换成你真实 API）
      await api.apiEditProduct({ ...props.product, ...form, id: props.product.id })

      ElMessage.success('提交成功')

      handleReset()

      dialogVisible.value = false
      emits('refresh')
    } catch (err) {
      ElMessage.error(err?.message || '提交失败')
    } finally {
      submitLoading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .base-info {
  }
</style>
