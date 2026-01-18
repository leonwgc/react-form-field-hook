/**
 * @author leon.wang
 */

import React, { useState } from 'react';
import {
  Input,
  Button,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Select,
  DatePicker,
  Checkbox,
} from 'antd';
import { useFormField, validators, useFormFields } from '../src';
import './FormFieldHook.scss';

const { Title, Paragraph, Text } = Typography;

/**
 * Async validation helper - simulates API call
 */
const asyncUnique = (value: string) =>
  new Promise<string | null>((resolve) => {
    setTimeout(() => {
      const taken = ['admin', 'test', 'user'].includes(value.toLowerCase());
      resolve(taken ? 'This username is already taken' : null);
    }, 500);
  });

/**
 * Basic usage example
 */
const BasicExample: React.FC = () => {
  const emailField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.email()],
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <Card title="Basic Usage" className="form-field-hook__card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Input
            placeholder="Enter your email"
            {...emailField.getAntdInputProps()}
          />

          {emailField.renderError('form-field-hook__error')}
        </div>
        <div className="form-field-hook__states">
          <Space wrap>
            <Tag color={emailField.touched ? 'blue' : undefined}>
              Touched: {String(emailField.touched)}
            </Tag>
            <Tag color={emailField.dirty ? 'orange' : undefined}>
              Dirty: {String(emailField.dirty)}
            </Tag>
            <Tag color={emailField.pristine ? 'green' : undefined}>
              Pristine: {String(emailField.pristine)}
            </Tag>
            <Tag color={emailField.valid ? 'green' : undefined}>
              Valid: {String(emailField.valid)}
            </Tag>
            <Tag color={emailField.invalid ? 'red' : undefined}>
              Invalid: {String(emailField.invalid)}
            </Tag>
            <Tag color={emailField.visited ? 'purple' : undefined}>
              Visited: {String(emailField.visited)}
            </Tag>
            <Tag color={emailField.focused ? 'cyan' : undefined}>
              Focused: {String(emailField.focused)}
            </Tag>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Async validation example
 */
const AsyncValidationExample: React.FC = () => {
  const usernameField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.minLength(3), asyncUnique],
    validateOnChange: true,
    validateDebounce: 300,
  });

  return (
    <Card
      title="Async Validation (with Debounce)"
      className="form-field-hook__card"
    >
      <Paragraph>
        Try entering: <Text code>admin</Text>, <Text code>test</Text>, or{' '}
        <Text code>user</Text> to see async validation
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Input
            placeholder="Enter username"
            {...usernameField.getAntdInputProps()}
            suffix={usernameField.validating ? 'Validating...' : undefined}
          />
          {usernameField.renderError('form-field-hook__error')}
        </div>
        <div className="form-field-hook__states">
          <Space wrap>
            <Tag color={usernameField.validating ? 'blue' : undefined}>
              Validating: {String(usernameField.validating)}
            </Tag>
            <Tag color={usernameField.valid ? 'green' : undefined}>
              Valid: {String(usernameField.valid)}
            </Tag>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Password strength example
 */
const PasswordStrengthExample: React.FC = () => {
  const passwordField = useFormField({
    initialValue: '',
    rules: [
      validators.required(),
      validators.minLength(8),
      validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    ],
    validateOnChange: true,
  });

  const confirmPasswordField = useFormField({
    initialValue: '',
    rules: [
      validators.required(),
      (value: string) =>
        value !== passwordField.value ? 'Passwords do not match' : null,
    ],
    validateOnChange: true,
  });

  return (
    <Card title="Password Validation" className="form-field-hook__card">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Password:</Text>
          <Input.Password
            placeholder="Enter password"
            {...passwordField.getAntdInputProps()}
          />
          {passwordField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Confirm Password:</Text>
          <Input.Password
            placeholder="Confirm password"
            {...confirmPasswordField.getAntdInputProps()}
          />
          {confirmPasswordField.renderError('form-field-hook__error')}
        </div>
      </Space>
    </Card>
  );
};

/**
 * Form actions example
 */
const FormActionsExample: React.FC = () => {
  const nameField = useFormField({
    initialValue: 'leon',
    rules: [validators.required(), validators.minLength(2)],
  });

  const ageField = useFormField({
    initialValue: '18',
    rules: [
      validators.required(),
      validators.number(),
      validators.min(0),
      validators.max(150),
    ],
  });

  const [submitData, setSubmitData] = useState<{
    name: string;
    age: string;
  } | null>(null);

  const handleSubmit = async () => {
    const nameValid = await nameField.validate();
    const ageValid = await ageField.validate();

    if (nameValid && ageValid) {
      setSubmitData({
        name: nameField.value,
        age: ageField.value,
      });
    }
  };

  const handleReset = () => {
    nameField.reset();
    ageField.reset();
    setSubmitData(null);
  };

  const handleFillSample = () => {
    nameField.setValue('John Doe');
    ageField.setValue('25');
  };

  return (
    <Card title="Form Actions" className="form-field-hook__card">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Name:</Text>
          <Input placeholder="Enter name" {...nameField.getAntdInputProps()} />
          {nameField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Age:</Text>
          <Input placeholder="Enter age" {...ageField.getAntdInputProps()} />
          {ageField.renderError('form-field-hook__error')}
        </div>
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button onClick={handleReset}>Reset</Button>
          <Button onClick={handleFillSample}>Fill Sample Data</Button>
        </Space>
        {submitData && (
          <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
            <Text strong>Submitted Data:</Text>
            <pre>{JSON.stringify(submitData, null, 2)}</pre>
          </Card>
        )}
      </Space>
    </Card>
  );
};

/**
 * Validate on blur only example
 */
const ValidateOnBlurExample: React.FC = () => {
  const field = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.minLength(5)],
    validateOnChange: false,
    validateOnBlur: true,
  });

  return (
    <Card title="Validate On Blur Only" className="form-field-hook__card">
      <Paragraph type="secondary">
        This field only validates when you leave the input (onBlur), not while
        typing.
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Input
            placeholder="Type and blur to validate"
            {...field.getAntdInputProps()}
          />
          {field.renderError('form-field-hook__error')}
        </div>
        <div className="form-field-hook__states">
          <Space wrap>
            <Tag color={field.touched ? 'blue' : undefined}>
              Touched: {String(field.touched)}
            </Tag>
            <Tag color={field.valid ? 'green' : undefined}>
              Valid: {String(field.valid)}
            </Tag>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Built-in validators example
 */
const BuiltInValidatorsExample: React.FC = () => {
  const emailField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.email()],
  });

  const ageField = useFormField({
    initialValue: '',
    rules: [
      validators.required(),
      validators.number(),
      validators.min(0),
      validators.max(150),
    ],
  });

  const urlField = useFormField({
    initialValue: '',
    rules: [validators.url()],
  });

  return (
    <Card
      title="Built-in Validators (Simplified)"
      className="form-field-hook__card"
    >
      <Paragraph type="secondary">
        Use built-in validators for common scenarios - cleaner and more
        maintainable
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Email:</Text>
          <Input
            placeholder="user@example.com"
            {...emailField.getAntdInputProps()}
          />
          {emailField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Age (0-150):</Text>
          <Input placeholder="25" {...ageField.getAntdInputProps()} />
          {ageField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Website URL:</Text>
          <Input
            placeholder="https://example.com"
            {...urlField.getAntdInputProps()}
          />
          {urlField.renderError('form-field-hook__error')}
        </div>
      </Space>
    </Card>
  );
};

/**
 * Transform example
 */
const TransformExample: React.FC = () => {
  const usernameField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.minLength(3)],
    transform: (value: string) => value.toLowerCase().trim(), // Auto lowercase and trim
  });

  const phoneField = useFormField({
    initialValue: '',
    rules: [
      validators.required(),
      validators.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Format: 123-456-7890'),
    ],
    transform: (value: string) => {
      // Auto format phone number
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    },
  });

  return (
    <Card title="Value Transform" className="form-field-hook__card">
      <Paragraph type="secondary">
        Auto-transform input values (trim, lowercase, format, etc.)
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Username (auto lowercase & trim):</Text>
          <Input
            placeholder="JohnDoe"
            value={usernameField.value}
            onChange={(e) => usernameField.onChange(e.target.value)}
            onBlur={usernameField.onBlur}
            onFocus={usernameField.onFocus}
            status={
              usernameField.touched && usernameField.invalid
                ? 'error'
                : undefined
            }
          />
          {usernameField.touched && usernameField.error && (
            <div className="form-field-hook__error">{usernameField.error}</div>
          )}
          <Text type="secondary">Stored value: {usernameField.value}</Text>
        </div>
        <div>
          <Text>Phone (auto format):</Text>
          <Input
            placeholder="1234567890"
            value={phoneField.value}
            onChange={(e) => phoneField.onChange(e.target.value)}
            onBlur={phoneField.onBlur}
            onFocus={phoneField.onFocus}
            status={
              phoneField.touched && phoneField.invalid ? 'error' : undefined
            }
          />
          {phoneField.touched && phoneField.error && (
            <div className="form-field-hook__error">{phoneField.error}</div>
          )}
        </div>
      </Space>
    </Card>
  );
};

/**
 * Custom compare example
 */
const CustomCompareExample: React.FC = () => {
  const tagsField = useFormField<string>({
    initialValue: 'react,vue,angular',
    rules: [validators.required()],
    // Custom comparison - compare sorted arrays
    compareWith: (a, b) => {
      const arrA = a
        .split(',')
        .map((s) => s.trim())
        .sort();
      const arrB = b
        .split(',')
        .map((s) => s.trim())
        .sort();
      return JSON.stringify(arrA) === JSON.stringify(arrB);
    },
  });

  return (
    <Card
      title="Custom Comparison (compareWith)"
      className="form-field-hook__card"
    >
      <Paragraph type="secondary">
        Custom logic for determining dirty state. Here, tag order doesn't
        matter.
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text>Tags (comma-separated):</Text>
          <Input
            placeholder="react,vue,angular"
            value={tagsField.value}
            onChange={(e) => tagsField.onChange(e.target.value)}
            onBlur={tagsField.onBlur}
            onFocus={tagsField.onFocus}
          />
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            Try: "vue,react,angular" - still pristine because order doesn't
            matter
          </Paragraph>
        </div>
        <div className="form-field-hook__states">
          <Space wrap>
            <Tag color={tagsField.dirty ? 'orange' : undefined}>
              Dirty: {String(tagsField.dirty)}
            </Tag>
            <Tag color={tagsField.pristine ? 'green' : undefined}>
              Pristine: {String(tagsField.pristine)}
            </Tag>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Ultra simplified example - showing the most concise usage
 */
const UltraSimplifiedExample: React.FC = () => {
  const nameField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.minLength(2)],
  });

  const emailField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.email()],
  });

  const phoneField = useFormField({
    initialValue: '',
    rules: [
      validators.required(),
      validators.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Format: 123-456-7890'),
    ],
  });

  return (
    <Card title="Ultra Simplified Usage 🚀" className="form-field-hook__card">
      <Paragraph type="secondary">
        Maximum simplification with <Text code>getAntdInputProps()</Text> and{' '}
        <Text code>renderError()</Text>
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Name:</Text>
          <Input placeholder="John Doe" {...nameField.getAntdInputProps()} />
          {nameField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Email:</Text>
          <Input
            placeholder="john@example.com"
            {...emailField.getAntdInputProps()}
          />
          {emailField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Phone:</Text>
          <Input
            placeholder="123-456-7890"
            {...phoneField.getAntdInputProps()}
          />
          {phoneField.renderError('form-field-hook__error')}
        </div>
      </Space>
    </Card>
  );
};

/**
 * Select and DatePicker example - using getInputProps
 */
const SelectDateExample: React.FC = () => {
  const categoryField = useFormField<string | undefined>({
    initialValue: undefined,
    rules: [
      validators.validate((value) => !!value, 'Please select a category'),
    ],
  });

  const birthDateField = useFormField({
    initialValue: null,
    rules: [validators.validate((value) => !!value, 'Please select a date')],
  });

  const countryField = useFormField<string | undefined>({
    initialValue: undefined,
    rules: [validators.required('Please select a country')],
  });

  return (
    <Card
      title="Select & DatePicker Components"
      className="form-field-hook__card"
    >
      <Paragraph type="secondary">
        Using <Text code>getInputProps()</Text> for components that directly
        receive value
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Category:</Text>
          <Select
            {...categoryField.getInputProps()}
            placeholder="Select category"
            style={{ width: '100%' }}
            options={[
              { label: 'Frontend', value: 'frontend' },
              { label: 'Backend', value: 'backend' },
              { label: 'DevOps', value: 'devops' },
            ]}
          />
          {categoryField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Birth Date:</Text>
          <DatePicker
            {...birthDateField.getInputProps()}
            placeholder="Select date"
            style={{ width: '100%' }}
          />
          {birthDateField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Country:</Text>
          <Select
            {...countryField.getInputProps()}
            placeholder="Select country"
            style={{ width: '100%' }}
            showSearch
            options={[
              { label: 'United States', value: 'us' },
              { label: 'China', value: 'cn' },
              { label: 'Japan', value: 'jp' },
              { label: 'United Kingdom', value: 'uk' },
            ]}
          />
          {countryField.renderError('form-field-hook__error')}
        </div>
        <div className="form-field-hook__states">
          <Space wrap>
            <Tag>Category: {categoryField.value || 'null'}</Tag>
            <Tag>Date: {birthDateField.value ? 'Selected' : 'null'}</Tag>
            <Tag>Country: {countryField.value || 'null'}</Tag>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Disabled state management example
 */
const DisabledStateExample: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.minLength(3)],
  });

  const emailField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.email()],
  });

  const handleSubmit = async () => {
    const isValid =
      (await usernameField.validate()) && (await emailField.validate());

    if (isValid) {
      setIsSubmitting(true);
      usernameField.setDisabled(true);
      emailField.setDisabled(true);

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        usernameField.setDisabled(false);
        emailField.setDisabled(false);
      }, 2000);
    }
  };

  return (
    <Card title="Disabled State Management" className="form-field-hook__card">
      <Paragraph type="secondary">
        Use <Text code>setDisabled()</Text> to dynamically control field state
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Username:</Text>
          <Input
            {...usernameField.getAntdInputProps()}
            placeholder="Enter username"
          />
          {usernameField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Email:</Text>
          <Input
            {...emailField.getAntdInputProps()}
            placeholder="Enter email"
          />
          {emailField.renderError('form-field-hook__error')}
        </div>
        <Button type="primary" loading={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
        <div className="form-field-hook__states">
          <Space wrap>
            <Tag color={usernameField.disabled ? 'red' : 'green'}>
              Username Disabled: {String(usernameField.disabled)}
            </Tag>
            <Tag color={emailField.disabled ? 'red' : 'green'}>
              Email Disabled: {String(emailField.disabled)}
            </Tag>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Edit form example - setInitialValue
 */
const EditFormExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    bio: string;
  } | null>(null);

  const nameField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.minLength(2)],
  });

  const emailField = useFormField({
    initialValue: '',
    rules: [validators.required(), validators.email()],
  });

  const bioField = useFormField({
    initialValue: '',
    rules: [validators.maxLength(200, 'Bio must be less than 200 characters')],
  });

  // Simulate fetching user data from API
  const loadUserData = () => {
    setLoading(true);
    setTimeout(() => {
      const data = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Software engineer with 5 years experience.',
      };

      // Set initial values from API
      nameField.setInitialValue(data.name);
      emailField.setInitialValue(data.email);
      bioField.setInitialValue(data.bio);

      setUserData(data);
      setLoading(false);
    }, 1000);
  };

  const handleSave = async () => {
    const isValid =
      (await nameField.validate()) &&
      (await emailField.validate()) &&
      (await bioField.validate());

    if (isValid) {
      alert('Data saved successfully!');
      // Update initial values to current values
      nameField.setInitialValue(nameField.value);
      emailField.setInitialValue(emailField.value);
      bioField.setInitialValue(bioField.value);
    }
  };

  const hasChanges = nameField.dirty || emailField.dirty || bioField.dirty;

  return (
    <Card title="Edit Form (setInitialValue)" className="form-field-hook__card">
      <Paragraph type="secondary">
        Use <Text code>setInitialValue()</Text> to load data from API and track
        changes
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {!userData ? (
          <Button type="primary" onClick={loadUserData} loading={loading}>
            Load User Data
          </Button>
        ) : (
          <>
            <div>
              <Text>Name:</Text>
              <Input {...nameField.getAntdInputProps()} />
              {nameField.renderError('form-field-hook__error')}
            </div>
            <div>
              <Text>Email:</Text>
              <Input {...emailField.getAntdInputProps()} />
              {emailField.renderError('form-field-hook__error')}
            </div>
            <div>
              <Text>Bio:</Text>
              <Input.TextArea {...bioField.getAntdInputProps()} rows={3} />
              {bioField.renderError('form-field-hook__error')}
            </div>
            <Space>
              <Button
                type="primary"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  nameField.reset();
                  emailField.reset();
                  bioField.reset();
                }}
              >
                Reset
              </Button>
            </Space>
            <div className="form-field-hook__states">
              <Space wrap>
                <Tag color={hasChanges ? 'orange' : 'green'}>
                  Has Unsaved Changes: {String(hasChanges)}
                </Tag>
                <Tag>Name Dirty: {String(nameField.dirty)}</Tag>
                <Tag>Email Dirty: {String(emailField.dirty)}</Tag>
                <Tag>Bio Dirty: {String(bioField.dirty)}</Tag>
              </Space>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
};

/**
 * useFormFields example - multiple fields management
 */
const MultipleFieldsExample: React.FC = () => {
  const { fields, form } = useFormFields({
    username: {
      rules: [
        validators.required('Username is required'),
        validators.minLength(3),
      ],
    },
    email: {
      rules: [validators.required('Email is required'), validators.email()],
    },
    password: {
      rules: [
        validators.required('Password is required'),
        validators.minLength(6, 'At least 6 characters'),
      ],
    },
    age: {
      rules: [
        validators.number('Must be a number'),
        validators.min(18, 'Must be at least 18'),
        validators.max(100, 'Must be less than 100'),
      ],
    },
  });

  const [submitResult, setSubmitResult] = useState<{
    username: string;
    email: string;
    password: string;
    age: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (await form.validateAll()) {
      const values = form.getValues();
      setSubmitResult(values);
    }
  };

  const handleReset = () => {
    form.resetAll();
    setSubmitResult(null);
  };

  const handleLoadSample = () => {
    form.setValues({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      age: '25',
    });
  };

  return (
    <Card title="useFormFields Hook 🔥" className="form-field-hook__card">
      <Paragraph type="secondary">
        Use <Text code>useFormFields</Text> to manage multiple fields at once
        with form-level actions
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={16}>
          <Col span={12}>
            <Text>Username:</Text>
            <Input
              {...fields.username.getAntdInputProps()}
              placeholder="Enter username"
            />
            {fields.username.renderError('form-field-hook__error')}
          </Col>
          <Col span={12}>
            <Text>Email:</Text>
            <Input
              {...fields.email.getAntdInputProps()}
              placeholder="Enter email"
            />
            {fields.email.renderError('form-field-hook__error')}
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Text>Password:</Text>
            <Input.Password
              {...fields.password.getAntdInputProps()}
              placeholder="Enter password"
            />
            {fields.password.renderError('form-field-hook__error')}
          </Col>
          <Col span={12}>
            <Text>Age:</Text>
            <Input
              {...fields.age.getAntdInputProps()}
              placeholder="Enter age"
            />
            {fields.age.renderError('form-field-hook__error')}
          </Col>
        </Row>
        <Space>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={form.isDisabled()}
          >
            Submit All
          </Button>
          <Button onClick={handleReset}>Reset All</Button>
          <Button onClick={handleLoadSample}>Load Sample</Button>
          <Button onClick={() => form.setDisabled(!form.isDisabled())}>
            Toggle Form Disabled
          </Button>
        </Space>
        <div className="form-field-hook__states">
          <Space wrap>
            <Tag color={form.isDirty() ? 'orange' : 'green'}>
              Form Dirty: {String(form.isDirty())}
            </Tag>
            <Tag color={form.isValid() ? 'green' : 'red'}>
              Form Valid: {String(form.isValid())}
            </Tag>
            <Tag color={form.isDisabled() ? 'red' : 'green'}>
              Form Disabled: {String(form.isDisabled())}
            </Tag>
          </Space>
        </div>
        {submitResult && (
          <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
            <Text strong>Submitted Values:</Text>
            <pre>{JSON.stringify(submitResult, null, 2)}</pre>
          </Card>
        )}
      </Space>
    </Card>
  );
};

/**
 * Conditional validation example
 */
const ConditionalValidationExample: React.FC = () => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const emailField = useFormField({
    initialValue: '',
    rules: [
      validators.required('Email is required'),
      validators.email(),
      // Conditional validation
      validators.validate(
        (value) => !agreeToTerms || value.includes('@'),
        'Valid email required when terms are accepted'
      ),
    ],
  });

  return (
    <Card title="Conditional Validation" className="form-field-hook__card">
      <Paragraph type="secondary">
        Validation rules can be conditional based on other state
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Email:</Text>
          <Input
            {...emailField.getAntdInputProps()}
            placeholder="Enter email"
          />
          {emailField.renderError('form-field-hook__error')}
        </div>
        <Checkbox
          checked={agreeToTerms}
          onChange={(e) => {
            setAgreeToTerms(e.target.checked);
            emailField.validate(); // Re-validate when checkbox changes
          }}
        >
          I agree to terms and conditions
        </Checkbox>
        <div className="form-field-hook__states">
          <Tag color={agreeToTerms ? 'blue' : undefined}>
            Terms Accepted: {String(agreeToTerms)}
          </Tag>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Validators composition example
 */
const ValidatorsCompositionExample: React.FC = () => {
  const passwordField = useFormField({
    initialValue: '',
    rules: [
      validators.required('Password is required'),
      validators.minLength(8, 'At least 8 characters'),
      validators.pattern(/[A-Z]/, 'Must contain uppercase letter'),
      validators.pattern(/[a-z]/, 'Must contain lowercase letter'),
      validators.pattern(/[0-9]/, 'Must contain number'),
      validators.pattern(/[!@#$%^&*]/, 'Must contain special character'),
    ],
  });

  const getStrength = () => {
    const value = passwordField.value;
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[!@#$%^&*]/.test(value)) strength++;
    return strength;
  };

  const strength = getStrength();
  const strengthText = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
    'Very Strong',
  ][strength];

  return (
    <Card title="Validators Composition" className="form-field-hook__card">
      <Paragraph type="secondary">
        Combine multiple validation rules for complex requirements
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text>Strong Password:</Text>
          <Input.Password
            {...passwordField.getAntdInputProps()}
            placeholder="Enter password"
          />
          {passwordField.renderError('form-field-hook__error')}
        </div>
        <div>
          <Text>Password Strength: </Text>
          <Tag color="red">{strengthText}</Tag>
          <Tag>{strength}/5</Tag>
        </div>
        <Card size="small" type="inner">
          <Text type="secondary">Requirements:</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li
              style={{
                color: passwordField.value.length >= 8 ? 'green' : 'inherit',
              }}
            >
              At least 8 characters
            </li>
            <li
              style={{
                color: /[A-Z]/.test(passwordField.value) ? 'green' : 'inherit',
              }}
            >
              Contains uppercase letter
            </li>
            <li
              style={{
                color: /[a-z]/.test(passwordField.value) ? 'green' : 'inherit',
              }}
            >
              Contains lowercase letter
            </li>
            <li
              style={{
                color: /[0-9]/.test(passwordField.value) ? 'green' : 'inherit',
              }}
            >
              Contains number
            </li>
            <li
              style={{
                color: /[!@#$%^&*]/.test(passwordField.value)
                  ? 'green'
                  : 'inherit',
              }}
            >
              Contains special character (!@#$%^&*)
            </li>
          </ul>
        </Card>
      </Space>
    </Card>
  );
};

/**
 * Main component
 */
const FormFieldHook: React.FC = () => {
  return (
    <div className="form-field-hook">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <BasicExample />
        </Col>
        <Col xs={24} lg={12}>
          <UltraSimplifiedExample />
        </Col>
        <Col xs={24}>
          <MultipleFieldsExample />
        </Col>
        <Col xs={24} lg={12}>
          <SelectDateExample />
        </Col>
        <Col xs={24} lg={12}>
          <DisabledStateExample />
        </Col>
        <Col xs={24}>
          <EditFormExample />
        </Col>
        <Col xs={24} lg={12}>
          <BuiltInValidatorsExample />
        </Col>
        <Col xs={24} lg={12}>
          <AsyncValidationExample />
        </Col>
        <Col xs={24} lg={12}>
          <ValidatorsCompositionExample />
        </Col>
        <Col xs={24} lg={12}>
          <ConditionalValidationExample />
        </Col>
        <Col xs={24} lg={12}>
          <TransformExample />
        </Col>
        <Col xs={24} lg={12}>
          <PasswordStrengthExample />
        </Col>
        <Col xs={24} lg={12}>
          <CustomCompareExample />
        </Col>
        <Col xs={24} lg={12}>
          <ValidateOnBlurExample />
        </Col>
        <Col xs={24}>
          <FormActionsExample />
        </Col>
      </Row>

      <Card
        title="Features"
        className="form-field-hook__card"
        style={{ marginTop: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Title level={5}>Field States:</Title>
            <ul>
              <li>
                <Text code>value</Text> - Current field value
              </li>
              <li>
                <Text code>touched</Text> - Field has been focused and blurred
              </li>
              <li>
                <Text code>dirty</Text> - Value has been modified
              </li>
              <li>
                <Text code>pristine</Text> - Value has not been modified
              </li>
              <li>
                <Text code>valid</Text> - Field passes all validations
              </li>
              <li>
                <Text code>invalid</Text> - Field fails validation
              </li>
              <li>
                <Text code>error</Text> - Current error message
              </li>
              <li>
                <Text code>validating</Text> - Async validation in progress
              </li>
              <li>
                <Text code>visited</Text> - Field has been focused at least once
              </li>
              <li>
                <Text code>disabled</Text> - 🆕 Field is disabled
              </li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <Title level={5}>Actions:</Title>
            <ul>
              <li>
                <Text code>onChange</Text> - Handle value changes
              </li>
              <li>
                <Text code>onBlur</Text> - Handle blur events
              </li>
              <li>
                <Text code>onFocus</Text> - Handle focus events
              </li>
              <li>
                <Text code>setValue</Text> - Manually set value
              </li>
              <li>
                <Text code>reset</Text> - Reset to initial state
              </li>
              <li>
                <Text code>validate</Text> - Manually trigger validation
              </li>
              <li>
                <Text code>setError</Text> - Manually set error
              </li>
              <li>
                <Text code>setTouched</Text> - Manually set touched state
              </li>
              <li>
                <Text code>setDisabled</Text> - 🆕 Set disabled state
              </li>
              <li>
                <Text code>setInitialValue</Text> - 🆕 Update initial value
              </li>
            </ul>
            <Title level={5} style={{ marginTop: 8 }}>
              Helper Methods:
            </Title>
            <ul>
              <li>
                <Text code>getInputProps()</Text> - Basic input props
              </li>
              <li>
                <Text code>getHTMLInputProps()</Text> - HTML input props
              </li>
              <li>
                <Text code>getAntdInputProps()</Text> - Ant Design props
              </li>
              <li>
                <Text code>renderError()</Text> - Render error message
              </li>
            </ul>
          </Col>
          <Col xs={24} md={8}>
            <Title level={5}>Advanced Hooks:</Title>
            <ul>
              <li>
                <Text code>useFormFields</Text> - 🆕 Manage multiple fields
              </li>
            </ul>
            <Title level={5} style={{ marginTop: 8 }}>
              Form Actions (useFormFields):
            </Title>
            <ul>
              <li>
                <Text code>validateAll()</Text> - Validate all fields
              </li>
              <li>
                <Text code>resetAll()</Text> - Reset all fields
              </li>
              <li>
                <Text code>getValues()</Text> - Get all field values
              </li>
              <li>
                <Text code>setValues()</Text> - Set multiple values
              </li>
              <li>
                <Text code>setInitialValues()</Text> - Set initial values
              </li>
              <li>
                <Text code>isDirty()</Text> - Check if any field is dirty
              </li>
              <li>
                <Text code>isValid()</Text> - Check if all fields are valid
              </li>
              <li>
                <Text code>getErrors()</Text> - Get all errors
              </li>
            </ul>
            <Title level={5} style={{ marginTop: 16 }}>
              Built-in Validators:
            </Title>
            <ul style={{ fontSize: '12px' }}>
              <li>
                <Text code>required()</Text>
              </li>
              <li>
                <Text code>email()</Text>
              </li>
              <li>
                <Text code>minLength(n)</Text> / <Text code>maxLength(n)</Text>
              </li>
              <li>
                <Text code>pattern(regex, msg)</Text>
              </li>
              <li>
                <Text code>min(n)</Text> / <Text code>max(n)</Text>
              </li>
              <li>
                <Text code>url()</Text>
              </li>
              <li>
                <Text code>number()</Text> / <Text code>integer()</Text>
              </li>
              <li>
                <Text code>matches()</Text> - 🆕 Compare two fields
              </li>
              <li>
                <Text code>oneOf()</Text> - 🆕 Value in allowed list
              </li>
              <li>
                <Text code>validate()</Text> - 🆕 Custom validation
              </li>
              <li>
                <Text code>phone()</Text> - 🆕 Phone number
              </li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FormFieldHook;
