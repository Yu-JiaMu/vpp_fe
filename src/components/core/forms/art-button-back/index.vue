<template>
  <div class="art-button-back text-g-5 text-lg font-scBold">
    <el-button class="icon-back" @click="goBack">
      <ArtSvgIcon icon="ri:arrow-left-line" class="text-g-5 text-lg" />
    </el-button>
    <slot />
  </div>
</template>

<script setup>
  const router = useRouter()

  const goBack = () => {
    router.back()
  }
</script>

<style lang="scss" scoped>
  .art-button-back {
    .icon-back {
      width: 29px;
      height: 40px;
      background: #ebecf1;
      border: 1px solid #eeeff1;
      border-radius: 6px;
    }
  }
</style>
