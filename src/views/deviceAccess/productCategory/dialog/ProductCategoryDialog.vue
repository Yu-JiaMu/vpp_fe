<template>
  <!-- 主弹窗组件 -->
  <el-dialog
    v-model="dialogVisible"
    title="新增产品品类"
    width="600px"
    :close-on-click-modal="false"
    :show-close="false"
    :close-on-press-escape="false"
    align-center
  >
    <!-- 表单主体 -->
    <div style="padding: 0 100px 0 0">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        size="default"
        class="custom-dialog-form"
      >
        <!-- 行业选择 -->
        <el-form-item label="行业" prop="industryCode" class="form-item-required">
          <el-select
            v-model="formData.industryCode"
            placeholder="请选择"
            @change="industryCodeChange"
            clearable
            class="full-width"
          >
            <el-option
              v-for="item in industryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 场景选择 -->
        <el-form-item label="场景" prop="sceneCode" class="form-item-required">
          <el-select v-model="formData.sceneCode" placeholder="请选择" clearable class="full-width">
            <el-option
              v-for="item in sceneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 产品品类输入 -->
        <el-form-item label="产品品类" prop="name" class="form-item-required">
          <el-input
            v-model="formData.name"
            placeholder="请输入产品品类名称"
            clearable
            class="full-width"
          />
        </el-form-item>

        <!-- 描述文本域 -->
        <el-form-item label="描述" prop="remark" class="description-item">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入产品品类说明"
            class="full-width"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer flex flex-sp-center">
        <el-button type="info" class="btn-width-177" v-ripple @click="handleCancel">取消</el-button>
        <el-button class="btn-width-177" type="primary" v-ripple @click="handleSubmit"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { validateNameLength, validateCommon, validateDescLength } from '@/utils'
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import * as productCategoryApi from '@/api/iot/productCategory.js'
  // 定义 props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  })
  // 定义 emits
  const emit = defineEmits(['update:modelValue', 'success'])
  // 使用计算属性包装
  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  // 表单引用
  const formRef = ref()

  // 表单数据
  const formData = reactive({
    id: '',
    industryCode: '',
    sceneCode: '',
    name: '',
    remark: ''
  })

  // 表单验证规则
  const formRules = {
    industryCode: [{ required: true, message: '请选择行业', trigger: 'change' }],
    sceneCode: [{ required: true, message: '请选择场景', trigger: 'change' }],
    name: [
      {
        required: true,
        validator: validateNameLength,
        trigger: 'blur',
        message: '请输入产品品类名称'
      },
      { validator: validateCommon, trigger: 'blur' }
    ],
    remark: [{ validator: validateDescLength, trigger: 'blur' }]
  }

  // 通过接口 选项数据
  const industryOptions = ref([])
  const sceneOptions = ref([])
  async function getIndustryList() {
    const res = await productCategoryApi.apiGetIndustryList()
    console.log(res, 'res')
    industryOptions.value = res.map((item) => {
      return {
        label: item.label,
        value: item.code,
        children: item.children || []
      }
    })
  }
  function industryCodeChange(e) {
    if (e) {
      formData.sceneCode = ''
      const children = industryOptions.value.find((item) => item.value === e)?.children || []
      sceneOptions.value = children.map((item) => {
        return {
          label: item.label,
          value: item.code
        }
      })
    } else {
      sceneOptions.value = []
      formData.sceneCode = ''
    }
  }
  // 监听弹窗打开状态
  watch(
    () => props.modelValue,
    (newVal) => {
      if (!newVal) {
        // 弹窗关闭时重置表单
        resetForm()
      } else {
        // 弹窗打开关闭时，做逻辑处理
        getIndustryList()
        // getSceneList()
      }
    }
  )
  // 表单提交处理
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 表单验证通过
      // console.log('表单数据:', JSON.stringify(formData, null, 2))
      if (formData.id) {
        await productCategoryApi.apiProductCategoryEdit({ ...formData })
      } else {
        const res = await productCategoryApi.apiProductCategoryAdd({ ...formData })
        formData.id = res || '2014243059751063552'
        emit('success', { ...formData })
      }
      // 提交成功提示
      ElMessage({
        message: '提交成功',
        type: 'success',
        duration: 2000
      })
      // 触发成功事件
      // 关闭弹窗
      emit('update:modelValue', false)
    } catch (error) {
      // 验证失败
      console.log('表单验证失败:', error)
    }
  }

  // 取消按钮处理
  const handleCancel = () => {
    if (isFormDirty()) {
      showCloseConfirm()
    } else {
      emit('update:modelValue', false)
    }
  }

  // 检查表单是否有数据
  const isFormDirty = () => {
    return formData.industryCode || formData.sceneCode || formData.name || formData.remark
  }

  // 显示关闭确认对话框
  const showCloseConfirm = (onConfirm) => {
    ElMessageBox.confirm('内容尚未保存，确定要关闭吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'close-confirm-dialog'
    })
      .then(() => {
        if (onConfirm) onConfirm()
        else emit('update:modelValue', false)
      })
      .catch(() => {
        // 取消关闭
      })
  }

  // 重置表单
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    // 手动重置
    Object.keys(formData).forEach((key) => {
      formData[key] = ''
    })
  }
  //编辑时初始化表单数据
  const initFormData = (data) => {
    formData.id = data.id
    formData.industryCode = data.industryCode || ''
    formData.sceneCode = data.sceneCode || ''
    formData.name = data.name || ''
    formData.remark = data.remark || ''
    industryCodeChange(formData.industryCode)
  }
  // 暴露方法给父组件
  defineExpose({
    resetForm,
    initFormData
  })
</script>

<style scoped lang="scss"></style>
