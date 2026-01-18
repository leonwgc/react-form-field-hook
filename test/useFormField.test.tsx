/**
 * @file useFormField.test.tsx
 * @description Tests for useFormField hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormField, validators } from '../src/index';

describe('useFormField', () => {
  describe('初始化', () => {
    it('应该使用默认值初始化', () => {
      const { result } = renderHook(() => useFormField());

      expect(result.current.value).toBe('');
      expect(result.current.touched).toBe(false);
      expect(result.current.dirty).toBe(false);
      expect(result.current.pristine).toBe(true);
      expect(result.current.valid).toBe(true);
      expect(result.current.invalid).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('应该使用提供的初始值', () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'test' }));

      expect(result.current.value).toBe('test');
    });
  });

  describe('值变化', () => {
    it('应该更新值', async () => {
      const { result } = renderHook(() => useFormField());

      await act(async () => {
        result.current.onChange('new value');
      });

      expect(result.current.value).toBe('new value');
      expect(result.current.dirty).toBe(true);
    });

    it('应该调用 onValueChange 回调', async () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() => useFormField({ onValueChange }));

      await act(async () => {
        result.current.onChange('test');
      });

      expect(onValueChange).toHaveBeenCalledWith('test');
    });
  });

  describe('验证', () => {
    it('应该验证必填字段', async () => {
      const { result } = renderHook(() =>
        useFormField({
          initialValue: '',
          rules: [validators.required('必填')],
        }),
      );

      await act(async () => {
        await result.current.validate();
      });

      expect(result.current.error).toBe('必填');
      expect(result.current.invalid).toBe(true);
    });

    it('应该验证邮箱格式', async () => {
      const { result } = renderHook(() =>
        useFormField({
          initialValue: 'invalid',
          rules: [validators.email()],
        }),
      );

      await act(async () => {
        await result.current.validate();
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.onChange('test@example.com');
      });

      await act(async () => {
        await result.current.validate();
      });

      expect(result.current.error).toBe(null);
    });

    it('应该处理异步验证', async () => {
      const asyncValidator = async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return value === 'taken' ? '已被占用' : null;
      };

      const { result } = renderHook(() =>
        useFormField({
          initialValue: 'taken',
          rules: [asyncValidator],
        }),
      );

      await act(async () => {
        await result.current.validate();
      });

      expect(result.current.error).toBe('已被占用');
    });
  });

  describe('重置', () => {
    it('应该重置到初始状态', async () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'initial' }));

      await act(async () => {
        result.current.onChange('changed');
        result.current.setError('error');
      });

      await act(async () => {
        result.current.reset();
      });

      expect(result.current.value).toBe('initial');
      expect(result.current.error).toBe(null);
      expect(result.current.dirty).toBe(false);
    });
  });

  describe('Props Getters', () => {
    it('getInputProps 应该返回正确的 props', () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'test' }));

      const props = result.current.getInputProps();

      expect(props.value).toBe('test');
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onBlur).toBe('function');
      expect(typeof props.onFocus).toBe('function');
    });
  });
});
