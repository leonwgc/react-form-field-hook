# react-form-field-hook

⚡️ 一个轻量级的 React Hook，用于管理表单字段状态。

[English](./README.en.md) | 简体中文

## ✨ 特性

- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🚀 **轻量级** - 无外部依赖，体积小
- 📝 **灵活的验证** - 支持同步和异步验证
- 🔄 **防抖验证** - 可配置的验证防抖
- 💪 **丰富的状态** - 跟踪 touched、dirty、pristine、valid 等状态
- 🎭 **多字段管理** - 使用 `useFormFields` 管理多个字段
- 📦 **开箱即用的验证器** - 内置常用验证规则

## 📦 安装

```bash
npm install react-form-field-hook
# 或
yarn add react-form-field-hook
# 或
pnpm add react-form-field-hook
```

## 🚀 快速开始

### 基础用法

```tsx
import { useFormField, validators } from 'react-form-field-hook';
import { Input, Button } from 'antd';

function MyForm() {
  const emailField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.email()],
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async () => {
    const isValid = await emailField.validate();
    if (isValid) {
      console.log('Email:', emailField.value);
    }
  };

  return (
    <div>
      <Input
        placeholder="输入您的邮箱"
        {...emailField.getAntdInputProps()}
      />
      {emailField.renderError()}
      <Button onClick={handleSubmit}>提交</Button>
    </div>
  );
}
```

### 异步验证（带防抖）

```tsx
const usernameField = useFormField({
  initialValue: '',
  rules: [
    validators.required(),
    validators.minLength(3),
    async (value) => {
      const response = await fetch(`/api/check-username?username=${value}`);
      const { available } = await response.json();
      return available ? null : '用户名已被占用';
    }
  ],
  validateOnChange: true,
  validateDebounce: 300, // 300ms 防抖
});

return (
  <div>
    <Input {...usernameField.getAntdInputProps()} />
    {usernameField.validating && <span>验证中...</span>}
    {usernameField.renderError()}
  </div>
);
```

### 管理多个字段

```tsx
const { fields, validateAll, resetAll } = useFormFields({
  username: {
    initialValue: '',
    rules: [validators.required(), validators.minLength(3)],
  },
  email: {
    initialValue: '',
    rules: [validators.required(), validators.email()],
  },
  password: {
    initialValue: '',
    rules: [validators.required(), validators.minLength(6)],
  },
});

const handleSubmit = async () => {
  const isValid = await validateAll();
  if (isValid) {
    const formData = {
      username: fields.username.value,
      email: fields.email.value,
      password: fields.password.value,
    };
    // 提交表单...
  }
};

return (
  <form>
    <Input {...fields.username.getAntdInputProps()} />
    {fields.username.renderError()}

    <Input {...fields.email.getAntdInputProps()} />
    {fields.email.renderError()}

    <Input.Password {...fields.password.getAntdInputProps()} />
    {fields.password.renderError()}

    <Button onClick={handleSubmit}>提交</Button>
    <Button onClick={resetAll}>重置</Button>
  </form>
);
```

## 📚 API

### useFormField

```tsx
const field = useFormField<T>(options: FieldOptions<T>);
```

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `initialValue` | `T` | - | 字段的初始值 |
| `rules` | `ValidationRule<T>[]` | `[]` | 验证规则数组 |
| `validateOnChange` | `boolean` | `false` | 值变化时是否验证 |
| `validateOnBlur` | `boolean` | `true` | 失去焦点时是否验证 |
| `validateDebounce` | `number` | `0` | 验证防抖延迟（毫秒） |
| `disabled` | `boolean` | `false` | 字段是否禁用 |
| `onValueChange` | `(value: T) => void` | - | 值变化时的回调 |

#### 返回的字段对象

**状态属性：**

- `value: T` - 当前字段值
- `touched: boolean` - 字段是否已触碰（聚焦后失焦）
- `dirty: boolean` - 值是否已从初始值修改
- `pristine: boolean` - 值是否未从初始值修改
- `valid: boolean` - 字段是否有效
- `invalid: boolean` - 字段是否无效
- `error: string | null` - 当前验证错误信息
- `validating: boolean` - 是否正在验证（异步验证）
- `visited: boolean` - 是否至少聚焦过一次
- `focused: boolean` - 是否当前聚焦
- `disabled: boolean` - 是否禁用

**方法：**

- `onChange(value: T)` - 处理值变化
- `onBlur()` - 处理失焦事件
- `onFocus()` - 处理聚焦事件
- `setValue(value: T)` - 手动设置值
- `reset()` - 重置到初始状态
- `validate()` - 手动触发验证
- `setError(error: string | null)` - 手动设置错误
- `setTouched(touched: boolean)` - 标记为已触碰
- `setDisabled(disabled: boolean)` - 设置禁用状态
- `setInitialValue(value: T)` - 更新初始值
- `getInputProps()` - 获取输入组件的 props
- `getHTMLInputProps()` - 获取原生 HTML 输入元素的 props
- `getAntdInputProps()` - 获取 Ant Design 输入组件的 props（包含 status）
- `renderError(className?: string)` - 渲染错误信息

### useFormFields

```tsx
const { fields, validateAll, resetAll, getValues } = useFormFields(fieldsConfig);
```

#### 返回值

- `fields` - 包含所有字段的对象
- `validateAll()` - 验证所有字段
- `resetAll()` - 重置所有字段
- `getValues()` - 获取所有字段的值对象

### 内置验证器

所有验证器都返回一个验证规则函数：

```tsx
// 必填验证
validators.required(message?: string)

// 邮箱格式
validators.email(message?: string)

// 最小长度
validators.minLength(min: number, message?: string)

// 最大长度
validators.maxLength(max: number, message?: string)

// 正则表达式
validators.pattern(regex: RegExp, message: string)

// 最小数值
validators.min(min: number, message?: string)

// 最大数值
validators.max(max: number, message?: string)

// URL 格式
validators.url(message?: string)

// 数字格式
validators.number(message?: string)

// 整数格式
validators.integer(message?: string)

// 匹配其他字段（如密码确认）
validators.matches(getOtherValue: () => T, message?: string)

// 值在允许列表中
validators.oneOf(allowedValues: T[], message?: string)

// 自定义验证（支持异步）
validators.validate(
  validator: (value: T) => boolean | Promise<boolean>,
  message: string
)

// 手机号格式
validators.phone(message?: string)
```

### 自定义验证规则

```tsx
// 同步验证
const customRule: ValidationRule<string> = (value) => {
  if (!value.startsWith('prefix-')) {
    return '值必须以 "prefix-" 开头';
  }
  return null;
};

// 异步验证
const asyncRule: ValidationRule<string> = async (value) => {
  const response = await fetch(`/api/validate?value=${value}`);
  const { valid } = await response.json();
  return valid ? null : '验证失败';
};

const field = useFormField({
  initialValue: '',
  rules: [customRule, asyncRule],
});
```

## 🎯 不同 UI 框架的集成方法

### Ant Design / Neat Design

```tsx
<Input {...field.getAntdInputProps()} />
```

### 原生 HTML

```tsx
<input {...field.getHTMLInputProps()} />
```

### 其他组件库

```tsx
<CustomInput {...field.getInputProps()} />
```

## 🔧 高级用法

### 字段状态追踪

```tsx
const field = useFormField({ initialValue: '' });

// 检查各种状态
console.log(field.touched);   // 是否触碰
console.log(field.dirty);     // 是否修改
console.log(field.pristine);  // 是否原始
console.log(field.valid);     // 是否有效
console.log(field.invalid);   // 是否无效
console.log(field.visited);   // 是否访问过
console.log(field.focused);   // 是否聚焦
```

### 密码确认示例

```tsx
const passwordField = useFormField({
  initialValue: '',
  rules: [validators.required(), validators.minLength(6)],
});

const confirmField = useFormField({
  initialValue: '',
  rules: [
    validators.required(),
    validators.matches(
      () => passwordField.value,
      '两次密码输入不一致'
    ),
  ],
});
```

### 动态更新初始值（编辑表单）

```tsx
const userField = useFormField({ initialValue: '' });

// 加载数据后更新初始值
useEffect(() => {
  async function loadUser() {
    const user = await fetchUser(userId);
    userField.setInitialValue(user.name);
    userField.setValue(user.name);
  }
  loadUser();
}, [userId]);
```

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

MIT © [leonwgc](https://github.com/leonwgc)

## 🔗 相关链接

- [GitHub 仓库](https://github.com/leonwgc/react-form-field-hook)
- [问题反馈](https://github.com/leonwgc/react-form-field-hook/issues)
- [更新日志](https://github.com/leonwgc/react-form-field-hook/releases)
