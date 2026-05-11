<template>
  <div class="api-footer">
    <el-button @click="$emit('clear')" class="clean-btn-md">
      <span class="front-style">
        {{ buttonText.clear }}
      </span>
    </el-button>
    <el-button type="primary" @click="$emit('submit')" class="save-btn-md">
      <span class="front-style">{{ buttonText.submit }}</span>
    </el-button>
  </div>
</template>

<script setup>
  defineProps({
    buttonText: {
      type: Object,
      required: true,
      default: () => ({
        clear: '清空',
        submit: '发起调用'
      })
    }
  })

  defineEmits(['clear', 'submit'])
</script>

<style lang="scss" scoped>
  .api-footer {
    flex-shrink: 0;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;

    .clean-btn-md {
      .front-style {
        width: 28px;
        font-size: 14px;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Regular;
        font-weight: 400;
        text-align: left;
        color: #767c80;
      }
      width: 76px;
      height: 32px;
      border-color: #ffffff;
      background: #f6f7f9;
      border-radius: 6px;
    }

    .save-btn-md {
      .front-style {
        width: 56px;
        font-size: 14px;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Regular;
        font-weight: 400;
        text-align: left;
        color: #131617;
      }
      width: 76px;
      height: 32px;
      background: #ebf4ff;
      border-radius: 6px;
      border-color: #ffffff;
    }
  }
</style>
