<template>
  <el-dialog
      v-model="visible"
      title="提示"
      width="700px"
      :close-on-click-modal="false"
      :show-close="false"
      :close-on-press-escape="false"
      align-center
  >
    <div class="secret-dialog-content">
      <p class="tip-title">您的应用“<span class="app-name-bold">{{ appName }}</span>”已成功创建，现为您生成应用密钥。</p>
      <p class="tip-warning">注意：此密钥仅展示一次，关闭后将无法再次查看，请妥善保存。</p>

      <div class="secret-item">
        <span class="secret-label">Key：</span>
        <span class="secret-value">{{ appKey }}</span>
        <el-button type="primary" link @click="handleCopy('key')">复制</el-button>
      </div>

      <div class="secret-item">
        <span class="secret-label">Secret：</span>
        <span class="secret-value">{{ appSecret }}</span>
        <el-button type="primary" link @click="handleCopy('secret')">复制</el-button>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer flex flex-sp-center">
        <el-button type="primary" class="btn-width-177" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  appName: {
    type: String,
    default: ''
  },
  appKey: {
    type: String,
    default: ''
  },
  appSecret: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 复制
const handleCopy = async (type) => {
  const text = type === 'key' ? props.appKey : props.appSecret
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 关闭
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.secret-dialog-content {
  padding: 10px 0;

  // 应用名称加粗
  .app-name-bold {
    font-size: 20px;
    font-weight: bold;
  }

  .tip-title {
    font-size: 18px;
    color: #050505;
    margin: 0 0 10px 0;
  }

  .tip-warning {
    font-size: 16px;
    color: #ef0427;
    margin: 0 0 30px 0;
  }

  .secret-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;

    .secret-label {
      font-size: 18px;
      color: #050505;
      font-weight: bold;
      min-width: 60px;
    }

    .secret-value {
      font-size: 16px;
      color: #050505;
      flex: 1;
      word-break: break-all;
    }
  }
}
</style>
