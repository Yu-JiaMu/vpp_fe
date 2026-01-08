<template>
  <div class="product">
    <ElCard class="art-table-card" shadow="never">
      <!-- <div class="art-search-from"> -->
      <ArtSearchBar
        ref="searchBarRef"
        v-model="form"
        :items="formItems"
        :labelWidth="80"
        defaultExpanded
        :showExpand="false"
        @reset="onSearch"
        @search="onReset"
      >
      </ArtSearchBar>
      <!-- </div> -->

      <ArtAddBtn class="mb-4" @click="onNew">新增产品</ArtAddBtn>

      <el-table :data="pagedData" border style="width: 100%">
        <el-table-column prop="name" label="产品名称" min-width="180">
          <template #default="{ row }">
            <span class="text-theme cursor-pointer" @click.prevent="viewDetails(row)">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="productId" label="产品ID" min-width="200" />
        <el-table-column prop="category" label="产品品类" min-width="120"> </el-table-column>
        <el-table-column prop="nodeType" label="节点类型" min-width="100" />
        <el-table-column prop="protocol" label="协议类型" min-width="100" />
        <el-table-column label="启用/禁用" width="120">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="toggleEnable(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" sortable />
        <el-table-column label="操作" fixed="right" width="245">
          <template #default="{ row }">
            <el-button link type="primary" @click.prevent="viewDetails(row)">详情</el-button>
            <el-button link type="primary" @click.prevent="manageDevices(row)">管理设备</el-button>
            <el-button link type="danger" @click.prevent="deleteProduct(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <ArtPagination
        :pagination="pagination"
        @size-change="onSizeChange"
        @current-change="onPageChange"
      />
    </ElCard>
  </div>
</template>

<script setup>
  import { formatTime } from '@/utils'
  import { NODE_TYPES } from '@/enums'
  const router = useRouter()

  const form = reactive({
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: ''
  })

  const pagination = reactive({
    size: 10,
    current: 1,
    total: 0
  })
  const data = ref([])
  const statusOptions = ref([])
  // 表单配置
  const formItems = computed(() => [
    {
      label: '产品名称',
      key: 'userName',
      type: 'input',
      placeholder: '请输入产品名称',
      clearable: true
    },
    {
      label: '产品ID',
      key: 'userPhone',
      type: 'input',
      props: { placeholder: '请输入产品ID', maxlength: '11' }
    },

    {
      label: '产品品类',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择产品品类',
        filterable: true,
        options: statusOptions.value
      }
    },
    {
      label: '节点类型',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择节点类型',
        filterable: true,
        options: NODE_TYPES.options
      }
    },
    {
      label: '协议类型',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择协议类型',
        filterable: true,
        options: statusOptions.value
      }
    },
    {
      label: '启用/禁用',
      key: 'userGender',
      type: 'select',
      props: {
        placeholder: '请选择',
        filterable: true,
        options: [
          { label: '启用', value: '1' },
          { label: '禁用', value: '2' }
        ]
      }
    }
  ])

  // 示例：后端返回的数据结构（仅一项示例，实际应从接口获取）
  const apiExample = {
    id: '2005572786717229056',
    name: '门禁1',
    photoUrl: 'https://demo.jetlinks.cn/assets/device-product.png',
    classifiedId: 'e433c8033db430ab2beaeb0182ad1f22',
    classifiedName: '视频类',
    deviceType: { text: '直连设备', value: 'device' },
    state: 0,
    creatorId: '6e59acdcd9c1711b49ee05c583c78cbb',
    createTime: 1767000788750,
    creatorName: '刘帅奇',
    modifierId: '6e59acdcd9c1711b49ee05c583c78cbb',
    modifyTime: 1767000788750,
    modifierName: '刘帅奇'
  }

  // map backend item to Product view model
  function mapFromApi(item) {
    return {
      id: String(item.id),
      name: item.name || '',
      productId: String(item.id || ''),
      category: item.classifiedName || item.category || '-',
      nodeType: (item.deviceType && item.deviceType.text) || item.nodeType || '-',
      protocol: item.protocol || '-',
      enabled: item.state === 1,
      updatedAt: formatTime(item.modifyTime || item.createTime)
    }
  }

  // populate mock list using backend-like objects
  for (let i = 1; i <= 12; i++) {
    const apiItem = { ...apiExample, id: `${apiExample.id}${i}`, name: `计量电表300${i}` }
    data.value.push(mapFromApi(apiItem))
  }

  const currentPage = ref(1)
  const pageSize = ref(10)

  const filtered = computed(() => {
    return data.value
  })

  const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filtered.value.slice(start, start + pageSize.value)
  })

  function onSearch() {
    currentPage.value = 1
    console.log('搜索')
  }

  function onReset() {
    currentPage.value = 1
  }

  function onNew() {
    // navigate to new product form or open modal
    console.log('新增产品')
    router.push({
      name: 'addProduct'
    })
  }

  function viewDetails(row) {
    console.log('详情', row)
    router.push({
      name: 'productDetail',
      query: {
        id: row.id
      }
    })
  }

  function manageDevices(row) {
    console.log('管理设备', row)
  }

  function deleteProduct(row) {
    data.value = data.value.filter((p) => p.id !== row.id)
  }

  function toggleEnable(row) {
    console.log('切换启用', row)
  }

  function onPageChange(page) {
    currentPage.value = page
  }

  function onSizeChange(size) {
    pageSize.value = size
    currentPage.value = 1
  }
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
