<template>
  <el-button class="flex-cc" text>
    <img src="~@/assets/images/deviceAccess/1.png" style="width: 20px; height: 20px" class="mr5" />
    <span><slot /></span>
  </el-button>
</template>

<script setup></script>

<style lang="scss" scoped>
  .el-button.is-text {
    color: var(--art-gray-4);
    padding-left: 4px;
    padding-right: 4px;
  }
</style>
