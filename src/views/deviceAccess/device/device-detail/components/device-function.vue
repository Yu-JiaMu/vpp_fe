<template>
  <div class="device-function bg-white">
    <div class="flex items-center">
      <div class="flex items-center gap-2 cursor-pointer">
        <div
          class="tag"
          :class="{ 'active-tag': activeTag === tag.value }"
          v-for="(tag, index) in tagList"
          :key="index"
          @click="handleTagClick(tag)"
          >{{ tag.label }}</div
        >
      </div>
      <div class="flex items-center ml30">
        <el-icon color="#505658"><Warning /></el-icon>
        <span class="text-[13px] ml5" style="color: #505658"
          >精简模式下参数只支持输入框的方式录入</span
        >
      </div>
    </div>
    <el-tabs tab-position="left" style="height: 200px" class="mt-[30px]">
      <el-tab-pane label="开关控制">
        <div class="flex gap2">
          <div class="flex-2 mr-[15px]">
            <el-table :data="tableData" border>
              <el-table-column prop="name" label="参数名称" width="300" />
              <el-table-column prop="name" label="输入类型" width="300" />
              <el-table-column prop="name" label="值">
                <template #default="{ row }">
                  <el-select v-model="row.name">
                    <el-option value="1" label="开关" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
            <div class="flex justify-end mt-[15px]">
              <el-button size="large" type="info" class="w-[95px]" v-ripple>取消</el-button>
              <el-button type="primary" class="w-[95px]" v-ripple> 确认 </el-button>
            </div>
          </div>
          <div class="flex-1" style="border: 1px solid #eeeff1; border-radius: 6px">
            <div style="border-bottom: 1px solid #e4e5ef; padding: 15px 20px">执行结果</div>
            <div style="padding: 5px 20px">内容内容</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
  const tagList = ref([
    {
      label: '属性数据',
      value: 'attributeData'
    },
    {
      label: '事件管理',
      value: 'eventManage'
    }
  ])
  const activeTag = ref('attributeData')
  const handleTagClick = (tag) => {
    activeTag.value = tag.value
    console.log(activeTag.value)
  }
  const tableData = ref([
    {
      name: 's'
    }
  ])
</script>

<style lang="scss" scoped>
  .device-function {
    padding: 20px;
    .tag {
      padding: 6px 15px;
      border: 1px solid #e5e6ec;
      border-radius: 2px;
      font-size: 13px;
      font-family:
        Source Han Sans SC,
        Source Han Sans SC-Medium;
      color: #303537;
    }
    .active-tag {
      background: #eefeff !important;
      border: 1px solid #38ecf2 !important;
      font-weight: 500;
    }
  }
</style>
