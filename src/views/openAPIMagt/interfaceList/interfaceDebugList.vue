<template>
  <div class="product-page">
    <ApiSidebar @node-click="handleNodeClick" />

    <ApiConfigPanel
      :api-info="currentApi"
      :input-params="inputParams"
      :page-params="pageParams"
      v-model:active-tab="activeTab"
      v-model:app-key="appKey"
      v-model:app-secret="appSecret"
      @clear="handleClearParams"
      @submit="handleCallApi"
    />

    <ApiRightPanel
      v-model:active-tab="rightActiveTab"
      :api-info="currentApi"
      :params="inputParams"
      :api-result="apiResult"
      v-model:result-tab="resultTab"
      :call-history="callHistory"
      @recall="reCallApi"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import * as api from '@/api/iot'
import ApiSidebar from "@views/openAPIMagt/interfaceList/components/apiSidebar/ApiSidebar.vue";
import ApiConfigPanel from "@views/openAPIMagt/interfaceList/components/apiConfigPanel/ApiConfigPanel.vue";
import ApiRightPanel from "@views/openAPIMagt/interfaceList/components/apiRightPanel/ApiRightPanel.vue";
import paramsConfigData from '@/assets/openapi/paramsConfigData.json'
import pageParamsConfigData from '@/assets/openapi/pageParamsConfigData.json'

const appKey = ref('')
const appSecret = ref('')

const currentApi = ref({
  "id": "10001",
  "label": "查询所有设备列表信息",
  "apiPath": "remote.apiApplication.valid.core.info",
  "method": "GET",
  "desc": "调用该接口查询所有设备列表信息",
  "level": 2,
  "docPath": "/src/assets/openapi/docs/create-device.md",
  "hasPage": true
})

const inputParams = reactive(paramsConfigData);

const pageParams = reactive(pageParamsConfigData)

const activeTab = ref('params')
const rightActiveTab = ref('doc')
const resultTab = ref('response')

const apiResult = ref({
  success: false,              // 是否成功
  code: 200,                  // 状态码
  costTime: 188,              // 耗时（毫秒）
  response: "{\n" +
      "    \"code\": 200,\n" +
      "    \"total\": 13,\n" +
      "    \"rows\": [\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:06:11\",\n" +
      "            \"id\": \"2044296202912141312\",\n" +
      "            \"appName\": \"虚拟电厂\",\n" +
      "            \"appStatus\": \"enable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:32:48\",\n" +
      "            \"id\": \"2044302904684318720\",\n" +
      "            \"appName\": \"虚拟电厂2\",\n" +
      "            \"appStatus\": \"disable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:33:03\",\n" +
      "            \"id\": \"2044302967787622400\",\n" +
      "            \"appName\": \"虚拟电厂3\",\n" +
      "            \"appStatus\": \"enable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:33:15\",\n" +
      "            \"id\": \"2044303016307331072\",\n" +
      "            \"appName\": \"虚拟电厂4\",\n" +
      "            \"appStatus\": \"disable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:33:41\",\n" +
      "            \"id\": \"2044303123161419776\",\n" +
      "            \"appName\": \"虚拟电厂6\",\n" +
      "            \"appStatus\": \"disable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:33:48\",\n" +
      "            \"id\": \"2044303153943416832\",\n" +
      "            \"appName\": \"虚拟电厂8\",\n" +
      "            \"appStatus\": \"disable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:33:54\",\n" +
      "            \"id\": \"2044303180149428224\",\n" +
      "            \"appName\": \"虚拟电厂10\",\n" +
      "            \"appStatus\": \"disable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:34:01\",\n" +
      "            \"id\": \"2044303208427425792\",\n" +
      "            \"appName\": \"虚拟电厂12\",\n" +
      "            \"appStatus\": \"disable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:34:07\",\n" +
      "            \"id\": \"2044303233660358656\",\n" +
      "            \"appName\": \"虚拟电厂5\",\n" +
      "            \"appStatus\": \"disable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        },\n" +
      "        {\n" +
      "            \"createTime\": \"2026-04-15 14:34:17\",\n" +
      "            \"id\": \"2044303276173824000\",\n" +
      "            \"appName\": \"虚拟电厂7\",\n" +
      "            \"appStatus\": \"enable\",\n" +
      "            \"endTime\": \"2026-09-10 12:00:00\",\n" +
      "            \"lastRequestTime\": \"2023-04-01 00:00:00\"\n" +
      "        }\n" +
      "    ],\n" +
      "    \"msg\": \"\"\n" +
      "}", // 响应体 JSON 字符串
  request: '{"params": {...}}', // 请求体 JSON 字符串
  responseHeaders: "{\n" +
      "    \"code\": 401,\n" +
      "    \"msg\": \"登录状态已过期\"\n" +
      "}", // 响应头
  requestHeaders: '{"authorization": "Bearer xxx","authorization": "Bearer xxx"}' // 请求头
})

const callHistory = ref([
  {
    time: '2026-03-31 12:00:00',
    api: 'QueryProduct',
    success: true,
    costTime: '188',
    params: {
      PageSize: 1,
      CurrentPage: 1,
      SourceIp: '182.148.54.253'
    }
  },
  {
    time: '2026-03-31 11:55:30',
    api: 'QueryProduct',
    success: true,
    costTime: '205',
    params: {
      PageSize: 10,
      CurrentPage: 1,
      SourceIp: '192.168.1.100'
    }
  },
  {
    time: '2026-03-31 11:50:15',
    api: 'QueryProduct',
    success: true,
    costTime: '156',
    params: {
      PageSize: 20,
      CurrentPage: 2,
      SourceIp: '10.0.0.55'
    }
  },
  {
    time: '2026-03-31 11:45:22',
    api: 'QueryProduct',
    success: true,
    costTime: '234',
    params: {
      PageSize: 5,
      CurrentPage: 1,
      SourceIp: '172.16.0.88'
    }
  },
  {
    time: '2026-03-31 11:40:10',
    api: 'QueryProduct',
    success: true,
    costTime: '178',
    params: {
      PageSize: 15,
      CurrentPage: 3,
      SourceIp: '192.168.2.200'
    }
  },
  {
    time: '2026-03-31 11:35:05',
    api: 'QueryProduct',
    success: true,
    costTime: '199',
    params: {
      PageSize: 8,
      CurrentPage: 1,
      SourceIp: '10.10.10.10'
    }
  },
  {
    time: '2026-03-31 11:30:48',
    api: 'QueryProduct',
    success: true,
    costTime: '167',
    params: {
      PageSize: 12,
      CurrentPage: 2,
      SourceIp: '192.168.0.1'
    }
  },
  {
    time: '2026-03-31 11:25:33',
    api: 'QueryProduct',
    success: true,
    costTime: '211',
    params: {
      PageSize: 10,
      CurrentPage: 1,
      SourceIp: '172.16.8.99'
    }
  },
  {
    time: '2026-03-31 11:20:17',
    api: 'QueryProduct',
    success: false,
    costTime: '0',
    params: {
      PageSize: 10,
      CurrentPage: 1,
      SourceIp: '192.168.1.50',
      ErrorMsg: '网络请求超时'
    }
  },
  {
    time: '2026-03-31 11:15:02',
    api: 'QueryProduct',
    success: false,
    costTime: '0',
    params: {
      PageSize: 5,
      CurrentPage: 1,
      SourceIp: '10.0.0.25',
      ErrorMsg: '认证失败'
    }
  }
])

const handleNodeClick = (node) => {
  if (node.id) {
    currentApi.value = {
      id: node.id,
      label: node.label,
      apiPath: node.apiPath,
      desc: node.desc || '',
      docPath: node.docPath || `/src/assets/openapi/docs/${node.id.toLowerCase()}.md`,
      hasPage: node.hasPage
    }
    inputParams.forEach(item => item.value = '')
    pageParams.forEach(item => item.value = 10)
  }
}

const handleClearParams = () => {
  if (activeTab.value === 'params'){
    inputParams.forEach(item => item.value = '')
    pageParams.forEach(item => item.value = 1)
    ElMessage.success('已清空参数')
  } else {
    appKey.value = ''
    appSecret.value = ''
    ElMessage.success('已清空密钥')
  }
}

const handleCallApi = async () => {
  try {
    const params = {}
    inputParams.forEach(item => {
      if (item.value) params[item.key] = item.value
    })
    pageParams.forEach(item => {
      params[item.key] = item.value
    })

    const startTime = Date.now()
    const res = await api.queryProductList({
      ...params,
      appKey: appKey.value,
      appSecret: appSecret.value
    })
    const costTime = ((Date.now() - startTime) / 1000).toFixed(2)

    apiResult.value = {
      success: res.code === 200,
      code: res.code || 200,
      costTime,
      response: JSON.stringify(res, null, 2),
      request: JSON.stringify(params, null, 2)
    }

    callHistory.value.unshift({
      time: new Date().toLocaleString(),
      api: currentApi.value.title,
      success: res.code === 200,
      costTime
    })

    ElMessage.success(res.code === 200 ? '调用成功' : '调用失败')
  } catch (e) {
    console.error('接口调用失败:', e)
    apiResult.value = {
      success: false,
      code: -100,
      costTime: 0,
      response: '接口调用异常，请检查参数或网络',
      request: JSON.stringify(inputParams, null, 2)
    }
    ElMessage.error('接口调用失败')
  }
}

const reCallApi = (row) => {
  handleCallApi()
}
</script>

<style lang="scss" scoped>
.product-page {
  display: flex;
  height: calc(100vh - 100px);
  background: #f5f7fa;
  gap: 16px;
  padding: 16px 0;
  box-sizing: border-box;
  max-width: 1920px;
  margin: 0 auto;
  width: 100%;
}
</style>
