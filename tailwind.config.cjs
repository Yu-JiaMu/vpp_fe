/** @type {import('tailwindcss').Config} */

module.exports = {
  corePlugins: {
    // 禁用 Tailwind 的全局基本样式
    preflight: false
  },
  content: ["./index.html", "./src/components/**/*.{vue,js,ts,jsx,tsx}", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {
      width: {
        dvw: "100dvw"
      },
      height: {
        dvh: "100dvh",
        "100%": "100%",
        "100vh": "100vh"
      },
      colors: {
        "#D5B887": "#D5B887"
      },
      fontFamily: {
        hkRegular: ["HKGrotesk-Regular"],
        hkBold: ["HKGrotesk-Bold"],
        hkBoldLegacy: ["HKGrotesk-BoldLegacy"],
        hkBoldItalic: ["HKGrotesk-BoldItalic"],
        hkMedium: ["HKGrotesk-Medium"],
        hkMediumLegacy: ["HKGrotesk-MediumLegacy"],
        hkSemiBold: ["HKGrotesk-SemiBold"],
        timesBold: ["Times-Bold"],
        hkMedium: ["HKGrotesk-Medium"],
        hkSemiBoldLegacy: ["font-hkSemiBoldLegacy"]
      },
      fontSize: {
        12: "12px",
        13: "13px",
        14: ["14px", "20px"],
        15: "15px",
        16: ["16px", "24px"],
        17: "17px",
        18: "18px",
        19: "19px",
        20: ["20px", "28px"],
        21: "21px",
        22: "22px"
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
};
