<template>
  <div class="min-h-full pb-5 bg-white">
    <!-- 顶部搜索区 -->
    <div class="flex items-center justify-between p-5 search-con">
      <div class="flex flex-wrap items-center">
        <el-form :model="form" inline class="">
          <el-form-item>
            <el-select
              v-model="form.devState"
              placeholder="请选择状态"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="item in DEVICE_STATUS_TYPES.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-date-picker
              v-model="form.value1"
              type="datetimerange"
              range-separator="到"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>

          <el-form-item>
            <el-button @click="getTableData"> 搜索 </el-button>
            <ArtResetBtn class="" @click="handleReset" />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border height="520">
      <el-table-column prop="name" label="属性名称" min-width="140" />

      <el-table-column prop="identifier" label="时间" min-width="200" />

      <el-table-column prop="productName" label="内容" min-width="160" />

      <el-table-column label="操作" fixed="right" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetailDialog(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ArtPagination v-model="pagination" @change="getTableData" />

    <!-- 绑定弹窗 -->
    <el-dialog v-model="dialogVisible" title="详情" width="742px">
      <MonacoEditor v-model="editorContent" theme="vs" class="h-[378px]" lang="json" readOnly />
    </el-dialog>
  </div>
</template>

<script setup>
  import { NODE_TYPES, DEVICE_STATUS_TYPES } from '@/enums'

  const router = useRouter()

  const dialogVisible = ref(false)

  /** 查询条件 */
  const form = reactive({
    name: '',
    productName: '',
    devState: '',
    nodeType: ''
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  /** 表格数据 */
  const tableData = ref([])

  /** 分页 */
  const page = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  /** 获取表格数据（示例 mock） */
  const getTableData = async () => {
    const queryParams = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...form
    }
    // 实际项目：这里换成接口
    /*  const response = await api.apiGetProductList(queryParams)
      if (response) {
        tableData.value = response.rows
        pagination.total = response.total || 0
      } */
    tableData.value = Array.from({ length: 10 }).map((_, i) => ({
      id: i + '',
      name: '属性',
      identifier: '195460491876864',
      productName: 'ADW300计量表',
      devState: i % 2 === 0 ? 'online' : 'offline',
      nodeType: 'SUB',
      devEnable: true,
      lastOnlineTime: '2025-08-12 15:34:51',
      createTime: '2025-08-12 15:34:51'
    }))
    page.total = 658
  }

  const handleReset = () => {
    Object.assign(form, {
      name: '',
      productName: '',
      devState: '',
      nodeType: ''
    })
    getTableData()
  }

  const editorContent = ref('')
  const openDetailDialog = (item) => {
    editorContent.value = item.name
    dialogVisible.value = true
  }

  onMounted(() => {
    getTableData()
  })
</script>

<style lang="scss" scoped>
  .sub-device-management {
  }
  .dividing-line {
    height: 20px;
    width: 1px;
    background-color: #ced1d9;
  }

  @media screen and (max-width: 1600px) {
    .search-con {
      flex-direction: column;
      align-items: flex-start;
    }
    .op-con {
      margin-top: 4px;
      align-self: flex-end;
    }
  }
</style>
