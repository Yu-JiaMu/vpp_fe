<template>
  <div class="flex items-center justify-center w-full h-screen login" :class="{ dark: isMenuDark }">
    <AuthTopBar />
    <div class="relative flex login-con max-2xl:scale-85">
      <div class="left"></div>
      <div class="right relative px-[98px] dark:!bg-[#161615] dark:text-white">
        <img :src="logo" alt="" class="absolute logo" />
        <h4 class="title font-scBold">登录</h4>
        <el-form
          :model="form"
          ref="formRef"
          label-width="auto"
          class="w-full"
          :rules="rules"
          @keyup.enter="handleSubmit"
        >
          <el-form-item label="">
            <el-select
              v-model="form.tenant"
              class="h-8 dark:bg-transparent"
              placeholder="请选择"
              popper-class="tenant-select"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
              <template #prefix>
                <span class="text-g-4 dark:text-[#AFAFAF]">租户</span>
                <div class="mx-3 select-line"></div>
              </template>
            </el-select>
          </el-form-item>

          <template v-if="!isAccountLogin">
            <el-form-item prop="phone">
              <el-input v-model.trim="form.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item prop="code">
              <div class="w-full gap-10 flex-cb">
                <el-input v-model.trim="form.code" placeholder="请输入验证码" />
                <el-button
                  :type="codeButtonType"
                  :disabled="isCounting"
                  class="!h-11"
                  @click="sendCode"
                >
                  <template v-if="isCounting">{{ count }}s</template>
                  <template v-else>{{ codeButtonText }}</template>
                </el-button>
              </div>
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item prop="username">
              <el-input v-model.trim="form.username" placeholder="请输入账号" />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model.trim="form.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="off"
                show-password
              />
            </el-form-item>

            <el-form-item prop="code">
              <div class="items-center w-full gap-10 flex-cb">
                <el-input v-model.trim="form.code" class="flex-1" placeholder="请输入验证码" />
                <div class="captcha-img">
                  <img
                    v-if="codeImageUrl"
                    :src="codeImageUrl"
                    alt="captcha"
                    @click="fetchCaptcha"
                  />
                </div>
              </div>
            </el-form-item>
          </template>

          <div class="mt-2 text-sm flex-cb text-g-3">
            <ElCheckbox v-model="form.rememberPassword">
              <span class="dark:text-g-3">{{ $t('login.rememberPwd') }}</span>
            </ElCheckbox>
            <RouterLink class="" :to="{ name: 'ForgetPassword' }">
              {{ $t('login.forgetPwd') }}
            </RouterLink>
          </div>

          <div style="margin-top: 120px">
            <ElButton
              class="w-full !h-11"
              type="primary"
              @click="handleSubmit"
              :loading="loading"
              v-ripple
            >
              {{ $t('login.btnText') }}
            </ElButton>
          </div>
        </el-form>
      </div>
      <div class="absolute text-sm login-type dark:text-[#C7CAD2]" @click="toggleLoginType">
        <img class="absolute w-9 h-9" :src="iconLoginType" alt="" />
        {{ isAccountLogin ? '手机登录' : '账号登录' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/store/modules/setting'
  import { MenuThemeEnum } from '@/enums/appEnum'
  import darkLogo from '@/assets/images/login/dark-logo-icon.webp'
  import lightLogo from '@/assets/images/login/light-logo-icon.webp'
  import { ElNotification, ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { localStorage as appLocalStorage } from '@/utils/util'
  import { fetchLogin, fetchGetCaptcha } from '@/api/auth'
  import AppConfig from '@/config'
  import iconPhone from '@/assets/images/login/icon-mobile.webp'
  import iconAccount from '@/assets/images/login/icon-account.webp'
  import iconPhoneDark from '@/assets/images/login/icon-mobile-dark.webp'
  import iconAccountDark from '@/assets/images/login/icon-account-dark.webp'

  interface RuleForm {
    account: string
    phone: string
    code: string
    rememberPassword: boolean
    tenant: string
    username: string
    password: string
  }

  const settingStore = useSettingStore()
  const { getMenuTheme, isMenuDark } = storeToRefs(settingStore)
  const form = reactive({
    account: '',
    phone: '',
    code: '',
    rememberPassword: false,
    tenant: '',
    username: '',
    password: ''
  })
  const rules = reactive<FormRules<RuleForm>>({
    username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: ['blur'] }
    ],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  })

  const options = [
    {
      value: 'Option1',
      label: 'Option1'
    },
    {
      value: 'Option2',
      label: 'Option2'
    },
    {
      value: 'Option3',
      label: 'Option3'
    },
    {
      value: 'Option4',
      label: 'Option4'
    },
    {
      value: 'Option5',
      label: 'Option5'
    }
  ]

  const formRef = useTemplateRef<FormInstance>('formRef')
  const loading = ref(false)
  const isAccountLogin = ref(true)

  const REMEMBER_KEY = 'login_remember'

  // 初始化：如果曾记住过，填充表单
  try {
    const saved = appLocalStorage[REMEMBER_KEY]
    if (saved) {
      // saved 示例: { type: 'account'|'phone', username?, password?, phone? }
      if (saved.type === 'account') {
        form.username = saved.username || ''
        form.password = saved.password || ''
        form.rememberPassword = true
        isAccountLogin.value = true
      } else if (saved.type === 'phone') {
        form.phone = saved.phone || ''
        form.rememberPassword = true
        isAccountLogin.value = false
      }
    }
  } catch (e) {
    console.error('读取记住登录信息失败', e)
  }

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    // 表单验证
    const valid = await formRef.value.validate()
    if (!valid) return
    try {
      loading.value = true

      // 登录请求

      const params: any = { uuid: captchaUuid }
      if (isAccountLogin.value) {
        params.username = form.username
        params.password = form.password
        params.code = form.code
      } else {
        params.username = form.phone
        params.password = form.code
      }

      const { access_token: token, refreshToken } = await fetchLogin(params)

      // 验证token
      if (!token) {
        throw new Error('Login failed - no token received')
      }

      // 存储 token 和登录状态
      userStore.setToken(token, refreshToken)
      userStore.setLoginStatus(true)

      // 登录成功处理
      showLoginSuccessNotice()

      // 根据记住密码选项保存/删除登录信息
      const saveRemember = () => {
        try {
          if (form.rememberPassword) {
            if (isAccountLogin.value) {
              appLocalStorage[REMEMBER_KEY] = {
                type: 'account',
                username: form.username,
                password: form.password
              }
            } else {
              appLocalStorage[REMEMBER_KEY] = {
                type: 'phone',
                phone: form.phone
              }
            }
          } else {
            // 清除记住信息
            appLocalStorage[REMEMBER_KEY] = undefined
          }
        } catch (e) {
          console.error('保存记住信息失败', e)
        }
      }

      saveRemember()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      console.error('[Login] Unexpected error:', error)
      if (isAccountLogin.value) {
        form.code = ''
        fetchCaptcha()
      }
    } finally {
      loading.value = false
    }
  }

  const logo = computed(() =>
    getMenuTheme.value.theme === MenuThemeEnum.DARK ? darkLogo : lightLogo
  )

  const iconLoginType = computed(() => {
    if (isMenuDark.value) {
      return isAccountLogin.value ? iconPhoneDark : iconAccountDark
    }
    return isAccountLogin.value ? iconPhone : iconAccount
  })

  const loginBackgroundImg1 = computed(() => {
    const img = isMenuDark.value
      ? new URL('@/assets/images/login/bg1-dark.webp', import.meta.url).href
      : new URL('@/assets/images/login/bg1-light.webp', import.meta.url).href
    return `url(${img})`
  })

  const loginBackgroundImg2 = computed(() => {
    const img = isMenuDark.value
      ? new URL('@/assets/images/login/bg2-dark.webp', import.meta.url).href
      : new URL('@/assets/images/login/bg2-light.webp', import.meta.url).href
    return `url(${img})`
  })

  watch(
    isMenuDark,
    (newVal, oldVal) => {
      if (newVal) {
        document.documentElement.setAttribute('class', 'dark')
      } else {
        document.documentElement.setAttribute('class', '')
      }
    },
    {
      immediate: true
    }
  )

  const systemName = AppConfig.systemInfo.name

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: '登录成功',
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `欢迎回来, ${userStore.info.userName}!`
      })
    }, 1000)
  }

  // 发送验证码与倒计时
  const INITIAL_COUNT = 60
  const count = ref(INITIAL_COUNT)
  const isCounting = ref(false)
  const codeButtonText = ref('发送验证码')
  const codeButtonType = ref<'primary' | 'danger'>('primary')
  const codeImageUrl = ref('')
  let timer: number | null = null

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const startCount = () => {
    isCounting.value = true
    count.value = INITIAL_COUNT
    codeButtonType.value = 'primary'
    timer = window.setInterval(() => {
      count.value -= 1
      if (count.value <= 0) {
        clearTimer()
        isCounting.value = false
        codeButtonText.value = '重新发送'
        codeButtonType.value = 'danger'
      }
    }, 1000)
  }

  let captchaUuid = ''
  const fetchCaptcha = async () => {
    const { img, uuid } = await fetchGetCaptcha()
    codeImageUrl.value = `data:image/gif;base64,${img}`
    captchaUuid = uuid
  }

  const sendCode = async () => {
    if (!form.phone) {
      ElMessage({ message: '请输入手机号', type: 'warning' })
      return
    }

    // 如果正在倒计时中，直接返回
    if (isCounting.value) return

    try {
      // TODO: 调用后端发送短信验证码接口，例如: await request.post('/api/auth/send-code', { phone: form.phone })
      startCount()
      ElMessage({ message: '验证码已发送', type: 'success' })
    } catch (err) {
      ElMessage({ message: String(err || '发送验证码失败'), type: 'error' })
    }
  }

  const toggleLoginType = () => {
    isAccountLogin.value = !isAccountLogin.value
    /*     // 重置表单字段与按钮状态
    count.value = INITIAL_COUNT
    isCounting.value = false
    codeButtonText.value = '发送验证码'
    codeButtonType.value = 'primary' */
  }

  onMounted(() => {
    isAccountLogin.value && fetchCaptcha()
  })

  onUnmounted(() => {
    clearTimer()
    document.documentElement.setAttribute('class', '')
  })
</script>

<!-- <style lang="scss">
  .tenant-select.el-select__popper:not(.el-tree-select__popper) {
    --select-option-hover: #1f2126;

    .el-select-dropdown__list .el-select-dropdown__item:hover {
      background-color: var(--select-option-hover) !important;
    }
  }
</style> -->
<style lang="scss" scoped>
  .login {
    --gray-divider-line: #e5e6ec;

    background: url('@/assets/images/login/bg1-light.webp') no-repeat center/cover;
    background-image: v-bind(loginBackgroundImg1);
    .login-con {
      width: calc(560px * 2);
      .left {
        width: 560px;
        height: 750px;
        background: url('@/assets/images/login/bg2-light.webp') no-repeat center/cover;
        background-image: v-bind(loginBackgroundImg2);
      }

      .right {
        width: 560px;
        height: 750px;
        background-color: var(--art-color);
        border-radius: 0px 6px 6px 0px;
        .logo {
          top: -35px;
          left: 98px;
          width: 109px;
          height: 125px;
        }
        .title {
          margin-top: 146px;
          margin-bottom: 37px;
          font-size: 30px;
        }
        .select-line {
          width: 1px;
          height: 20px;
          background-color: var(--gray-divider-line);
        }
        :deep(.el-select--default .el-select__wrapper) {
          min-height: 32px !important;
        }
        :deep(.el-input) {
          height: 44px !important;
        }
      }

      .login-type {
        right: -56px;
        width: 36px;
        height: 124px;
        padding-top: 32px;
        border-radius: 36px;
        background-color: var(--art-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        writing-mode: vertical-rl;
        text-orientation: upright;
        &:hover {
          color: #52eff4 !important;
        }
        img {
          top: 0;
        }
      }
      .captcha-img {
        width: 128px;
        height: 44px;
        // background: rgba(0, 0, 0, 0);
        // border-radius: 8px;
        cursor: pointer;
        object-fit: contain;
        // border: 1px solid red;
        img {
          height: inherit;
          width: inherit;
        }
      }
    }
  }
</style>
