<template>
  <div
    class="relative text-base art-button-back text-g-5 font-scBold w-fit flex-cc"
    :class="{ 'is-back': isBack }"
    @click="fullBack"
  >
    <el-button class="icon-back mr-2.5" @click.stop="goBack">
      <ArtSvgIcon icon="ri:arrow-left-line" class="text-lg text-g-5" />
    </el-button>
    <span> <slot /></span>
  </div>
</template>

<script setup>
  const router = useRouter()
  const props = defineProps({
    isBack: {
      type: Boolean,
      default: false
    }
  })

  const goBack = () => {
    router.back()
  }
  const fullBack = () => {
    if (!props.isBack) return
    goBack()
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
