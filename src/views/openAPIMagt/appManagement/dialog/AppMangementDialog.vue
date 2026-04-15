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
            <el-select v-model="formData.validityPeriod" placeholder="请选择" clearable @change="handleValidityChange">
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
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleEndTimeChange"
                :disabled-date="disabledEndDate"
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
import * as productCategoryApi from '@/api/iot/productCategory.js'
import { APP_STATUS, VALIDITY_PERIOD } from "@/enums/index.js";
import AppSecretDialog from "@views/openAPIMagt/appManagement/dialog/AppSecretDialog.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'add-success'])

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
  switch (val) {
    case VALIDITY_PERIOD.map.LONG_TERM.value:
      formData.endTime = '2029-12-31'
      break
    case VALIDITY_PERIOD.map.THREE_YEARS.value:
      now.setFullYear(now.getFullYear() + 3)
      formData.endTime = now.toISOString().split('T')[0]
      break
    case VALIDITY_PERIOD.map.ONE_YEAR.value:
      now.setFullYear(now.getFullYear() + 1)
      formData.endTime = now.toISOString().split('T')[0]
      break
    case VALIDITY_PERIOD.map.THREE_MONTHS.value:
      now.setMonth(now.getMonth() + 3)
      formData.endTime = now.toISOString().split('T')[0]
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

const industryOptions = ref([])
const sceneOptions = ref([])

async function getIndustryList() {
  const res = await productCategoryApi.apiGetIndustryList()
  industryOptions.value = res.map(item => ({
    label: item.label,
    value: item.code,
    children: item.children || []
  }))
}

function industryCodeChange(e) {
  if (e) {
    formData.sceneCode = ''
    const children = industryOptions.value.find(i => i.value === e)?.children || []
    sceneOptions.value = children.map(i => ({ label: i.label, value: i.code }))
  } else {
    sceneOptions.value = []
    formData.sceneCode = ''
  }
}

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  } else {
    getIndustryList()
  }
})

/**
 * @Description 确认新增应用调用接口
 * @author Huang Jialin
 * @date 2026/4/14 17:01
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()

    // todo 调用新增接口，返回key和secret
    console.log("提交数据", { ...formData })

    // 模拟生成密钥
    generateKeys()

    // 打开密钥弹窗
    secretDialogVisible.value = true

    ElMessage.success('提交成功')
    // emit('addSuccess', { ...formData })
  } catch (e) {
    console.log('验证失败', e)
  }
}

/**
 * @Description 模拟生成密钥对接可以删除
 * @author Huang Jialin
 * @date 2026/4/14 17:01
 */
// 生成随机密钥（真实项目由后端返回）
const generateKeys = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = ''
  let secret = ''
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  appKey.value = 'AKID' + key
  appSecret.value = secret
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

const initFormData = (data) => {
  formData.id = data.id || ''
  formData.appStatus = data.appStatus || 'enable'
  formData.appName = data.appName || ''
  formData.validityPeriod = data.validityPeriod || ''
  formData.endTime = data.endTime || ''
  formData.remark = data.remark || ''
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
