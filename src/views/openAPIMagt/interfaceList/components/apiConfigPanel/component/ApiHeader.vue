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
    max-width: 100%;
    min-height: 24px;
    font-size: 16px;
    font-family: Source Han Sans SC, Source Han Sans SC-Bold;
    font-weight: 700;
    text-align: left;
    color: #303537;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.4;
    margin: 0;
  }

  .api-desc {
    max-width: 100%;
    min-height: 20px;
    font-size: 14px;
    font-family: Source Han Sans SC, Source Han Sans SC-Regular;
    font-weight: 400;
    text-align: left;
    color: #505658;
    line-height: 1.6;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    margin: 8px 0 0 0;
  }
}
</style>
