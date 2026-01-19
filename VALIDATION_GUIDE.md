# 物模型校验完善指南

## 概述

为物模型参数编辑添加了全面的校验规则，涵盖所有数据类型和参数要求。

## 新增校验函数

### 1. 参数描述校验 (`validateParamDesc`)

**位置**: `src/utils/form/validator.ts`

**规则**:

- 支持字符: 中文、英文字母、数字、短划线（-）、下划线（\_）、@
- 必须以中文或英文字母开头
- 长度限制: 不超过20个字符

**使用**:

```typescript
import { validateParamDesc } from '@/utils'

rules: {
  desc: [{ validator: validateParamDesc, trigger: 'blur' }]
}
```

### 2. 布尔值描述校验 (`validateBooleanDesc`)

**规则**:

- 必填项
- 支持字符: 中文、英文字母、数字、短划线（-）、下划线（\_）、@
- 必须以中文或英文字母开头
- 长度限制: 不超过20个字符
- True和False描述都需要验证

**使用位置**: `DataTypeEditor.vue` - 布尔值输入框失焦时自动验证

### 3. 数值范围校验 (`createRangeValidator`)

**规则**:

- 验证最小值不超过最大值
- 验证输入为有效数值

**使用**:

```typescript
import { createRangeValidator } from '@/utils'

// 验证最小值
{ validator: createRangeValidator(undefined, model.config.max), trigger: 'blur' }

// 验证最大值
{ validator: createRangeValidator(model.config.min, undefined), trigger: 'blur' }
```

### 4. 数组元素个数校验 (`createArrayCountValidator`)

**规则**:

- 元素个数范围: 1-512
- 必填项

**使用**:

```typescript
import { createArrayCountValidator } from '@/utils'

rules: {
  maxItemsCount: [
    { required: true, message: '请输入元素个数', trigger: 'blur' },
    { validator: createArrayCountValidator(1, 512), trigger: 'blur' }
  ]
}
```

### 5. 枚举值校验 (`validateEnumListNotEmpty`)

**规则**:

- 枚举值必须至少有一项
- 每一项的参数值必填
- 每一项的参数描述必填且符合参数描述规则

**使用位置**: `EnumEditor.vue` - 自动验证每个枚举项

### 6. JSON对象校验 (`validateJsonObjectNotEmpty`)

**规则**:

- JSON对象必须至少有一个参数

**使用**:

```typescript
import { validateJsonObjectNotEmpty } from '@/utils'

rules: {
  children: [{ validator: validateJsonObjectNotEmpty, trigger: 'change' }]
}
```

## 组件校验集成

### index.vue (物模型属性编辑)

- ✅ 参数名称：基础校验
- ✅ 标识符：唯一性校验
- ✅ 功能名称/读写类型：基础校验
- ✅ 数据类型：必选校验
- ✅ 描述：通用和长度校验

### DataTypeEditor.vue (数据类型编辑)

- ✅ 数值范围（整数/浮点数/双精度）：取值范围校验
- ✅ 布尔值：True/False描述必填且格式校验
- ✅ 数组：元素个数校验（1-512）
- ✅ JSON对象：必填项校验
- ✅ 枚举：至少一项校验

### EnumEditor.vue (枚举编辑)

- ✅ 参数值：必填校验
- ✅ 参数描述：必填 + 格式校验（20字符限制，中/英开头）

## 校验规则汇总表

| 校验项          | 规则                                     | 位置         |
| --------------- | ---------------------------------------- | ------------ |
| 参数描述        | 中/英开头、≤20字符、仅允许指定字符       | 枚举编辑     |
| 布尔值True描述  | 必填、中/英开头、≤20字符、仅允许指定字符 | 数据类型编辑 |
| 布尔值False描述 | 必填、中/英开头、≤20字符、仅允许指定字符 | 数据类型编辑 |
| 数值范围最小值  | 不超过最大值                             | 数据类型编辑 |
| 数值范围最大值  | 不低于最小值                             | 数据类型编辑 |
| 数组元素个数    | 必填、1-512范围                          | 数据类型编辑 |
| JSON对象        | 至少一个参数                             | 数据类型编辑 |
| 枚举值          | 必须≥1项、每项参数值必填、每项描述必填   | 枚举编辑     |

## 支持字符集

以下字符在参数描述和布尔值描述中被支持：

- 中文字符（`\u4e00-\u9fa5`）
- 英文字母（a-z, A-Z）
- 数字（0-9）
- 短划线（-）
- 下划线（\_）
- @ 符号

必须以中文字符或英文字母开头。

## 错误提示示例

| 场景                   | 错误提示                                                 |
| ---------------------- | -------------------------------------------------------- |
| 参数描述为空           | 仅支持中文、英文字母、数字、短划线（-）、下划线（\_）、@ |
| 参数描述超过20字符     | 长度不能超过20个字符                                     |
| 参数描述以特殊字符开头 | 必须以中文或英文字母开头                                 |
| 参数描述含非允许字符   | 仅支持中文、英文字母、数字、短划线（-）、下划线（\_）、@ |
| 布尔值描述未填写       | 请输入描述                                               |
| 枚举值未填写           | 参数值不能为空 / 参数描述不能为空                        |
| 数组元素个数超限       | 元素个数不能超过512                                      |
| JSON对象为空           | JSON对象必须至少有一个参数                               |

## 测试检查清单

- [ ] 参数描述限制20字符且格式正确
- [ ] 布尔值True/False描述必填且格式正确
- [ ] 数值范围验证（最小值≤最大值）
- [ ] 数组元素个数在1-512范围内
- [ ] JSON对象至少包含一个参数
- [ ] 枚举值至少有一项且每项信息完整
- [ ] 所有参数描述支持指定字符集
- [ ] 错误消息正确显示
