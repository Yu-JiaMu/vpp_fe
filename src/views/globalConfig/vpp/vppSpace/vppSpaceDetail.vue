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

        <el-form-item label="虚拟电厂类型" prop="vppType">
          <el-select v-model="form.vppType" placeholder="请选择虚拟电厂类型" clearable style="width: 100%" :disabled="!editing">
            <el-option label="发电类虚拟电厂" :value="1" />
            <el-option label="负荷类虚拟电厂" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="市场准入状态" prop="marketAccessStatus">
          <el-select v-model="form.marketAccessStatus" placeholder="请选择市场准入状态" clearable style="width: 100%" :disabled="!editing">
            <el-option label="未准入" :value="1" />
            <el-option label="已注册" :value="2" />
            <el-option label="暂停" :value="3" />
            <el-option label="注销" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="form.region"
            :options="regionOptions"
            placeholder="请选择省-市-区/县"
            clearable
            style="width: 100%"
            :disabled="!editing"
          />
        </el-form-item>

        <el-form-item label="经纬度" prop="longitude">
          <div class="flex w-full gap-2">
            <el-input v-model="form.longitude" placeholder="经度" disabled />
            <el-input v-model="form.latitude" placeholder="纬度" disabled />
            <el-button v-if="editing" @click="openMap">地图点选</el-button>
          </div>
        </el-form-item>

        <el-form-item label="适配政策地区" prop="policyRegions" class="policy-region-item">
          <el-select
            v-model="form.policyRegions"
            multiple
            placeholder="请选择适配政策地区（可多选）"
            clearable
            style="width: 100%"
            :disabled="!editing"
            fit-input-width
            popper-class="policy-region-popper"
          >
            <el-option
              v-for="pr in policyRegionOptions"
              :key="pr.value"
              :label="pr.label"
              :value="pr.value"
            />
          </el-select>
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
  vppType: undefined,
  marketAccessStatus: undefined,
  region: [],
  longitude: '',
  latitude: '',
  policyRegions: []
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
  {
    value: '广东省', label: '广东省',
    children: [
      {
        value: '广州市', label: '广州市',
        children: [
          { value: '荔湾区', label: '荔湾区' }, { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' }, { value: '天河区', label: '天河区' },
          { value: '白云区', label: '白云区' }, { value: '黄埔区', label: '黄埔区' },
          { value: '番禺区', label: '番禺区' }
        ]
      },
      {
        value: '深圳市', label: '深圳市',
        children: [
          { value: '罗湖区', label: '罗湖区' }, { value: '福田区', label: '福田区' },
          { value: '南山区', label: '南山区' }, { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' }, { value: '龙华区', label: '龙华区' },
          { value: '坪山区', label: '坪山区' }
        ]
      }
    ]
  },
  {
    value: '四川省', label: '四川省',
    children: [
      {
        value: '成都市', label: '成都市',
        children: [
          { value: '锦江区', label: '锦江区' }, { value: '青羊区', label: '青羊区' },
          { value: '金牛区', label: '金牛区' }, { value: '武侯区', label: '武侯区' },
          { value: '成华区', label: '成华区' }, { value: '温江区', label: '温江区' },
          { value: '高新区', label: '高新区' }
        ]
      }
    ]
  },
  {
    value: '浙江省', label: '浙江省',
    children: [
      {
        value: '杭州市', label: '杭州市',
        children: [
          { value: '上城区', label: '上城区' }, { value: '拱墅区', label: '拱墅区' },
          { value: '西湖区', label: '西湖区' }, { value: '滨江区', label: '滨江区' },
          { value: '萧山区', label: '萧山区' }, { value: '余杭区', label: '余杭区' }
        ]
      }
    ]
  },
  {
    value: '北京市', label: '北京市',
    children: [
      {
        value: '北京市', label: '北京市',
        children: [
          { value: '东城区', label: '东城区' }, { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' }, { value: '海淀区', label: '海淀区' },
          { value: '丰台区', label: '丰台区' }
        ]
      }
    ]
  },
  {
    value: '江苏省', label: '江苏省',
    children: [
      {
        value: '南京市', label: '南京市',
        children: [
          { value: '玄武区', label: '玄武区' }, { value: '秦淮区', label: '秦淮区' },
          { value: '建邺区', label: '建邺区' }, { value: '鼓楼区', label: '鼓楼区' },
          { value: '浦口区', label: '浦口区' }
        ]
      }
    ]
  },
  {
    value: '山东省', label: '山东省',
    children: [
      {
        value: '济南市', label: '济南市',
        children: [
          { value: '历下区', label: '历下区' }, { value: '市中区', label: '市中区' },
          { value: '槐荫区', label: '槐荫区' }, { value: '天桥区', label: '天桥区' },
          { value: '历城区', label: '历城区' }
        ]
      }
    ]
  },
  {
    value: '福建省', label: '福建省',
    children: [
      {
        value: '福州市', label: '福州市',
        children: [
          { value: '鼓楼区', label: '鼓楼区' }, { value: '台江区', label: '台江区' },
          { value: '仓山区', label: '仓山区' }, { value: '马尾区', label: '马尾区' },
          { value: '晋安区', label: '晋安区' }
        ]
      }
    ]
  },
  {
    value: '湖南省', label: '湖南省',
    children: [
      {
        value: '长沙市', label: '长沙市',
        children: [
          { value: '芙蓉区', label: '芙蓉区' }, { value: '天心区', label: '天心区' },
          { value: '岳麓区', label: '岳麓区' }, { value: '开福区', label: '开福区' },
          { value: '雨花区', label: '雨花区' }
        ]
      }
    ]
  },
  {
    value: '安徽省', label: '安徽省',
    children: [
      {
        value: '合肥市', label: '合肥市',
        children: [
          { value: '瑶海区', label: '瑶海区' }, { value: '庐阳区', label: '庐阳区' },
          { value: '蜀山区', label: '蜀山区' }, { value: '包河区', label: '包河区' }
        ]
      }
    ]
  }
]

const policyRegionOptions = [
  { label: '华北电力市场', value: '华北电力市场' },
  { label: '华东电力市场', value: '华东电力市场' },
  { label: '南方电力市场', value: '南方电力市场' },
  { label: '西南电力市场', value: '西南电力市场' },
  { label: '西北电力市场', value: '西北电力市场' },
  { label: '华中电力市场', value: '华中电力市场' }
]

const rules = {
  vppName: [{ required: true, message: '请输入虚拟电厂名称', trigger: 'blur' }],
  operatorName: [{ required: true, message: '请选择所属运营商', trigger: 'change' }],
  vppType: [{ required: true, message: '请选择虚拟电厂类型', trigger: 'change' }],
  marketAccessStatus: [{ required: true, message: '请选择市场准入状态', trigger: 'change' }],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  longitude: [{ required: true, message: '请在地图上点选经纬度', trigger: 'change' }]
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
      vppType: res.vppType,
      marketAccessStatus: res.marketAccessStatus,
      region: res.region ? res.region.split(',') : [],
      longitude: res.longitude || '',
      latitude: res.latitude || '',
      policyRegions: res.policyRegions || []
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
      region: Array.isArray(form.region) ? form.region.join(',') : form.region,
      policyRegions: Array.isArray(form.policyRegions) ? form.policyRegions.join(',') : form.policyRegions
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

<style>
.policy-region-popper {
  min-width: var(--el-select-dropdown-width, 320px) !important;
}
</style>
