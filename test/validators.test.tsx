/**
 * @file validators.test.tsx
 * @description Tests for built-in validators
 */

import { describe, it, expect } from 'vitest';
import { validators } from '../src/index';

describe('validators', () => {
  describe('required', () => {
    it('空值应该返回错误', () => {
      const validate = validators.required('必填');
      expect(validate('')).toBe('必填');
      expect(validate('   ')).toBe('必填');
    });

    it('有效值应该返回 null', () => {
      const validate = validators.required();
      expect(validate('value')).toBe(null);
    });
  });

  describe('email', () => {
    it('无效邮箱应该返回错误', () => {
      const validate = validators.email();
      expect(validate('invalid')).toBeTruthy();
      expect(validate('invalid@')).toBeTruthy();
    });

    it('有效邮箱应该返回 null', () => {
      const validate = validators.email();
      expect(validate('test@example.com')).toBe(null);
      expect(validate('user.name@domain.co.uk')).toBe(null);
    });
  });

  describe('minLength', () => {
    it('长度不足应该返回错误', () => {
      const validate = validators.minLength(5);
      expect(validate('abc')).toBeTruthy();
    });

    it('达到最小长度应该返回 null', () => {
      const validate = validators.minLength(5);
      expect(validate('abcde')).toBe(null);
      expect(validate('abcdef')).toBe(null);
    });
  });

  describe('maxLength', () => {
    it('超过最大长度应该返回错误', () => {
      const validate = validators.maxLength(5);
      expect(validate('abcdef')).toBeTruthy();
    });

    it('未超过最大长度应该返回 null', () => {
      const validate = validators.maxLength(5);
      expect(validate('abcde')).toBe(null);
    });
  });

  describe('pattern', () => {
    it('不匹配模式应该返回错误', () => {
      const validate = validators.pattern(/^\d+$/, '只能输入数字');
      expect(validate('abc')).toBe('只能输入数字');
    });

    it('匹配模式应该返回 null', () => {
      const validate = validators.pattern(/^\d+$/, '只能输入数字');
      expect(validate('123')).toBe(null);
    });
  });

  describe('min/max', () => {
    it('min 应该验证最小值', () => {
      const validate = validators.min(10);
      expect(validate(5)).toBeTruthy();
      expect(validate(10)).toBe(null);
      expect(validate(15)).toBe(null);
    });

    it('max 应该验证最大值', () => {
      const validate = validators.max(100);
      expect(validate(150)).toBeTruthy();
      expect(validate(100)).toBe(null);
    });
  });

  describe('url', () => {
    it('无效 URL 应该返回错误', () => {
      const validate = validators.url();
      expect(validate('not a url')).toBeTruthy();
    });

    it('有效 URL 应该返回 null', () => {
      const validate = validators.url();
      expect(validate('https://example.com')).toBe(null);
    });
  });

  describe('number', () => {
    it('非数字应该返回错误', () => {
      const validate = validators.number();
      expect(validate('abc')).toBeTruthy();
    });

    it('有效数字应该返回 null', () => {
      const validate = validators.number();
      expect(validate('123')).toBe(null);
      expect(validate('123.45')).toBe(null);
    });
  });

  describe('integer', () => {
    it('小数应该返回错误', () => {
      const validate = validators.integer();
      expect(validate('123.45')).toBeTruthy();
    });

    it('整数应该返回 null', () => {
      const validate = validators.integer();
      expect(validate('123')).toBe(null);
    });
  });

  describe('matches', () => {
    it('应该比较两个值', () => {
      const password = { value: 'password123' };
      const validate = validators.matches(() => password.value);

      expect(validate('wrong')).toBeTruthy();
      expect(validate('password123')).toBe(null);
    });
  });

  describe('oneOf', () => {
    it('不在列表中应该返回错误', () => {
      const validate = validators.oneOf(['A', 'B', 'C']);
      expect(validate('D')).toBeTruthy();
    });

    it('在列表中应该返回 null', () => {
      const validate = validators.oneOf(['A', 'B', 'C']);
      expect(validate('A')).toBe(null);
      expect(validate('B')).toBe(null);
    });
  });

  describe('validate', () => {
    it('应该支持自定义验证', async () => {
      const validator = (value: string) => value.length > 3;
      const validate = validators.validate(validator, '长度必须大于3');

      const result1 = await validate('ab');
      expect(result1).toBe('长度必须大于3');

      const result2 = await validate('abcd');
      expect(result2).toBe(null);
    });
  });

  describe('phone', () => {
    it('无效电话号码应该返回错误', () => {
      const validate = validators.phone();
      expect(validate('abc')).toBeTruthy();
      expect(validate('123')).toBeTruthy();
    });

    it('有效电话号码应该返回 null', () => {
      const validate = validators.phone();
      expect(validate('1234567')).toBe(null);
      expect(validate('123-456-7890')).toBe(null);
    });
  });
});
