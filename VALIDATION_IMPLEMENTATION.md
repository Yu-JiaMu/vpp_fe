# 物模型校验完善总结

## 实施情况

已成功为物模型参数编辑功能添加了完整的校验规则。

## 修改文件列表

### 1. [src/utils/form/validator.ts](src/utils/form/validator.ts)

**新增7个校验函数**:

- `validateParamDesc()` - 参数描述校验
- `validateBooleanDesc()` - 布尔值描述校验
- `createRangeValidator()` - 数值范围校验工厂函数
- `createArrayCountValidator()` - 数组元素个数校验工厂函数
- `validateEnumListNotEmpty()` - 枚举值非空校验
- `validateJsonObjectNotEmpty()` - JSON对象非空校验

### 2. [src/views/deviceAccess/product/product-detail/components/thing-model/thing-property/index.vue](src/views/deviceAccess/product/product-detail/components/thing-model/thing-property/index.vue)

**更新内容**:

- 导入新的校验函数 `validateParamDesc` 和 `validateBooleanDesc`

### 3. [src/views/deviceAccess/product/product-detail/components/thing-model/thing-property/DataTypeEditor.vue](src/views/deviceAccess/product/product-detail/components/thing-model/thing-property/DataTypeEditor.vue)

**更新内容**:

- 导入所有新的校验函数
- 添加 `booleanErrors` 响应式状态用于存储布尔值验证错误
- 为布尔值输入框添加格式校验（maxlength、@blur事件）
- 新增方法：
  - `validateBooleanValue()` - 单个布尔值描述校验
  - `validateAllBooleanValues()` - 全部布尔值描述校验
  - `getRangeRules()` - 获取数值范围校验规则
  - `getArrayCountRules()` - 获取数组元素个数校验规则
  - `getEnumRules()` - 获取枚举校验规则
- 导出验证方法供父组件调用

### 4. [src/views/deviceAccess/product/product-detail/components/thing-model/thing-property/EnumEditor.vue](src/views/deviceAccess/product/product-detail/components/thing-model/thing-property/EnumEditor.vue)

**更新内容**:

- 导入 `validateParamDesc` 和 `ref`
- 为参数描述字段添加实时格式验证
- 新增方法：
  - `validateEnumItem()` - 单个枚举项校验
  - `validateAll()` - 全部枚举项校验
- 为参数描述添加错误提示显示
- 导出验证方法供父组件调用

## 校验规则详细说明

### 参数描述规则 (参数值、枚举项描述、JSON参数描述)

✅ **支持字符**:

- 中文字符
- 英文字母（a-z, A-Z）
- 数字（0-9）
- 短划线（-）
- 下划线（\_）
- @ 符号

✅ **格式要求**:

- 必须以中文或英文字母开头
- 长度不超过20个字符

### 布尔值描述规则 (True/False描述)

✅ **基本要求**:

- 必填项（都需要填写）

✅ **格式要求**:

- 同参数描述规则
- 支持相同字符集
- 以中文或英文开头
- 长度不超过20字符

### 数值范围规则 (取值范围)

✅ **验证规则**:

- 最小值 ≤ 最大值（如果两个都填了）
- 输入必须是有效数值

### 数组元素个数规则

✅ **验证规则**:

- 必填项
- 范围：1 ≤ 个数 ≤ 512

### 枚举值规则

✅ **验证规则**:

- 必须至少有一项
- 每项的参数值必填
- 每项的参数描述必填
- 参数描述符合格式要求

### JSON对象规则

✅ **验证规则**:

- 必须至少有一个参数

## 错误提示文案

| 验证项             | 错误提示                                                 |
| ------------------ | -------------------------------------------------------- |
| 参数描述为空       | （通过格式检查）                                         |
| 参数描述超长       | 长度不能超过20个字符                                     |
| 参数描述格式错误   | 仅支持中文、英文字母、数字、短划线（-）、下划线（\_）、@ |
| 参数描述开头错误   | 必须以中文或英文字母开头                                 |
| 布尔值描述为空     | 请输入描述                                               |
| 布尔值描述其他错误 | 同参数描述                                               |
| 最小值>最大值      | 不能小于/大于...                                         |
| 数组元素个数错误   | 元素个数不能超过512                                      |
| 枚举值为空         | 枚举值必须至少有一项                                     |
| 枚举项信息不完整   | 第N项参数值/描述不能为空                                 |
| JSON对象为空       | JSON对象必须至少有一个参数                               |

## 使用方式

### 在表单中使用

```typescript
// DataTypeEditor.vue 中获取规则
const rangeRules = dataTypeEditorRef.value.getRangeRules()
const arrayCountRules = dataTypeEditorRef.value.getArrayCountRules()
const enumRules = dataTypeEditorRef.value.getEnumRules()
```

### 表单验证前调用

```typescript
// 提交前验证布尔值
const isBooleanValid = dataTypeEditorRef.value.validateAllBooleanValues()

// 验证枚举
const enumError = enumEditorRef.value.validateAll()
```

## 测试建议

1. **参数描述字段**
   - 输入中文和英文混合 ✓
   - 输入特殊字符组合 ✓
   - 输入超过20字符 ✓
   - 以数字或特殊字符开头 ✓

2. **布尔值描述**
   - 空值提交 ✓
   - 超长输入 ✓
   - 非法字符 ✓
   - 正常输入 ✓

3. **数值范围**
   - 最小值 > 最大值 ✓
   - 非数值输入 ✓
   - 浮点数边界值 ✓

4. **数组和枚举**
   - 空列表提交 ✓
   - 参数值或描述缺失 ✓
   - 多项完整数据 ✓

5. **JSON对象**
   - 空对象提交 ✓
   - 完整参数列表 ✓

## 状态

✅ **完成**: 所有校验规则已实现 ✅ **编译**: 无语法错误 ✅ **导出**: 所有校验函数已正确导出 ✅ **集成**: 所有组件已正确集成校验
