<!-- 系统logo -->
<template>
  <div class="flex-cc">
    <img :style="logoStyle" :src="logo" alt="logo" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/store/modules/setting'
  import { MenuThemeEnum } from '@/enums/appEnum'
  import darkLogo from '@/assets/images/common/dark-logo.png'
  import lightLogo from '@/assets/images/common/light-logo.png'

  defineOptions({ name: 'ArtLogo' })

  interface Props {
    /** logo 大小 */
    size?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 38
  })

  const settingStore = useSettingStore()
  const { getMenuTheme } = storeToRefs(settingStore)
  const logo = computed(() =>
    getMenuTheme.value.theme === MenuThemeEnum.DARK ? lightLogo : darkLogo
  )

  const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
