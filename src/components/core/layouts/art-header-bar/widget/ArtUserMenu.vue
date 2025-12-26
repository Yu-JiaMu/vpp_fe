<!-- 用户菜单 -->
<template>
  <!-- <div class="user-info flex items-center"> </div> -->
  <ElPopover
    ref="userMenuPopover"
    placement="bottom-end"
    width="auto"
    :hide-after="0"
    :offset="10"
    trigger="hover"
    :show-arrow="true"
    popper-class="user-menu-popover"
    popper-style="padding: 5px 16px;"
  >
    <template #reference>
      <div class="user-info flex items-center">
        <img
          class="size-5 mr-2.5 c-p rounded-full max-sm:w-6.5 max-sm:h-6.5 max-sm:mr-[16px]"
          src="@imgs/user/avatar.webp"
          alt="avatar"
        />
        <span class="user-name max-w-24 truncate"> {{ userInfo.userName }} </span>
        <ArtSvgIcon icon="ri:more-2-fill" class="ml-5" />
      </div>
    </template>

    <template #default>
      <div class="">
        <ul class="py-2">
          <li class="btn-item user-name" @click="goPage('/system/user-center')">
            <img class="w-5 h-5 mr-1" src="@/assets/images/icon/icon-user-center.png" alt="" />
            <span>{{ $t('topBar.user.userCenter') }}</span>
          </li>
        </ul>
        <div class="log-out user-name c-p flex items-center p-2" @click="loginOut">
          <img class="w-5 h-5 mr-1" src="@/assets/images/icon/icon-logout.png" alt="" />
          {{ $t('topBar.user.logout') }}
        </div>
      </div>
    </template>
  </ElPopover>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { WEB_LINKS } from '@/utils/constants'
  import { mittBus } from '@/utils/sys'

  defineOptions({ name: 'ArtUserMenu' })

  const router = useRouter()
  const { t } = useI18n()
  const userStore = useUserStore()

  const { getUserInfo: userInfo } = storeToRefs(userStore)
  const userMenuPopover = ref()

  /**
   * 页面跳转
   * @param {string} path - 目标路径
   */
  const goPage = (path: string): void => {
    router.push(path)
  }

  /**
   * 打开文档页面
   */
  const toDocs = (): void => {
    window.open(WEB_LINKS.DOCS)
  }

  /**
   * 打开 GitHub 页面
   */
  const toGithub = (): void => {
    window.open(WEB_LINKS.GITHUB)
  }

  /**
   * 打开锁屏功能
   */
  const lockScreen = (): void => {
    mittBus.emit('openLockScreen')
  }

  /**
   * 用户登出确认
   */
  const loginOut = (): void => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm(t('common.logOutTips'), t('common.tips'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'login-out-dialog'
      }).then(() => {
        userStore.logOut()
      })
    }, 200)
  }

  /**
   * 关闭用户菜单弹出层
   */
  const closeUserMenu = (): void => {
    setTimeout(() => {
      userMenuPopover.value.hide()
    }, 100)
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  @layer components {
    .btn-item {
      @apply flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0;

      span {
        @apply text-sm;
      }

      .art-svg-icon {
        @apply mr-2 text-base;
      }

      &:hover {
        background-color: var(--art-gray-200);
      }
    }
  }

  .log-out {
    @apply transition-all
    duration-200
    hover:shadow-xl;
  }
</style>

<style scoped lang="scss">
  .user-name {
    font-size: 13px;
    font-weight: 400;
    text-align: left;
    color: var(--art-gray-4);
    line-height: 20px;
  }

  .log-out {
    background: #1f2126;
    border-radius: 5px;
    color: #ffffff;
  }
</style>
