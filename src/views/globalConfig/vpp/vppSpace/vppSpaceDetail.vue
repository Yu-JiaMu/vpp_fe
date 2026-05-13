<template>
  <div class="pt-5 pb-8 vpp-space-detail">
    <ArtButtonBack class="mb-2.5"> 虚拟电厂详情 </ArtButtonBack>

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

        <el-form-item label="虚拟电厂名称" prop="vppName">
          <el-input v-model="form.vppName" placeholder="请输入虚拟电厂名称" maxlength="100" :disabled="!editing" />
        </el-form-item>

        <el-form-item label="虚拟电厂编号" prop="vppCode">
          <el-input v-model="form.vppCode" placeholder="虚拟电厂编号" disabled />
        </el-form-item>

        <el-form-item label="所属运营商" prop="operatorName">
          <el-select v-model="form.operatorName" placeholder="请选择所属运营商" clearable filterable style="width: 100%" :disabled="!editing">
            <el-option
              v-for="op in operatorOptions"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="接入容量(MW)" prop="accessCapacity">
          <el-input-number
            v-model="form.accessCapacity"
            :min="0"
            :max="99999"
            :precision="2"
            style="width: 100%"
            controls-position="right"
            :disabled="!editing"
          />
        </el-form-item>

        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="form.region"
            :options="regionOptions"
            placeholder="请选择省-市"
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

        <el-form-item label="经度" prop="longitude" class="col-span-1">
          <div class="flex w-full gap-2">
            <el-input v-model="form.longitude" placeholder="经度" disabled />
            <el-input v-model="form.latitude" placeholder="纬度" disabled />
            <el-button v-if="editing" @click="openMap">地图点选</el-button>
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description" class="col-span-2">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入虚拟电厂描述"
            maxlength="500"
            :rows="3"
            show-word-limit
            :disabled="!editing"
          />
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
import { Loading } from '@element-plus/icons-vue'
import MapComponent from '@/components/map/index.vue'
import { generateMockVppSpaceDetail } from './vppSpaceMockData.js'

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
  vppName: '',
  vppCode: '',
  operatorName: '',
  accessCapacity: undefined,
  region: [],
  expireDate: '',
  longitude: '',
  latitude: '',
  description: ''
})

const operatorOptions = [
  { label: '广东绿色能源科技有限公司', value: '广东绿色能源科技有限公司' },
  { label: '深圳智慧能源有限公司', value: '深圳智慧能源有限公司' },
  { label: '浙江新能源电力有限公司', value: '浙江新能源电力有限公司' },
  { label: '北京清能电力技术有限公司', value: '北京清能电力技术有限公司' },
  { label: '江苏华电能源科技有限公司', value: '江苏华电能源科技有限公司' },
  { label: '四川蜀能电力有限公司', value: '四川蜀能电力有限公司' },
  { label: '山东鲁能智慧能源有限公司', value: '山东鲁能智慧能源有限公司' },
  { label: '福建海电能源有限公司', value: '福建海电能源有限公司' },
  { label: '湖南湘电能源科技有限公司', value: '湖南湘电能源科技有限公司' },
  { label: '安徽皖能电力技术有限公司', value: '安徽皖能电力技术有限公司' }
]

const regionOptions = [
  { value: '广东省广州市', label: '广东省广州市' },
  { value: '广东省深圳市', label: '广东省深圳市' },
  { value: '浙江省杭州市', label: '浙江省杭州市' },
  { value: '北京市', label: '北京市' },
  { value: '江苏省南京市', label: '江苏省南京市' },
  { value: '四川省成都市', label: '四川省成都市' },
  { value: '山东省济南市', label: '山东省济南市' },
  { value: '福建省福州市', label: '福建省福州市' },
  { value: '湖南省长沙市', label: '湖南省长沙市' },
  { value: '安徽省合肥市', label: '安徽省合肥市' }
]

const rules = {
  vppName: [{ required: true, message: '请输入虚拟电厂名称', trigger: 'blur' }],
  operatorName: [{ required: true, message: '请选择所属运营商', trigger: 'change' }],
  accessCapacity: [{ required: true, message: '请输入接入容量', trigger: 'blur' }],
  expireDate: [{ required: true, message: '请选择到期时间', trigger: 'change' }]
}

const useMockData = true

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
    const res = useMockData ? generateMockVppSpaceDetail(id) : await api.getVppSpaceDetail({ id })
    detailData.value = res
    Object.assign(form, {
      vppName: res.vppName || '',
      vppCode: res.vppCode || '',
      operatorName: res.operatorName || '',
      accessCapacity: res.accessCapacity,
      region: res.region ? [res.region] : [],
      expireDate: res.expireDate || '',
      longitude: res.longitude || '',
      latitude: res.latitude || '',
      description: res.description || ''
    })
    originalForm.value = JSON.parse(JSON.stringify(form))
  } catch (error) {
    console.error('获取虚拟电厂详情失败:', error)
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
    await api.editVppSpace({
      id: route.query.id,
      ...form,
      region: Array.isArray(form.region) ? form.region.join(',') : form.region
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
.vpp-space-detail {
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
