<template>
  <div
    class="art-button-back relative text-g-5 text-lg font-scBold w-fit"
    :class="{ 'is-back': isBack }"
  >
    <el-button class="icon-back mr-2.5" @click="goBack">
      <ArtSvgIcon icon="ri:arrow-left-line" class="text-g-5 text-lg" />
    </el-button>
    <slot />
  </div>
</template>

<script setup>
  const router = useRouter()
  defineProps({
    isBack: {
      type: Boolean,
      default: false
    }
  })

  const goBack = () => {
    router.back()
  }
</script>

<style lang="scss" scoped>
  .art-button-back {
    padding: 4px 15px 4px 0;
    border-radius: 6px;
    .icon-back {
      width: 29px;
      height: 40px;
      background: #ebecf1;
      border: 1px solid #eeeff1;
      border-radius: 6px;
    }
    &.is-back {
      background: #ebecf1;
      cursor: pointer;
      .icon-back {
        &::after {
          content: '';
          position: absolute;
          width: 2px;
          height: 16px;
          background-color: #afb2b8;
          left: 33px;
          margin: auto 0;
          margin-right: 15px;
        }
      }
    }
  }
</style>
