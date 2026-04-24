<template>
  <div class="product-page" v-loading="loading">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ApiSidebar from "@views/openAPIMagt/interfaceList/components/apiSidebar/ApiSidebar.vue";
import ApiConfigPanel from "@views/openAPIMagt/interfaceList/components/apiConfigPanel/ApiConfigPanel.vue";
import ApiRightPanel from "@views/openAPIMagt/interfaceList/components/apiRightPanel/ApiRightPanel.vue";
import paramsConfigData from '@/../public/openapi/paramsConfigData.json'
import pageParamsConfigData from '@/../public/openapi/pageParamsConfigData.json'
import { openApiClient, validateRequiredParams } from '@/views/openAPIMagt/interfaceList/util/openApiSignature'
const appKey = ref('demo-ak-sm3')
const appSecret = ref('b8c5504c3ee43ecfe3207abb5b63692f7759d41de7c628f80a92569c151c149d')

const currentApi = ref({
  "id": "10001",
  "label": "查询所有设备列表信息",
  "apiPath": "getDeviceList",
  "method": "GET",
  "desc": "调用该接口查询所有设备列表信息",
  "level": 2,
  "docPath": "/../public/openapi/docs/IotDeviceOpenApi_getDeviceList接口文档.md",
  "hasPage": true
})

const inputParams = reactive(paramsConfigData);

const pageParams = reactive(pageParamsConfigData)

const activeTab = ref('params')
const rightActiveTab = ref('doc')
const resultTab = ref('response')

const apiResult = ref({})

// loading 状态
const loading = ref(false)

// 调用历史 - 使用 ref 以便手动更新
const callHistory = ref([])

// 更新调用历史的辅助函数
const updateCallHistory = () => {
  callHistory.value = openApiClient.getCallHistory(currentApi.value.id)
}

onMounted(() => {
 updateCallHistory()
})

const handleNodeClick = (node) => {
  if (node.id !== currentApi.value.id) {
    currentApi.value = {
      id: node.id,
      label: node.label,
      apiPath: node.apiPath,
      desc: node.desc || '',
      docPath: node.docPath || `/src/assets/openapi/docs/${node.id.toLowerCase()}.md`,
      hasPage: node.hasPage
    }
    updateCallHistory()
    inputParams.forEach(item => item.value = '')
    pageParams.forEach(item => item.value = 1)
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
  // 防止重复点击
  if (loading.value) {
    return
  }

  if (!appKey.value || !appSecret.value) {
    activeTab.value = 'auth'
    ElMessage.error('请填写密钥')
    return
  }
  if (activeTab.value === 'auth') {
    ElMessage.success('保存成功')
    activeTab.value = 'params'
    return
  }

  // 开启 loading
  loading.value = true

  try {
    const { valid, missingParams } = validateRequiredParams(inputParams, pageParams, currentApi.value.id)
    if (!valid) {
      ElMessage.warning(`请填写必填参数：${missingParams.join('、')}`)
      return
    }
    const params = {}
    inputParams.forEach(item => {
      // 如果item为list
      if (item.value!==null && item.value){
        console.log("item", item.value)
        if (item.type === 'daterange') {
          params['startTime']= formatDate(item.value[0])
          params['endTime']= formatDate(item.value[1])
        } else {
          params[item.key] = item.value
        }
      }
    })
    if (currentApi.value.hasPage){
      pageParams.forEach(item => {
        params[item.key] = item.value
      })
    }
    // 发起请求
    const result = await openApiClient.request({
      gatewayUrl: import.meta.env.VITE_OPENAPI_GATEWAY_URL,
      accessKey: appKey.value,
      secretKey: appSecret.value,
      action: currentApi.value.apiPath,
      signMethod: 'SM3',
      httpMethod: 'GET',
      extraParams: params,
      apiId: currentApi.value.id  // 接口 ID，用于缓存
    })
    rightActiveTab.value='result'
    console.log('接口返回:', result);
    apiResult.value = {
      success: result.success,
      code: result.data.code,
      costTime: result.costTime,
      response: result.data,
      responseHeaders: JSON.stringify(result.responseHeaders, null, 2),
      request: JSON.stringify(params, null, 2),
      requestHeaders: JSON.stringify(result.requestHeaders, null, 2)
    }
    updateCallHistory()
    if (result.success){
      ElMessage.success('调用成功')
    }else{
      ElMessage.error('调用失败')
    }
  } catch (e) {
    console.log('接口异常:', e)
    apiResult.value = {
      success: false,
      code: -100,
      costTime: 0,
      response: '接口调用异常，请检查参数或网络',
      request: {}
    }
    openApiClient.saveCallHistory(currentApi.value.id, currentApi.value.apiPath, {
      success: false,
      code: -100,
      costTime: 0,
      response: '接口调用异常，请检查参数或网络',
      request: {}
    })
    updateCallHistory()
    rightActiveTab.value='result'
    ElMessage.error('接口调用失败')
  } finally {
    // 关闭 loading
    loading.value = false
  }
}

const reCallApi = (row) => {
  console.log("重新调用参数:", row.params);

  if (!row.params) {
    ElMessage.warning('该记录没有参数信息')
    return
  }

  // 将历史参数填充到表单
  inputParams.forEach(item => {
    if (row.params[item.key] !== undefined) {
      item.value = row.params[item.key]
    }
  })

  // 填充分页参数
  if (row.params.PageSize !== undefined) {
    const pageSizeParam = pageParams.find(p => p.key === 'PageSize')
    if (pageSizeParam) pageSizeParam.value = row.params.PageSize
  }
  if (row.params.CurrentPage !== undefined) {
    const currentPageParam = pageParams.find(p => p.key === 'CurrentPage')
    if (currentPageParam) currentPageParam.value = row.params.CurrentPage
  }

  // 切换到参数配置 Tab
  activeTab.value = 'params'

  // 发起调用
  handleCallApi()
}


/**
 * @Description 时间格式化 YYYY-MM-DD
 * @author Huang Jialin
 * @date 2026/4/14 15:09
 */
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
