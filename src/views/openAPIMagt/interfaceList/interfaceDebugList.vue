<template xmlns="http://www.w3.org/1999/html">
  <div class="product-page">
    <!-- 左侧侧边栏：接口列表 -->
    <div class="sidebar">
      <div class="sidebar-search">
        <el-input
            v-model="searchKeyword"
            placeholder="请输入接口名称"
            clearable
            prefix-icon="Search"
        />
      </div>
      <el-tree
          :data="filteredTreeData"
          :props="treeProps"
          default-expand-all
          @node-click="handleNodeClick"
          class="sidebar-tree"
      >
        <!-- 自定义节点模板：区分一级/二级节点样式 -->
        <template #default="{ node, data }">
          <div class="tree-node-custom">
            <!-- 一级/二级 label 类名区分 -->
            <div
                class="node-label"
                :class="{
          'node-label-level1': node.level === 1,
          'node-label-level2': node.level === 2
        }"
            >
              {{ node.label }}
            </div>
            <!-- 仅二级节点显示 id -->
            <div class="node-id" v-if="data.id">{{ data.id }}</div>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 中间：参数配置区 -->
    <div class="main-content">
      <div class="api-header">
        <h2 class="api-title">{{ currentApi.title }}</h2>
        <p class="api-desc">{{ currentApi.desc }}</p>
      </div>

      <el-tabs v-model="activeTab" class="api-tabs">
        <el-tab-pane label="参数配置" name="params">
          <div class="params-form">
            <div class="params-section">
              <h3 class="section-title">
                <img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />输入参数
              </h3>
              <div v-for="item in inputParams" :key="item.key" class="param-item">
                <div class="param-label">
                  <span v-if="item.required" class="required">*</span>
                  <span class="field-label">{{ item.label }}</span>
                  <span class="cn-label">{{ item.cnLabel }}</span>
                  <el-tooltip
                      :content="item.desc"
                      placement="right"
                      effect="light"
                      :nowrap="false"
                      raw-content
                  >
                    <el-icon :size="16" class="info-icon"><Warning /></el-icon>
                  </el-tooltip>
                </div>
                <el-input v-if="item.type==='input'"
                    v-model="item.value"
                    :placeholder="`请输入${item.cnLabel}`"
                    clearable
                    class="param-input"
                />
              </div>
            </div>

            <div class="params-section">
              <h3 class="section-title"><img src="@/assets/images/icon/icon-info.png" class="w-5 h-5 mr-2.5" alt="" />分页参数</h3>
              <div v-for="item in pageParams" :key="item.key" class="param-item">
                <div class="param-label">
                  <span v-if="item.required" class="required">*</span>
                  <span class="field-label">{{ item.label }}</span>
                  <span class="cn-label">{{ item.cnLabel }}</span>
                  <el-tooltip
                      :content="item.desc"
                      placement="right"
                      effect="light"
                      :nowrap="false"
                      raw-content
                  >
                    <el-icon :size="16" class="info-icon"><Warning /></el-icon>
                  </el-tooltip>
                </div>
                <el-input-number
                    v-if="item.type==='pageSize'"
                    v-model="item.value"
                    controls-position="right"
                    class="param-input"
                    :min="1"
                    :max="100"
                    :step-strictly="true"
                />
                <el-input-number
                    v-if="item.type==='currentPage'"
                    v-model="item.value"
                    controls-position="right"
                    class="param-input"
                    :min="1"
                    :max="100"
                    :step-strictly="true"
                />
              </div>
            </div>

            <div class="params-actions">
              <el-button @click="handleClearParams" class="clean-btn-md">
                <span class="front-style">
                  清空
                </span>
              </el-button>
              <el-button type="primary" @click="handleCallApi" class="save-btn-md">
                <span class="front-style">发起调用</span>
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="API密钥配置" name="auth">
          <div class="auth-form">
            <p class="auth-tip">使用 OpenAPI 前，您需要配置密钥信息。</p>
            <div v-for="item in inputParams" :key="item.key" class="param-item">
              <div class="param-label">
                <span v-if="item.required" class="required">*</span>
                <span class="field-label">{{ item.label }}</span>
                <span class="cn-label">{{ item.cnLabel }}</span>
                <el-tooltip
                    :content="item.desc"
                    placement="right"
                    effect="light"
                    :nowrap="false"
                    raw-content
                >
                  <el-icon :size="16" class="info-icon"><Warning /></el-icon>
                </el-tooltip>
              </div>
              <el-input v-if="item.type==='input'"
                        v-model="item.value"
                        :placeholder="`请输入${item.cnLabel}`"
                        clearable
                        class="param-input"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 右侧：文档/调用结果区 -->
    <div class="right-panel">
      <el-tabs v-model="rightActiveTab" class="right-tabs">
        <el-tab-pane label="文档" name="doc">
          <div class="doc-content">
            <h3>接口说明</h3>
            <p>{{ currentApi.doc }}</p>
            <h3>参数说明</h3>
            <!-- 新增表格外层滚动容器 -->
            <div class="table-scroll-container">
              <el-table :data="inputParams" border>
                <el-table-column prop="label" label="参数名" width="150" />
                <el-table-column prop="desc" label="说明" min-width="200" />
                <el-table-column prop="example" label="示例" width="200" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="调用结果" name="result">
          <div class="result-content">
            <div class="result-status" :class="{ success: apiResult.success, error: !apiResult.success }">
              <el-icon :size="20">
                <CircleCheck v-if="apiResult.success" />
                <CircleClose v-else />
              </el-icon>
              <span>{{ apiResult.success ? '调用成功' : '调用失败' }}</span>
              <span class="status-code">状态码：{{ apiResult.code }}</span>
              <span class="cost-time">耗时：{{ apiResult.costTime }}s</span>
            </div>

            <el-tabs v-model="resultTab" type="border-card">
              <el-tab-pane label="响应信息" name="response">
                <el-input
                    v-model="apiResult.response"
                    type="textarea"
                    :rows="15"
                    readonly
                    class="result-textarea"
                />
              </el-tab-pane>
              <el-tab-pane label="请求信息" name="request">
                <el-input
                    v-model="apiResult.request"
                    type="textarea"
                    :rows="15"
                    readonly
                    class="result-textarea"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>

        <el-tab-pane label="调用历史" name="history">
          <div class="history-content">
            <!-- 新增表格外层滚动容器 -->
            <div class="table-scroll-container">
              <el-table :data="callHistory" border>
                <el-table-column prop="time" label="调用时间" width="180" />
                <el-table-column prop="api" label="接口" width="150" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.success ? 'success' : 'danger'">
                      {{ row.success ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="costTime" label="耗时" width="80" />
                <el-table-column label="操作" width="80">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="reCallApi(row)">重调</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  QuestionFilled,
  CircleCheck,
  CircleClose, Warning
} from '@element-plus/icons-vue'
import * as api from '@/api/iot'
import apiListData from '@/assets/openapi/apiListData.json'

// ==================== 数据定义 ====================
// 搜索关键词
const searchKeyword = ref('')

// 侧边栏树数据
const originalTreeData = ref(apiListData)

// 核心：计算属性 - 过滤后的树数据
const filteredTreeData = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return originalTreeData.value
  }

  // 递归过滤方法（安全版）
  function filterNodes(nodes) {
    if (!Array.isArray(nodes)) return [] // 关键修复：不是数组直接返回[]

    return nodes.map(node => {
      const item = { ...node }

      // 递归过滤子节点
      if (item.children && item.children.length) {
        const filteredChildren = filterNodes(item.children)

        if (filteredChildren.length > 0) {
          item.children = filteredChildren
          return item
        }
      }

      // 匹配：label 或 id
      const matchLabel = item.label?.toLowerCase().includes(keyword)
      const matchId = item.id?.toLowerCase().includes(keyword)

      if (matchLabel || matchId) {
        return item
      }

      return null
    }).filter(Boolean)
  }

  return filterNodes(originalTreeData.value)
})

// 树配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 当前选中的接口
const currentApi = ref({
  title: 'QueryProduct',
  desc: '调用该接口查看指定设备上报属性的数据快照',
  doc: '该接口用于查询IoT平台中所有设备的列表信息，支持按设备标识、名称、产品等条件筛选，并支持分页查询。'
})

// 输入参数
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

// 分页参数
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

// API密钥配置
const authConfig = reactive({
  appKey: '',
  appSecret: ''
})

// 标签页状态
const activeTab = ref('params')
const rightActiveTab = ref('result')
const resultTab = ref('response')

// 接口调用结果
const apiResult = ref({
  success: false,
  code: -100,
  costTime: 0,
  response: '',
  request: ''
})

// 调用历史
const callHistory = ref([])

// ==================== 方法定义 ====================
/**
 * 侧边栏节点点击：切换当前接口
 */
const handleNodeClick = (node) => {
  if (node.id) {
    currentApi.value = {
      title: node.id,
      desc: node.desc || '',
      doc: `该接口用于${node.label}，支持条件筛选和分页查询。`
    }
    // 清空参数
    inputParams.forEach(item => item.value = '')
    pageParams.forEach(item => item.value = 10)
  }
}

/**
 * 清空参数
 */
const handleClearParams = () => {
  inputParams.forEach(item => item.value = '')
  pageParams.forEach(item => item.value = 1)
  ElMessage.success('已清空参数')
}

/**
 * 发起接口调用
 */
const handleCallApi = async () => {
  try {
    // 1. 构造请求参数
    const params = {}
    inputParams.forEach(item => {
      if (item.value) params[item.key] = item.value
    })
    pageParams.forEach(item => {
      params[item.key] = item.value
    })

    // 2. 调用接口（替换为真实接口）
    const startTime = Date.now()
    const res = await api.queryProductList({
      ...params,
      appKey: authConfig.appKey,
      appSecret: authConfig.appSecret
    })
    const costTime = ((Date.now() - startTime) / 1000).toFixed(2)

    // 3. 处理返回结果
    apiResult.value = {
      success: res.code === 200,
      code: res.code || 200,
      costTime,
      response: JSON.stringify(res, null, 2),
      request: JSON.stringify(params, null, 2)
    }

    // 4. 加入调用历史
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

/**
 * 重调历史接口
 */
const reCallApi = (row) => {
  // 找到历史参数并回填（简化逻辑，实际可存储完整参数）
  handleCallApi()
}
</script>

<style lang="scss" scoped>
// 核心修改：限制页面最大宽度，居中显示
.product-page {
  display: flex;
  height: calc(100vh - 100px);
  background: #f5f7fa;
  gap: 16px;
  padding: 16px 0; // 调整padding避免边缘紧贴
  box-sizing: border-box;
  max-width: 1920px; // 限制最大宽度
  margin: 0 auto; // 居中显示
  width: 100%; // 自适应小屏幕
}

// 左侧侧边栏
.sidebar {
  width: 25%;
  flex-shrink: 0; // 固定宽度不收缩
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;

  .sidebar-search {
    :deep(.el-input__wrapper) {
      border-radius: 8px;
    }
  }

  .sidebar-tree {
    flex: 1;
    overflow-y: auto;

    // 自定义节点容器
    :deep(.tree-node-custom) {
      display: flex;
      flex-direction: column;
      padding: 4px 0;
    }

    // 一级节点 label 样式（加粗、更大字号、主色）
    :deep(.node-label-level1) {
      width: 60px;
      height: 21px;
      font-size: 15px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #303537;
    }

    // 二级节点 label 样式（常规字号、次要色）
    :deep(.node-label-level2) {
      width: 154px;
      height: 20px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #303537;
      line-height: 16px;
    }

    // 二级节点 id 样式（保持不变）
    :deep(.node-id) {
      width: 79px;
      height: 17px;
      font-size: 12px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #afb2b8;
      line-height: 16px;
    }

    // 调整树节点默认样式，适配层级差异
    :deep(.el-tree-node__content) {
      height: auto !important; // 取消固定高度
      padding: 6px 4px; // 一级/二级节点统一内边距
      line-height: 1.4;
    }
  }
}

// 中间主内容区
// 中间主内容区 - 核心修改（解决api-tabs溢出问题）
.main-content {
  flex: 1;
  min-width: 200px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  // 关键：把main-content改为flex布局，垂直排列
  display: flex;
  flex-direction: column;
  // 保留overflow，但只在极端情况生效
  overflow: hidden;
  box-sizing: border-box;

  .api-header {
    flex-shrink: 0; // 标题区固定高度，不收缩、不被挤压
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 16px;

    .api-title {
      width: 111px;
      height: 24px;
      font-size: 16px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #303537;
    }

    .api-desc {
      width: 280px;
      height: 20px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #505658;
      line-height: 16px;
    }
  }

  .api-tabs {
    flex: 1; // 自动占满main-content剩余空间（替代100%高度）
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden; // 闭合容器，防止子元素溢出

    :deep(.el-tabs__header) {
      flex-shrink: 0; // 标签头固定高度
      margin: 0 0 16px 0; // 用margin-bottom替代content的padding-top，减少计算误差
    }

    :deep(.el-tabs__content) {
      flex: 1; // 占满api-tabs剩余空间
      padding: 0; // 重置默认padding
      overflow: auto; // 内容超出时滚动
      box-sizing: border-box;
    }

    // 1. 未选中的 Tab 字体样式
    :deep(.el-tabs__item) {
      height: 29px;
      font-size: 13px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #303537;
      padding-bottom: 10px;
    }

    :deep(.el-tabs__item.is-active) {
      height: 29px;
      font-size: 13px;
      font-family: Source Han Sans SC, Source Han Sans SC-Bold;
      font-weight: 700;
      text-align: left;
      color: #1464ee;
    }

    :deep(.el-tabs__item:hover) {
      color: #1464ee;       // 悬浮文字颜色
    }
  }

  // 以下样式保持不变
  .params-form {
    .params-section {
      margin-bottom: 24px;
      padding-right: 16px;
      .section-title {
        display: flex;
        align-items: center;
        white-space: nowrap;
        line-height: 1;
        width: 56px;
        height: 20px;
        font-size: 14px;
        font-family: Source Han Sans SC, Source Han Sans SC-Bold;
        font-weight: 700;
        text-align: left;
        color: #131617;
        margin-bottom: 16px;
      }

      .param-item {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .param-label {
          font-size: 14px;
          color: #606266;
          display: flex;
          align-items: center;
          gap: 8px;

          .required {
            color: #F8345C;
          }

          .info-icon {
            width: 14px;
            height: 14px;
          }

          .example-label {
            font-size: 12px;
            color: #c0c4cc;
          }

          .field-label{
            height: 20px;
            font-size: 14px;
            font-family: Source Han Sans SC, Source Han Sans SC-Bold;
            font-weight: 700;
            text-align: left;
            color: #303537;
          }
          .cn-label{
            height: 19px;
            font-size: 13px;
            font-family: Source Han Sans SC, Source Han Sans SC-Regular;
            font-weight: 400;
            text-align: left;
            color: #b2bac4;
          }
        }

        .param-input {
          width: 100%;
          max-width: 500px;
        }
      }
    }

    .params-actions {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 16px;
      padding-right: 10px;
      border-top: 1px solid #eee;
    }
    .clean-btn-md {
      .front-style{
        width: 28px;
        font-size: 14px;
        font-family: Source Han Sans SC, Source Han Sans SC-Regular;
        font-weight: 400;
        text-align: left;
        color: #767c80;
      }
      width: 76px;
      height: 32px;
      border-color: #ffffff;
      background: #f6f7f9;
      border-radius: 6px;
    }
    .save-btn-md {
      .front-style{
        width: 56px;
        font-size: 14px;
        font-family: Source Han Sans SC, Source Han Sans SC-Regular;
        font-weight: 400;
        text-align: left;
        color: #131617;
      }
      width: 76px;
      height: 32px;
      background: #ebf4ff;
      border-radius: 6px;
      border-color: #ffffff;
    }
  }

  .auth-form {
    padding: 16px;

    .auth-tip {
      height: 20px;
      font-size: 14px;
      font-family: Source Han Sans SC, Source Han Sans SC-Regular;
      font-weight: 400;
      text-align: left;
      color: #505658;
      line-height: 16px;
    }
  }
}

// 右侧面板
.right-panel {
  width: 40%;
  flex-shrink: 0; // 固定宽度不收缩
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  .right-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.el-tabs__header) {
      flex-shrink: 0; // 标签头不收缩
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto; // 避免内容双重滚动
    }
  }

  // 文档内容区 - 核心修改
  .doc-content {
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto; // 内容超出时显示滚动条
    // 优化滚动体验
    scrollbar-width: thin;
    scrollbar-color: #dcdfe6 #f5f7fa;

    // 兼容webkit内核浏览器滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: #f5f7fa;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
      &:hover {
        background: #c0c4cc;
      }
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
    }

    p {
      color: #606266;
      line-height: 1.6;
      margin-bottom: 16px;
    }
  }

  // 新增：表格横向滚动容器
  .table-scroll-container {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 16px;
    // 优化滚动体验
    scrollbar-width: thin;
    scrollbar-color: #dcdfe6 #f5f7fa;

    &::-webkit-scrollbar {
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: #f5f7fa;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
      &:hover {
        background: #c0c4cc;
      }
    }

    :deep(.el-table) {
      width: 100%;
      min-width: max-content; // 确保表格宽度足够显示所有列
      max-height: 300px; // 表格最大高度，纵向滚动
      overflow-y: auto;
    }
  }

  .result-content {
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    padding-right: 10px;

    .result-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 500;
      flex-shrink: 0;

      &.success {
        background: #f0f9ff;
        color: #67c23a;
        border: 1px solid #e1f3d8;
      }

      &.error {
        background: #fef0f0;
        color: #f56c6c;
        border: 1px solid #fbc4c4;
      }

      .status-code,
      .cost-time {
        margin-left: 16px;
        color: #909399;
        font-weight: 400;
      }
    }

    .result-textarea {
      width: 100%;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
    }

    :deep(.el-tabs) {
      height: calc(100% - 60px); // 减去状态栏高度
      display: flex;
      flex-direction: column;

      :deep(.el-tabs__content) {
        flex: 1;
      }
    }
  }

  .history-content {
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
  }
}
</style>
