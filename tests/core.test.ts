import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('core / required & optional', () => {
  it('required fails on empty value', () => {
    const r = v.string().required().validate('')
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.firstError.code).toBe('required')
    }
  })

  it('required fails on null', () => {
    const r = v.string().required().validate(null as any)
    expect(r.success).toBe(false)
  })

  it('required fails on undefined', () => {
    const r = v.string().required().validate(undefined as any)
    expect(r.success).toBe(false)
  })

  it('required passes with non-empty string', () => {
    const r = v.string().required().validate('hello')
    expect(r.success).toBe(true)
  })

  it('optional skips all rules on empty', () => {
    const r = v.string().min(6).optional().validate('')
    expect(r.success).toBe(true)
  })

  it('optional still validates non-empty', () => {
    const r = v.string().min(6).optional().validate('abc')
    expect(r.success).toBe(false)
  })

  it('nullable allows null', () => {
    const r = v.string().nullable().validate(null as any)
    expect(r.success).toBe(true)
  })

  it('custom required message', () => {
    const r = v.string().required('请输入').validate('')
    expect(r.success).toBe(false)
    if (!r.success) expect(r.firstError.message).toBe('请输入')
  })
})

describe('core / abortOnFail behavior', () => {
  it('required failure aborts subsequent rules', () => {
    const r = v.string().required().min(6).email().validate('')
    expect(r.success).toBe(false)
    if (!r.success) {
      // only required fired; min/email skipped
      expect(r.errors).toHaveLength(1)
      expect(r.errors[0].code).toBe('required')
    }
  })

  it('non-abort rules accumulate errors', () => {
    const r = v.string().min(10).email().validate('foo')
    expect(r.success).toBe(false)
    if (!r.success) {
      // both min and email failed
      expect(r.errors.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('type mismatch aborts subsequent rules', () => {
    const r = v.string().min(6).validate(123 as any)
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.errors[0].code).toBe('type_string')
    }
  })
})

describe('core / result structure', () => {
  it('success result has empty errors', () => {
    const r = v.string().required().validate('hi')
    expect(r.success).toBe(true)
    expect(r.errors).toEqual([])
  })

  it('failure result has firstError + errorMap', () => {
    const r = v
      .object({
        name: v.string().required(),
        age: v.number().required(),
      })
      .validate({ name: '', age: undefined } as any)

    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.firstError).toBeDefined()
      expect(r.errorMap.name).toBeDefined()
      expect(r.errorMap.age).toBeDefined()
      expect(r.errors.length).toBe(2)
    }
  })

  it('label is reflected in error message', () => {
    const r = v.string().required().label('手机号').validate('')
    expect(r.success).toBe(false)
    if (!r.success) expect(r.firstError.message).toContain('手机号')
  })
})

describe('core / custom rule', () => {
  it('custom returning string is treated as failure', () => {
    const r = v
      .string()
      .custom((value) => (value === 'admin' ? '不能用 admin' : true))
      .validate('admin')
    expect(r.success).toBe(false)
    if (!r.success) expect(r.firstError.message).toBe('不能用 admin')
  })

  it('custom returning true is treated as pass', () => {
    const r = v
      .string()
      .custom(() => true)
      .validate('any')
    expect(r.success).toBe(true)
  })
})
