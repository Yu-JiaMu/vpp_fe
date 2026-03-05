<template>
  <el-dialog
    v-model="dialogVisible"
    title="导入数据统计"
    width="588"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="px-10">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-6 h-6">
          <img src="@/assets/images/icon/icon-success.png" class="w-6 h-6" alt="" />
        </div>
        <span class="text-base font-scMedium text-g-303537">导入完成</span>
      </div>

      <div class="ml-9">
        <h4 class="text-gray-700 mb-3 font-medium">导入数据统计</h4>

        <div class="border border-[#E5E6EC] rounded-md overflow-hidden">
          <div class="flex border-b border-[#E5E6EC]">
            <div class="w-1/3 p-3 text-gray-600 border-r border-[#E5E6EC] text-center">
              导入成功数量
            </div>
            <div class="w-2/3 p-3 text-blue-500 text-center">{{ info.successCount }}</div>
          </div>
          <div class="flex">
            <div class="w-1/3 p-3 text-gray-600 border-r border-[#E5E6EC] text-center">
              导入失败数量
            </div>
            <div class="w-2/3 p-3 text-red-500 text-center">{{ info.failCount }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- footer -->
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button type="primary" class="w-[177px]" v-ripple @click="handleConfirm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  const router = useRouter()

  const emit = defineEmits(['confirm'])

  const dialogVisible = ref(false)

  function handleCancel() {
    dialogVisible.value = false
  }

  function handleConfirm() {
    dialogVisible.value = false
    emit('confirm')
    router.replace({
      name: 'Device'
    })
  }

  const info = reactive({})

  const open = (data) => {
    console.log('哈哈哈哈哈')

    info.successCount = data.successCount
    info.failCount = data.failCount
    dialogVisible.value = true
  }

  defineExpose({ open })
</script>
