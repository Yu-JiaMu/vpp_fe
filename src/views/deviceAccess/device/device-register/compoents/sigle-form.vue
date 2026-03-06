<template>
  <div>
    <!-- 单表单组件 -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="grid grid-cols-2 gap-x-12 gap-y-2"
    >
      <el-form-item label="设备标识符" prop="devIdentifier">
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
        <el-input v-model="form.devIdentifier" placeholder="请输入设备标识符" />
      </el-form-item>
      <el-form-item label="设备名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入设备名称" />
      </el-form-item>
      <!-- <el-form-item label="所属分组" prop="deviceGroup">
        <el-select v-model="form.deviceGroup" placeholder="请选择所属分组" multiple>
          <el-option
            v-for="item in groupList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="启用/禁用" prop="devEnable">
        <el-select v-model="form.devEnable" placeholder="请选择启用/禁用状态">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <!-- 通用配置信息 -->
      <!-- <div class="col-span-2 my-4">
        <div class="relative flex items-center">
          <div
            class="flex-shrink bg-white p-2.5 text-g-4 font-scBold text-sm cursor-pointer rounded-[20px]"
            @click="formShowMore.TYShowMore = !formShowMore.TYShowMore"
          >
            通用配置信息
            <ArtSvgIcon
              :icon="formShowMore.TYShowMore ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
              class="ml-1 text-[18px]"
            />
          </div>
          <div class="flex-grow border-t border-gray-300 border-dashed"></div>
        </div>
      </div>
      <template v-if="TYShowMore">
        <el-form-item label="设备地址">
          <el-input v-model="form.deviceAddress" placeholder="请输入设备地址" />
        </el-form-item>
        <el-form-item label="采用周期">
          <el-input v-model="form.cyzq" placeholder="请输入采用周期" />
        </el-form-item>
      </template> -->
      <!-- 拓展字段 -->
      <div
        class="col-span-2"
        v-if="productDetail.expandInfoList && productDetail.expandInfoList.length > 0"
      >
        <div class="relative flex items-center">
          <div
            class="flex-shrink bg-[#f7f8fa] p-2.5 text-g-4 font-scBold text-sm cursor-pointer rounded-[20px]"
            @click="formShowMore.TZShowMore = !formShowMore.TZShowMore"
          >
            拓展字段
            <ArtSvgIcon
              :icon="formShowMore.TZShowMore ? 'ri:arrow-down-s-line' : 'ri:arrow-up-s-line'"
              class="ml-1 text-[18px]"
            />
          </div>
          <div class="flex-grow border-t border-gray-300 border-dashed"></div>
        </div>
      </div>

      <template
        v-if="
          formShowMore.TZShowMore &&
          productDetail.expandInfoList &&
          productDetail.expandInfoList.length > 0
        "
      >
        <!-- <el-form-item label="详细地址" class="col-span-2">
          <el-input v-model="form.xxdz" placeholder="请输入详细地址" />
        </el-form-item> -->
        <ExpandInfo
          :expandInfoList="productDetail.expandInfoList"
          v-model:modelValue="form.expandInfo"
          class="col-span-2"
        />
      </template>
      <!-- 更多配置 -->
      <div class="col-span-2">
        <div class="relative flex items-center">
          <div
            class="flex-shrink bg-[#f7f8fa] p-2.5 text-g-4 font-scBold text-sm cursor-pointer rounded-[20px]"
            @click="formShowMore.GDShowMore = !formShowMore.GDShowMore"
          >
            更多配置
            <ArtSvgIcon
              :icon="formShowMore.GDShowMore ? 'ri:arrow-down-s-line' : 'ri:arrow-up-s-line'"
              class="ml-1 text-[18px]"
            />
          </div>
          <div class="flex-grow border-t border-gray-300 border-dashed"></div>
        </div>
      </div>
      <template v-if="formShowMore.GDShowMore">
        <el-form-item label="描述" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="5"
            placeholder="请输入"
            maxlength="200"
          />
          <div class="w-full mt-1 text-xs text-right text-gray-400">
            {{ getByteLength(form.remark) }}/200
          </div>
        </el-form-item>
        <el-form-item label="设备标签">
          <div class="labels-box">
            <span
              class="tag"
              :class="{ 'border-none': item.flag }"
              v-for="(item, index) in tagList"
              :key="index"
            >
              <template v-if="!item.flag">
                <span class="mr-[8px]">{{ item.value }}</span>
                <el-icon @click="deleteTag(index)" class="cursor-pointer"><Close /></el-icon>
              </template>
              <template v-if="item.flag">
                <el-input placeholder="请输入文字" v-model="item.value" size="small" />
                <el-icon @click="submitTag(item)" class="cursor-pointer" size="22" color="#38ECF2"
                  ><Check
                /></el-icon>
              </template>
            </span>
            <el-icon @click="addTag" class="cursor-pointer" size="22" color="#38ECF2"
              ><CirclePlus
            /></el-icon>
          </div>
        </el-form-item>
        <el-form-item label="位置信息" class="relative col-span-2">
          <template #label="{ label }">
            <div>
              <span class="mr10">{{ label }}</span>
              <span class="map-trip">*搜索地点确定位置</span>
            </div>
          </template>
          <div class="map-box">
            <span v-if="form.address"
              >{{ form.address }}---经度:{{ form.lng }}----纬度:{{ form.lat }}</span
            >
          </div>
          <div class="mt10" id="sigle-map" style="height: 300px; width: 100%"></div>
          <div class="absolute top-[60px] left-[30px]">
            <el-input
              v-model="input"
              id="tipinput"
              style="width: 387px"
              placeholder="请输入搜索地址"
              :suffix-icon="Search"
              clearable
            />
          </div>
        </el-form-item>
      </template>
      <div class="col-span-2 flex justify-center gap-5 mt-[120px] rounded-t-md">
        <el-button size="large" type="info" class="w-80" v-ripple @click="previousStep"
          >上一步</el-button
        >
        <el-button size="large" type="primary" class="w-80" v-ripple @click="submitForm">
          确认
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
  import {
    validateProductId,
    validateNameLength,
    validateCommon,
    getByteLength,
    validateDescLength
  } from '@/utils'
  import newMap from '@/utils/map'
  import { Search } from '@element-plus/icons-vue'
  import * as api from '@/api/iot'
  import ExpandInfo from './expand-info.vue'
  // import dayjs from 'dayjs'

  const form = reactive({
    devIdentifier: '',
    name: '',
    devEnable: true,
    //通用配置信息
    expandInfo: [],
    //结束
    remark: '',
    address: '',
    lng: '',
    lat: ''
  })

  const rules = reactive({
    devIdentifier: [{ validator: validateProductId, trigger: 'blur' }],
    name: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入设备名称'
      },
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateNameLength, trigger: 'blur' }
    ],
    // deviceGroup: [{ type: 'array', required: false, message: '请选择所属分组', trigger: 'change' }],
    devEnable: [
      {
        required: true,
        message: '请选择启用/禁用状态',
        trigger: 'change'
      }
    ],
    remark: [{ validator: validateDescLength, trigger: 'blur' }]
  })
  const groupList = [
    { label: '默认分组', value: 'default' },
    { label: '分组一', value: 'group1' },
    { label: '分组二', value: 'group2' }
  ]
  const statusList = [
    { label: '启用', value: true },
    { label: '禁用', value: false }
  ]
  //表单控制隐藏状态
  const formShowMore = reactive({
    TZShowMore: true, //拓展字段
    GDShowMore: true, //更多
    TYShowMore: false //通用配置信息
  })
  // computed(())
  watch(
    () => formShowMore.GDShowMore,
    (newVal) => {
      console.log('object', newVal)
      if (newVal) {
        createMap()
      } else {
        // 停止监听

        // 销毁地图
        if (map.value) {
          map.value.stopMapClickListening()
          map.value.destroy()
          map.value = null
        }
      }
    }
  )
  const tagList = ref([])
  const addTag = () => {
    tagList.value.push({
      flag: true,
      value: ''
    })
  }
  const deleteTag = (index) => {
    tagList.value.splice(index, 1)
  }
  const submitTag = (item) => {
    const value = item.value
    if (value.trim() === '') return ElMessage.warning('标签内容不能为空')
    const pattern = /^[a-zA-Z0-9\u4e00-\u9fa5\-_@]*$/
    if (value && !pattern.test(value)) {
      // callback(new Error('仅支持中文、英文字母、数字、短划线、下划线、@'))
      return ElMessage.warning('仅支持中文、英文字母、数字、短划线、下划线、@')
    }
    if (value && getByteLength(value) > 50) {
      return ElMessage.warning('描述不能超过50个字符）')
    }
    item.flag = false
  }
  // 拓展字段数据
  const expandFormData = ref({})
  watch(
    expandFormData,
    (newVal) => {
      console.log(newVal)
      // Object.assign(form, newVal)
    },
    { deep: true }
  )
  const formRef = ref(null)
  const submitForm = async () => {
    // TODO: 测试创建成功弹窗
    /*  productCreateSuccessRef.value.open()
    return */
    try {
      // 验证表单
      await formRef.value.validate()
      // form.expandInfo.forEach((item) => {
      //   if (item.dataType.type === 'date') {
      //     item[item.identifier] = dayjs(item[item.identifier]).valueOf()
      //   }
      // })
      // 这里 form 已经包含了正确的格式
      const submitData = {
        devIdentifier: form.devIdentifier ? form.devIdentifier : undefined,
        name: form.name,
        devEnable: form.devEnable,
        remark: form.remark,
        expandInfo: form.expandInfo,
        tags: tagList.value.map((tag) => tag.value),
        lng: form.lng,
        lat: form.lat,
        address: form.address
      }

      console.log('提交数据:', submitData)
      emit('sumbitForm', submitData)
      // 调用接口
      // await api.apiDevAdd(form)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }
  //上一步
  const emit = defineEmits(['previousStep', 'getProductDetail', 'sumbitForm'])
  const previousStep = () => {
    emit('previousStep')
  }
  const productId = ref('')
  const productDetail = ref({})
  const getProductDetail = async (id) => {
    productId.value = productId
    const result = await api.apiGetProductDetail(id)
    productDetail.value = result
    // productDetail.value.expandInfoList = []
    if (productDetail.value.expandInfoList?.length > 0) {
      // 处理初始值
      form.expandInfo = result.expandInfoList.map((item) => {
        const value = result.expandInfoValues?.[item.identifier]
        return {
          ...item,
          [item.identifier]: value !== undefined ? value : null
        }
      })
    }
    console.log(productDetail.value, 'productDetail.value')
  }
  defineExpose({
    getProductDetail
  })
  //地图
  // 创建地图
  const input = ref('')
  const map = ref('')
  const createMap = async () => {
    map.value = new newMap()
    await map.value.createMap('sigle-map')
    await mapClickAddMarker()
    await getAddress()
  }
  const getAddress = async () => {
    const res = await map.value.getSearchAddressList('tipinput')
    console.log('res------address', res)
    form.address = res.address
    const { lng, lat } = res
    form.lng = lng
    form.lat = lat
  }
  //监听地图点击事件
  const mapClickAddMarker = async () => {
    console.log('执行几次')
    await map.value.handleClickMapAddMarker({
      once: false, // 设置为持续监听
      getAddress: true, // 自动获取地址
      markerTitle: '选择的位置',
      onClick: (data) => {
        // 每次点击都会执行这个回调
        console.log('地图点击数据:', data)
        form.lng = data.lng
        form.lat = data.lat
        form.address = data.address
      }
    })
  }
  onMounted(() => {
    createMap()
  })
  onUnmounted(() => {
    // 停止监听
    // 销毁地图
    if (map.value) {
      map.value.stopMapClickListening()
      map.value.destroy()
      map.value = null
    }
  })
</script>

<style lang="scss" scoped>
  .trip {
    background: #f7f8fa;
    border-radius: 20px;
  }
  .labels-box {
    min-height: 116px;
    border: 1px solid #ebecf1;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .tag {
      background: #eefeff;
      border: 1px solid #38ecf2;
      border-radius: 6px;
      height: 24px;
      font-size: 14px;
      font-weight: 400;
      color: #505658;
      padding: 0 5px;
      /* 添加以下样式实现居中 */
      display: flex; /* 使用flex布局 */
      align-items: center; /* 垂直居中 */
      justify-content: center; /* 水平居中 */
      text-align: center; /* 文字居中（备用） */
      line-height: 1; /* 重置行高 */
    }
    .border-none {
      border: none !important;
      background: transparent !important;
    }
  }
  .map-trip {
    font-size: 12px;
    font-family:
      Source Han Sans SC,
      Source Han Sans SC-Regular;
    font-weight: 400;
    color: #5b77ff;
  }
  .map-box {
    border: 1px solid #ebecf1;
    border-radius: 6px;
    width: 100%;
    height: 36px;
    padding: 0 10px;
  }
</style>
