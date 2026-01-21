<template>
  <div class="upload-box">
    <el-upload
      class="upload"
      v-model:file-list="_fileList"
      action="#"
      :multiple="multiple"
      :limit="limit"
      :disabled="self_disabled"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :accept="accept"
    >
      <slot name="empty">
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </slot>
      <template #tip>
        <slot name="tip">
          <div class="el-upload__tip"
            >请上传 .xls , .xlsx 标准格式文件，文件最大为 {{ props.fileSize }}M</div
          >
        </slot>
      </template>
    </el-upload>

    <div class="el-upload__tip">
      <slot name="tip"></slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="UploadFiles">
  import type { UploadProps, UploadFile, UploadUserFile, UploadRequestOptions } from 'element-plus'
  import { ElNotification } from 'element-plus'
  import { useUploadCommon } from './composables/useUploadCommon'
  import { useUploadBefore } from './composables/useUploadBefore'

  interface UploadFileProps {
    // fileList: UploadUserFile[];
    api?: (params: any) => Promise<any> // 上传图片的 api 方法，一般项目上传都是同一个 api 方法，在组件里直接引入即可 ==> 非必传
    drag?: boolean // 是否支持拖拽上传 ==> 非必传（默认为 true）
    disabled?: boolean // 是否禁用上传组件 ==> 非必传（默认为 false）
    limit?: number // 最大图片上传数 ==> 非必传（默认为 5张）
    fileSize?: number // 图片大小限制 ==> 非必传（默认为 5M）
    accept?: string // 图片类型限制 ==> 非必传（默认为 "image/jpeg,image/png,image/gif"）
    height?: string // 组件高度 ==> 非必传（默认为 150px）
    width?: string // 组件宽度 ==> 非必传（默认为 150px）
    borderRadius?: string // 组件边框圆角 ==> 非必传（默认为 8px）
    multiple?: boolean // 是否支持多选
  }

  const modelValue = defineModel<UploadUserFile[]>({
    default: () => []
  })

  const props = withDefaults(defineProps<UploadFileProps>(), {
    // fileList: () => [],
    drag: true,
    disabled: false,
    limit: 5,
    fileSize: 5,
    accept: 'image/jpeg,image/png,image/gif',
    height: '150px',
    width: '150px',
    borderRadius: '8px',
    multiple: false
  })

  const _fileList = ref<UploadUserFile[]>([])

  watch(
    modelValue,
    (val) => {
      _fileList.value = [...val]
    },
    { immediate: true }
  )
  const { self_disabled, doUpload, validateForm, notifySuccess, notifyError } =
    useUploadCommon(props)

  const beforeUpload = useUploadBefore({
    fileSize: props.fileSize,
    accept: props.accept
  })

  const handleHttpUpload = async (options: UploadRequestOptions) => {
    try {
      const data = await doUpload(options, 'file')
      options.onSuccess(data)
    } catch {
      notifyError('文件上传失败，请您重新上传！')
    }
  }

  const uploadSuccess = (response: { url: string } | undefined, uploadFile: UploadFile) => {
    console.log('res', response)

    if (!response) return
    uploadFile.url = response.url
    // emit("update:fileList", _fileList.value);
    modelValue.value = [..._fileList.value]
    validateForm()
    notifySuccess('文件上传成功！')
  }

  /**
   * @description 上传成功
   * @param response 上传响应结果
   * @param uploadFile 上传的文件
   * */
  const emit = defineEmits<{
    'update:fileList': [value: UploadUserFile[]]
  }>()

  /**
   * @description 删除文件
   * @param file 删除的文件
   * */
  const handleRemove = (file: UploadFile) => {
    _fileList.value = _fileList.value.filter(
      (item) => item.url !== file.url || item.name !== file.name
    )
    // emit("update:fileList", _fileList.value);
    modelValue.value = [..._fileList.value]
  }

  /**
   * @description 图片上传错误
   * */
  const uploadError = () => {
    ElNotification({
      title: '温馨提示',
      message: '图片上传失败，请您重新上传！',
      type: 'error'
    })
  }

  /**
   * @description 文件数超出
   * */
  const handleExceed = () => {
    ElNotification({
      title: '温馨提示',
      message: `当前最多只能上传 ${props.limit} 张文件，请移除后上传！`,
      type: 'warning'
    })
  }

  /**
   * @description 图片预览
   * @param file 预览的文件
   * */
  // const viewImageUrl = ref("");
  // const imgViewVisible = ref(false);
  // const handlePictureCardPreview: UploadProps["onPreview"] = file => {
  //   viewImageUrl.value = file.url!;
  //   imgViewVisible.value = true;
  // };
</script>

<style scoped lang="scss">
  // .upload-box {
  //   .file-item {
  //     display: flex;
  //     align-items: center;
  //     padding: 4px 8px;
  //     border-radius: 4px;
  //     &:hover {
  //       background-color: var(--el-fill-color-light);
  //     }
  //     .file-icon {
  //       margin-right: 6px;
  //       color: var(--el-color-primary);
  //     }
  //     .file-name {
  //       flex: 1;
  //       overflow: hidden;
  //       font-size: 13px;
  //       color: var(--el-text-color-primary);
  //       text-overflow: ellipsis;
  //       white-space: nowrap;
  //     }
  //     .file-remove {
  //       color: var(--el-text-color-secondary);
  //       cursor: pointer;
  //       &:hover {
  //         color: var(--el-color-danger);
  //       }
  //     }
  //   }
  // }
</style>
