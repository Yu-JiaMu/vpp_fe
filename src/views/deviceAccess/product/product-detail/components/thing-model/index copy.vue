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
        <el-button type="primary" class="!ml-4" @click="openAdd">新增</el-button>
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

          <!-- 对象类型的子定义 -->
          <div v-else-if="row.define.type === 'object'" class="text-gray-600">
            <div v-for="spec of row.define.specsArray" :key="spec.identifier" class="mb-2">
              <div class="font-medium">{{ spec.name || spec.identifier }}</div>
              <div class="text-sm">类型：{{ spec.dataType?.type || '-' }}</div>
            </div>
          </div>

          <!-- 兜底显示原始定义 -->
          <div v-else class="text-gray-600">
            {{ JSON.stringify(row.define.raw || row.define) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="rw" label="读写类型" width="100" />

      <!-- 操作 -->
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 导出物模型弹窗 -->
    <ExportModelDialog ref="exportModelDialogRef" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model:visible="dialogVisible"
      :title="isEditing ? '编辑功能' : '新增功能'"
      width="600px"
    >
      <el-form :model="editingForm">
        <el-form-item label="功能类型" label-width="100px">
          <el-select v-model="editingForm.functionMode" placeholder="请选择">
            <el-option label="属性" value="property" />
            <el-option label="事件" value="event" />
            <el-option label="服务/函数" value="service" />
          </el-select>
        </el-form-item>

        <el-form-item label="来源(functionType)" label-width="100px">
          <el-input v-model="editingForm.functionType" />
        </el-form-item>

        <el-form-item label="标识符(identifier)" label-width="100px">
          <el-input v-model="editingForm.identifier" />
        </el-form-item>

        <el-form-item label="名称(name)" label-width="100px">
          <el-input v-model="editingForm.name" />
        </el-form-item>

        <el-form-item label="数据类型" label-width="100px">
          <el-select v-model="editingForm.dataType.type">
            <el-option label="int" value="int" />
            <el-option label="double" value="double" />
            <el-option label="float" value="float" />
            <el-option label="text" value="text" />
            <el-option label="enum" value="enum" />
            <el-option label="object" value="object" />
            <el-option label="array" value="array" />
          </el-select>
        </el-form-item>

        <el-form-item label="dataType.specs(JSON)" label-width="100px">
          <el-input
            type="textarea"
            v-model="editingForm.dataType.specs"
            rows="4"
            placeholder='示例: {"min":0,"max":100}'
          />
        </el-form-item>

        <el-form-item label="读写(accessMode)" label-width="100px">
          <el-select v-model="editingForm.accessMode">
            <el-option label="只读" value="r" />
            <el-option label="读写" value="rw" />
            <el-option label="只写" value="w" />
          </el-select>
        </el-form-item>

        <el-form-item label="模块(module)" label-width="100px">
          <el-select v-model="editingForm._module">
            <el-option
              v-for="m in thing.modules"
              :key="m.identifier"
              :label="m.name + ' (' + m.identifier + ') '"
              :value="m.identifier"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRow">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import ExportModelDialog from './export-model-dialog/index.vue'
  import { ref, computed } from 'vue'
  import thingJson from './thing.json'

  const emit = defineEmits(['update-thing-json'])

  const form = ref({
    name: ''
  })

  // 原始物模型
  const thing = ref(JSON.parse(JSON.stringify(thingJson)))

  // 将 thingJson 展平并转换为表格所需的数据结构
  const tableData = computed(() => {
    const rows = []
    const modules = thing.value.modules || []
    modules.forEach((mod) => {
      // properties
      ;(mod.properties || []).forEach((p) => {
        rows.push(convertItemToRow(p, 'property', mod.identifier))
      })
      ;(mod.events || []).forEach((e) => {
        rows.push(convertItemToRow(e, 'event', mod.identifier))
      })
      ;(mod.functions || []).forEach((f) => {
        rows.push(convertItemToRow(f, 'service', mod.identifier))
      })
    })
    return rows
  })

  function safeGet(obj, path, def = '-') {
    try {
      const parts = path.split('.')
      let cur = obj
      for (const p of parts) {
        if (cur == null) return def
        cur = cur[p]
      }
      return cur == null || cur === '' ? def : cur
    } catch (e) {
      return def
    }
  }

  function convertItemToRow(item, defaultMode = 'property', moduleId) {
    const functionMode = safeGet(item, 'functionMode', defaultMode)
    const functionType = safeGet(item, 'functionType')
    const identifier = safeGet(item, 'identifier')
    const name = safeGet(item, 'name')
    const accessMode = safeGet(item, 'accessMode')
    const dt = item.dataType || {}
    const dataTypeStr = safeGet(dt, 'type')

    // 解析定义
    const specs = dt.specs || {}
    let define = { raw: specs }

    if (['int', 'double', 'float'].includes(dt.type) && (specs.min || specs.max)) {
      define = {
        type: 'range',
        min: specs.min ?? specs.minValue ?? '-',
        max: specs.max ?? specs.maxValue ?? '-',
        step: specs.step ?? '-',
        unit: specs.unit ?? '-'
      }
    } else if (dt.type === 'enum' && specs) {
      // specs is object map
      const enums = Object.keys(specs).map((k) => ({ value: k, label: specs[k] }))
      define = { type: 'enum', enums }
    } else if (dt.type === 'object' && specs.specsArray) {
      define = { type: 'object', specsArray: specs.specsArray }
    } else if (defaultMode === 'service') {
      define = { type: 'invoke', mode: item.callType || (item.callType ?? '-') }
    }

    return {
      _module: moduleId,
      _raw: item,
      type: functionMode || '-',
      source: functionType || '-',
      name: name || '-',
      code: identifier || '-',
      dataType: dataTypeStr || '-',
      define,
      rw: accessMode || '-'
    }
  }

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

  // 编辑/新增弹窗状态
  const dialogVisible = ref(false)
  const editingForm = ref({})
  const isEditing = ref(false)

  function openAdd() {
    isEditing.value = false
    editingForm.value = {
      functionMode: 'property',
      functionType: '',
      identifier: '',
      name: '',
      dataType: { type: 'int', specs: '{}' },
      accessMode: 'rw',
      _module: thing.value.modules && thing.value.modules[0] && thing.value.modules[0].identifier
    }
    dialogVisible.value = true
  }

  function openEdit(row) {
    isEditing.value = true
    // deep clone raw
    const raw = row._raw || {}
    editingForm.value = JSON.parse(JSON.stringify(raw))
    // store original id for matching
    editingForm.value._originalId = raw.identifier
    editingForm.value._module = row._module
    // 将 specs 转为 JSON 字符串，便于编辑
    if (editingForm.value.dataType && typeof editingForm.value.dataType.specs !== 'string') {
      try {
        editingForm.value.dataType.specs = JSON.stringify(editingForm.value.dataType.specs)
      } catch (e) {
        editingForm.value.dataType.specs = ''
      }
    }
    dialogVisible.value = true
  }

  function saveRow() {
    try {
      const payload = JSON.parse(JSON.stringify(editingForm.value))
      // ensure dataType exists and parse specs if user entered JSON string
      payload.dataType = payload.dataType || {
        type: payload.dataType?.type || 'text',
        specs: payload.dataType?.specs || {}
      }
      if (typeof payload.dataType.specs === 'string') {
        try {
          payload.dataType.specs = payload.dataType.specs ? JSON.parse(payload.dataType.specs) : {}
        } catch (e) {
          // 若解析失败，保留原字符串在 specs.raw
          payload.dataType.specs = { _raw: payload.dataType.specs }
        }
      }

      const moduleId =
        payload._module ||
        (thing.value.modules && thing.value.modules[0] && thing.value.modules[0].identifier)
      const mod =
        (thing.value.modules || []).find((m) => m.identifier === moduleId) || thing.value.modules[0]
      if (!mod) {
        // 若没有模块则直接返回
        alert('未找到目标模块')
        return
      }

      const listName =
        payload.functionMode === 'event'
          ? 'events'
          : payload.functionMode === 'service'
            ? 'functions'
            : 'properties'
      mod[listName] = mod[listName] || []

      if (isEditing.value) {
        // 查找原始项并替换
        const idx = mod[listName].findIndex((it) => it.identifier === payload._originalId)
        if (idx >= 0) {
          // 删除 helper props
          delete payload._originalId
          delete payload._module
          mod[listName].splice(idx, 1, payload)
        } else {
          // fallback - push
          delete payload._originalId
          delete payload._module
          mod[listName].push(payload)
        }
      } else {
        delete payload._originalId
        delete payload._module
        mod[listName].push(payload)
      }

      // 触发外部更新或上传
      emit('update-thing-json', JSON.parse(JSON.stringify(thing.value)))

      dialogVisible.value = false
    } catch (e) {
      alert('保存失败：' + e.message)
    }
  }
</script>

<style lang="scss" scoped>
  .thing-model {
  }
</style>
