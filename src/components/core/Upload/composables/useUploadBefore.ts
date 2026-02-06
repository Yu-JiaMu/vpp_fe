import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'

interface UseUploadBeforeOptions {
  fileSize: number
  accept: string
}

function formatAcceptText(accept: string) {
  return accept
    .split(',')
    .map((type) => type.trim())
    .map((type) => {
      if (type.startsWith('.')) {
        return type.replace('.', '')
      }
      if (type.includes('/')) {
        // image/jpeg 或 image/*
        return type.split('/')[1].replace('*', '')
      }
      return type
    })
    .filter(Boolean)
    .join('、')
}

export function useUploadBefore(options: UseUploadBeforeOptions) {
  const acceptTypes = options.accept.split(',').map((type) => type.trim())

  const acceptText = formatAcceptText(options.accept)
  // console.log('上传限制')

  const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
    // 1️⃣ 大小校验
    const sizeOk = rawFile.size / 1024 / 1024 < options.fileSize
    if (!sizeOk) {
      ElMessage.warning(`上传失败，文件大小不能超过 ${options.fileSize}MB`)
      return false
    }

    // console.log('232324', rawFile.type, acceptTypes)

    // 2️⃣ 类型校验
    const typeOk = acceptTypes.some((type) => {
      // .jpg .png
      if (type.startsWith('.')) {
        return rawFile.name.toLowerCase().endsWith(type.toLowerCase())
      }

      // image/*
      if (type.includes('*')) {
        const prefix = type.replace('*', '')
        return rawFile.type.startsWith(prefix)
      }

      // image/jpeg
      return rawFile.type === type
    })

    if (!typeOk) {
      ElMessage.warning(`上传失败，请重新选择 ${acceptText} 格式上传`)
      return false
    }

    return true
  }

  return beforeUpload
}
