<template>
  <div class="api-header">
    <h2 class="api-title">{{ apiInfo.title }}</h2>
    <p class="api-desc">{{ apiInfo.desc }}</p>
  </div>
</template>

<script setup>
defineProps({
  apiInfo: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      desc: ''
    })
  }
})
</script>

<style lang="scss" scoped>
.api-header {
  flex-shrink: 0;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;

  .api-title {
    width: 111px;
    height: 24px;
    font-size: 16px;
    font-family: Source Han Sans SC, Source Han Sans SC-Bold;
    font-weight: 700;
    text-align: left;
    color: #303537;
  }

  .api-desc {
    width: 280px;
    height: 20px;
    font-size: 14px;
    font-family: Source Han Sans SC, Source Han Sans SC-Regular;
    font-weight: 400;
    text-align: left;
    color: #505658;
    line-height: 16px;
  }
}
</style>
