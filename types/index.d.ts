/**
 * @file src/index.tsx
 * @author leon.wang
 */
import React from 'react';
/**
 * Validation rule type - can be synchronous or asynchronous
 */
export type ValidationRule<T = string> = (value: T, fieldName?: string) => string | null | undefined | Promise<string | null | undefined>;
/**
 * Common validation rules
 */
export declare const validators: {
    required: (message?: string) => (value: string) => string;
    email: (message?: string) => (value: string) => string;
    minLength: (min: number, message?: string) => (value: string) => string;
    maxLength: (max: number, message?: string) => (value: string) => string;
    pattern: (regex: RegExp, message: string) => (value: string) => string;
    min: (min: number, message?: string) => (value: string | number) => string;
    max: (max: number, message?: string) => (value: string | number) => string;
    url: (message?: string) => (value: string) => string;
    number: (message?: string) => (value: string) => string;
    integer: (message?: string) => (value: string) => string;
    /**
     * Validate that two fields match (e.g., password confirmation)
     * @example validators.matches(() => passwordField.value, 'Passwords must match')
     */
    matches: <T>(getOtherValue: () => T, message?: string) => (value: T) => string;
    /**
     * Validate value is one of the allowed values
     */
    oneOf: <T>(allowedValues: T[], message?: string) => (value: T) => string;
    /**
     * Custom validation with async support
     */
    validate: <T>(validator: (value: T) => boolean | Promise<boolean>, message: string) => ValidationRule<T>;
    /**
     * Validate phone number format
     */
    phone: (message?: string) => (value: string) => string;
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
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
        onBlur: () => void;
        onFocus: () => void;
        disabled: boolean;
    };
    /** Get props for Ant Design / Neat Design Input component (includes status) */
    getAntdInputProps: () => {
        value: T;
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
export declare function useFormField<T = string>(options?: UseFormFieldOptions<T>): FieldState<T> & FieldActions<T>;
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
    isDirty: () => boolean;
    /** Check if all fields are valid */
    isValid: () => boolean;
    /** Get all errors as an object */
    getErrors: () => Partial<Record<keyof T, string | null>>;
    /** Set initial values (useful for edit forms) */
    setInitialValues: (values: Partial<T>) => void;
    /** Set disabled state for all fields */
    setDisabled: (disabled: boolean) => void;
    /** Check if all fields are disabled */
    isDisabled: () => boolean;
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
export declare function useFormFields<T extends Record<string, unknown>>(config: {
    [K in keyof T]: UseFormFieldOptions<T[K]>;
}): {
    fields: FieldCollection<T>;
    form: FormActions<T>;
};
