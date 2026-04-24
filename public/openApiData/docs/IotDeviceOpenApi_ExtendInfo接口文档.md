# IOT设备管理OpenAPI接口文档

[OpenAPI 接入指南](/openApiData/docs/OpenAPI接入指南.md)

## 查询设备扩展信息接口

### 基本信息
- **Action**: `getDeviceExtendInfo`
- **请求方法**: `GET`
- **接口描述**: 根据设备标识符查询设备的扩展信息


### 请求参数

| 参数名              | 类型 | 必填 | 默认值 | 描述     |
|------------------|------|----|--------|--------|
| deviceIdentifier | String | 是  | - | 设备标识符  |
| pointIdentifier  | String | 否  | - | 功能点标识符 |
### 请求示例


### 响应参数

### 响应字段说明

#### 顶层响应字段

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| code | Integer | 是 | 响应状态码，200表示成功，500表示失败 |
| msg | String | 是 | 响应消息 |
| data | JSONArray | 是 | 设备扩展信息数组 |

#### 扩展信息对象字段说明

| 字段名 | 类型            | 必填 | 描述 | 
|--------|---------------|------|------|
| required | Boolean       | 是 | 扩展字段是否必填 | 
| name | String | 是 | 扩展字段名称 | 
| identifier | String        | 是 | 扩展字段标识符 | 
| dataType | String        | 否 | 字段数据类型 | 
| desc | String        | 否 | 字段描述 | 

#### 数据类型:dataType 字段说明
| 字段名 | 类型            | 必填 | 描述    | 
|--------|---------------|----|-------|
| type | String | 是  | 数据类型  | 
| specs | String        | 否  | 数据规格  | 





