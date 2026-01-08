<template>
  <div class="add-product pt-5">
    <ArtButtonBack class="mb-2.5"> 新增产品 </ArtButtonBack>
    <el-form
      ref="productFormRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="grid grid-cols-2 gap-x-12 gap-y-2"
    >
      <el-form-item label="产品ID" prop="productId">
        <template #label="{ label }">
          <div class="flex-c">
            <span> {{ label }} </span>
            <el-tooltip
              popper-class="max-w-[300px]"
              effect="dark"
              content="若不填写，系统将自动生成唯一标识"
              placement="top"
            >
              <ArtSvgIcon icon="ri:question-line" class="text-g-2 ml-2" />
            </el-tooltip>
          </div>
        </template>
        <el-input v-model="form.productId" placeholder="请输入产品ID" />
      </el-form-item>

      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="form.productName" placeholder="请输入产品名称" />
      </el-form-item>

      <el-form-item class="relative" label="产品品类" prop="category" label-width="400px">
        <div
          class="absolute flex-c pl-1 cursor-pointer top-[-36px] right-0 open-box w-[68px] h-[32px] bg-white rounded-md text-g-3"
          @click="thingModelRef.open(form, true)"
        >
          <img class="w-5 h-5 mr-1" src="@/assets/images/icon/icon-open-eye.png" alt="" />
          查看
        </div>
        <template #label="{ label }">
          <div class="flex-c inline">
            <span> {{ label }} </span>
            <el-tooltip
              popper-class="max-w-[300px]"
              effect="dark"
              content="系统内置标准品类，并将根据所选择行业/场景/品类，自动匹配物模型"
              placement="top"
            >
              <ArtSvgIcon icon="ri:question-line" class="text-g-2 ml-2" />
            </el-tooltip>
          </div>
        </template>
        <div class="flex w-full gap-2">
          <el-select
            v-model="form.category"
            placeholder="请选择品类"
            class="flex-1"
            @click="handleCategoryChange"
          >
            <!-- <el-option label="智能家居" value="smart-home" />
            <el-option label="工业互联" value="industrial" /> -->
          </el-select>
        </div>
      </el-form-item>

      <el-form-item label="节点类型" prop="nodeType">
        <el-select v-model="form.nodeType" class="w-full">
          <el-option
            v-for="item in NODE_TYPES.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="form.nodeType !== NODE_TYPES.values.SUB_DEVICE"
        label="联网方式"
        prop="networkWay"
      >
        <el-select v-model="form.networkWay" placeholder="请选择联网方式" class="w-full">
          <el-option
            v-for="item in CONNECTION_TYPES.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="协议类型" prop="protocolType">
        <el-select v-model="form.protocolType" placeholder="请选择协议类型" class="w-full">
          <el-option label="MQTT" value="mqtt" />
          <el-option label="HTTP" value="http" />
        </el-select>
      </el-form-item>

      <el-form-item label="数据格式" prop="dataFormat">
        <el-select v-model="form.dataFormat" class="w-full">
          <el-option label="JSON" value="JSON" />
        </el-select>
      </el-form-item>

      <el-form-item label="认证方式" prop="authType">
        <el-select v-model="form.authType" placeholder="请选择认证方式" class="w-full">
          <el-option label="设备密钥" value="secret" />
          <el-option label="产品序列号产品ID" value="sn_pid" />
        </el-select>
      </el-form-item>

      <div class="col-span-2 my-4">
        <div class="relative flex items-center">
          <div
            class="flex-shrink bg-white p-2.5 text-g-4 font-scBold text-sm cursor-pointer rounded-[20px]"
            @click="isShowMore = !isShowMore"
          >
            更多配置
            <ArtSvgIcon
              :icon="isShowMore ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
              class="ml-1 text-[18px]"
            />
          </div>
          <div class="flex-grow border-t border-dashed border-gray-300"></div>
        </div>
      </div>

      <template v-if="isShowMore">
        <div class="grid grid-cols-1 gap-y-2">
          <el-form-item label="产品厂商" prop="manufacturer">
            <el-input v-model="form.manufacturer" placeholder="请输入" />
          </el-form-item>

          <el-form-item label="产品型号" prop="model">
            <el-input v-model="form.model" placeholder="请输入" />
          </el-form-item>

          <div class="flex gap-4 items-end mt-4">
            <div
              class="w-24 h-24 bg-gray-100 rounded border flex flex-col items-center justify-center text-gray-400 cursor-pointer overflow-hidden"
            >
              <el-icon v-if="!form.logo" :size="30"><Picture /></el-icon>
              <img v-else :src="form.logo" class="object-contain w-full h-full" />
            </div>
            <div class="flex flex-col gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false">
                <el-button link type="primary" :icon="Cloudy">点击上传LOGO</el-button>
              </el-upload>
              <div
                v-if="form.logoName"
                class="flex items-center text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded"
              >
                <el-icon class="mr-1 text-blue-500"><Cloudy /></el-icon>
                {{ form.logoName }}
                <el-icon class="ml-2 text-red-400 cursor-pointer"><CircleClose /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="6"
            placeholder="请输入"
            maxlength="200"
          />
          <div class="w-full text-right text-xs text-gray-400 mt-1">
            {{ getByteLength(form.description) }}/200
          </div>
        </el-form-item>
      </template>

      <div class="col-span-2 flex justify-center gap-5 h-[176px] mt-[120px] rounded-t-md">
        <el-button size="large" type="info" class="w-80" v-ripple>取消</el-button>
        <el-button size="large" type="primary" class="w-80" v-ripple @click="submitForm">
          确认
        </el-button>
      </div>
    </el-form>

    <!-- 选择产品品类 -->
    <SelectProductCategory v-model="isProductSelectVisible" />

    <!-- 查看物模型 -->
    <ThingModelDetailDialog ref="thingModel" />

    <!-- 产品创建成功 -->
    <ProductCreateSuccessDialog ref="productCreateSuccess" />
  </div>
</template>

<script setup>
  import { ArrowLeft, ArrowDown, Picture, Cloudy, CircleClose } from '@element-plus/icons-vue'
  import {
    validateNameLength,
    validateCommon,
    validateDescLength,
    getByteLength,
    validateProductId
  } from '@/utils'
  import { NODE_TYPES, CONNECTION_TYPES } from '@/enums'
  import SelectProductCategory from './components/select-product-category.vue'
  import ThingModelDetailDialog from './components/thing-model-detail-dialog.vue'
  import ProductCreateSuccessDialog from './components/product-create-success-dialog.vue'

  const productFormRef = ref(null)
  const thingModelRef = useTemplateRef('thingModel')
  const productCreateSuccessRef = useTemplateRef('productCreateSuccess')

  const isProductSelectVisible = ref(false)

  const isShowMore = ref(false)

  const form = reactive({
    productId: '',
    productName: '',
    category: '',
    nodeType: 'direct',
    networkWay: 'wifi',
    protocolType: '',
    dataFormat: 'JSON',
    authType: '',
    manufacturer: '',
    model: '',
    description: '',
    logo: 'https://placeholder.com/150', // 示例logo
    logoName: 'LOGO文件.JPG'
  })

  const rules = {
    productId: [{ validator: validateProductId, trigger: 'blur' }],
    productName: [
      {
        required: true,
        validator: validateNameLength,
        trigger: 'blur'
      },
      { validator: validateCommon, trigger: 'blur' }
    ],
    category: [{ required: true, message: '请选择产品品类', trigger: 'change' }],
    nodeType: [{ required: true, message: '请选择节点类型', trigger: 'change' }],
    networkWay: [{ required: true, message: '请选择联网方式', trigger: 'change' }],
    protocolType: [{ required: true, message: '请选择协议类型', trigger: 'change' }],
    authType: [{ required: true, message: '请选择认证方式', trigger: 'change' }],
    description: [
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateDescLength, trigger: 'blur' }
    ]
  }

  const handleCategoryChange = () => {
    isProductSelectVisible.value = true // 模拟点击后弹出抽屉
  }

  const submitForm = async () => {
    // TODO: 测试创建成功弹窗
    /*  productCreateSuccessRef.value.open()
    return */
    if (!productFormRef.value) return
    const valid = await productFormRef.value.validate()

    if (!valid) return
  }
</script>

<style scoped lang="scss">
  .add-product {
    // border: 1px solid red;
  }
  /* 深度调整 Element Plus 样式以匹配 UI */
  :deep(.el-form-item__label) {
    font-size: 16px;
    font-family:
      Source Han Sans SC,
      Source Han Sans SC-Regular;
    font-weight: 400;
    text-align: left;
    color: #303537;
  }

  /*   :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    box-shadow: none !important;
    border: 1px solid #eeeff1;
  }
 */
  /*   :deep(.el-input__wrapper.is-focus),
  :deep(.el-textarea__inner:focus) {
    border-color: #3b82f6;
  }
 */
</style>
