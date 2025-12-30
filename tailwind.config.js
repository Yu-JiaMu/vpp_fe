/** @type {import('tailwindcss').Config} */

module.exports = {
  corePlugins: {
    // 禁用 Tailwind 的全局基本样式
    preflight: false
  },
  content: [
    './index.html',
    './src/components/**/*.{vue,js,ts,jsx,tsx}',
    './src/**/*.{js,jsx,ts,tsx,vue}'
  ],
  theme: {
    extend: {
      width: {
        dvw: '100dvw'
      },
      height: {
        dvh: '100dvh',
        '100%': '100%',
        '100vh': '100vh'
      },
      colors: {
        '#D5B887': '#D5B887',
        'g-1': 'var(--art-gray-1)',
        'g-2': 'var(--art-gray-2)',
        'g-3': 'var(--art-gray-3)',
        'g-4': 'var(--art-gray-4)',
        'g-5': 'var(--art-gray-5)'
      },
      fontFamily: {
        hkRegular: ['HKGrotesk-Regular'],
        hkBold: ['HKGrotesk-Bold'],
        hkBoldLegacy: ['HKGrotesk-BoldLegacy'],
        hkBoldItalic: ['HKGrotesk-BoldItalic'],
        hkMedium: ['HKGrotesk-Medium'],
        hkMediumLegacy: ['HKGrotesk-MediumLegacy'],
        hkSemiBold: ['HKGrotesk-SemiBold'],
        timesBold: ['Times-Bold'],
        hkSemiBoldLegacy: ['font-hkSemiBoldLegacy'],
        scRegular: ['Source Han Sans SC-Regular'],
        scMedium: ['Source Han Sans SC-Medium'],
        scLight: ['Source Han Sans SC-Light'],
        scBold: ['Source Han Sans SC-Bold']
      },
      fontWeight: {
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500,
        600: 600,
        700: 700,
        800: 800,
        900: 900
      }
    },

    container: {
      center: true
    }
  }
}
