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

const appKey = ref('')
const appSecret = ref('')

const currentApi = ref({
  title: 'QueryProduct',
  desc: '调用该接口查看指定设备上报属性的数据快照',
  doc: '该接口用于查询IoT平台中所有设备的列表信息，支持按设备标识、名称、产品等条件筛选，并支持分页查询。'
})

const inputParams = reactive([
  {
    key: 'identifier',
    label: 'Identifier',
    cnLabel: '设备标识符',
    type: 'input',
    required: false,
    desc: '<div class="tooltip-desc">描述</div>' +
        '<span class="tooltip-cont">设备标识符。可在</span>' +
        '<span class="tooltip-link">【设备接入-设备】</span> ' +
        '<span class="tooltip-cont"><br/>模块页面查看</span>' +
        '<hr class="tooltip-underline"/>' +
        '<div class="tooltip-desc">示例</div>' +
        '<span class="tooltip-cont">213123131231</span>',
    value: ''
  },
  {
    key: 'identifier',
    label: 'Identifier',
    cnLabel: '设备名称',
    type: 'input',
    required: false,
    desc: '<div class="tooltip-desc">描述</div>' +
        '<span class="tooltip-cont">设备名称。可在</span>' +
        '<span class="tooltip-link">【设备接入-设备】</span> ' +
        '<span class="tooltip-cont"><br/>模块页面查看</span>' +
        '<hr class="tooltip-underline"/>' +
        '<div class="tooltip-desc">示例</div>' +
        '<span class="tooltip-cont">213123131231</span>',
    value: ''
  },
  {
    key: 'identifier',
    label: 'Identifier',
    cnLabel: '所属产品',
    type: 'input',
    required: false,
    desc: '<div class="tooltip-desc">描述</div>' +
        '<span class="tooltip-cont">指同一类产品下的设备。可在</span>' +
        '<span class="tooltip-link">【设备接入-产品】</span> ' +
        '<span class="tooltip-cont"><br/>模块页面查看</span>' +
        '<hr class="tooltip-underline"/>' +
        '<div class="tooltip-desc">示例</div>' +
        '<span class="tooltip-cont">213123131231</span>',
    value: ''
  },
  {
    key: 'identifier',
    label: 'Identifier',
    cnLabel: '状态',
    type: 'input',
    required: false,
    desc: '<div class="tooltip-desc">描述</div>' +
        '<span class="tooltip-cont">设备状态。状态分为在线、离线、<br/>未激活。可在</span>' +
        '<span class="tooltip-link">【设备接入-设备】</span> ' +
        '<span class="tooltip-cont"><br/>模块页面查看设备的状态</span>' +
        '<hr class="tooltip-underline"/>' +
        '<div class="tooltip-desc">示例</div>' +
        '<span class="tooltip-cont">213123131231</span>',
    value: ''
  },
  {
    key: 'identifier',
    label: 'Identifier',
    cnLabel: '节点类型',
    type: 'input',
    required: false,
    desc: '<div class="tooltip-desc">描述</div>' +
        '<span class="tooltip-cont">设备的节点类型。分为网关设备、</span>' +
        '<span class="tooltip-cont"><br/>直连设备、网关子设备。</span>' +
        '<hr class="tooltip-underline"/>' +
        '<div class="tooltip-desc">示例</div>' +
        '<span class="tooltip-cont">213123131231</span>',
    value: ''
  },
])

const pageParams = reactive([
  {
    key: 'pageSize',
    label: 'PageSize',
    cnLabel: '指定返回结果中每页显示的产品数量',
    type: 'pageSize',
    required: true,
    desc: '<div class="tooltip-desc">描述</div>' +
        '<span class="tooltip-cont">指定返回结果中每页显示的设备</span>' +
        '<span class="tooltip-cont"><br/>数量，最大100</span>' +
        '<hr class="tooltip-underline"/>' +
        '<div class="tooltip-desc">示例</div>' +
        '<span class="tooltip-cont">10</span>',
    value: ''
  },
  {
    key: 'CurrentPage',
    label: 'CurrentPage',
    cnLabel: '指定显示返回结果中的第几页',
    type: 'currentPage',
    required: true,
    desc: '<div class="tooltip-desc">描述</div>' +
        '<span class="tooltip-cont">指定返回结果中的第几页</span>' +
        '<hr class="tooltip-underline"/>' +
        '<div class="tooltip-desc">示例</div>' +
        '<span class="tooltip-cont">1</span>',
    value: ''
  },
])

const activeTab = ref('params')
const rightActiveTab = ref('result')
const resultTab = ref('response')

const apiResult = ref({
  success: false,
  code: -100,
  costTime: 0,
  response: '',
  request: ''
})

const callHistory = ref([])

const handleNodeClick = (node) => {
  if (node.id) {
    currentApi.value = {
      title: node.id,
      desc: node.desc || '',
      doc: `该接口用于${node.label}，支持条件筛选和分页查询。`
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
