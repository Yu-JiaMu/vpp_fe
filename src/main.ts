import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import language from './locales'                    // 国际化
// import '@/assets/styles/zhu-app.scss'
import '@styles/core/tailwind.css'                  // tailwind
import '@styles/index.scss'                         // 样式
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
import '@/assets/styles/hu-common.scss'
import '@/assets/styles/common.scss'
import '@/assets/styles/core/font.css'
document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
initStore(app)
initRouter(app)
setupGlobDirectives(app)
setupErrorHandle(app)

app.use(language)
app.mount('#app')