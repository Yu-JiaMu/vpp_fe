<template>
  <!-- 主弹窗组件 -->
  <el-dialog
    v-model="dialogVisible"
    title="新增产品品类"
    width="600px"
    :close-on-click-modal="false"
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
        <el-form-item label="行业" prop="industry" class="form-item-required">
          <el-select v-model="formData.industry" placeholder="请选择" clearable class="full-width">
            <el-option
              v-for="item in industryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 场景选择 -->
        <el-form-item label="场景" prop="scene" class="form-item-required">
          <el-select v-model="formData.scene" placeholder="请选择" clearable class="full-width">
            <el-option
              v-for="item in sceneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 产品品类输入 -->
        <el-form-item label="产品品类" prop="category" class="form-item-required">
          <el-input
            v-model="formData.category"
            placeholder="请输入产品品类名称"
            clearable
            class="full-width"
          />
        </el-form-item>

        <!-- 描述文本域 -->
        <el-form-item label="描述" prop="description" class="description-item">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入产品品类说明"
            maxlength="99"
            show-word-limit
            class="full-width"
          />
        </el-form-item>
      </el-form>
    </div>
    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn-width-177" @click="handleCancel">取消</el-button>
        <el-button class="btn-width-177" type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'

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
    industry: '',
    scene: '',
    category: '',
    description: ''
  })

  // 表单验证规则
  const formRules = {
    industry: [{ required: true, message: '请选择行业', trigger: 'change' }],
    scene: [{ required: true, message: '请选择场景', trigger: 'change' }],
    category: [
      { required: true, message: '请输入产品品类名称', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    description: [{ max: 99, message: '不能超过 99 个字符', trigger: 'blur' }]
  }

  // 选项数据
  const industryOptions = [
    { label: '制造业', value: 'manufacturing' },
    { label: '零售业', value: 'retail' },
    { label: '金融业', value: 'finance' },
    { label: '医疗健康', value: 'healthcare' },
    { label: '教育行业', value: 'education' }
  ]

  const sceneOptions = [
    { label: '生产场景', value: 'production' },
    { label: '仓储场景', value: 'warehouse' },
    { label: '销售场景', value: 'sales' },
    { label: '服务场景', value: 'service' },
    { label: '管理场景', value: 'management' }
  ]

  // 计算描述字数
  const descriptionCount = computed(() => {
    return formData.description?.length || 0
  })

  // 监听弹窗打开状态
  watch(
    () => props.modelValue,
    (newVal) => {
      if (!newVal) {
        // 弹窗关闭时重置表单
        resetForm()
      }
    }
  )

  // 监听描述变化
  watch(
    () => formData.description,
    (newVal) => {
      if (newVal && newVal.length > 99) {
        formData.description = newVal.substring(0, 99)
      }
    }
  )

  // 表单提交处理
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 表单验证通过
      console.log('表单数据:', JSON.stringify(formData, null, 2))

      // 提交成功提示
      ElMessage({
        message: '提交成功',
        type: 'success',
        duration: 2000
      })

      // 触发成功事件
      emit('success', { ...formData })

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
    return formData.industry || formData.scene || formData.category || formData.description
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
    } else {
      // 手动重置
      Object.keys(formData).forEach((key) => {
        formData[key] = ''
      })
    }
  }

  // 暴露方法给父组件
  defineExpose({
    resetForm
  })
</script>

<style scoped lang="scss">
  .dialog-footer {
    display: flex;
    justify-content: center;
  }
  .btn-width-177 {
    width: 177px;
  }
</style>
