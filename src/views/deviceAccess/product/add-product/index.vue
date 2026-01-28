<template>
  <div class="pt-5 add-product">
    <ArtButtonBack class="mb-2.5"> 新增产品 </ArtButtonBack>
    <el-form
      ref="productFormRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="grid grid-cols-2 gap-x-12 gap-y-2"
    >
      <el-form-item label="产品ID" prop="identifier">
        <template #label="{ label }">
          <div class="flex-c">
            <span> {{ label }} </span>
            <el-tooltip
              popper-class="max-w-[300px]"
              effect="dark"
              content="若不填写，系统将自动生成唯一标识"
              placement="top"
            >
              <ArtSvgIcon icon="ri:question-line" class="ml-2 text-g-2" />
            </el-tooltip>
          </div>
        </template>
        <el-input v-model="form.identifier" placeholder="请输入产品ID" />
      </el-form-item>

      <el-form-item label="产品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入产品名称" />
      </el-form-item>

      <el-form-item class="relative" label="产品品类" prop="categoryId" label-width="400px">
        <div
          v-if="form.categoryId"
          class="absolute flex-c pl-1 cursor-pointer top-[-36px] right-0 open-box w-[68px] h-[32px] bg-white rounded-md text-g-3"
          @click="handleOpenThingModel"
        >
          <img class="w-5 h-5 mr-1" src="@/assets/images/icon/icon-open-eye.png" alt="" />
          查看
        </div>
        <template #label="{ label }">
          <div class="inline flex-c">
            <span> {{ label }} </span>
            <el-tooltip
              popper-class="max-w-[300px]"
              effect="dark"
              content="系统内置标准品类，并将根据所选择行业/场景/品类，自动匹配物模型"
              placement="top"
            >
              <ArtSvgIcon icon="ri:question-line" class="ml-2 text-g-2" />
            </el-tooltip>
          </div>
        </template>
        <div class="flex w-full gap-2">
          <el-select
            v-model="form.categoryId"
            placeholder="请选择品类"
            class="flex-1"
            @click="handleCategoryChange"
          >
            <el-option
              v-for="item in productCategoryList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
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

      <el-form-item label="协议类型" prop="applyLayerProtocol">
        <el-select v-model="form.applyLayerProtocol" placeholder="请选择协议类型" class="w-full">
          <el-option
            v-for="item in PROTOCOL_TYPES_MAP.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="数据格式" prop="dataFormat">
        <el-select v-model="form.dataFormat" class="w-full">
          <el-option
            v-for="item in DATA_FORMAT_MAP.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="认证方式" prop="authType">
        <el-select v-model="form.authType" placeholder="请选择认证方式" class="w-full">
          <el-option
            v-for="item in AUTH_MODE_MAP.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
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
          <div class="flex-grow border-t border-gray-300 border-dashed"></div>
        </div>
      </div>

      <template v-if="isShowMore">
        <div class="grid grid-cols-1 gap-y-2">
          <el-form-item label="产品厂商" prop="manufactory">
            <el-input v-model="form.manufactory" placeholder="请输入" />
          </el-form-item>

          <el-form-item label="产品型号" prop="productModel">
            <el-input v-model="form.productModel" placeholder="请输入" />
          </el-form-item>

          <div class="flex items-end gap-4 mt-4">
            <UploadImg
              v-model="form.imgUrl"
              accept="image/*"
              :fileSize="0.5"
              width="100px"
              height="100px"
            >
              <template #tip>
                <span class="text-xs text-g-505658"
                  >支持500k以内的图片；支持jpg、png、jpeg；建议尺寸256x256。</span
                >
              </template>
            </UploadImg>
          </div>
        </div>

        <el-form-item label="产品描述" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="6"
            placeholder="请输入"
            maxlength="200"
          />
          <div class="w-full mt-1 text-xs text-right text-gray-400">
            {{ getByteLength(form.remark) }}/200
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
    <SelectProductCategory
      v-model="isProductSelectVisible"
      :productCategoryList="productCategoryList"
      @select="handleSelect"
    />

    <!-- 查看物模型 -->
    <ThingModelDetailDialog ref="thingModel" />

    <!-- 产品创建成功 -->
    <ProductCreateSuccessDialog ref="productCreateSuccess" />
  </div>
</template>

<script setup>
  import {
    validateNameLength,
    validateCommon,
    validateDescLength,
    getByteLength,
    validateProductId
  } from '@/utils'
  import {
    NODE_TYPES,
    CONNECTION_TYPES,
    PROTOCOL_TYPES_MAP,
    DATA_FORMAT_MAP,
    AUTH_MODE_MAP
  } from '@/enums'
  import SelectProductCategory from './components/select-product-category.vue'
  import ThingModelDetailDialog from './components/thing-model-detail-dialog.vue'
  import ProductCreateSuccessDialog from './components/product-create-success-dialog.vue'
  import * as api from '@/api/iot'

  const productFormRef = ref(null)
  const thingModelRef = useTemplateRef('thingModel')
  const productCreateSuccessRef = useTemplateRef('productCreateSuccess')

  const isProductSelectVisible = ref(false)

  const isShowMore = ref(false)

  const form = reactive({
    identifier: '',
    name: '',
    categoryId: '',
    nodeType: NODE_TYPES.values.DIRECT,
    networkWay: '',
    applyLayerProtocol: '',
    dataFormat: 'JSON',
    authType: '',
    manufactory: '',
    productModel: '',
    remark: '',
    imgUrl: '', // 示例logo
    logoName: 'LOGO文件.JPG'
  })

  const rules = {
    identifier: [{ validator: validateProductId, trigger: 'blur' }],
    name: [
      {
        required: true,
        validator: validateNameLength,
        trigger: 'blur'
      },
      { validator: validateCommon, trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择产品品类', trigger: 'change' }],
    nodeType: [{ required: true, message: '请选择节点类型', trigger: 'change' }],
    networkWay: [{ required: true, message: '请选择联网方式', trigger: 'change' }],
    applyLayerProtocol: [{ required: true, message: '请选择协议类型', trigger: 'change' }],
    authType: [{ required: true, message: '请选择认证方式', trigger: 'change' }],
    remark: [{ validator: validateDescLength, trigger: 'blur' }]
  }

  const handleCategoryChange = () => {
    isProductSelectVisible.value = true // 模拟点击后弹出抽屉
  }

  const handleSelect = (item) => {
    // console.log('item', item)
    form.categoryId = item.id
  }

  const handleOpenThingModel = () => {
    const row = productCategoryList.value.find((item) => item.id === form.categoryId)
    if (!row) return
    thingModelRef.value.open(row, true)
  }

  const submitForm = async () => {
    if (!productFormRef.value) return
    const valid = await productFormRef.value.validate()
    if (!valid) return
    try {
      const data = await api.apiAddProduct(form)
      productCreateSuccessRef.value.open({ id: data, identifier: form.identifier })
    } catch (error) {
      console.log(error)
    }
  }

  const productCategoryList = ref([])
  // 获取产品品类列表
  const initProductCategoryList = async () => {
    try {
      const { rows } = await api.apiGetProductCategoryList({ pageNum: 1, pageSize: 1000 })
      if (rows && Array.isArray(rows)) {
        productCategoryList.value = rows.map((item) => ({
          ...item,
          label: item.name || item.label,
          value: item.id || item.value
        }))
      }
    } catch (error) {
      console.error('获取产品品类列表失败:', error)
    }
  }

  onMounted(() => {
    initProductCategoryList()
  })
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
