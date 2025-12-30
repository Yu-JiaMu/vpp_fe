<!-- 授权页右上角组件 -->
<template>
  <div class="absolute w-full flex justify-end top-4.5 z-10">
    <div
      v-if="shouldShowThemeToggle"
      class="w-8 h-8 mr-2 btn theme-btn c-p flex-cc tad-300"
      @click="settingStore.toggleMenuThemeColor"
    >
      <ArtSvgIcon
        :icon="isMenuDark ? 'ri:sun-fill' : 'ri:moon-line'"
        class="text-xl transition-colors duration-300 text-g-800"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'
  import { useHeaderBar } from '@/hooks/core/useHeaderBar'
  import { themeAnimation } from '@/utils/ui/animation'
  import { languageOptions } from '@/locales'
  import { LanguageEnum } from '@/enums/appEnum'
  import AppConfig from '@/config'

  defineOptions({ name: 'AuthTopBar' })

  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const { isDark, systemThemeColor, isMenuDark } = storeToRefs(settingStore)
  const { shouldShowThemeToggle, shouldShowLanguage } = useHeaderBar()
  const { locale } = useI18n()

  const mainColors = AppConfig.systemMainColor
  const color = systemThemeColor // css v-bind 使用

  const changeLanguage = (lang: LanguageEnum) => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
  }

  const changeThemeColor = (color: string) => {
    if (systemThemeColor.value === color) return
    settingStore.setElementTheme(color)
    settingStore.reload()
  }
</script>

<style scoped>
  .color-dots {
    pointer-events: none;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 12px var(--art-gray-300);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    transform: translateX(10px);
  }

  .color-dot {
    box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: calc(var(--index) * 0.05s);
    transform: translateX(20px) scale(0.8);
  }

  .color-dot:hover {
    box-shadow: 0 4px 8px rgb(0 0 0 / 20%);
    transform: translateX(0) scale(1.1);
  }

  .color-picker-expandable:hover .color-dots {
    pointer-events: auto;
    opacity: 1;
    transform: translateX(0);
  }

  .color-picker-expandable:hover .color-dot {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  .dark .color-dots {
    background-color: var(--art-gray-200);
    box-shadow: none;
  }

  .color-picker-expandable:hover .palette-btn :deep(.art-svg-icon) {
    color: v-bind(color);
  }
</style>
