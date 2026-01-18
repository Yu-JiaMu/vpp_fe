# 校验规则集成改进 - Form 表单统一管理

## 改进概述

将所有的校验规则集成到 el-form 的 rules 系统中，实现：

- ✅ 必填项显示 \* 号
- ✅ 错误提示由表单统一管理
- ✅ 与现有表单校验机制一致

## 主要改动

### 1. index.vue - 完善 rules 规则

**新增规则**:

| 规则路径                        | 校验内容             | 触发事件 |
| ------------------------------- | -------------------- | -------- |
| `dataType.config.length`        | 文本/密码长度必填    | blur     |
| `dataType.config.min`           | 数值最小值范围检查   | blur     |
| `dataType.config.max`           | 数值最大值范围检查   | blur     |
| `dataType.config.maxItemsCount` | 数组元素个数 (1-512) | blur     |
| `dataType.config.list`          | 枚举值必须≥1项       | change   |
| `dataType.children`             | JSON对象必须≥1个参数 | change   |
| `dataType.config.true`          | Boolean true描述     | blur     |
| `dataType.config.false`         | Boolean false描述    | blur     |

**特点**:

- 使用条件性校验，仅在特定数据类型时验证
- 例如：`length` 只在 text/password 类型时验证
- 例如：`min/max` 只在 int/float/double 类型时验证
- 例如：`true/false` 只在 boolean 类型时验证

### 2. DataTypeEditor.vue - 简化为纯展示组件

**移除内容**:

- ❌ 删除 `booleanErrors` 响应式状态
- ❌ 删除 `validateBooleanValue()` 方法
- ❌ 删除 `validateAllBooleanValues()` 方法
- ❌ 删除所有 `getRules()` 方法
- ❌ 删除单独的错误提示显示逻辑

**修改内容**:

- ✅ 为取值范围的输入框添加 prop 属性

  ```vue
  <el-form-item prop="dataType.config.min" :show-message="false">
    <el-input v-model="model.config.min" placeholder="最小值" />
  </el-form-item>
  ```

- ✅ 为布尔值改用标准 el-form-item

  ```vue
  <el-form-item label="True描述" prop="dataType.config.true">
    <el-input v-model="model.config.true" placeholder="请输入" maxlength="20" />
  </el-form-item>
  ```

- ✅ 为数组元素个数添加 prop 属性
  ```vue
  <el-form-item label="元素个数" prop="dataType.config.maxItemsCount">
    <!-- ... -->
  </el-form-item>
  ```

**imports 简化**:

```typescript
// 删除校验函数导入
- import { createRangeValidator, createArrayCountValidator, ... } from '@/utils'
```

### 3. EnumEditor.vue - 完全由表单管理

**移除内容**:

- ❌ 删除 `validateEnumItem()` 方法
- ❌ 删除 `validateAll()` 方法
- ❌ 删除单独的错误提示 span
- ❌ 删除 `labelError` 字段初始化

**修改内容**:

- ✅ 添加 prop 属性到 el-form-item

  ```vue
  <el-form-item label="枚举型" prop="dataType.config.list"></el-form-item>
  ```

- ✅ 清理模型初始化，删除 `labelError`
  ```typescript
  modelValue.value.push({ value: null, label: '' })
  // 不再包含 labelError 字段
  ```

## 校验流程图

```
用户输入 → 触发事件 (blur/change) → el-form 验证
   ↓
通过校验函数检查
   ↓
校验结果
 ├─ 通过: 清除错误提示
 └─ 失败: 显示错误提示 (由 el-form 统一管理)
```

## 错误提示样式

所有错误提示现在由 el-form-item 统一管理，样式一致：

- 错误文字下方显示
- 颜色为 el-form 的标准错误色
- 验证通过时自动清除

## 必填项标记

必填字段现在显示标准的红色 \* 号：

- `dataType.config.length` (text/password 时)
- `dataType.config.maxItemsCount` (array 时)
- `dataType.config.true` (boolean 时)
- `dataType.config.false` (boolean 时)
- 其他已有的必填字段保持不变

## 测试检查清单

- [ ] 输入文本长度并失焦，显示校验错误
- [ ] 输入数值范围，验证最小值≤最大值
- [ ] 数组元素个数输入 513，显示"不能超过512"
- [ ] 枚举列表为空时，显示"必须至少有一项"
- [ ] 布尔值描述超过20字符，显示长度错误
- [ ] 必填项显示红色 \* 号
- [ ] 所有错误提示样式一致，由 el-form 管理

## 优势

1. **统一管理**: 所有校验由 el-form 统一处理
2. **用户体验**: 必填项显示 \* 号，错误提示样式一致
3. **代码简洁**: 子组件只负责展示，校验逻辑在父组件
4. **易于维护**: 规则集中在一个地方，便于修改和扩展
5. **符合标准**: 遵循 Element Plus 表单最佳实践
