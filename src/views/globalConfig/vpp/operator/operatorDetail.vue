<template>
  <div class="pt-5 pb-8 operator-detail">
    <ArtButtonBack class="mb-2.5"> 运营商详情 </ArtButtonBack>

    <div v-if="loading" class="flex justify-center py-20">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <template v-else-if="loadError">
      <el-empty description="加载失败">
        <el-button type="primary" @click="fetchDetail">重新加载</el-button>
      </el-empty>
    </template>

    <template v-else>
      <el-form
        ref="formRef"
        :model="form"
        :rules="editing ? rules : {}"
        label-position="top"
        class="grid grid-cols-2 gap-x-12 gap-y-2"
      >
        <!-- ============ 基本信息 ============ -->
        <div class="col-span-2 section-title">基本信息</div>

        <el-form-item label="运营商名称" prop="operatorName">
          <el-input v-model="form.operatorName" placeholder="请输入运营商名称" maxlength="100" :disabled="!editing" />
        </el-form-item>

        <el-form-item label="运营商简称" prop="operatorShortName">
          <el-input v-model="form.operatorShortName" placeholder="请输入运营商简称" maxlength="50" :disabled="!editing" />
        </el-form-item>

        <el-form-item prop="industryCategory">
          <template #label>
            <span>
              行业分类
              <el-tooltip content="依据国民经济行业分类（GB/T 4754—2017）" placement="right">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="form.industryCategory" placeholder="请选择行业分类" clearable style="width: 100%" :disabled="!editing">
            <el-option label="电力生产" value="电力生产" />
            <el-option label="电力供应" value="电力供应" />
            <el-option label="热力生产和供应" value="热力生产和供应" />
            <el-option label="燃气生产和供应" value="燃气生产和供应" />
            <el-option label="新能源技术推广服务" value="新能源技术推广服务" />
            <el-option label="节能技术推广服务" value="节能技术推广服务" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item prop="creditCode">
          <template #label>
            <span>
              统一社会信用代码
              <el-tooltip content="18位阿拉伯数字或大写英文字母表示" placement="right">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="form.creditCode" placeholder="请输入18位统一社会信用代码" maxlength="18" :disabled="!editing" />
        </el-form-item>

        <el-form-item label="成立日期" prop="establishDate">
          <el-date-picker
            v-model="form.establishDate"
            type="date"
            placeholder="选择成立日期"
            value-format="YYYY-MM-DD"
            :disabled="!editing"
          />
        </el-form-item>

        <el-form-item label="企业法人" prop="legalPerson">
          <el-input v-model="form.legalPerson" placeholder="请输入企业法人姓名" maxlength="50" :disabled="!editing" />
        </el-form-item>

        <el-form-item prop="legalIdCard">
          <template #label>
            <el-tooltip content="企业法人的18位身份证号码" placement="top">
              <span>法人身份证号</span>
            </el-tooltip>
          </template>
          <el-input v-model="form.legalIdCard" placeholder="请输入法人身份证号" maxlength="18" :disabled="!editing" />
        </el-form-item>

        <el-form-item prop="enterpriseAddress">
          <template #label>
            <span>
              详细地址
              <el-tooltip content="地图上选择位置后将自动生成详细地址，可修改" placement="right">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="form.enterpriseAddress" placeholder="请输入详细地址" maxlength="200" :disabled="!editing" />
        </el-form-item>

        <el-form-item prop="regionCode">
          <template #label>
            <el-tooltip content="选择企业注册所在的省-市-区/县" placement="top">
              <span>所在地区</span>
            </el-tooltip>
          </template>
          <el-cascader
            v-model="form.regionCode"
            :options="regionOptions"
            placeholder="请选择省-市-区/县"
            clearable
            style="width: 100%"
            :disabled="!editing"
          />
        </el-form-item>

        <el-form-item label="到期时间" prop="expireDate">
          <el-date-picker
            v-model="form.expireDate"
            type="datetime"
            placeholder="选择到期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled="!editing"
          />
        </el-form-item>

        <el-form-item prop="longitude" class="col-span-1">
          <template #label>
            <span>
              经纬度
              <el-tooltip content="需保留小数点后六位数字，可在地图上直接选择位置" placement="right">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <div class="flex w-full gap-2">
            <el-input v-model="form.longitude" placeholder="经度" disabled />
            <el-input v-model="form.latitude" placeholder="纬度" disabled />
            <el-button v-if="editing" @click="openMap">地图点选</el-button>
          </div>
        </el-form-item>

        <el-form-item label="营业执照" prop="businessLicenseUrl">
          <UploadImg
            v-model="form.businessLicenseUrl"
            accept="image/jpg,image/png,image/jpeg,image/jfif,image/pjp"
            :file-size="5"
            width="180px"
            height="120px"
            :disabled="!editing"
          >
            <template #tip>
              <span class="text-xs text-gray-400">支持 jpg/png/jfif/pjp/jpeg 格式</span>
            </template>
          </UploadImg>
        </el-form-item>

        <el-form-item label="系统 LOGO" prop="logoUrl">
          <UploadImg
            v-model="form.logoUrl"
            accept="image/jpg,image/png,image/jpeg,image/jfif,image/pjp"
            :file-size="5"
            width="180px"
            height="120px"
            :disabled="!editing"
          >
            <template #tip>
              <span class="text-xs text-gray-400">建议尺寸 400x1200；支持 jpg/png/jfif/pjp/jpeg</span>
            </template>
          </UploadImg>
        </el-form-item>

        <!-- ============ 联系信息 ============ -->
        <div class="col-span-2 section-title mt-4">联系信息</div>

        <el-form-item label="联系人姓名" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人姓名" maxlength="50" :disabled="!editing" />
        </el-form-item>

        <el-form-item label="联系人电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" maxlength="20" :disabled="!editing" />
        </el-form-item>

        <el-form-item prop="contactEmail">
          <template #label>
            <el-tooltip content="用于接收系统通知和告警信息" placement="top">
              <span>联系邮箱</span>
            </el-tooltip>
          </template>
          <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" maxlength="50" :disabled="!editing" />
        </el-form-item>

        <!-- 按钮 -->
        <div class="col-span-2 flex justify-center gap-5 mt-8">
          <el-button v-if="!editing" size="large" type="primary" class="w-80" v-ripple @click="startEdit">
            编辑
          </el-button>
          <template v-else>
            <el-button size="large" type="info" class="w-80" v-ripple @click="cancelEdit">取消</el-button>
            <el-button size="large" type="primary" class="w-80" v-ripple :loading="saving" @click="submitForm">
              保存
            </el-button>
          </template>
        </div>
      </el-form>

      <!-- 地图弹窗 -->
      <el-dialog
        v-model="showMap"
        title="选择位置"
        width="720px"
        top="5vh"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <div class="h-[500px]">
          <MapComponent
            v-if="showMap"
            ref="mapRef"
            :center="mapInitCenter"
          />
        </div>
        <template #footer>
          <el-button @click="cancelMap">取消</el-button>
          <el-button type="primary" @click="confirmMap">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import * as api from '@/api/vpp'
import { ElMessage } from 'element-plus'
import { Loading, InfoFilled } from '@element-plus/icons-vue'
import UploadImg from '@/components/core/Upload/UploadImg.vue'
import MapComponent from '@/components/map/index.vue'
import { generateMockOperatorDetail } from './operatorMockData.js'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

const loading = ref(true)
const loadError = ref(false)
const editing = ref(false)
const saving = ref(false)
const showMap = ref(false)
const mapRef = ref(null)
const detailData = ref({})
const originalForm = ref(null)

const mapInitCenter = ref([104.065735, 30.659462])

const form = reactive({
  operatorName: '',
  operatorShortName: '',
  industryCategory: '',
  expireDate: '',
  logoUrl: '',
  creditCode: '',
  establishDate: '',
  legalPerson: '',
  legalIdCard: '',
  enterpriseAddress: '',
  regionCode: [],
  longitude: '',
  latitude: '',
  businessLicenseUrl: '',
  contactName: '',
  contactPhone: '',
  contactEmail: ''
})

const validateCreditCode = (_rule, value, callback) => {
  if (!value) return callback(new Error('请输入企业信用代码'))
  if (!/^[0-9A-Z]{18}$/.test(value)) {
    return callback(new Error('企业信用代码为18位数字或大写字母'))
  }
  callback()
}

const validatePhone = (_rule, value, callback) => {
  if (!value) return callback(new Error('请输入联系人电话'))
  if (!/^1[3-9]\d{9}$/.test(value)) {
    return callback(new Error('请输入有效的手机号码'))
  }
  callback()
}

const rules = {
  operatorName: [{ required: true, message: '请输入运营商名称', trigger: 'blur' }],
  creditCode: [{ required: true, validator: validateCreditCode, trigger: 'blur' }],
  enterpriseAddress: [{ required: true, message: '请输入企业地址', trigger: 'blur' }],
  regionCode: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  longitude: [{ required: true, message: '请在地图上点选经纬度', trigger: 'change' }],
  expireDate: [{ required: true, message: '请选择到期时间', trigger: 'change' }],
  businessLicenseUrl: [{ required: true, message: '请上传营业执照', trigger: 'change' }],
  logoUrl: [{ required: true, message: '请上传系统LOGO', trigger: 'change' }],
  contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  contactPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }]
}

const regionOptions = [
  {
    value: '440000', label: '广东省',
    children: [
      {
        value: '440100', label: '广州市',
        children: [
          { value: '440103', label: '荔湾区' }, { value: '440104', label: '越秀区' },
          { value: '440105', label: '海珠区' }, { value: '440106', label: '天河区' },
          { value: '440111', label: '白云区' }
        ]
      },
      {
        value: '440300', label: '深圳市',
        children: [
          { value: '440303', label: '罗湖区' }, { value: '440304', label: '福田区' },
          { value: '440305', label: '南山区' }, { value: '440306', label: '宝安区' },
          { value: '440307', label: '龙岗区' }
        ]
      }
    ]
  },
  {
    value: '510000', label: '四川省',
    children: [
      {
        value: '510100', label: '成都市',
        children: [
          { value: '510104', label: '锦江区' }, { value: '510105', label: '青羊区' },
          { value: '510106', label: '金牛区' }, { value: '510107', label: '武侯区' },
          { value: '510108', label: '成华区' }
        ]
      }
    ]
  }
]

const useMockData = true // 开发阶段使用 mock 数据，联调时改为 false

async function fetchDetail() {
  loading.value = true
  loadError.value = false
  const id = route.query.id
  if (!id) {
    loadError.value = true
    loading.value = false
    return
  }
  try {
    const res = useMockData ? generateMockOperatorDetail(id) : await api.getOperatorDetail({ id })
    detailData.value = res
    Object.assign(form, {
      operatorName: res.operatorName || '',
      operatorShortName: res.operatorShortName || '',
      industryCategory: res.industryCategory || '',
      expireDate: res.expireDate || '',
      logoUrl: res.logoUrl || '',
      creditCode: res.creditCode || '',
      establishDate: res.establishDate || '',
      legalPerson: res.legalPerson || '',
      legalIdCard: res.legalIdCard || '',
      enterpriseAddress: res.enterpriseAddress || '',
      regionCode: res.regionCode ? res.regionCode.split(',') : [],
      longitude: res.longitude || '',
      latitude: res.latitude || '',
      businessLicenseUrl: res.businessLicenseUrl || '',
      contactName: res.contactName || '',
      contactPhone: res.contactPhone || '',
      contactEmail: res.contactEmail || ''
    })
    originalForm.value = JSON.parse(JSON.stringify(form))
  } catch (error) {
    console.error('获取运营商详情失败:', error)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function startEdit() {
  originalForm.value = JSON.parse(JSON.stringify(form))
  editing.value = true
}

function cancelEdit() {
  if (originalForm.value) {
    Object.assign(form, originalForm.value)
  }
  editing.value = false
  formRef.value?.clearValidate()
}

// 地图
function openMap() {
  if (form.longitude && form.latitude) {
    mapInitCenter.value = [Number(form.longitude), Number(form.latitude)]
  } else {
    mapInitCenter.value = [104.065735, 30.659462]
  }
  showMap.value = true
}

function confirmMap() {
  const pos = mapRef.value?.getCurrentPosition()
  if (pos && pos.length === 2) {
    form.longitude = pos[0].toFixed(6)
    form.latitude = pos[1].toFixed(6)
    ElMessage.success(`位置已选择: 经度${form.longitude}, 纬度${form.latitude}`)
    showMap.value = false
    nextTick(() => {
      formRef.value?.validateField('longitude')
    })
  } else {
    ElMessage.warning('请先在地图上选择一个位置')
  }
}

function cancelMap() {
  showMap.value = false
}

async function submitForm() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await api.editOperator({
      id: route.query.id,
      ...form,
      regionCode: Array.isArray(form.regionCode) ? form.regionCode.join(',') : form.regionCode
    })
    ElMessage.success('保存成功')
    editing.value = false
    originalForm.value = JSON.parse(JSON.stringify(form))
    await fetchDetail()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped lang="scss">
.operator-detail {
  :deep(.el-form-item__label) {
    font-size: 16px;
    font-weight: 400;
    text-align: left;
    color: #303537;
  }
  :deep(.el-date-editor) {
    width: 100%;
  }
}
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #050505;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 8px;
}
</style>
