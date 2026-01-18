/**
 * @file src/index.tsx
 * @author leon.wang
 */
import React from 'react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * Validation rule type - can be synchronous or asynchronous
 */
export type ValidationRule<T = string> = (
  value: T,
  fieldName?: string,
) => string | null | undefined | Promise<string | null | undefined>;

/**
 * Common validation rules
 */
export const validators = {
  required:
    (message = 'This field is required') =>
    (value: string) =>
      !value || !value.trim() ? message : null,

  email:
    (message = 'Invalid email format') =>
    (value: string) =>
      value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : null,

  minLength: (min: number, message?: string) => (value: string) =>
    value && value.length < min ? message || `Minimum ${min} characters` : null,

  maxLength: (max: number, message?: string) => (value: string) =>
    value && value.length > max ? message || `Maximum ${max} characters` : null,

  pattern: (regex: RegExp, message: string) => (value: string) =>
    value && !regex.test(value) ? message : null,

  min: (min: number, message?: string) => (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num < min
      ? message || `Minimum value is ${min}`
      : null;
  },

  max: (max: number, message?: string) => (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > max
      ? message || `Maximum value is ${max}`
      : null;
  },

  url:
    (message = 'Invalid URL format') =>
    (value: string) => {
      try {
        if (value) new URL(value);
        return null;
      } catch {
        return message;
      }
    },

  number:
    (message = 'Must be a number') =>
    (value: string) =>
      value && isNaN(Number(value)) ? message : null,

  integer:
    (message = 'Must be an integer') =>
    (value: string) =>
      value && !Number.isInteger(Number(value)) ? message : null,

  /**
   * Validate that two fields match (e.g., password confirmation)
   * @example validators.matches(() => passwordField.value, 'Passwords must match')
   */
  matches:
    <T,>(getOtherValue: () => T, message = 'Values do not match') =>
    (value: T) =>
      value !== getOtherValue() ? message : null,

  /**
   * Validate value is one of the allowed values
   */
  oneOf:
    <T,>(allowedValues: T[], message?: string) =>
    (value: T) =>
      !allowedValues.includes(value)
        ? message || `Must be one of: ${allowedValues.join(', ')}`
        : null,

  /**
   * Custom validation with async support
   */
  validate:
    <T,>(
      validator: (value: T) => boolean | Promise<boolean>,
      message: string,
    ): ValidationRule<T> =>
    async (value: T) => {
      const isValid = await Promise.resolve(validator(value));
      return isValid ? null : message;
    },

  /**
   * Validate phone number format
   */
  phone:
    (message = 'Invalid phone number') =>
    (value: string) =>
      value && !/^[\d\s\-+()]{7,}$/.test(value) ? message : null,
};

/**
 * Field state interface
 */
export interface FieldState<T = string> {
  /** Current value of the field */
  value: T;
  /** Whether the field has been touched (focused and blurred) */
  touched: boolean;
  /** Whether the field value has been modified from its initial value */
  dirty: boolean;
  /** Whether the field value has not been modified from its initial value */
  pristine: boolean;
  /** Whether the field is currently valid */
  valid: boolean;
  /** Whether the field is currently invalid */
  invalid: boolean;
  /** Current validation error message, if any */
  error: string | null;
  /** Whether the field is currently being validated (for async validation) */
  validating: boolean;
  /** Whether the field has been visited (focused at least once) */
  visited: boolean;
  /** Whether the field is currently focused */
  focused: boolean;
  /** Whether the field is disabled */
  disabled: boolean;
}

/**
 * Field actions interface
 */
export interface FieldActions<T = string> {
  /** Handler for value change events */
  onChange: (value: T) => void;
  /** Handler for blur events */
  onBlur: () => void;
  /** Handler for focus events */
  onFocus: () => void;
  /** Manually set the field value */
  setValue: (value: T) => void;
  /** Reset the field to its initial state */
  reset: () => void;
  /** Manually trigger validation */
  validate: () => Promise<boolean>;
  /** Set error message manually */
  setError: (error: string | null) => void;
  /** Mark field as touched */
  setTouched: (touched: boolean) => void;
  /** Set disabled state */
  setDisabled: (disabled: boolean) => void;
  /** Update the initial value (useful for edit forms after fetching data) */
  setInitialValue: (value: T) => void;
  /** Get props for input component (simplified usage) */
  getInputProps: () => {
    value: T;
    onChange: (value: T) => void;
    onBlur: () => void;
    onFocus: () => void;
    disabled: boolean;
  };
  /** Get props for HTML input element (auto-extracts event.target.value) */
  getHTMLInputProps: () => {
    value: T;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    onBlur: () => void;
    onFocus: () => void;
    disabled: boolean;
  };
  /** Get props for Ant Design / Neat Design Input component (includes status) */
  getAntdInputProps: () => {
    value: T;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    onBlur: () => void;
    onFocus: () => void;
    status?: 'error' | 'warning';
    disabled: boolean;
  };
  /** Render error message (returns JSX or null) */
  renderError: (className?: string) => React.ReactNode;
}

/**
 * Options for useFormField hook
 */
export interface UseFormFieldOptions<T = string> {
  /** Initial value of the field */
  initialValue?: T;
  /** Array of validation rules to apply */
  rules?: ValidationRule<T>[];
  /** Whether to validate on change (default: true) */
  validateOnChange?: boolean;
  /** Whether to validate on blur (default: true) */
  validateOnBlur?: boolean;
  /** Debounce delay for validation in milliseconds (default: 0) */
  validateDebounce?: number;
  /** Transform value before setting (e.g., trim, lowercase) */
  transform?: (value: T) => T;
  /** Custom comparison function for dirty state (default: strict equality) */
  compareWith?: (a: T, b: T) => boolean;
  /** Callback fired when value changes */
  onValueChange?: (value: T) => void;
  /** Callback fired when validation status changes */
  onValidationChange?: (valid: boolean, error: string | null) => void;
  /** Whether the field is initially disabled */
  disabled?: boolean;
}

/**
 * Field configuration for useFormFields hook
 */
export interface FieldConfig<T = string> extends UseFormFieldOptions<T> {
  /** Field name/key */
  name: string;
}

/**
 * A comprehensive form field validation hook that manages field state and validation
 *
 * Features:
 * - Tracks multiple field states: touched, dirty, pristine, valid, invalid, visited, disabled
 * - Supports both synchronous and asynchronous validation rules
 * - Configurable validation timing (onChange, onBlur)
 * - Debounced validation support
 * - Manual validation trigger
 * - Field reset and initial value update
 * - Error message management
 * - Multiple prop getters for different component types
 *
 * @example
 * // Basic usage with validators
 * const emailField = useFormField({
 *   initialValue: '',
 *   rules: [validators.required('Email is required'), validators.email()],
 * });
 *
 * // Method 1: Using getAntdInputProps (recommended for Input components)
 * <Input {...emailField.getAntdInputProps()} />
 * {emailField.renderError()}
 *
 * // Method 2: Using getInputProps (for Select, DatePicker, etc.)
 * <Select {...emailField.getInputProps()} options={options} />
 * {emailField.renderError()}
 *
 * // Method 3: Manual control
 * <Input
 *   value={emailField.value}
 *   onChange={(e) => emailField.onChange(e.target.value)}
 *   onBlur={emailField.onBlur}
 *   status={emailField.touched && emailField.invalid ? 'error' : undefined}
 *   disabled={emailField.disabled}
 * />
 *
 * // Advanced: Custom validation with async
 * const usernameField = useFormField({
 *   initialValue: '',
 *   rules: [
 *     validators.required(),
 *     validators.minLength(3),
 *     validators.custom(
 *       async (value) => {
 *         const exists = await checkUsernameExists(value);
 *         return !exists;
 *       },
 *       'Username already taken'
 *     ),
 *   ],
 *   validateDebounce: 500,
 * });
 *
 * // Edit form: Set initial value from API
 * useEffect(() => {
 *   fetchUserData().then(data => {
 *     emailField.setInitialValue(data.email);
 *   });
 * }, []);
 *
 * // Manual validation and submission
 * const handleSubmit = async () => {
 *   if (await emailField.validate()) {
 *     console.log('Valid:', emailField.value);
 *   }
 * };
 */
export function useFormField<T = string>(
  options: UseFormFieldOptions<T> = {},
): FieldState<T> & FieldActions<T> {
  const {
    initialValue = '' as T,
    rules = [],
    validateOnChange = true,
    validateOnBlur = true,
    validateDebounce = 0,
    transform,
    compareWith,
    onValueChange,
    onValidationChange,
    disabled: initialDisabled = false,
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [touched, setTouched] = useState(false);
  const [visited, setVisited] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [disabled, setDisabled] = useState(initialDisabled);

  const initialValueRef = useRef(initialValue);
  const validateTimeoutRef = useRef<NodeJS.Timeout>();
  const validationCounterRef = useRef(0);

  // Calculate derived states with memoization
  const dirty = useMemo(() => {
    if (compareWith) {
      return !compareWith(value, initialValueRef.current);
    }
    return value !== initialValueRef.current;
  }, [value, compareWith]);

  const pristine = !dirty;
  const invalid = error !== null;
  const valid = !invalid && !validating;

  /**
   * Run validation rules against the current value
   */
  const runValidation = useCallback(
    async (valueToValidate: T): Promise<string | null> => {
      if (rules.length === 0) {
        return null;
      }

      const currentValidation = ++validationCounterRef.current;
      setValidating(true);

      try {
        for (const rule of rules) {
          const result = await Promise.resolve(rule(valueToValidate));

          // Check if this is still the latest validation
          if (currentValidation !== validationCounterRef.current) {
            return null; // Discard outdated validation
          }

          if (result) {
            setValidating(false);
            return result;
          }
        }
        setValidating(false);
        return null;
      } catch {
        setValidating(false);
        return 'Validation error occurred';
      }
    },
    [rules],
  );

  /**
   * Trigger validation with optional debounce
   */
  const triggerValidation = useCallback(
    async (valueToValidate: T, immediate = false) => {
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current);
      }

      const validate = async () => {
        const validationError = await runValidation(valueToValidate);
        setError(validationError);

        if (onValidationChange) {
          onValidationChange(validationError === null, validationError);
        }
      };

      if (immediate || validateDebounce === 0) {
        await validate();
      } else {
        validateTimeoutRef.current = setTimeout(validate, validateDebounce);
      }
    },
    [runValidation, validateDebounce, onValidationChange],
  );

  /**
   * Handle value change
   */
  const handleChange = useCallback(
    (newValue: T) => {
      if (disabled) return;
      const transformedValue = transform ? transform(newValue) : newValue;
      setValue(transformedValue);

      if (onValueChange) {
        onValueChange(transformedValue);
      }

      if (validateOnChange) {
        triggerValidation(transformedValue);
      }
    },
    [disabled, validateOnChange, triggerValidation, onValueChange, transform],
  );

  /**
   * Handle blur event
   */
  const handleBlur = useCallback(() => {
    setTouched(true);
    setFocused(false);

    if (validateOnBlur) {
      triggerValidation(value, true); // Immediate validation on blur
    }
  }, [value, validateOnBlur, triggerValidation]);

  /**
   * Handle focus event
   */
  const handleFocus = useCallback(() => {
    setVisited(true);
    setFocused(true);
  }, []);

  /**
   * Manually trigger validation
   */
  const validate = useCallback(async (): Promise<boolean> => {
    const validationError = await runValidation(value);
    setError(validationError);
    setTouched(true);

    if (onValidationChange) {
      onValidationChange(validationError === null, validationError);
    }

    return validationError === null;
  }, [value, runValidation, onValidationChange]);

  /**
   * Reset field to initial state
   */
  const reset = useCallback(() => {
    setValue(initialValueRef.current);
    setTouched(false);
    setVisited(false);
    setFocused(false);
    setError(null);
    setValidating(false);

    if (validateTimeoutRef.current) {
      clearTimeout(validateTimeoutRef.current);
    }
  }, []);

  /**
   * Update initial value (useful for edit forms after fetching data)
   */
  const setInitialValue = useCallback((newInitialValue: T) => {
    initialValueRef.current = newInitialValue;
    setValue(newInitialValue);
    setTouched(false);
    setError(null);
  }, []);

  /**
   * Manually set value
   */
  const handleSetValue = useCallback(
    (newValue: T) => {
      const transformedValue = transform ? transform(newValue) : newValue;
      setValue(transformedValue);

      if (onValueChange) {
        onValueChange(transformedValue);
      }
    },
    [onValueChange, transform],
  );

  /**
   * Get props for input component (simplified usage)
   */
  const getInputProps = useCallback(
    () => ({
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      disabled,
    }),
    [value, handleChange, handleBlur, handleFocus, disabled],
  );

  /**
   * Get props for HTML input element (auto-extracts event.target.value)
   */
  const getHTMLInputProps = useCallback(
    () => ({
      value,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => handleChange(e.target.value as T),
      onBlur: handleBlur,
      onFocus: handleFocus,
      disabled,
    }),
    [value, handleChange, handleBlur, handleFocus, disabled],
  );

  /**
   * Get props for Ant Design / Neat Design Input component (includes status)
   */
  const getAntdInputProps = useCallback(
    () => ({
      value,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => handleChange(e.target.value as T),
      onBlur: handleBlur,
      onFocus: handleFocus,
      status: (touched && invalid ? 'error' : undefined) as
        | 'error'
        | 'warning'
        | undefined,
      disabled,
    }),
    [value, handleChange, handleBlur, handleFocus, touched, invalid, disabled],
  );

  /**
   * Render error message (returns JSX or null)
   */
  const renderError = useCallback(
    (className = 'form-field-error') => {
      if (!touched || !invalid || !error || focused) return null;
      return <div className={className}>{error}</div>;
    },
    [touched, invalid, error, focused],
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    value,
    touched,
    dirty,
    pristine,
    valid,
    invalid,
    error,
    validating,
    visited,
    focused,
    disabled,
    // Actions
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    setValue: handleSetValue,
    reset,
    validate,
    setError,
    setTouched,
    setDisabled,
    setInitialValue,
    getInputProps,
    getHTMLInputProps,
    getAntdInputProps,
    renderError,
  };
}

/**
 * Type for field collection returned by useFormFields
 */
export type FieldCollection<T extends Record<string, unknown>> = {
  [K in keyof T]: FieldState<T[K]> & FieldActions<T[K]>;
};

/**
 * Form actions for managing multiple fields
 */
export interface FormActions<T extends Record<string, unknown>> {
  /** Validate all fields and return whether form is valid */
  validateAll: () => Promise<boolean>;
  /** Reset all fields to their initial values */
  resetAll: () => void;
  /** Get all field values as an object */
  getValues: () => T;
  /** Set multiple field values at once */
  setValues: (values: Partial<T>) => void;
  /** Check if any field is dirty */
  isDirty: boolean;
  /** Check if all fields are valid */
  isValid: boolean;
  /** Get all errors as an object */
  getErrors: () => Partial<Record<keyof T, string | null>>;
  /** Set initial values (useful for edit forms) */
  setInitialValues: (values: Partial<T>) => void;
  /** Set disabled state for all fields */
  setDisabled: (disabled: boolean) => void;
  /** Check if all fields are disabled */
  isDisabled: boolean;
}

/**
 * Hook for managing multiple form fields at once
 *
 * @example
 * ```tsx
 * const { fields, form } = useFormFields({
 *   username: {
 *     initialValue: '',
 *     rules: [validators.required()],
 *   },
 *   email: {
 *     initialValue: '',
 *     rules: [validators.required(), validators.email()],
 *   },
 * });
 *
 * // Usage
 * <Input {...fields.username.getAntdInputProps()} />
 * {fields.username.renderError()}
 *
 * <Input {...fields.email.getAntdInputProps()} />
 * {fields.email.renderError()}
 *
 * <Button onClick={async () => {
 *   if (await form.validateAll()) {
 *     console.log(form.getValues());
 *   }
 * }}>Submit</Button>
 * ```
 */
export function useFormFields<T extends Record<string, unknown>>(config: {
  [K in keyof T]: UseFormFieldOptions<T[K]>;
}): {
  fields: FieldCollection<T>;
  form: FormActions<T>;
} {
  const fieldNames = Object.keys(config) as (keyof T)[];

  // Create individual field hooks
  const fieldEntries = fieldNames.map((name) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const field = useFormField<T[typeof name]>(config[name]);
    return [name, field] as const;
  });

  const fields = Object.fromEntries(fieldEntries) as FieldCollection<T>;

  const validateAll = useCallback(async (): Promise<boolean> => {
    const results = await Promise.all(
      fieldNames.map((name) => fields[name].validate()),
    );
    return results.every((valid) => valid);
  }, [fields, fieldNames]);

  const resetAll = useCallback(() => {
    fieldNames.forEach((name) => fields[name].reset());
  }, [fields, fieldNames]);

  const getValues = useCallback((): T => {
    return Object.fromEntries(
      fieldNames.map((name) => [name, fields[name].value]),
    ) as T;
  }, [fields, fieldNames]);

  const setValues = useCallback(
    (values: Partial<T>) => {
      Object.entries(values).forEach(([name, value]) => {
        if (name in fields) {
          fields[name as keyof T].setValue(value as T[keyof T]);
        }
      });
    },
    [fields],
  );

  const setInitialValues = useCallback(
    (values: Partial<T>) => {
      Object.entries(values).forEach(([name, value]) => {
        if (name in fields) {
          fields[name as keyof T].setInitialValue(value as T[keyof T]);
        }
      });
    },
    [fields],
  );

  const isDirty = useMemo((): boolean => {
    return fieldNames.some((name) => fields[name].dirty);
  }, [fields, fieldNames]);

  const isValid = useMemo((): boolean => {
    return fieldNames.every((name) => fields[name].valid);
  }, [fields, fieldNames]);

  const getErrors = useCallback((): Partial<Record<keyof T, string | null>> => {
    return Object.fromEntries(
      fieldNames.map((name) => [name, fields[name].error]),
    ) as Partial<Record<keyof T, string | null>>;
  }, [fields, fieldNames]);

  const setDisabled = useCallback(
    (disabled: boolean) => {
      fieldNames.forEach((name) => fields[name].setDisabled(disabled));
    },
    [fields, fieldNames],
  );

  const isDisabled = useMemo((): boolean => {
    return fieldNames.every((name) => fields[name].disabled);
  }, [fields, fieldNames]);

  const form: FormActions<T> = useMemo(
    () => ({
      validateAll,
      resetAll,
      getValues,
      setValues,
      setInitialValues,
      isDirty,
      isValid,
      getErrors,
      setDisabled,
      isDisabled,
    }),
    [
      validateAll,
      resetAll,
      getValues,
      setValues,
      setInitialValues,
      isDirty,
      isValid,
      getErrors,
      setDisabled,
      isDisabled,
    ],
  );

  return { fields, form };
}
