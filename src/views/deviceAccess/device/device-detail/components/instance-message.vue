<template>
  <div class="bg-white base-info base-info-table">
    <div class="flex items-center justify-between p-5">
      <div class="font-scBold text-g-131617 flex-c">
        <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />
        基本信息
      </div>
      <div class="cursor-pointer text-g-303537 flex-c" @click="handleEdit">
        <img src="@/assets/images/icon/icon-edit.png" class="w-5 h-5 mr-1" alt="" />
        编辑
      </div>
    </div>
    <!-- 信息表格 -->
    <el-descriptions :column="3" border label-width="133px" class="">
      <el-descriptions-item label="设备ID">
        {{ deviceDetail.identifier }}
      </el-descriptions-item>

      <el-descriptions-item label="设备名称">
        {{ deviceDetail.name }}
      </el-descriptions-item>

      <el-descriptions-item label="设备品类">
        {{ deviceDetail.productName }}
      </el-descriptions-item>

      <el-descriptions-item label="固件版本">
        {{ deviceDetail.firmwareVersion }}
      </el-descriptions-item>

      <el-descriptions-item label="协议类型">
        {{ deviceDetail.protocolType }}
      </el-descriptions-item>

      <!-- <el-descriptions-item label="所属分组">
        {{ deviceDetail.devGroupIds }}
      </el-descriptions-item> -->

      <el-descriptions-item label="注册时间">
        {{ deviceDetail.createTime }}
      </el-descriptions-item>

      <el-descriptions-item label="更新时间">
        {{ deviceDetail.updateTime }}
      </el-descriptions-item>

      <el-descriptions-item label="最后上线时间">
        {{ deviceDetail.lastOnlineTime }}
      </el-descriptions-item>

      <el-descriptions-item label="设备标签" :span="2">
        <div class="flex gap-2">
          <el-tag type="primary" v-for="(tag, index) in deviceDetail.tagArray || []" :key="index">{{
            tag
          }}</el-tag>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="设备描述" :span="1">
        {{ deviceDetail.remark }}
      </el-descriptions-item>
      <el-descriptions-item label="位置信息" :span="4">
        {{ deviceDetail.address }}
      </el-descriptions-item>
    </el-descriptions>
    <!-- 基本信息编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      align-center
      title="基本信息编辑"
      :show-close="false"
      width="800"
      :close-on-click-modal="false"
      :z-index="99"
      :close-on-press-escape="false"
    >
      <div class="p-2">
        <el-form ref="reviceFormRef" :model="form" :rules="rules" label-width="82px">
          <el-form-item label="设备ID">
            <el-input v-model="form.id" placeholder="请输入设备ID" disabled />
          </el-form-item>
          <!-- 设备名称 -->
          <el-form-item label="设备名称" prop="name" required>
            <el-input v-model="form.name" placeholder="请输入设备名称" />
          </el-form-item>

          <!-- 所属分组 -->
          <!-- <el-form-item label="所属分组" prop="devGroupIds">
            <el-select v-model="form.devGroupIds" placeholder="请选择所属分组" multiple>
              <el-option
                v-for="item in groupList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item> -->
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

          <!-- 描述 -->
          <el-form-item label="描述" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="请输入设备说明"
              :rows="5"
              maxlength="200"
            />
            <div class="w-full mt-1 text-xs text-right text-gray-400">
              {{ getByteLength(form.remark) }}/200
            </div>
          </el-form-item>

          <el-form-item label="位置信息" class="relative col-span-2">
            <div class="map-box" v-if="form.address">
              <div>
                {{ form.address }}
              </div>
              <div>
                <span>经度:{{ form.lng }}</span>
                <span class="ml-[5px] mr-[15px]">纬度:{{ form.lat }}</span>
                <span class="cursor-pointer text-theme" @click="clearAddress">清空</span>
              </div>
            </div>
            <div class="mt10" id="instance-map" style="height: 250px; width: 100%"></div>
            <div
              class="absolute left-[30px]"
              :class="{ 'top-[80px]': form.address, 'top-[15px]': !form.address }"
            >
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
        </el-form>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="flex justify-center gap-[6px]">
          <el-button size="large" type="info" class="w-[177px]" v-ripple @click="handleCancel"
            >取消</el-button
          >
          <el-button type="primary" class="w-[177px]" v-ripple @click="handleSubmit">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { pick } from 'lodash-es'
  import { getByteLength, validateNameLength, validateCommon, validateDescLength } from '@/utils'
  import { Search } from '@element-plus/icons-vue'
  import newMap from '@/utils/map'
  import * as api from '@/api/iot'
  const route = useRoute()
  const props = defineProps({
    deviceDetail: {
      type: Object,
      default: () => {}
    }
  })
  const emit = defineEmits(['eidtSuccess'])
  // const deviceDetail = ref({
  //   deviceId: '1955073219080001',
  //   deviceName: '计量电表001',
  //   deviceCategory: '能源电力/电表/表计',
  //   deviceGroup: '以太网',
  //   nodeType: 'v1.0.0',
  //   protocol: 'Modbus TCP',
  //   registerTime: '2023-08-01 10:00:00',
  //   updateTime: '2023-08-10 15:30:00',
  //   latestOnlineTime: '2023-08-15 09:45:00',
  //   deviceDescription:
  //     '这是一款高性能的计量电表，适用于各种工业和商业应用场景，具有精准的测量能力和稳定的性能表现。',

  //   locationInfo: '位置信息' // 图片中未明确
  // })
  const rules = reactive({
    // deviceId: [{ validator: validateProductId, trigger: 'blur' }],
    name: [
      {
        required: true,
        validator: validateNameLength,
        trigger: 'blur',
        message: '请输入设备名称'
      },
      { validator: validateCommon, trigger: 'blur' }
    ],
    // devGroupIds: [{ type: 'array', required: false, message: '请选择所属分组', trigger: 'change' }],
    // devEnable: [
    //   {
    //     required: true,
    //     message: '请选择启用/禁用状态',
    //     trigger: 'change'
    //   }
    // ],
    remark: [{ validator: validateDescLength, trigger: 'blur' }]
  })
  const form = reactive({
    id: '',
    name: '',
    remark: '',
    // tagList: [],
    // devGroupIds: '',
    address: 'dsfsdf',
    lng: '121',
    lat: '456'
  })
  const groupList = [
    { label: '默认分组', value: 'default' },
    { label: '分组一', value: 'group1' },
    { label: '分组二', value: 'group2' }
  ]
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
  const dialogVisible = ref(false)
  const handleEdit = async () => {
    input.value = ''
    Object.assign(
      form,
      pick(props.deviceDetail, ['id', 'name', 'tagArray', 'remark', 'address', 'lng', 'lat'])
    )
    if (form.tagArray?.length > 0) {
      tagList.value = form.tagArray.map((item) => {
        return {
          value: item,
          flag: false
        }
      })
    }

    dialogVisible.value = true
    await nextTick()
    createMap()
  }
  const handleCancel = () => {
    dialogVisible.value = false

    map.value.destroy()
  }
  const reviceFormRef = ref(null)
  const handleSubmit = async () => {
    if (!reviceFormRef.value) return
    const valid = await reviceFormRef.value.validate()
    if (!valid) return
    const params = {
      id: form.id,
      name: form.name,
      remark: form.remark,
      tags: tagList.value.map((tag) => tag.value),
      lng: form.lng,
      lat: form.lat,
      address: form.address
    }
    await api.apiDevEdit(params)
    dialogVisible.value = false
    ElMessage.success('编辑成功')
    emit('eidtSuccess')
  }
  //地图
  // 创建地图
  const input = ref('')
  const map = ref('')
  const createMap = async () => {
    console.log(form, 'console.log(form)')
    map.value = new newMap()
    await map.value.createMap('instance-map')
    if (form.lng && form.lat) {
      console.log(form, 'console.log(form)')
      map.value.addMarker([form.lng, form.lat])
      map.value.setCenter([form.lng, form.lat])
    }
    await getAddress()
  }
  const getAddress = async () => {
    const res = await map.value.getSearchAddressList('tipinput')
    console.log('res------address', res)
    form.address = res.address
    const { lng, lat } = res
    form.lng = lng
    form.lat = lat
    console.log(form, lng, lat)
  }
  const clearAddress = async () => {
    map.value.clearMarkers()
    form.lng = ''
    form.lat = ''
    form.address = ''
  }
  watch(
    () => dialogVisible.value,
    (newValue) => {
      if (!newValue) {
        map.value.destroy()
      }
    }
  )

  onMounted(() => {})
  onUnmounted(() => {})
</script>

<style lang="scss" scoped>
  .labels-box {
    // min-height: 116px;
    border: 1px solid #ebecf1;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    padding: 5px 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;

    .tag {
      background: #eefeff;
      border: 1px solid #38ecf2;
      border-radius: 6px;
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
  }
</style>
