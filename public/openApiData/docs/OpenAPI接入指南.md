# OpenAPI 接入指南

[返回接口文档](return)

## 一、概述

本平台 OpenAPI 基于 **AK/SK（Access Key / Secret Key）签名认证机制**，所有请求均需通过签名验证后方可访问后端服务。

**统一请求入口：**

```
{网关地址}/openapi/api/v1?action={接口别名}&{其他参数}
```

---

## 二、签名方式

系统支持以下三种签名方式，通过请求头 `X-Signature-Method` 指定，未指定时默认使用 **SM3**。

| 签名方式               | 算法          | 密钥类型 | 说明                             |
|--------------------|---------------|----------|----------------------------------|
| **SM2** （开发中）      | 国密SM2非对称 | 非对称   | 客户端使用**私钥**签名，服务端**公钥**验签，安全性最高 |
| **SM3**    √       | HMAC-SM3      | 对称     | 客户端和服务端共享同一密钥，国密标准，**默认方式** |
| **HMAC-SHA1**（开发中） | HMAC-SHA1   | 对称     | 标准HMAC-SHA1，兼容性好，适合跨平台场景 |

---

## 三、公共请求头

每个请求必须携带以下 HTTP Header：

| 请求头               | 必填 | 说明                                                         |
|----------------------|------|--------------------------------------------------------------|
| `X-Access-Key`       | 是   | 访问密钥标识（AccessKey），用于查找对应的 SecretKey          |
| `X-Timestamp`        | 是   | 请求时间戳，**毫秒级** Unix 时间戳（如 `1713254400000`）     |
| `X-Nonce`            | 是   | 请求唯一标识，建议使用 **UUID** 格式，防重放攻击             |
| `X-Signature`        | 是   | 请求签名值，**Base64 编码**                                  |
| `X-Signature-Method` | 否   | 签名方式：`SM2`、`SM3`、`HMAC-SHA1`，不传默认 `SM3`         |

---

## 四、公共查询参数

| 参数名   | 必填 | 说明                                           |
|----------|------|------------------------------------------------|
| `action` | 是   | 接口操作别名，决定请求路由到哪个后端接口       |

**请求示例：**

```
GET /openapi/api/v1?action=getDeviceList&page=1&size=10
```

> `action` 参数也支持通过请求头 `X-Action` 传递，优先从查询参数中获取。

---

## 五、签名算法

### 5.1 构造待签名字符串（StringToSign）

待签名字符串由以下 5 部分组成，每部分之间用换行符 `\n` 分隔：

```
HTTP方法\n
请求路径\n
排序后的查询参数\n
时间戳\n
随机数
```

**构造规则：**

1. **HTTP方法**：大写，如 `GET`、`POST`
2. **请求路径**：不含域名和查询参数，如 `/openapi/api/v1`
3. **查询参数**：所有查询参数按**参数名字典序**排序，格式为 `key1=value1&key2=value2`；无查询参数时此行为空
4. **时间戳**：毫秒级 Unix 时间戳字符串
5. **随机数**：UUID 格式字符串，与请求头 `X-Nonce` 一致

**示例：**

```
GET
/openapi/api/v1
accessKey=demo-ak-sm3&action=getDeviceList&page=1&size=10
1713254400000
550e8400-e29b-41d4-a716-446655440000
```

### 5.2 计算签名

#### SM3（HMAC-SM3）—— 默认

```java
// SecretKey 为分配的共享密钥字符串
Mac mac = Mac.getInstance("HmacSM3", "KonaCrypto");
SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSM3");
mac.init(keySpec);
byte[] signatureBytes = mac.doFinal(stringToSign.getBytes(StandardCharsets.UTF_8));
String signature = Base64.getEncoder().encodeToString(signatureBytes);
```

#### HMAC-SHA1

```java
Mac mac = Mac.getInstance("HmacSHA1");
SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA1");
mac.init(keySpec);
byte[] signatureBytes = mac.doFinal(stringToSign.getBytes(StandardCharsets.UTF_8));
String signature = Base64.getEncoder().encodeToString(signatureBytes);
```

#### SM2（非对称签名）

```java
// 客户端持有私钥
Signature sig = Signature.getInstance("SM2", "KonaCrypto");
sig.initSign(privateKey);
sig.update(stringToSign.getBytes(StandardCharsets.UTF_8));
String signature = Base64.getEncoder().encodeToString(sig.sign());
```

### 5.3 JavaScript 实现参考

#### 构造待签名字符串

```javascript
function buildStringToSign(method, path, queryString, timestamp, nonce) {
    return method + '\n' + path + '\n' + (queryString || '') + '\n' + timestamp + '\n' + nonce;
}
```

---

## 六、完整请求流程

### 步骤说明

```
1. 准备参数：accessKey、secretKey、action、业务参数
2. 生成 timestamp（毫秒级）和 nonce（UUID）
3. 拼接所有查询参数，按参数名字典序排序
4. 构造 StringToSign
5. 使用 SecretKey 计算签名（Base64编码）
6. 设置请求头并发送请求
```

### 完整示例（Java）

```java
// 1. 准备参数
String accessKey = "your-access-key";
String secretKey = "your-secret-key";
String action = "getDeviceList";
String timestamp = String.valueOf(System.currentTimeMillis());
String nonce = UUID.randomUUID().toString();

// 2. 构造查询参数（按字典序排序）
String queryString = "accessKey=" + accessKey + "&action=" + action + "&page=1&size=10";

// 3. 构造待签名字符串
String stringToSign = "GET" + "\n"
        + "/openapi/api/v1" + "\n"
        + queryString + "\n"
        + timestamp + "\n"
        + nonce;

// 4. 计算签名（以 HMAC-SM3 为例）
Mac mac = Mac.getInstance("HmacSM3", "KonaCrypto");
SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSM3");
mac.init(keySpec);
byte[] signatureBytes = mac.doFinal(stringToSign.getBytes(StandardCharsets.UTF_8));
String signature = Base64.getEncoder().encodeToString(signatureBytes);

// 5. 发送请求
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://gateway-host:9090/openapi/api/v1?" + queryString))
        .header("X-Access-Key", accessKey)
        .header("X-Timestamp", timestamp)
        .header("X-Nonce", nonce)
        .header("X-Signature", signature)
        .header("X-Signature-Method", "SM3")
        .header("Accept", "application/json")
        .GET()
        .build();
```

---

## 七、响应说明

### 响应头

| 响应头         | 说明                                     |
|----------------|------------------------------------------|
| `X-Request-Id` | 请求唯一标识（雪花ID），可用于问题排查  |

### 成功响应

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": { ... }
}
```

### 失败响应

```json
{
    "code": "401.1",
    "msg": "AccessKey不能为空",
    "data": null
}
```

> **注意：** 成功响应的 `code` 为整数 `200`，失败响应的 `code` 为字符串格式（如 `"401.1"`）。

---

## 八、安全机制

| 机制         | 说明                                                                 |
|--------------|----------------------------------------------------------------------|
| **时间戳校验** | 请求时间戳与服务器时间差超过 **5分钟**（可配置）将被拒绝            |
| **防重放攻击** | 每个 Nonce 只能使用一次，在签名有效期内缓存已使用的 Nonce           |
| **签名校验**   | 验证请求签名确保数据完整性和来源可信                                |
| **白名单机制** | 部分路径（如 `/actuator/**`、`/swagger-ui/**`）无需认证             |

---

## 九、错误码说明

错误码格式为 `HTTP状态码.序号`，以字符串形式返回在响应体的 `code` 字段中。

### 401.x 认证错误

| 错误码   | 错误信息                     | 说明                           |
|----------|-------------------------------|--------------------------------|
| `401.1`  | AccessKey不能为空             | 未传 `X-Access-Key` 请求头     |
| `401.2`  | Timestamp不能为空             | 未传 `X-Timestamp` 请求头      |
| `401.3`  | Nonce不能为空                 | 未传 `X-Nonce` 请求头          |
| `401.4`  | Signature不能为空             | 未传 `X-Signature` 请求头      |
| `401.5`  | Timestamp格式错误             | 时间戳不是合法数字             |
| `401.6`  | 请求已过期                     | 时间戳与服务器时间差超过有效期 |
| `401.7`  | 请求已被使用，请勿重放           | Nonce 重复使用（重放攻击）       |
| `401.8`  | 无效的AccessKey                 | AccessKey 不存在或已失效     |
| `401.9`  | 签名验证失败                   | 签名计算不匹配               |
| `401.10` | 签名验证异常                   | 服务端验签过程发生异常       |
| `401.11` | 认证服务异常                   | 远程凭证服务调用失败         |

### 400.x 请求错误

| 错误码   | 错误信息                     | 说明                           |
|----------|-------------------------------|--------------------------------|
| `400.1`  | 非法请求路径                   | 请求路径不是 `/openapi/api/v1` |
| `400.2`  | 缺少必需参数: action           | 未传 `action` 查询参数       |
| `400.3`  | 未配置的action: xxx             | action 在服务端未配置映射    |

### 500.x 服务错误

| 错误码   | 错误信息                     | 说明                           |
|----------|-------------------------------|--------------------------------|
| `500.1`  | *来自下游微服务的错误信息*    | 鉴权和路由成功，但下游微服务返回业务错误（code ≠ 200） |
| `500.2`  | action映射URI格式错误         | 服务端 action 路由配置格式有误 |
| `500.3`  | 路由配置错误                   | 服务端路由配置异常           |
| `500.4`  | 服务未找到                     | 目标微服务实例不可用         |
| `500.5`  | 内部服务器错误                 | 网关内部未知异常             |

---

## 十、注意事项

1. **查询参数排序**：签名时所有查询参数必须按参数名**字典序（ASCII升序）**排序，参数值需要进行 URL 解码后再排序
2. **时间同步**：客户端与服务器的时钟偏差不能超过 5 分钟，建议使用 NTP 同步时间
3. **Nonce 唯一性**：每次请求必须使用不同的 Nonce，推荐 UUID v4
4. **编码方式**：签名字符串和密钥均使用 **UTF-8** 编码
5. **SM2 密钥管理**：SM2 方式下，客户端妥善保管私钥，仅将公钥提供给服务端
6. **SM3/HMAC-SHA1 密钥**：对称签名方式下，SecretKey 以 UTF-8 字符串形式直接使用
