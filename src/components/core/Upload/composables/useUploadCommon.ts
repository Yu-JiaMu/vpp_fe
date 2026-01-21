import { computed, inject } from 'vue'
import { ElMessage, formContextKey, formItemContextKey } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'
import { apiUploadImg as uploadImg, apiUploadFile as uploadFile } from '@/api/file'

interface UseUploadCommonOptions {
  api?: (params: any) => Promise<any>
  disabled?: boolean
}

export function useUploadCommon(props: UseUploadCommonOptions) {
  // el-form 上下文
  const formContext = inject(formContextKey, void 0)
  const formItemContext = inject(formItemContextKey, void 0)

  // 是否禁用（兼容 el-form）
  const self_disabled = computed(() => {
    return props.disabled || formContext?.disabled
  })

  // 真正的上传请求（你原来的 handleHttpUpload 核心）
  const doUpload = async (options: UploadRequestOptions, apiType?: string) => {
    let api
    if (props.api) {
      api = props.api
    } else {
      api = apiType === 'file' ? uploadFile : uploadImg
    }

    const formData = new FormData()
    formData.append('file', options.file)

    try {
      const { data } = await api(formData)
      return data
    } catch (error) {
      options.onError(error as any)
      throw error
    }
  }

  // 触发表单校验
  const validateForm = () => {
    if (formItemContext?.prop) {
      formContext?.validateField([formItemContext.prop as string])
    }
  }

  // 通用提示
  const notifySuccess = (msg: string) => {
    ElMessage({
      message: msg,
      type: 'success'
    })
  }

  const notifyError = (msg: string) => {
    ElMessage({
      message: msg,
      type: 'error'
    })
  }

  return {
    self_disabled,
    doUpload,
    validateForm,
    notifySuccess,
    notifyError
  }
}
