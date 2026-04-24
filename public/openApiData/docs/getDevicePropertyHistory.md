# getDevicePropertyHistory — 获取设备属性历史
[OpenAPI 接入指南](/openApiData/docs/OpenAPI接入指南.md)
## 基本信息

| 项目     | 说明                            |
|----------|---------------------------------|
| Action   | `getDevicePropertyHistory`      |
| 请求方式 | GET                             |
| 说明     | 分页查询指定设备某个属性点位的历史上报数据，支持时间范围筛选 |

---

## 请求参数

| 参数名             | 必填 | 类型   | 默认值 | 说明                                           |
|--------------------|------|--------|--------|------------------------------------------------|
| `action`           | 是   | string | —      | 固定值 `getDevicePropertyHistory`               |
| `deviceIdentifier` | 是   | string | —      | 设备标识符                                      |
| `pointIdentifier`  | 是   | string | —      | 属性点位标识符（如 `voltage`、`current`）        |
| `startTime`        | 否   | string | —      | 查询起始时间（如 `2026-04-01 00:00:00`）         |
| `endTime`          | 否   | string | —      | 查询截止时间（如 `2026-04-23 23:59:59`）         |
| `pageSize`         | 否   | int    | `10`   | 每页记录数                                      |
| `pageNum`          | 否   | int    | `1`    | 页码                                            |

---

## 请求示例

```
GET /openapi/api/v1?action=getDevicePropertyHistory&deviceIdentifier=METER-001&pointIdentifier=voltage&startTime=2026-04-01 00:00:00&endTime=2026-04-23 23:59:59&pageNum=1&pageSize=20
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
| `rows`  | array  | 历史数据列表             |

### rows 数组元素

| 字段         | 类型   | 说明                                       |
|--------------|--------|--------------------------------------------|
| `ts`         | string | 数据时间，属性上报时间                      |
| `identifier` | string | 属性标识符                                  |
| `name`       | string | 属性名称                                    |
| `val`        | any    | 属性值，类型取决于物模型定义（数字/字符串/布尔等） |

---

## 响应示例

### 成功

```json
{
    "code": 200,
    "msg": "",
    "total": 1440,
    "rows": [
        {
            "ts": "2026-04-23 10:30:00",
            "identifier": "voltage",
            "name": "电压",
            "val": 220.5
        },
        {
            "ts": "2026-04-23 10:29:00",
            "identifier": "voltage",
            "name": "电压",
            "val": 219.8
        },
        {
            "ts": "2026-04-23 10:28:00",
            "identifier": "voltage",
            "name": "电压",
            "val": 221.2
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
action=getDevicePropertyHistory&deviceIdentifier=METER-001&endTime=2026-04-23 23:59:59&pageNum=1&pageSize=20&pointIdentifier=voltage&startTime=2026-04-01 00:00:00
```

完整待签名字符串（StringToSign）：

```
GET
/openapi/api/v1
action=getDevicePropertyHistory&deviceIdentifier=METER-001&endTime=2026-04-23 23:59:59&pageNum=1&pageSize=20&pointIdentifier=voltage&startTime=2026-04-01 00:00:00
1713254400000
550e8400-e29b-41d4-a716-446655440000
```
