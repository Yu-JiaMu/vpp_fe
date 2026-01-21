<template>
  <div class="single-register bg-white">
    <!-- 第一步选择 -->
    <SingleCardList @next-step="nextStep" v-if="activeStep === 1" />
    <!-- 第二步表单 -->
    <SingleForm v-if="activeStep === 2" />
  </div>
</template>

<script setup>
  import SingleCardList from './single-card-List.vue'
  import SingleForm from './sigle-form.vue'
  const activeStep = ref(2)
  const nextStep = (e) => {
    console.log('进入第二步表单')
    activeStep.value = 2
  }
</script>

<style lang="scss" scoped>
  .single-register {
    background: #fff;
    padding: 30px;
  }
</style>
