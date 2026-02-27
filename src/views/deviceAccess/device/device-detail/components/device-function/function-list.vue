<template>
  <div class="w-48 bg-white rounded-md relative">
    <div class="absolute right-0 top-0 h-full w-[2px] bg-[#EBECF1]"></div>
    <ul>
      <li
        v-for="item in list"
        :key="item.identifier"
        class="px-4 py-3 text-sm border-r-2 cursor-pointer z-2 relative"
        :class="[
          modelValue?.identifier === item.identifier
            ? 'border-[#38ECF2] text-g-303537 bg-[#EBECF1]'
            : 'border-transparent hover:bg-gray-100'
        ]"
        @click="select(item)"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
  const props = defineProps({
    list: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['change'])

  const modelValue = defineModel()
  function select(item) {
    modelValue.value = item
    emit('change', item)
  }
</script>
