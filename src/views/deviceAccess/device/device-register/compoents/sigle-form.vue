<template>
  <div>
    <!-- 单表单组件 -->
    <el-form
      ref="reviceFormRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="grid grid-cols-2 gap-x-12 gap-y-2"
    >
      <el-form-item label="设备ID" prop="deviceId">
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
        <el-input v-model="form.deviceId" placeholder="请输入设备ID" />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
      </el-form-item>
      <el-form-item label="所属分组" prop="deviceGroup">
        <el-select v-model="form.deviceGroup" placeholder="请选择所属分组" multiple>
          <el-option
            v-for="item in groupList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="启用/禁用" prop="status">
        <el-select v-model="form.status" placeholder="请选择启用/禁用状态">
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
          <div class="flex-grow border-t border-dashed border-gray-300"></div>
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
      <div class="col-span-2 my-4">
        <div class="relative flex items-center">
          <div
            class="flex-shrink bg-white p-2.5 text-g-4 font-scBold text-sm cursor-pointer rounded-[20px]"
            @click="formShowMore.TZShowMore = !formShowMore.TZShowMore"
          >
            拓展字段
            <ArtSvgIcon
              :icon="formShowMore.TZShowMore ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
              class="ml-1 text-[18px]"
            />
          </div>
          <div class="flex-grow border-t border-dashed border-gray-300"></div>
        </div>
      </div>

      <template v-if="formShowMore.TZShowMore">
        <el-form-item label="详细地址" class="col-span-2">
          <el-input v-model="form.xxdz" placeholder="请输入详细地址" />
        </el-form-item>
      </template>
      <!-- 更多配置 -->
      <div class="col-span-2 my-4">
        <div class="relative flex items-center">
          <div
            class="flex-shrink bg-white p-2.5 text-g-4 font-scBold text-sm cursor-pointer rounded-[20px]"
            @click="formShowMore.GDShowMore = !formShowMore.GDShowMore"
          >
            更多配置
            <ArtSvgIcon
              :icon="formShowMore.GDShowMore ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'"
              class="ml-1 text-[18px]"
            />
          </div>
          <div class="flex-grow border-t border-dashed border-gray-300"></div>
        </div>
      </div>
      <template v-if="formShowMore.GDShowMore">
        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="5"
            placeholder="请输入"
            maxlength="200"
          />
          <div class="w-full text-right text-xs text-gray-400 mt-1">
            {{ getByteLength(form.description) }}/200
          </div>
        </el-form-item>
        <el-form-item label="设备标签" prop="deviceLabels">
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
        <el-form-item label="位置信息" class="col-span-2 relative">
          <template #label="{ label }">
            <div>
              <span class="mr10">{{ label }}</span>
              <span class="map-trip">*请点击地图确定位置</span>
            </div>
          </template>
          <div class="map-box">
            <span v-if="form.address"
              >{{ form.address }}---经度:{{ form.lng }}----纬度:{{ form.lat }}</span
            >
          </div>
          <div class="mt10" id="sigle-map" style="height: 380px; width: 100%"></div>
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
        <el-button size="large" type="info" class="w-80" v-ripple>取消</el-button>
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
  const form = reactive({
    deviceId: '',
    deviceName: '',
    deviceGroup: [],
    status: 'enabled',
    //通用配置信息
    deviceAddress: '',
    //结束
    description: '',
    address: '',
    lng: '',
    lat: ''
  })
  const rules = reactive({
    deviceId: [{ validator: validateProductId, trigger: 'blur' }],
    deviceName: [
      {
        required: true,
        validator: validateNameLength,
        trigger: 'blur',
        message: '请输入设备名称'
      },
      { validator: validateCommon, trigger: 'blur' }
    ],
    deviceGroup: [{ type: 'array', required: false, message: '请选择所属分组', trigger: 'change' }],
    status: [
      {
        required: true,
        message: '请选择启用/禁用状态',
        trigger: 'change'
      }
    ],
    description: [
      { validator: validateCommon, trigger: 'blur' },
      { validator: validateDescLength, trigger: 'blur' }
    ]
  })
  const groupList = [
    { label: '默认分组', value: 'default' },
    { label: '分组一', value: 'group1' },
    { label: '分组二', value: 'group2' }
  ]
  const statusList = [
    { label: '启用', value: 'enabled' },
    { label: '禁用', value: 'disabled' }
  ]
  //表单控制隐藏状态
  const formShowMore = reactive({
    TZShowMore: true, //拓展字段
    GDShowMore: true, //更多
    TYShowMore: false //通用配置信息
  })
  const tagList = ref([
    {
      flag: false,
      value: 'tag1'
    },
    {
      flag: false,
      value: 'tag2'
    }
  ])
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
    if (item.value.trim() === '') return ElMessage.warning('标签内容不能为空')
    item.flag = false
  }
  const reviceFormRef = ref(null)
  const submitForm = async () => {
    // TODO: 测试创建成功弹窗
    /*  productCreateSuccessRef.value.open()
    return */
    if (!reviceFormRef.value) return
    const valid = await reviceFormRef.value.validate()

    if (!valid) return
  }

  //地图
  // 创建地图
  const input = ref('')
  const map = ref('')
  const createMap = async () => {
    map.value = new newMap()
    await map.value.createMap('sigle-map')
    await getAddress()
  }
  const getAddress = async () => {
    const res = await map.value.getSearchAddressList('tipinput')
    console.log('res------address', res)
    form.address = res.poi.district + res.poi.name
    const { lng, lat } = res.poi.location
    form.lng = lng
    form.lat = lat
    console.log(form, lng, lat)
  }
  const ClearTime = ref(null)
  // watch(
  //   () => map.value,
  //   (newValue) => {
  //     if (newValue) {
  //       // ClearTime.value = setTimeout(() => {
  //       getAddress()
  //       // }, 2000)
  //     }
  //   }
  // )
  onMounted(() => {
    createMap()
  })
  onUnmounted(() => {
    map.value.destroy()
    clearTimeout(ClearTime.value)
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
    display: grid;
    //一行放8个标签
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 10px;

    .tag {
      background: #eefeff;
      border: 1px solid #38ecf2;
      border-radius: 6px;
      height: 24px;
      font-size: 14px;
      font-weight: 400;
      color: #505658;

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
