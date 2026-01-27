<template>
  <div class="w-48 bg-white rounded-md">
    <ul>
      <li
        v-for="item in list"
        :key="item.identifier"
        class="px-4 py-3 text-sm border-r-2 cursor-pointer"
        :class="[
          modelValue?.identifier === item.identifier
            ? 'border-blue-500 text-blue-600 bg-blue-50'
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
