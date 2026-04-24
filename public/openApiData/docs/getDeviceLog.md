# getDeviceLog — 获取设备操作日志
[OpenAPI 接入指南](/openApiData/docs/OpenAPI接入指南.md)
## 基本信息

| 项目     | 说明                            |
|----------|---------------------------------|
| Action   | `getDeviceLog`                  |
| 请求方式 | GET                             |
| 说明     | 分页查询指定设备的操作日志，支持按日志类型和时间范围筛选 |

---

## 请求参数

| 参数名             | 必填 | 类型   | 默认值 | 说明                                                         |
|--------------------|------|--------|--------|--------------------------------------------------------------|
| `action`           | 是   | string | —      | 固定值 `getDeviceLog`                                         |
| `deviceIdentifier` | 是   | string | —      | 设备标识符                                                    |
| `logType`          | 否   | string | —      | 日志类型，不传则查询全部，可选值见下方说明                    |
| `startTime`        | 否   | string | —      | 查询起始时间（如 `2026-04-01 00:00:00`）                      |
| `endTime`          | 否   | string | —      | 查询截止时间（如 `2026-04-24 23:59:59`）                      |
| `pageSize`         | 否   | int    | `10`   | 每页记录数                                                    |
| `pageNum`          | 否   | int    | `1`    | 页码                                                          |

### logType 可选值

| 值                  | 说明     |
|---------------------|----------|
| `PROPERTY_REPORT`   | 属性上报 |
| `PROPERTY_SET`      | 属性设置 |
| `EVENT_REPORT`      | 事件上报 |
| `FUNCTION_CALL`     | 功能调用 |
| `FUNCTION_RESPONSE` | 功能响应 |
| `DEVICE_ONLINE`     | 设备上线 |
| `DEVICE_OFFLINE`    | 设备离线 |
| `UP_MESSAGE`        | 消息上报 |

---

## 请求示例

```
GET /openapi/api/v1?action=getDeviceLog&deviceIdentifier=METER-001&logType=DEVICE_ONLINE&pageNum=1&pageSize=20
```

**请求头：**

```
X-Access-Key: your-access-key
X-Timestamp: 1713254400000
X-Nonce: 550e8400-e29b-41d4-a716-446655440000
X-Signature: Base64编码的签名值
X-Signature-Method: SM3
```

---

## 响应参数

### 外层结构

| 字段    | 类型   | 说明                     |
|---------|--------|--------------------------|
| `code`  | int    | 状态码，`200` 表示成功   |
| `msg`   | string | 提示信息                 |
| `total` | long   | 符合条件的总记录数       |
| `rows`  | array  | 日志数据列表             |

### rows 数组元素

| 字段               | 类型   | 说明                                       |
|--------------------|--------|--------------------------------------------|
| `ts`               | string | 日志时间                                    |
| `logType`          | string | 日志类型描述（如 `设备上线`、`属性上报`）    |
| `operator`         | string | 操作员                                      |
| `deviceIdentifier` | string | 设备标识符                                  |
| `logContent`       | string | 日志内容                                    |

---

## 响应示例

### 成功

```json
{
    "code": 200,
    "msg": "",
    "total": 128,
    "rows": [
        {
            "ts": "2026-04-24 10:30:00",
            "logType": "设备上线",
            "operator": "system",
            "deviceIdentifier": "METER-001",
            "logContent": "{\"ip\":\"192.168.1.100\"}"
        },
        {
            "ts": "2026-04-24 09:15:30",
            "logType": "属性上报",
            "operator": "device",
            "deviceIdentifier": "METER-001",
            "logContent": "{\"voltage\":220.5,\"current\":5.2}"
        }
    ]
}
```

### 失败（网关错误）

```json
{
    "code": "401.1",
    "msg": "AccessKey不能为空",
    "data": null
}
```

### 失败（业务错误，自动包装为 500.1）

```json
{
    "code": "500.1",
    "msg": "设备不存在",
    "data": null
}
```

---

## 签名时查询参数排序示例

签名时，所有查询参数（含 `action`）按参数名**字典序**排列：

```
action=getDeviceLog&deviceIdentifier=METER-001&logType=DEVICE_ONLINE&pageNum=1&pageSize=20
```

完整待签名字符串（StringToSign）：

```
GET
/openapi/api/v1
action=getDeviceLog&deviceIdentifier=METER-001&logType=DEVICE_ONLINE&pageNum=1&pageSize=20
1713254400000
550e8400-e29b-41d4-a716-446655440000
```
