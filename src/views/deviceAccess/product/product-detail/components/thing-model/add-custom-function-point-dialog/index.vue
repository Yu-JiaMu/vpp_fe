<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增功能点"
    width="762"
    align-center
    :close-on-click-modal="false"
  >
    <div class="add-custom-function-point-dialog">
      <!-- Tabs -->
      <div class="flex h-10 bg-white tab-con w-fit mb-2.5 rounded-md">
        <div
          v-for="item in FUNCTION_MODE_MAP.options"
          :key="item.value"
          class="tab-item w-[66px] flex-cc cursor-pointer"
          :class="{ active: activeTab === item.value }"
          @click="activeTab = item.value"
        >
          <div class="tab-btn w-[56px] h-6 rounded-sm leading-6">{{ item.label }}</div>
        </div>
      </div>

      <!-- 物模型属性 -->
      <ThingProperty ref="thingPropertyRef"></ThingProperty>
    </div>
    <!-- Footer -->
    <template #footer>
      <div class="flex justify-center gap-[6px]">
        <el-button size="large" type="info" class="w-[177px]" v-ripple @click="handleCancel">
          取消
        </el-button>
        <el-button type="primary" class="w-[177px]" v-ripple @click="handleSubmit">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { CircleCheck } from '@element-plus/icons-vue'
  import { FUNCTION_MODE_MAP } from '@/enums'
  import ThingProperty from '../thing-property/index.vue'

  const dialogVisible = ref(true)
  const activeTab = ref('property')
  const formRef = ref(null)

  const handleCancel = () => {
    dialogVisible.value = false
  }

  const thingPropertyRef = useTemplateRef('thingPropertyRef')
  const handleSubmit = () => {
    console.log('thingPropertyRef', thingPropertyRef.value.getThingJson())
    return
    formRef.value.validate((valid) => {
      if (!valid) return
      console.log('提交数据:', form)
      ElMessage.success('新增成功')
      dialogVisible.value = false
    })
  }
</script>

<style lang="scss" scoped>
  .add-custom-function-point-dialog {
    .tab-con {
      border: 1px solid #eeeff1;
      .tab-item {
        position: relative;
        line-height: 32px;
        text-align: center;
        font-size: 13px;
        font-family:
          Source Han Sans SC,
          Source Han Sans SC-Regular;
        color: var(--color-g-505658);
        &:hover:not(.active) {
          color: #303537;
        }
        &::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 12px;
          background-color: #ced1d9;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }
        &.active {
          color: #303537;
          font-family:
            Source Han Sans SC,
            Source Han Sans SC-Medium;
          .tab-btn {
            background: #ebecf1;
          }
        }
      }
      .tab-item:last-child::after {
        content: none;
      }
    }
  }
</style>
