<template>
  <div class="base-info bg-white base-info-table">
    <div class="flex justify-between items-center p-5">
      <div class="font-scBold text-g-131617 flex-c">
        <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
        基本信息
      </div>
      <div class="text-g-303537 flex-c cursor-pointer" @click="handleEdit">
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
              <el-upload class="logo-uploader" action="#" :show-file-list="false">
                <div
                  class="w-20 h-20 border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:border-primary cursor-pointer"
                >
                  <img
                    v-if="form.logo"
                    :src="form.logo"
                    class="w-full h-full object-cover rounded"
                  />
                </div>
              </el-upload>

              <span class="text-primary cursor-pointer text-sm"> 点击上传 LOGO </span>
            </div>
          </el-form-item>

          <!-- 产品名称 -->
          <el-form-item label="产品名称" prop="name" required>
            <el-input v-model="form.name" placeholder="请输入产品名称" />
          </el-form-item>

          <!-- 产品厂商 -->
          <el-form-item label="产品厂商" prop="vendor">
            <el-input v-model="form.vendor" placeholder="请输入产品厂商" />
          </el-form-item>

          <!-- 产品型号 -->
          <el-form-item label="产品型号" prop="model">
            <el-input v-model="form.model" placeholder="请输入产品型号" />
          </el-form-item>

          <!-- 描述 -->
          <el-form-item label="描述" prop="desc">
            <el-input
              v-model="form.desc"
              type="textarea"
              placeholder="请输入产品说明"
              :rows="5"
              maxlength="200"
            />
            <div class="w-full text-right text-xs text-gray-400 mt-1">
              {{ getByteLength(form.desc) }}/200
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
          <el-button type="primary" class="w-[177px]" v-ripple @click="handleSubmit">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { validateNameLength, validateCommon, validateDescLength, getByteLength } from '@/utils'
  import { pick } from 'lodash-es'
  const props = defineProps({
    product: {
      type: Object,
      default: () => {}
    }
  })

  const emits = defineEmits(['refresh'])
  const dialogVisible = ref(false)

  const handleEdit = () => {
    Object.assign(form, pick(props.product, ['logo', 'name', 'vendor', 'model', 'desc']))
    dialogVisible.value = true
  }

  // 弹窗逻辑
  const formRef = ref(null)

  const form = reactive({
    logo: '',
    name: '',
    vendor: '',
    model: '',
    desc: ''
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
    desc: [
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateDescLength, trigger: 'blur' }
    ]
  }
  const handleReset = () => {
    formRef.value?.resetFields()
    form.logo = ''
  }
  const handleSubmit = async () => {
    const valid = await formRef.value.validate()
    if (!valid) return
    submitLoading.value = true

    try {
      // 👇 模拟接口请求（换成你真实 API）
      await fakeSubmitApi({
        logo: form.logo,
        name: form.name,
        vendor: form.vendor,
        model: form.model,
        desc: form.desc
      })

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
