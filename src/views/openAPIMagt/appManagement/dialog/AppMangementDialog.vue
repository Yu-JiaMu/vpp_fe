<template>
  <!-- 主弹窗组件 -->
  <el-dialog
    v-model="dialogVisible"
    :title="formData.id ? '编辑应用' : '新增应用'"
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
        <el-form-item label="应用编号" prop="id" >
          <el-input
              v-model="formData.id"
              placeholder="请输入应用编号"
              clearable
              :disabled="true"
          />
        </el-form-item>
        <el-form-item label="状态" prop="appStatus" >
          <el-select
            v-model="formData.appStatus"
            placeholder="请选择"
            clearable
            :disabled="formData.id !== ''"
          >
            <el-option
              v-for="item in APP_STATUS.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="应用名称" prop="appName" >
          <el-input
              v-model="formData.appName"
              placeholder="请输入应用名称"
              clearable
          />
        </el-form-item>
        <el-form-item label="有效期" prop="endTime">
          <div class="validity-box">
            <el-select :disabled="formData.id !== ''" v-model="formData.validityPeriod" placeholder="请选择" clearable @change="handleValidityChange">
              <el-option
                  v-for="item in VALIDITY_PERIOD.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
            <el-date-picker
                v-model="formData.endTime"
                type="date"
                placeholder="请选择到期日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="handleEndTimeChange"
                :disabled-date="disabledEndDate"
                :disabled="formData.id !== ''"
            />
          </div>
        </el-form-item>
        <!-- 描述文本域 -->
        <el-form-item label="描述" prop="remark" class="description-item">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入产品品类说明"
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
                   :loading="loading"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
  <AppSecretDialog
      v-model="secretDialogVisible"
      :app-name="formData.appName"
      :app-key="appKey"
      :app-secret="appSecret"
      @close-dialog="handleCloseDialog"
  />
</template>

<script setup>
import { validateNameLength, validateCommon, validateDescLength } from '@/utils'
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { APP_STATUS, VALIDITY_PERIOD } from "@/enums/index.js";
import AppSecretDialog from "@views/openAPIMagt/appManagement/dialog/AppSecretDialog.vue";
import * as api from '@/api/iot'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

// loading 状态
const loading = ref(false)
const emit = defineEmits(['update:modelValue', 'add-success', 'edit-success'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const formData = reactive({
  id: '',
  appStatus: 'enable',
  appName: '',
  validityPeriod: '',
  endTime: '',
  remark: ''
})

const secretDialogVisible = ref(false)
const appKey = ref('')
const appSecret = ref('')

const formRules = {
  endTime: [{ required: true, message: '请选择到期时间', trigger: 'change' }],
  appName: [
    { required: true, trigger: 'blur', message: '请输入应用名称' },
    { validator: validateCommon, trigger: 'blur' },
    { validator: validateNameLength, trigger: 'blur' }
  ],
  remark: [{ validator: validateDescLength, trigger: 'blur' }]
}

/**
 * @Description 有效期选择变化
 * @author Huang Jialin
 * @date 2026/4/14 16:33
 */
const handleValidityChange = (val) => {
  const now = new Date()
  // 定义格式化函数：将日期对象转为 "YYYY-MM-DD 00:00:00" 格式
  const formatEndTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // 月份补0
    const day = String(date.getDate()).padStart(2, '0') // 日期补0
    return `${year}-${month}-${day} 00:00:00`
  }

  switch (val) {
    case VALIDITY_PERIOD.map.LONG_TERM.value:
      formData.endTime = '2029-12-31 00:00:00'
      break
    case VALIDITY_PERIOD.map.THREE_YEARS.value:
      now.setFullYear(now.getFullYear() + 3)
      formData.endTime = formatEndTime(now) // 统一格式
      break
    case VALIDITY_PERIOD.map.ONE_YEAR.value:
      now.setFullYear(now.getFullYear() + 1)
      formData.endTime = formatEndTime(now) // 统一格式
      break
    case VALIDITY_PERIOD.map.THREE_MONTHS.value:
      now.setMonth(now.getMonth() + 3)
      formData.endTime = formatEndTime(now) // 统一格式
      break
    case VALIDITY_PERIOD.map.CUSTOMIZABLE.value:
      formData.endTime = ''
      break
    default:
      formData.endTime = ''
  }
}

/**
 * @Description 手动改日期 → 自动切为自定义
 * @author Huang Jialin
 * @date 2026/4/14 16:33
 */
const handleEndTimeChange = () => {
  if (formData.validityPeriod && formData.validityPeriod !== VALIDITY_PERIOD.map.CUSTOMIZABLE.value) {
    formData.validityPeriod = VALIDITY_PERIOD.map.CUSTOMIZABLE.value
  }
}

/**
 * @Description 禁用今天之前的日期
 * @author Huang Jialin
 * @date 2026/4/14 16:35
 */
const disabledEndDate = (time) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time.getTime() < today.getTime()
}

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

/**
 * @Description 确认新增应用调用接口
 * @author Huang Jialin
 * @date 2026/4/14 17:01
 */
const handleSubmit = async () => {
  // 防止重复提交
  if (loading.value) {
    return
  }

  if (!formRef.value) return
  try {
    await formRef.value.validate()

    // 开启 loading
    loading.value = true

    if (formData.id) {
      // 编辑逻辑
      await api.updateApiApplication({ ...formData })
      dialogVisible.value = false;
      emit('edit-success')
      ElMessage.success('修改成功')
    } else {
      // 新增逻辑
      const res = await api.addApiApplication({ ...formData })
      appKey.value = res.appKey
      appSecret.value = res.appSecret
      secretDialogVisible.value = true
      ElMessage.success('提交成功')
    }
  } catch (e) {
    console.log('验证失败', e)
    // 补充：表单验证失败时提示用户
    ElMessage.error('表单填写有误，请检查')
  } finally {
    // 关闭 loading
    loading.value = false
  }
}

const handleCancel = () => {
  if (isFormDirty()) {
    showCloseConfirm()
  } else {
    emit('update:modelValue', false)
  }
}
/**
 * @Description 关闭弹窗
 * @author Huang Jialin
 * @date 2026/4/15 10:23
 */
const handleCloseDialog = () => {
  emit('add-success')
}

const isFormDirty = () => {
  return formData.appName || formData.remark || formData.endTime
}

const showCloseConfirm = (onConfirm) => {
  ElMessageBox.confirm('内容尚未保存，确定要关闭吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (onConfirm) onConfirm()
    else emit('update:modelValue', false)
  }).catch(() => {})
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  Object.keys(formData).forEach(key => { formData[key] = '' })
  formData.appStatus = 'enable'
}

/**
 * @Description 编辑页面初始化数据
 * @author Huang Jialin
 * @date 2026/4/15 11:27
 */
const initFormData = (data) => {
  if (!data) return // 空值兜底
  formData.id = data.id || ''
  formData.appStatus = data.appStatus || 'enable'
  formData.appName = data.appName || ''
  formData.endTime = data.endTime || ''
  formData.remark = data.remark || ''
  formData.validityPeriod = data.validityPeriod || VALIDITY_PERIOD.map.LONG_TERM.value
}

defineExpose({ resetForm, initFormData })
</script>

<style scoped lang="scss">
.validity-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  :deep(.el-select) {
    width: 120px !important;
  }
  :deep(.el-date-picker) {
    flex: 1 !important;
    width: auto !important;
  }
}
</style>
