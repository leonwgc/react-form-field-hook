# use-form-field 单元测试

## 测试概览

已为 `use-form-field` 项目添加了完整的单元测试套件。

### 测试统计

- **测试文件数**: 3
- **测试用例数**: 40
- **测试通过率**: 100%
- **代码覆盖率**: 91.49%

### 测试文件

#### 1. useFormField.test.tsx

测试 `useFormField` hook 的核心功能：

- **初始化测试** (2个用例)
  - 默认值初始化
  - 自定义初始值

- **值变化测试** (2个用例)
  - 值更新
  - onValueChange 回调

- **验证测试** (3个用例)
  - 必填字段验证
  - 邮箱格式验证
  - 异步验证

- **重置测试** (1个用例)
  - 重置到初始状态

- **Props Getters 测试** (1个用例)
  - getInputProps 返回正确的属性

#### 2. useFormFields.test.tsx

测试 `useFormFields` hook 的多字段管理功能：

- **初始化测试** (1个用例)
  - 多字段初始化

- **表单方法测试** (6个用例)
  - validateAll - 验证所有字段
  - resetAll - 重置所有字段
  - getValues - 获取所有字段值
  - setValues - 批量设置字段值
  - isDirty - 检测字段修改状态
  - isValid - 检查所有字段有效性

#### 3. validators.test.tsx

测试所有内置验证器：

- **required** - 必填验证
- **email** - 邮箱格式验证
- **minLength** - 最小长度验证
- **maxLength** - 最大长度验证
- **pattern** - 正则表达式验证
- **min/max** - 数值范围验证
- **url** - URL 格式验证
- **number** - 数字格式验证
- **integer** - 整数格式验证
- **matches** - 值匹配验证
- **oneOf** - 值在列表中验证
- **validate** - 自定义验证
- **phone** - 电话号码验证

共计 24 个验证器测试用例。

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行测试并监听文件变化
```bash
npm run test:watch
```

### 运行测试覆盖率
```bash
npm run test:coverage
```

## 测试配置

### vitest.config.ts

- 使用 jsdom 环境模拟浏览器
- 配置测试超时时间为 10 秒
- 使用 v8 覆盖率报告器
- 排除 node_modules、测试文件和构建输出

### 测试工具

- **Vitest** - 快速的单元测试框架
- **@testing-library/react** - React 组件测试工具
- **@types/react** - TypeScript 类型定义

## 代码覆盖率详情

| 指标 | 覆盖率 |
|------|--------|
| Statements | 91.49% |
| Branches | 86.91% |
| Functions | 100% |
| Lines | 91.49% |

### 未覆盖的代码行

主要是一些边缘情况和错误处理分支，包括：
- 某些特殊的验证错误场景
- 部分条件分支的 else 情况
- 一些异常处理代码

## 测试最佳实践

1. **使用 act()** - 所有导致状态更新的操作都包裹在 `act()` 中
2. **异步测试** - 使用 `async/await` 处理异步验证
3. **清理** - 每个测试后自动清理 React 组件
4. **隔离测试** - 每个测试用例互不影响
5. **清晰命名** - 测试用例使用中文描述，清晰易懂

## 持续集成

测试可以轻松集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run Tests
  run: npm test

- name: Generate Coverage Report
  run: npm run test:coverage
```

## 未来改进

可以考虑添加：

1. 更多的集成测试
2. 性能测试
3. 边缘情况测试
4. 浏览器兼容性测试
5. 端到端测试（E2E）
