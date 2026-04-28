<template>
  <div class="product-page" v-loading="loading">
    <ApiSidebar @node-click="handleNodeClick" />

    <ApiConfigPanel
      ref="configPanelRef"
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
      @doc-change="handleDocChange"
      @doc-return="handleDocReturn"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ApiSidebar from "@views/openAPIMagt/interfaceList/components/apiSidebar/ApiSidebar.vue";
import ApiConfigPanel from "@views/openAPIMagt/interfaceList/components/apiConfigPanel/ApiConfigPanel.vue";
import ApiRightPanel from "@views/openAPIMagt/interfaceList/components/apiRightPanel/ApiRightPanel.vue";
import paramsConfigData from '@/../public/openApiData/paramsConfigData.json'
import pageParamsConfigData from '@/../public/openApiData/pageParamsConfigData.json'
import { openApiClient } from '@/views/openAPIMagt/interfaceList/util/openApiSignature'
// const appKey = ref('')
// const appSecret = ref('')
const configPanelRef = ref(null)
const appKey = ref('demo-ak-sm3')
const appSecret = ref('b8c5504c3ee43ecfe3207abb5b63692f7759d41de7c628f80a92569c151c149d')
// c7af96cb29bb0601fa645c61a8806373305f0a11231cb3e724939f5c37d9b6b2
const currentApi = ref({
  "id": "10001",
  "label": "查询所有设备列表信息",
  "apiPath": "getDeviceList",
  "method": "GET",
  "desc": "调用该接口查询所有设备列表信息",
  "level": 2,
  "docPath": "/openApiData/docs/IotDeviceOpenApi_List接口文档.md",
  "hasPage": true
})
const oldDocPath = ref('/openApiData/docs/IotDeviceOpenApi_List接口文档.md')

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
      docPath: node.docPath,
      hasPage: node.hasPage
    }
    updateCallHistory()
    inputParams.forEach(item => item.value = '')
    pageParams.forEach(item => {
      if (item.type === 'pageSize'){ item.value = 10 } else { item.value = 1 }
    })
    apiResult.value = {}
    rightActiveTab.value = 'doc'
    activeTab.value= 'params'

    // 清空所有表单验证提示（等新接口参数渲染完毕后再清空）
    nextTick(() => {
      configPanelRef.value?.clearValidateAll()
    })
  }
}

const handleClearParams = () => {
  if (activeTab.value === 'params'){
    inputParams.forEach(item => item.value = '')
    pageParams.forEach(item => {
      if (item.type === 'pageSize'){
        item.value = 10
      } else {
        item.value = 1
      }
    })
    ElMessage.success('已清空参数')
  } else {
    appKey.value = ''
    appSecret.value = ''
    ElMessage.success('已清空密钥')
  }
}

const handleCallApi = async () => {
  if (loading.value) return

  // 如果是密钥配置 Tab，先验证密钥表单
  if (activeTab.value === 'auth') {
    try {
      await configPanelRef.value.validateAuth()
      ElMessage.success('保存成功')
      activeTab.value = 'params'
    } catch (e) {
      // 表单验证失败，错误信息已显示在表单上
      console.log('密钥验证失败', e)
    }
    return
  }

  // 参数配置 Tab 下：验证参数表单和密钥表单
  loading.value = true
  try {
    // 1) 验证参数表单
    await configPanelRef.value.validateParams()
  } catch (e) {
    // 参数验证失败，停留在当前 tab，表单已有红色提示
    loading.value = false
    return
  }

  try {
    // 2) 验证密钥（必须填写）
    await configPanelRef.value.validateAuth()
  } catch (e) {
    // 密钥未填，切换到 auth Tab 以便用户看到错误
    activeTab.value = 'auth'
    loading.value = false
    return
  }

  // 所有验证通过，发起请求
  try {
    const params = {}
    inputParams.forEach(item => {
      if (item.value !== null && item.value) {
        if (item.type === 'daterange') {
          params['startTime'] = formatDate(item.value[0], 'start')
          params['endTime'] = formatDate(item.value[1], 'end')
        } else {
          params[item.key] = item.value
        }
      }
    })
    if (currentApi.value.hasPage) {
      pageParams.forEach(item => { params[item.key] = item.value })
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
    resultTab.value='response'
    console.log('接口返回:', result);
    apiResult.value = {
      success: result.success,
      code: result.data?.code ?? -1,
      costTime: result.costTime,
      response: result.data,
      responseHeaders: JSON.stringify(result.responseHeaders, null, 2),
      request: JSON.stringify(result.requestParams, null, 2),
      requestHeaders: JSON.stringify(result.requestHeaders, null, 2)
    }
    updateCallHistory()
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
    resultTab.value='response'
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

  // 1. 填充参数到原始数组
  inputParams.forEach(item => {
    if (item.type === 'daterange') {
      const startTime = row.params?.startTime
      const endTime = row.params?.endTime
      if (startTime && endTime) {
        item.value = [startTime, endTime]
      }
    } else if (row.params[item.key] !== undefined) {
      item.value = row.params[item.key]
    }
  })


  // 2. 填充分页参数
  const pageSizeParam = pageParams.find(p => p.key === 'pageSize')
  if (pageSizeParam && row.params.pageSize !== undefined) {
    pageSizeParam.value = row.params.pageSize
  }
  const currentPageParam = pageParams.find(p => p.key === 'pageNum')
  if (currentPageParam && row.params.pageNum !== undefined) {
    currentPageParam.value = row.params.pageNum
  }

  // 3. 切换到参数配置 Tab
  activeTab.value = 'params'

  // 4. 重置所有表单验证状态（非常重要！）
  configPanelRef.value?.clearValidateAll()

  // 5. 等待 Vue 完成 DOM 更新和 formModel 同步，再发起调用
  nextTick(() => {
    handleCallApi()
  })
}

const handleDocChange = (newDocPath) => {
  console.log('切换文档:', newDocPath)
  oldDocPath.value = currentApi.value.docPath;
  // 更新当前 API 的文档路径
  currentApi.value.docPath = newDocPath
}

const handleDocReturn = () => {
  currentApi.value.docPath = oldDocPath.value;
}


/**
 * @Description 时间格式化 YYYY-MM-DD
 * @author Huang Jialin
 * @date 2026/4/14 15:09
 */
const formatDate = (dateStr, type) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  if (type === 'start') return `${year}-${month}-${day} 00:00:00`
  if (type === 'end') return `${year}-${month}-${day} 23:59:59`
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
  margin: 0 auto;
  width: 100%;
}
</style>
