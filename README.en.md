# react-form-field-hook

⚡️ A lightweight React hook for managing form field state.

English | [简体中文](./README.md)

## ✨ Features

- 🎯 **Type Safe** - Full TypeScript support
- 🚀 **Lightweight** - No external dependencies, small bundle size
- 📝 **Flexible Validation** - Sync and async validation support
- 🔄 **Debounced Validation** - Configurable validation debouncing
- 💪 **Rich State** - Track touched, dirty, pristine, valid, and more
- 🎭 **Multi-field Management** - Manage multiple fields with `useFormFields`
- 📦 **Built-in Validators** - Common validation rules out of the box

## 📦 Installation

```bash
npm install react-form-field-hook
# or
yarn add react-form-field-hook
# or
pnpm add react-form-field-hook
```

## 🚀 Quick Start

### Basic Usage

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
        placeholder="Enter your email"
        {...emailField.getAntdInputProps()}
      />
      {emailField.renderError()}
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
```

### Async Validation (with Debounce)

```tsx
const usernameField = useFormField({
  initialValue: '',
  rules: [
    validators.required(),
    validators.minLength(3),
    async (value) => {
      const response = await fetch(`/api/check-username?username=${value}`);
      const { available } = await response.json();
      return available ? null : 'Username is already taken';
    }
  ],
  validateOnChange: true,
  validateDebounce: 300, // 300ms debounce
});

return (
  <div>
    <Input {...usernameField.getAntdInputProps()} />
    {usernameField.validating && <span>Validating...</span>}
    {usernameField.renderError()}
  </div>
);
```

### Managing Multiple Fields

```tsx
const { fields, validateAll, resetAll, getValues } = useFormFields({
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
    const formData = getValues();
    // Submit form...
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

    <Button onClick={handleSubmit}>Submit</Button>
    <Button onClick={resetAll}>Reset</Button>
  </form>
);
```

## 📚 API

### useFormField

```tsx
const field = useFormField<T>(options: FieldOptions<T>);
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initialValue` | `T` | - | Initial value of the field |
| `rules` | `ValidationRule<T>[]` | `[]` | Array of validation rules |
| `validateOnChange` | `boolean` | `true` | Whether to validate on value change |
| `validateOnBlur` | `boolean` | `true` | Whether to validate on blur |
| `validateDebounce` | `number` | `0` | Validation debounce delay (ms) |
| `disabled` | `boolean` | `false` | Whether the field is disabled |
| `onValueChange` | `(value: T) => void` | - | Callback when value changes |

#### Returned Field Object

**State Properties:**

- `value: T` - Current field value
- `touched: boolean` - Whether the field has been touched (focused then blurred)
- `dirty: boolean` - Whether the value has been modified from initial value
- `pristine: boolean` - Whether the value has not been modified from initial value
- `valid: boolean` - Whether the field is currently valid
- `invalid: boolean` - Whether the field is currently invalid
- `error: string | null` - Current validation error message
- `validating: boolean` - Whether currently validating (async validation)
- `visited: boolean` - Whether focused at least once
- `focused: boolean` - Whether currently focused
- `disabled: boolean` - Whether disabled

**Methods:**

- `onChange(value: T)` - Handle value changes
- `onBlur()` - Handle blur events
- `onFocus()` - Handle focus events
- `setValue(value: T)` - Manually set value
- `reset()` - Reset to initial state
- `validate()` - Manually trigger validation
- `setError(error: string | null)` - Manually set error
- `setTouched(touched: boolean)` - Mark as touched
- `setDisabled(disabled: boolean)` - Set disabled state
- `setInitialValue(value: T)` - Update initial value
- `getInputProps()` - Get props for input components
- `getHTMLInputProps()` - Get props for native HTML input elements
- `getAntdInputProps()` - Get props for Ant Design input components (includes status)
- `renderError(className?: string)` - Render error message

### useFormFields

```tsx
const { fields, form } = useFormFields(fieldsConfig);
```

#### Parameters

`fieldsConfig` - Field configuration object, where keys are field names and values are `UseFormFieldOptions`

```tsx
type FieldsConfig<T> = {
  [K in keyof T]: UseFormFieldOptions<T[K]>;
};
```

#### Returns

**`fields`** - Field collection object

Contains all configured fields, each field is a complete `useFormField` return value (includes state and methods)

```tsx
fields.username.value
fields.username.error
fields.username.validate()
fields.username.getAntdInputProps()
// ... all useFormField properties and methods
```

**`form`** - Form-level operations object

| Method/Property | Type | Description |
|----------------|------|-------------|
| `validateAll()` | `() => Promise<boolean>` | Validate all fields and return whether all are valid |
| `resetAll()` | `() => void` | Reset all fields to initial state |
| `getValues()` | `() => T` | Get all field values as an object |
| `setValues()` | `(values: Partial<T>) => void` | Batch set field values |
| `setInitialValues()` | `(values: Partial<T>) => void` | Batch set initial values (for edit forms) |
| `getErrors()` | `() => Partial<Record<keyof T, string \| null>>` | Get all field errors |
| `setDisabled()` | `(disabled: boolean) => void` | Set disabled state for all fields |
| `isDirty` | `boolean` | Whether any field has been modified |
| `isValid` | `boolean` | Whether all fields are valid |
| `isDisabled` | `boolean` | Whether all fields are disabled |
- `getValues()` - Get values of all fields as an object

### Built-in Validators

All validators return a validation rule function:

```tsx
// Required validation
validators.required(message?: string)

// Email format
validators.email(message?: string)

// Minimum length
validators.minLength(min: number, message?: string)

// Maximum length
validators.maxLength(max: number, message?: string)

// Regular expression
validators.pattern(regex: RegExp, message: string)

// Minimum value
validators.min(min: number, message?: string)

// Maximum value
validators.max(max: number, message?: string)

// URL format
validators.url(message?: string)

// Number format
validators.number(message?: string)

// Integer format
validators.integer(message?: string)

// Match other field (e.g., password confirmation)
validators.matches(getOtherValue: () => T, message?: string)

// Value in allowed list
validators.oneOf(allowedValues: T[], message?: string)

// Custom validation (async support)
validators.validate(
  validator: (value: T) => boolean | Promise<boolean>,
  message: string
)

// Phone number format
validators.phone(message?: string)
```

### Custom Validation Rules

```tsx
// Synchronous validation
const customRule: ValidationRule<string> = (value) => {
  if (!value.startsWith('prefix-')) {
    return 'Value must start with "prefix-"';
  }
  return null;
};

// Asynchronous validation
const asyncRule: ValidationRule<string> = async (value) => {
  const response = await fetch(`/api/validate?value=${value}`);
  const { valid } = await response.json();
  return valid ? null : 'Validation failed';
};

const field = useFormField({
  initialValue: '',
  rules: [customRule, asyncRule],
});
```

## 🎯 Integration with Different UI Frameworks

### Ant Design / Neat Design

```tsx
<Input {...field.getAntdInputProps()} />
```

### Native HTML

```tsx
<input {...field.getHTMLInputProps()} />
```

### Other Component Libraries

```tsx
<CustomInput {...field.getInputProps()} />
```

## 🔧 Advanced Usage

### Field State Tracking

```tsx
const field = useFormField({ initialValue: '' });

// Check various states
console.log(field.touched);   // Has been touched
console.log(field.dirty);     // Has been modified
console.log(field.pristine);  // Is pristine
console.log(field.valid);     // Is valid
console.log(field.invalid);   // Is invalid
console.log(field.visited);   // Has been visited
console.log(field.focused);   // Is focused
```

### Password Confirmation Example

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
      'Passwords do not match'
    ),
  ],
});
```

### Dynamically Update Initial Value (Edit Forms)

```tsx
const userField = useFormField({ initialValue: '' });

// Update initial value after loading data
useEffect(() => {
  async function loadUser() {
    const user = await fetchUser(userId);
    userField.setInitialValue(user.name);
  }
  loadUser();
}, [userId]);
```

### Managing Entire Form with useFormFields

```tsx
const { fields, form } = useFormFields({
  username: {
    initialValue: '',
    rules: [validators.required(), validators.minLength(3)],
  },
  email: {
    initialValue: '',
    rules: [validators.required(), validators.email()],
  },
  age: {
    initialValue: '',
    rules: [validators.number(), validators.min(0)],
  },
});

const handleSubmit = async () => {
  if (await form.validateAll()) {
    const formData = form.getValues();
    await submitToAPI(formData);
  }
};

const handleLoadData = async () => {
  const data = await fetchUserData();
  form.setInitialValues(data); // Batch set initial values
};

// Check form state
const canSubmit = form.isValid && form.isDirty && !form.isDisabled;

return (
  <form>
    <Input {...fields.username.getAntdInputProps()} />
    {fields.username.renderError()}

    <Input {...fields.email.getAntdInputProps()} />
    {fields.email.renderError()}

    <Input {...fields.age.getAntdInputProps()} />
    {fields.age.renderError()}

    <Button onClick={handleSubmit} disabled={!canSubmit}>
      Submit
    </Button>
    <Button onClick={() => form.resetAll()}>Reset</Button>
  </form>
);
```

### Value Transform

```tsx
const phoneField = useFormField({
  initialValue: '',
  transform: (value: string) => {
    // Auto format to 123-456-7890
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  },
  rules: [validators.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Format: 123-456-7890')],
});
```

### Custom Comparison Function (compareWith)

```tsx
// Array comparison ignoring order
const tagsField = useFormField({
  initialValue: 'react,vue,angular',
  compareWith: (a, b) => {
    const arrA = a.split(',').sort();
    const arrB = b.split(',').sort();
    return JSON.stringify(arrA) === JSON.stringify(arrB);
  },
});
// Entering "vue,react,angular" still keeps pristine state
```

### Conditional Validation

```tsx
const [isPremium, setIsPremium] = useState(false);

const usernameField = useFormField({
  initialValue: '',
  rules: [
    validators.required(),
    validators.validate(
      (value) => !isPremium || value.length >= 10,
      'Premium username requires at least 10 characters'
    ),
  ],
});

// Re-validate when isPremium changes
useEffect(() => {
  usernameField.validate();
}, [isPremium]);
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## 📄 License

MIT © [leonwgc](https://github.com/leonwgc)

## 🔗 Links

- [GitHub Repository](https://github.com/leonwgc/react-form-field-hook)
- [Issue Tracker](https://github.com/leonwgc/react-form-field-hook/issues)
- [Changelog](https://github.com/leonwgc/react-form-field-hook/releases)
