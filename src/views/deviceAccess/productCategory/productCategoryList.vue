<template>
  <div>
    <ElCard class="art-table-card" shadow="never">
      <div class="flex flex-cz-center mb20">
        <div class="input-container">
          <span class="fixed-label">产品品类</span>
          <input v-model="inputValue" type="text" class="inner-input" placeholder="请输入" />
        </div>
        <div class="flex flex-cz-center ml10">
          <el-button class="mr10 btn-height-45" style="width: 145px">搜索</el-button>
          <div class="btn-rest flex flex-cz-center flex-sp-center">
            <img
              src="~@/assets/images/deviceAccess/4.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>重置</span>
          </div>
        </div>
      </div>
      <div class="flex flex-space-between mb10">
        <div class="flex flex-cz-center flex-sp-center add-container" @click="openDialog">
          <img
            src="~@/assets/images/deviceAccess/1.png"
            style="width: 20px; height: 20px"
            class="mr5"
          />
          <span>新增产品品类</span>
        </div>
        <div class="flex">
          <div class="flex flex-cz-center flex-sp-center add-container mr10">
            <img
              src="~@/assets/images/deviceAccess/2.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>删除</span>
          </div>
          <div class="flex flex-cz-center flex-sp-center add-container">
            <img
              src="~@/assets/images/deviceAccess/3.png"
              style="width: 20px; height: 20px"
              class="mr5"
            />
            <span>导出物模型</span>
          </div>
        </div>
      </div>

      <el-table ref="tableRef" :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="产品类别" />
        <el-table-column prop="name" label="产品品类" />
        <el-table-column prop="address" label="所属行业" />
        <el-table-column prop="tag" label="所属场景" />
        <el-table-column prop="updateTime" label="更新时间" />
        <el-table-column fixed="right" label="Operations" min-width="120">
          <template #default>
            <el-button link type="primary" size="small" @click="handleClick"> Detail </el-button>
            <el-button link type="primary" size="small">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ElCard>
    <!--  -->
    <!-- 弹窗组件 - 使用 v-model -->
    <ProductCategoryDialog v-model="dialogVisible" @success="handleSuccess" />
  </div>
</template>

<script setup lang="ts">
  import ProductCategoryDialog from './dialog/ProductCategoryDialog.vue'
  interface User {
    date: string
    name: string
    address: string
    tag: string
  }

  const tableData: User[] = [
    {
      date: '2016-05-03',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
      tag: 'Home'
    },
    {
      date: '2016-05-02',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
      tag: 'Office'
    },
    {
      date: '2016-05-04',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
      tag: 'Home'
    },
    {
      date: '2016-05-01',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles',
      tag: 'Office'
    }
  ]
  const handleClick = () => {
    console.log('click detail')
  }

  //新增
  const dialogVisible = ref(false)

  const openDialog = () => {
    dialogVisible.value = true
  }

  // 处理提交成功
  const handleSuccess = (formData) => {
    console.log('表单提交成功:', formData)
    // 这里可以调用 API 提交数据
    ElMessage.success('新增成功')
  }
</script>

<style lang="scss" scoped></style>
