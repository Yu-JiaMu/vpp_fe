<template>
  <el-dialog
    v-model="dialogVisible"
    align-center
    title="导入物模型"
    :show-close="false"
    width="710"
    :close-on-click-modal="false"
  >
    <div class="export-model-dialog">
      <!-- 导入方式 -->
      <el-form label-width="90px" label-position="top">
        <el-form-item label="导入方式" required>
          <el-select v-model="importType">
            <el-option label="拷贝产品" value="product" />
            <el-option label="JSON导入" value="json" />
          </el-select>
        </el-form-item>

        <!-- 接入产品 -->
        <template v-if="importType === 'product'">
          <el-form-item label="选择产品" required>
            <el-select v-model="productId" @change="handleProductSelect">
              <el-option v-for="item in productList" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-table :data="tableData" border class="mt-4" height="320">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="type" label="功能类型" />
            <el-table-column prop="name" label="功能名称" />
            <el-table-column prop="identifier" label="标识符" />
            <el-table-column prop="dataType" label="数据类型" />
          </el-table>
        </template>

        <!-- JSON 导入 -->
        <template v-else>
          <el-form-item label="文件上传" required>
            <el-upload
              class="w-full"
              drag
              :limit="1"
              accept=".json"
              :auto-upload="false"
              :on-change="handleFileChange"
            >
              <img class="w-12 h-12 mx-auto" src="@/assets/images/icon/icon-005.png" alt="" />
              <div class="mt-2 text-sm text-gray-600">
                将文件拖到此处，或 <span class="cursor-pointer text-primary">点击上传</span>
              </div>
              <div class="mt-1 text-xs text-gray-400"> 支持 json 格式，大小不超过 2M </div>
            </el-upload>
          </el-form-item>

          <!-- <div class="mt-2 text-sm text-gray-600">
            此处显示已上传的文件名：<span class="text-primary">{{ fileName || '-' }}</span>
          </div> -->

          <div class="mt-5">
            <div class="mb-5 text-sm text-gray-600">下载模板</div>
            <el-button class="w-[382px] !bg-[#f7f8fa] rounded-md" link type="primary">
              <img class="w-9 h-9" src="@/assets/images/icon/icon-006.png" alt="" />
              物模型模板.json
            </el-button>
          </div>
        </template>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button
          size="large"
          type="info"
          class="w-[177px]"
          v-ripple
          @click="dialogVisible = false"
          >取消</el-button
        >
        <el-button type="primary" class="w-[177px]" v-ripple @click="handleConfirm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { transformThingJsonToTable } from '@/utils'
  import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'
  import thingJson from '../thing.json'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const dialogVisible = ref(false)

  /** 导入方式 */
  const importType = ref('json')

  /** 接入产品 */
  const productId = ref('')
  const tableData = computed(() => {
    if (!productId.value) return []
    return transformThingJsonToTable(
      productList.value.find((item) => item.id === productId.value).thingModel
    )
  })

  const productList = ref([
    {
      createBy: 'test',
      createTime: '2026-01-07 02:56:12',
      updateBy: '0',
      updateTime: '2026-01-08 09:36:25',
      remark: 'string',
      id: 2008734381946048512,
      sceneCode: '家居安防',
      industryCode: '智慧生活',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '那夢',
      thingModel: thingJson,
      categoryType: 'inner'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:13',
      updateBy: null,
      updateTime: '2026-01-07 03:00:13',
      remark: 'string',
      id: 2008735392169332736,
      sceneCode: '网关中控',
      industryCode: '智慧生活',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:21',
      updateBy: null,
      updateTime: '2026-01-07 03:00:21',
      remark: 'string',
      id: 2008735426294190080,
      sceneCode: '未定义',
      industryCode: '智慧生活',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:24',
      updateBy: null,
      updateTime: '2026-01-07 03:00:24',
      remark: 'string',
      id: 2008735440676458496,
      sceneCode: '未定义',
      industryCode: '智慧生活',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的发',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:30',
      updateBy: null,
      updateTime: '2026-01-07 03:00:30',
      remark: 'string',
      id: 2008735463946457088,
      sceneCode: '纺织业',
      industryCode: '智慧工业',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的发各个',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:34',
      updateBy: null,
      updateTime: '2026-01-07 03:00:34',
      remark: 'string',
      id: 2008735482908905472,
      sceneCode: '气表制造',
      industryCode: '智慧工业',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的发各个方式',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:41',
      updateBy: null,
      updateTime: '2026-01-07 03:00:41',
      remark: 'string',
      id: 2008735509731479552,
      sceneCode: '智慧工业',
      industryCode: '智慧工业',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的发各个方式士',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:44',
      updateBy: null,
      updateTime: '2026-01-07 03:00:44',
      remark: 'string',
      id: 2008735524365406208,
      sceneCode: '未定义',
      industryCode: '智慧工业',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的发各个方式士安抚',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:48',
      updateBy: null,
      updateTime: '2026-01-07 03:00:48',
      remark: 'string',
      id: 2008735541004210176,
      sceneCode: '纺织业',
      industryCode: '智慧工业',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的发各个方式士安抚阿萨',
      thingModel: null,
      categoryType: 'define'
    },
    {
      createBy: 'test',
      createTime: '2026-01-07 03:00:56',
      updateBy: null,
      updateTime: '2026-01-07 03:00:56',
      remark: 'string',
      id: 2008735573346488320,
      sceneCode: '纺织业',
      industryCode: '智慧工业',
      sortNum: null,
      categoryLevel: null,
      identifier: null,
      deleteTag: 0,
      name: '啊啊的发各个方式士安抚阿萨安抚',
      thingModel: null,
      categoryType: 'define'
    }
  ])

  const handleProductSelect = (value) => {
    console.log(value)
  }

  /** JSON 导入 */
  const fileName = ref('')

  const handleFileChange = (file) => {
    fileName.value = file.name
  }

  const handleConfirm = () => {
    ElMessageBox.alert('导入失败，请检查导入内容后重新导入。', '温馨提示', {
      // if you want to disable its autofocus
      // autofocus: false,
      confirmButtonText: '确认',
      type: 'warning',
      callback: (action) => {}
    })

    if (importType.value === 'product') {
      console.log('接入产品导入', productId.value)
    } else {
      console.log('JSON导入', fileName.value)
    }
  }

  const open = (row) => {
    dialogVisible.value = true
  }

  defineExpose({ open })
</script>

<style lang="scss">
  .export-model-dialog {
  }
</style>
