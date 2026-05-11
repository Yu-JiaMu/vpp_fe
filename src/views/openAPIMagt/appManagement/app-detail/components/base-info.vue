<template>
  <div class="bg-white base-info base-info-table">
    <div class="flex items-center justify-between p-5">
      <div class="font-scBold text-g-131617 flex-c text-sm">
        <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
        基本信息
      </div>
      <div
        class="cursor-pointer text-g-303537 flex-c text-sm btn-link"
        @click="handleEdit(appInfo)"
      >
        <img src="@/assets/images/icon/icon-edit.png" class="w-5 h-5 mr-1" alt="" />
        编辑
      </div>
    </div>

    <!-- 信息表格 -->
    <el-descriptions :column="3" border label-width="133px" class="">
      <el-descriptions-item label="应用编号">
        <el-tooltip :content="appInfo.id" placement="top">
          <div class="max-w-[220px] truncate">{{ appInfo.id }}</div>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="应用名称">
        <el-tooltip :content="appInfo.appName" placement="top">
          <div class="max-w-[200px] truncate">{{ appInfo.appName }}</div>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="key">
        <el-tooltip :content="appInfo.id" placement="top">
          <div class="max-w-[160px] truncate">{{ appInfo.id }}</div>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="状态">
        {{ APP_STATUS.getLabel(appInfo.appStatus) }}
      </el-descriptions-item>

      <el-descriptions-item label="有效期">
        {{ formatDate(appInfo.createTime) }} 至 {{ formatDate(appInfo.endTime) }}
      </el-descriptions-item>

      <el-descriptions-item label="创建人">
        {{ appInfo.createUser }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ appInfo.createTime }}
      </el-descriptions-item>

      <el-descriptions-item label="更新时间">
        {{ appInfo.updateTime }}
      </el-descriptions-item>

      <el-descriptions-item label="最后调用时间">
        {{ appInfo.lastRequestTime }}
      </el-descriptions-item>

      <el-descriptions-item label="描述" :span="2">
        {{ appInfo.remark }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
  <!-- 基本信息编辑弹窗 -->
  <AppMangementDialog
    ref="appMangementDialogRef"
    v-model="dialogVisible"
    @edit-success="handleEditSuccess"
  />
</template>

<script setup>
  import { validateNameLength, validateCommon, validateDescLength } from '@/utils'
  import { APP_STATUS } from '@/enums'
  import { nextTick } from 'vue'
  import AppMangementDialog from '@views/openAPIMagt/appManagement/dialog/AppMangementDialog.vue' // 记得引入 nextTick
  const props = defineProps({
    appInfo: {
      type: Object,
      default: () => {}
    }
  })

  const emits = defineEmits(['refresh'])
  const dialogVisible = ref(false)
  const productCategoryList = ref([])
  const appMangementDialogRef = ref(null)

  /**
   * @Description 时间格式化 YYYY-MM-DD
   * @author Huang Jialin
   * @date 2026/4/14 15:09
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * @Description 打开编辑弹窗
   * @author Huang Jialin
   * @date 2026/4/15 11:34
   */
  const handleEdit = async (data) => {
    // 1. 先打开弹窗，让组件渲染
    dialogVisible.value = true
    // 2. 等待 DOM 更新完成（组件实例化完毕）
    await nextTick()
    // 3. 安全调用初始化方法
    if (appMangementDialogRef.value) {
      if (typeof appMangementDialogRef.value.initFormData === 'function') {
        appMangementDialogRef.value.initFormData(data)
      } else {
        console.error('initFormData 方法未暴露：', appMangementDialogRef.value)
        ElMessage.error('弹窗初始化方法不存在')
      }
    } else {
      console.error('AppMangementDialog 组件实例未获取到')
      ElMessage.error('编辑弹窗加载失败')
    }
  }

  // 弹窗逻辑
  const formRef = ref(null)

  const form = reactive({
    imgUrl: '',
    name: '',
    manufactory: '',
    productModel: '',
    remark: '',
    categoryId: null
  })

  const rules = {
    name: [
      {
        required: true,
        validator: validateNameLength,
        trigger: 'blur'
      },
      { validator: validateCommon, trigger: 'blur' }
    ],
    remark: [{ validator: validateDescLength, trigger: 'blur' }],
    categoryId: [
      {
        required: true,
        message: '请选择产品品类',
        trigger: 'change'
      }
    ]
  }

  const handleReset = () => {
    formRef.value?.resetFields()
    form.imgUrl = ''
    form.categoryId = null
  }

  const submitLoading = ref(false)
  /**
   * @Description 点击提交回调
   * @author Huang Jialin
   * @date 2026/4/15 14:55
   */
  const handleEditSuccess = async () => {
    try {
      dialogVisible.value = false
      emits('refresh')
    } catch (err) {
      console.log(err)
    }
  }
</script>

<style lang="scss" scoped>
  .base-info {
  }
</style>
