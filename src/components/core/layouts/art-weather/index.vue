<template>
  <div class="art-weather flex items-center">
    <img class="size-4 mr-1" src="@/assets/images/weather/sun.png" alt="" />
    <span class="weather">26°</span>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
  .art-weather {
    padding: 4px 10px;
    background: #f7f8fa;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 400;
    text-align: left;
    color: var(--art-gray-3);
    letter-spacing: 0.26px;
    line-height: 20px;
    .weather {
    }
  }
</style>
