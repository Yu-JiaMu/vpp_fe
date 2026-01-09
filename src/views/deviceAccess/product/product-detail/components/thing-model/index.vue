<template>
  <div class="bg-white rounded-md thing-model">
    <!-- 顶部搜索区 -->
    <div class="flex items-center justify-between p-5">
      <div class="flex items-center gap-2.5">
        <el-input
          v-model="form.name"
          placeholder="请输入功能名称"
          clearable
          class="input-with-prepend"
          style="width: 248px"
        >
          <template #prepend> 产品名称 </template>
        </el-input>

        <ArtSelectPrepend>
          <template #label> 功能类型 </template>
          <el-select
            v-model="form.mode"
            placeholder="请选择功能类型"
            style="width: 149px"
            clearable
          >
            <el-option label="属性" value="category" />
            <el-option label="事件" value="industry" />
            <el-option label="功能" value="scene" />
          </el-select>
        </ArtSelectPrepend>

        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <ArtResetBtn class="!ml-0" @click="handleReset" />
      </div>

      <div class="flex items-center">
        <el-button text class="!text-g-303537" @click="handleExportModel">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-export-eye.png" alt="" />
          导出物模型
        </el-button>
        <el-button text class="!text-g-303537 !ml-0">
          <img class="w-5 h-5 mr-1.5" src="@/assets/images/icon/icon-setting-blue.png" alt="" />
          设置物模型
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border stripe class="w-full">
      <el-table-column prop="type" label="功能类型" width="100" />
      <el-table-column prop="source" label="功能来源" width="100" />
      <el-table-column prop="name" label="功能名称" width="120" />
      <el-table-column prop="code" label="标识符" width="160" />
      <el-table-column prop="dataType" label="数据类型" width="140" />

      <!-- 数据定义 -->
      <el-table-column label="数据定义" min-width="260">
        <template #default="{ row }">
          <!-- 数值范围 -->
          <div v-if="row.define.type === 'range'" class="text-gray-600">
            取值范围：{{ row.define.min }} ~ {{ row.define.max }}；
            <br />
            步长：{{ row.define.step }}；
            <br />
            单位：{{ row.define.unit }}
          </div>

          <!-- 枚举 -->
          <div v-else-if="row.define.type === 'enum'" class="flex flex-wrap gap-2">
            <el-tag v-for="item in row.define.enums" :key="item.value" size="small" type="info">
              {{ item.value }}-{{ item.label }}
            </el-tag>
          </div>

          <!-- 事件等级 -->
          <div v-else-if="row.define.type === 'level'" class="flex gap-2">
            <el-tag
              v-for="level in row.define.levels"
              :key="level"
              :type="levelTagType(level)"
              size="small"
            >
              {{ level }}
            </el-tag>
          </div>

          <!-- 调用方式 -->
          <div v-else-if="row.define.type === 'invoke'" class="text-gray-600">
            调用方式：{{ row.define.mode }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="rw" label="读写类型" width="100" />

      <!-- 操作 -->
      <el-table-column label="操作" width="80" fixed="right">
        <template #default>
          <el-button type="primary" link> 详情 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 导出物模型弹窗 -->
    <ExportModelDialog ref="exportModelDialogRef" />
  </div>
</template>

<script setup>
  import ExportModelDialog from './export-model-dialog/index.vue'
  import { ref } from 'vue'

  const form = ref({
    name: ''
  })

  const tableData = ref([
    {
      type: '属性',
      source: '系统',
      name: '电压',
      code: 'voltage',
      dataType: 'int(整型)',
      define: {
        type: 'range',
        min: 0,
        max: 60,
        step: 1,
        unit: 'V'
      },
      rw: '读写'
    },
    {
      type: '属性',
      source: '系统',
      name: '电压状态',
      code: 'voltage',
      dataType: 'int(整型)',
      define: {
        type: 'enum',
        enums: [
          { value: true, label: '开' },
          { value: false, label: '关' }
        ]
      },
      rw: '读写'
    },
    {
      type: '属性',
      source: '系统',
      name: '电压告警',
      code: 'voltage',
      dataType: 'int(整型)',
      define: {
        type: 'level',
        levels: ['通知', '警告', '紧急']
      },
      rw: '读写'
    },
    {
      type: '属性',
      source: '系统',
      name: '电压同步',
      code: 'voltage',
      dataType: 'int(整型)',
      define: {
        type: 'invoke',
        mode: '同步'
      },
      rw: '读写'
    }
  ])

  const handleSearch = () => {
    console.log('搜索：', form.value.name)
  }

  const handleReset = () => {
    form.value.name = ''
  }

  const levelTagType = (level) => {
    switch (level) {
      case '通知':
        return 'info'
      case '警告':
        return 'warning'
      case '紧急':
        return 'danger'
      default:
        return 'info'
    }
  }

  const exportModelDialogRef = useTemplateRef('exportModelDialogRef')
  const handleExportModel = () => {
    exportModelDialogRef.value.open()
  }
</script>

<style lang="scss" scoped>
  .thing-model {
  }
</style>
