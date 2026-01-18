/**
 * @file useFormFields.test.tsx
 * @description Tests for useFormFields hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormFields, validators } from '../src/index';

describe('useFormFields', () => {
  describe('初始化', () => {
    it('应该初始化多个字段', () => {
      const { result } = renderHook(() =>
        useFormFields({
          username: { initialValue: 'john' },
          email: { initialValue: 'john@example.com' },
        }),
      );

      expect(result.current.fields.username.value).toBe('john');
      expect(result.current.fields.email.value).toBe('john@example.com');
    });
  });

  describe('表单方法', () => {
    it('validateAll 应该验证所有字段', async () => {
      const { result } = renderHook(() =>
        useFormFields({
          username: {
            initialValue: '',
            rules: [validators.required()],
          },
          email: {
            initialValue: '',
            rules: [validators.required(), validators.email()],
          },
        }),
      );

      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.form.validateAll();
      });

      expect(isValid).toBe(false);
    });

    it('resetAll 应该重置所有字段', async () => {
      const { result } = renderHook(() =>
        useFormFields({
          username: { initialValue: 'initial' },
          email: { initialValue: 'test@example.com' },
        }),
      );

      await act(async () => {
        result.current.fields.username.onChange('changed');
        result.current.fields.email.onChange('new@example.com');
      });

      await act(async () => {
        result.current.form.resetAll();
      });

      expect(result.current.fields.username.value).toBe('initial');
      expect(result.current.fields.email.value).toBe('test@example.com');
    });

    it('getValues 应该返回所有字段的值', () => {
      const { result } = renderHook(() =>
        useFormFields({
          username: { initialValue: 'john' },
          email: { initialValue: 'john@example.com' },
        }),
      );

      const values = result.current.form.getValues();

      expect(values).toEqual({
        username: 'john',
        email: 'john@example.com',
      });
    });

    it('setValues 应该批量设置值', () => {
      const { result } = renderHook(() =>
        useFormFields({
          username: { initialValue: '' },
          email: { initialValue: '' },
        }),
      );

      act(() => {
        result.current.form.setValues({
          username: 'john',
          email: 'john@example.com',
        });
      });

      expect(result.current.fields.username.value).toBe('john');
      expect(result.current.fields.email.value).toBe('john@example.com');
    });

    it('isDirty 应该检测字段是否被修改', async () => {
      const { result } = renderHook(() =>
        useFormFields({
          username: { initialValue: 'john' },
        }),
      );

      expect(result.current.form.isDirty()).toBe(false);

      await act(async () => {
        result.current.fields.username.onChange('jane');
      });

      expect(result.current.form.isDirty()).toBe(true);
    });

    it('isValid 应该检查所有字段的有效性', async () => {
      const { result } = renderHook(() =>
        useFormFields({
          username: {
            initialValue: 'john',
            rules: [validators.required()],
          },
        }),
      );

      expect(result.current.form.isValid()).toBe(true);
    });
  });
});
