<template>
  <div class="pt-5 add-operator">
    <ArtButtonBack class="mb-2.5"> 新增运营商 </ArtButtonBack>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="grid grid-cols-2 gap-x-12 gap-y-2"
    >
      <!-- ============ 基本信息 ============ -->
      <div class="col-span-2 section-title">基本信息</div>

      <el-form-item label="运营商名称" prop="operatorName">
        <el-input v-model="form.operatorName" placeholder="请输入运营商名称" maxlength="100" />
      </el-form-item>

      <el-form-item label="运营商简称" prop="operatorShortName">
        <el-input v-model="form.operatorShortName" placeholder="请输入运营商简称" maxlength="50" />
      </el-form-item>

      <el-form-item label="企业信用代码" prop="creditCode">
        <el-input v-model="form.creditCode" placeholder="请输入18位企业信用代码" maxlength="18" />
      </el-form-item>

      <el-form-item label="成立日期" prop="establishDate">
        <el-date-picker
          v-model="form.establishDate"
          type="date"
          placeholder="选择成立日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="企业法人" prop="legalPerson">
        <el-input v-model="form.legalPerson" placeholder="请输入企业法人姓名" maxlength="50" />
      </el-form-item>

      <el-form-item label="法人身份证号" prop="legalIdCard">
        <el-input v-model="form.legalIdCard" placeholder="请输入法人身份证号" maxlength="18" />
      </el-form-item>

      <el-form-item label="企业地址" prop="enterpriseAddress">
        <el-input v-model="form.enterpriseAddress" placeholder="请输入企业地址" maxlength="200" />
      </el-form-item>

      <el-form-item label="所在地区" prop="regionCode">
        <el-cascader
          v-model="form.regionCode"
          :options="regionOptions"
          placeholder="请选择省-市-区/县"
          clearable
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="到期时间" prop="expireDate">
        <el-date-picker
          v-model="form.expireDate"
          type="datetime"
          placeholder="选择到期时间"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>

      <el-form-item label="经纬度" prop="longitude" class="col-span-1">
        <div class="flex w-full gap-2">
          <el-input v-model="form.longitude" placeholder="经度" disabled />
          <el-input v-model="form.latitude" placeholder="纬度" disabled />
          <el-button @click="openMap">地图点选</el-button>
        </div>
      </el-form-item>

      <el-form-item label="营业执照" prop="businessLicenseUrl">
        <UploadImg
          v-model="form.businessLicenseUrl"
          accept="image/jpg,image/png,image/jpeg,image/jfif,image/pjp"
          :file-size="5"
          width="180px"
          height="120px"
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
        >
          <template #tip>
            <span class="text-xs text-gray-400">建议尺寸 400x1200；支持 jpg/png/jfif/pjp/jpeg</span>
          </template>
        </UploadImg>
      </el-form-item>

      <!-- ============ 联系信息 ============ -->
      <div class="col-span-2 section-title mt-4">联系信息</div>

      <el-form-item label="联系人姓名" prop="contactName">
        <el-input v-model="form.contactName" placeholder="请输入联系人姓名" maxlength="50" />
      </el-form-item>

      <el-form-item label="联系人电话" prop="contactPhone">
        <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" maxlength="20" />
      </el-form-item>

      <el-form-item label="联系邮箱" prop="contactEmail">
        <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" maxlength="50" />
      </el-form-item>

      <!-- 按钮 -->
      <div class="col-span-2 flex justify-center gap-5 mt-8">
        <el-button size="large" type="info" class="w-80" v-ripple @click="onCancel">取消</el-button>
        <el-button size="large" type="primary" class="w-80" v-ripple @click="submitForm">
          确认
        </el-button>
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
  </div>
</template>

<script setup>
import * as api from '@/api/vpp'
import { ElMessage } from 'element-plus'
import UploadImg from '@/components/core/Upload/UploadImg.vue'
import MapComponent from '@/components/map/index.vue'

const router = useRouter()
const formRef = ref(null)
const showMap = ref(false)
const mapRef = ref(null)

const form = reactive({
  operatorName: '',
  operatorShortName: '',
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

const mapInitCenter = ref([104.065735, 30.659462])

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
  if (pos) {
    form.longitude = pos[0].toFixed(6)
    form.latitude = pos[1].toFixed(6)
  }
  showMap.value = false
}

function cancelMap() {
  showMap.value = false
}

function onCancel() {
  router.back()
}

async function submitForm() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    await api.addOperator({
      ...form,
      regionCode: Array.isArray(form.regionCode) ? form.regionCode.join(',') : form.regionCode
    })
    ElMessage.success('新增运营商成功')
    router.back()
  } catch (error) {
    console.error('新增运营商失败:', error)
    ElMessage.error('新增运营商失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
.add-operator {
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
