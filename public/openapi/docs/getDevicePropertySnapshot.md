# getDevicePropertySnapshot — 获取设备属性快照
[OpenAPI 接入指南](/../public/openapi/docs/OpenAPI接入指南.md)
## 基本信息

| 项目     | 说明                            |
|----------|---------------------------------|
| Action   | `getDevicePropertySnapshot`     |
| 请求方式 | GET                             |
| 说明     | 分页查询指定设备的属性快照（最新值），支持按属性标识符搜索 |

---

## 请求参数

| 参数名             | 必填 | 类型   | 默认值 | 说明                                     |
|--------------------|------|--------|--------|------------------------------------------|
| `action`           | 是   | string | —      | 固定值 `getDevicePropertySnapshot`        |
| `deviceIdentifier` | 是   | string | —      | 设备标识符                                |
| `searchIdentifier` | 否   | string | —      | 搜索属性名称，模糊匹配                |
| `pageSize`         | 否   | int    | `10`   | 每页记录数                                |
| `pageNum`          | 否   | int    | `1`    | 页码                                      |

---

## 请求示例

```
GET /openapi/api/v1?action=getDevicePropertySnapshot&deviceIdentifier=METER-001&pageNum=1&pageSize=20
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
| `rows`  | array  | 属性快照数据列表         |

### rows 数组元素

| 字段         | 类型   | 说明                                       |
|--------------|--------|--------------------------------------------|
| `ts`         | string | 数据时间，属性最后上报时间                  |
| `identifier` | string | 属性标识符（如 `voltage`、`current`）       |
| `name`       | string | 属性名称（如 `电压`、`电流`）               |
| `val`        | any    | 属性值，类型取决于物模型定义（数字/字符串/布尔等） |

---

## 响应示例

### 成功

```json
{
    "code": 200,
    "msg": "",
    "total": 12,
    "rows": [
        {
            "ts": "2026-04-23 10:30:15",
            "identifier": "voltage",
            "name": "电压",
            "val": 220.5
        },
        {
            "ts": "2026-04-23 10:30:15",
            "identifier": "current",
            "name": "电流",
            "val": 5.2
        },
        {
            "ts": "2026-04-23 10:30:15",
            "identifier": "power",
            "name": "功率",
            "val": 1146.6
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
action=getDevicePropertySnapshot&deviceIdentifier=METER-001&pageNum=1&pageSize=20
```

完整待签名字符串（StringToSign）：

```
GET
/openapi/api/v1
action=getDevicePropertySnapshot&deviceIdentifier=METER-001&pageNum=1&pageSize=20
1713254400000
550e8400-e29b-41d4-a716-446655440000
```
