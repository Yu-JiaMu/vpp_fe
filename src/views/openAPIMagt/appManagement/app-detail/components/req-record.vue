<template>
  <ElCard class="art-table-card" shadow="never">
    <ArtSearchBar
        ref="searchBarRef"
        v-model="form"
        :items="formItems"
        @search="onSearch"
        @reset="onReset"
    >
    </ArtSearchBar>
    <el-table
        :data="tableData"
        ref="tableRef"
        border
        show-overflow-tooltip
        style="width: 100%"
        @sort-change="handleSort"
    >
      <el-table-column prop="reqTime" label="请求时间" width="180" sortable="custom" />
      <el-table-column prop="reqId" label="请求ID" min-width="180" />
      <el-table-column prop="id" label="API编号" min-width="180" />
      <el-table-column prop="appName" label="API名称" min-width="180" />
      <el-table-column prop="响应时间" label="响应时间" width="180" sortable="custom" />
      <el-table-column prop="reqStatus" label="调用状态" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.reqStatus === REQ_STATUS.map.REQ_SECESS.value" type="success">调用成功</el-tag>
          <el-tag v-else type="danger">调用失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastReqTime" label="备注" width="180" />
    </el-table>

    <ArtPagination v-model="pagination" @change="getTableData" />
  </ElCard>
</template>

<script setup>
import * as api from '@/api/iot/index.js'
import {ElMessage} from "element-plus";
import {APP_STATUS, REQ_STATUS} from "@/enums/index.ts";

const router = useRouter()

const form = reactive({
  asc: true,
  apiNumber: '',
  apiName: '',
  reqTime: '',
  startTime: '',
  endTime: '',
})

const pagination = reactive({
  size: 10,
  current: 1,
  total: 0
})
const tableData = ref([])
const dialogVisible = ref(false); // 记录弹窗是否显示

const productCategoryList = ref([])

/**
 * @Description 获取列表
 * @author Huang Jialin
 * @date 2026/4/14 14:58
 */
const getTableData = async () => {
  try {
    // 解构赋值，排除reqTime，只传递startTime/endTime
    const { reqTime, ...params } = form;
    const queryParams = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...params // 此时params包含startTime/endTime，无reqTime
    };
    const response = await api.reqLogApiApplication(queryParams);
    if (response) {
      tableData.value = response.rows;
      pagination.total = response.total || 0;
    }
  } catch (error) {
    console.error('获取应用列表失败:', error);
    ElMessage.error('获取应用列表失败');
  }
};

// 表单配置
const formItems = computed(() => [
  {
    label: 'API编号',
    key: 'apiNumber',
    type: 'input',
    placeholder: '请输入API编号',
    clearable: true,
    span: 5
  },
  {
    label: 'API名称',
    key: 'apiName',
    type: 'input',
    placeholder: '请输入apiName',
    clearable: true,
    span: 5
  },
  {
    label: '请求时间',
    key: 'reqTime',
    type: 'datetimerange', // 时间范围选择器类型
    onChange: (val) => {
      if (val && val.length === 2) {
        form.startTime = val[0]; // 开始时间
        form.endTime = val[1];   // 结束时间
      } else {
        form.startTime = '';
        form.endTime = '';
      }
    },
    span: 11,
  }
])

function onSearch() {
  pagination.current = 1;
  getTableData();
}

const tableRef = useTemplateRef('tableRef')

function onReset() {
  pagination.current = 1;
  tableRef.value?.clearSort();
  // 重置时间相关字段
  form.reqTime = '';
  form.startTime = '';
  form.endTime = '';
  // 重置其他表单字段（如果需要）
  form.apiNumber = '';
  form.apiName = '';
  getTableData();
}

function handleSort({ order, prop }) {
  // console.log('更新时间', value)
  form.orderByColumn = prop
  form.isAsc = order
  getTableData()
}

onActivated(() => {
  getTableData()
})

onMounted(() => {})
</script>

<style lang="scss" scoped>
.action-column {
  flex: 1;
  max-width: 100%;

  .action-buttons-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .form-buttons {
    display: flex;
    gap: 8px;
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    margin-left: 10px;
    line-height: 32px;
    color: var(--theme-color);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--ElColor-primary);
    }

    span {
      font-size: 14px;
      user-select: none;
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      margin-left: 4px;
      font-size: 14px;
      transition: transform 0.2s ease;
    }
  }
}
</style>
