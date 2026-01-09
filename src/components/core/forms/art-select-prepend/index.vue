<!-- 后面有需要再完善 -->
<template>
  <div class="select-prepend flex-c">
    <div class="label">
      <slot name="label"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
  .select-prepend {
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    .label {
      word-break: keep-all;
      padding: 0 20px;
      border-right: 1px solid var(--el-border-color);
      line-height: 36px;
      font-size: 14px;
      font-family:
        Source Han Sans SC,
        Source Han Sans SC-Regular;
      font-weight: 400;
      color: #303537;
    }
    :deep(.el-select) {
      .el-select__wrapper {
        border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base) 0;
        box-shadow: none;
      }
      .el-select__wrapper.is-focused {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
    }
  }
</style>
