<template>
  <div class="multiple-register bg-white">
    <!-- 第一步选择 -->
    <MultipleCardList @next-step="nextStep" v-if="activeStep === 1" />
    <!-- 第二步表单 -->
    <MultipleFileUpload v-if="activeStep === 2" />
  </div>
</template>

<script setup>
  import MultipleCardList from './multiple-card-List.vue'
  import MultipleFileUpload from './multiple-file-upload.vue'
  const activeStep = ref(1)
  const nextStep = (e) => {
    activeStep.value = 2
  }
</script>

<style lang="scss" scoped>
  .multiple-register {
    padding: 30px;
  }
</style>
