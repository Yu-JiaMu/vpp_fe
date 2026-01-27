<template>
  <el-drawer v-model="isProductSelectVisible" title="选择品类" size="628">
    <div class="select-product-category">
      <div class="flex-b gap-2.5 mb-7.5">
        <el-input
          v-model="form.key"
          placeholder="请输入搜索内容"
          class="input-with-select"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <el-select
              v-model="form.mode"
              placeholder="请选择"
              style="width: 116px"
              @change="form.key = ''"
            >
              <el-option label="产品品类" value="name" />
              <el-option label="所属行业" value="industryCode" />
              <el-option label="所属场景" value="sceneCode" />
            </el-select>
          </template>
        </el-input>
        <el-button @click="handleSearch">搜索</el-button>
      </div>
      <el-table
        :data="filteredList"
        border
        show-overflow-tooltip
        max-height="566"
        style="width: 100%"
      >
        <el-table-column prop="name" label="产品品类" min-width="140">
          <template #default="{ row }">
            <div class="flex-c">
              <span>{{ row.name }}</span>
              <span @click="thingModelRef.open(row)">
                <ArtSvgIcon
                  icon="ri:error-warning-line"
                  class="text-g-2 ml-1.5 text-[16px] cursor-pointer"
                />
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="industryCode" label="所属行业" min-width="140" />
        <el-table-column prop="sceneCode" label="所属场景" min-width="140" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="selectRow(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 查看物模型 -->
    <ThingModelDetailDialog ref="thingModel" />
  </el-drawer>
</template>

<script setup>
  import ThingModelDetailDialog from './thing-model-detail-dialog.vue'

  const isProductSelectVisible = defineModel({ type: Boolean, default: false })

  const props = defineProps({
    productCategoryList: {
      type: Array,
      default: () => []
    }
  })

  const emits = defineEmits(['select'])
  const thingModelRef = useTemplateRef('thingModel')

  const form = reactive({
    mode: 'name',
    key: ''
  })

  const filteredList = ref([])

  watch(
    () => props.productCategoryList,
    (newList) => {
      filteredList.value = newList
    },
    { immediate: true }
  )

  const handleSearch = () => {
    if (!form.key.trim()) {
      filteredList.value = props.productCategoryList
      return
    }

    const keyword = form.key.toLowerCase()

    filteredList.value = props.productCategoryList.filter((item) => {
      const fieldValue = String(item[form.mode] || '').toLowerCase()
      return fieldValue.includes(keyword)
    })
  }

  const selectRow = (row) => {
    isProductSelectVisible.value = false
    emits('select', row)
  }
</script>

<style lang="scss" scoped>
  .select-product-category {
  }
</style>
