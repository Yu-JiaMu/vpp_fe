import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>('/stage-api/auth/login', params, {
    // showSuccessMessage: true, // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>('/stage-api/system/user/getInfo')
}

/**
 * 获取图形验证码
 * @returns 图形验证码
 */
export function fetchGetCaptcha() {
  return request.get<Api.Auth.Captcha>('/stage-api/code')
}
