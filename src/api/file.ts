import request from '@/utils/http'

// 文件上传模块
export namespace Upload {
  export interface ResFileUrl {
    fileUrl: string
  }
}

// 图片上传
export function apiUploadImg(params: FormData) {
  return request.post<Upload.ResFileUrl>('/stage-api/file/picture/upload', params)
}

// 文件上传
export function apiUploadFile(params: FormData) {
  return request.post<Upload.ResFileUrl>('/stage-api/file/upload', params)
}
