import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'

interface UseUploadBeforeOptions {
  fileSize: number
  accept: string
}

export function useUploadBefore(options: UseUploadBeforeOptions) {
  const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
    const sizeOk = rawFile.size / 1024 / 1024 < options.fileSize

    // 将 accept 字符串拆分成允许的类型列表
    const acceptTypes = options.accept.split(',').map((type) => type.trim())

    // 检查文件类型
    const typeOk = acceptTypes.some((type) => {
      if (type.startsWith('.')) {
        // 处理文件扩展名如 .jpg, .png
        return rawFile.name.toLowerCase().endsWith(type.toLowerCase())
      }
      // 处理 MIME 类型如 image/jpeg
      return rawFile.type === type || rawFile.type.startsWith(type)
    })

    if (!typeOk) {
      ElMessage({
        message: '上传文件不符合所需的格式！',
        type: 'warning'
      })
    }

    if (!sizeOk) {
      setTimeout(() => {
        ElMessage({
          message: `上传文件大小不能超过 ${options.fileSize}M！`,
          type: 'warning'
        })
      }, 0)
    }

    return typeOk && sizeOk
  }

  return beforeUpload
}
