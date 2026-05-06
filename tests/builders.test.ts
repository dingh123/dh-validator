import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('builders / object', () => {
  it('validates each field', () => {
    const schema = v.object({
      name: v.string().required(),
      age: v.number().integer().between(0, 120),
    })
    const r = schema.validate({ name: '', age: 200 })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.errorMap.name).toBeDefined()
      expect(r.errorMap.age).toBeDefined()
    }
  })

  it('validateField does single-field check', () => {
    const schema = v.object({
      name: v.string().required(),
      age: v.number().required(),
    })
    const r = schema.validateField('age', { name: 'Alice', age: undefined })
    expect(r.success).toBe(false)
  })

  it('skips fields not in shape', () => {
    const schema = v.object({ name: v.string().required() })
    const r = schema.validate({ name: 'Alice', extra: 'ignored' } as any)
    expect(r.success).toBe(true)
  })
})

describe('builders / nested object', () => {
  it('reports nested path correctly', () => {
    const schema = v.object({
      user: v.object({
        address: v.object({
          city: v.string().required(),
        }),
      }),
    })
    const r = schema.validate({ user: { address: { city: '' } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.firstError.field).toBe('user.address.city')
    }
  })
})

describe('builders / array each', () => {
  it('runs sub-schema for each item', () => {
    const schema = v.array<string>().each(v.string().email())
    const r = schema.validate(['a@b.com', 'not-email', 'c@d.com'])
    expect(r.success).toBe(false)
    if (!r.success) {
      // index 1 should fail
      expect(r.errors.some((e) => e.field.includes('[1]'))).toBe(true)
    }
  })

  it('array of objects with shape', () => {
    const schema = v.array().each(
      v.object({
        sku: v.string().required(),
        qty: v.number().integer().gte(1),
      }),
    )
    const r = schema.validate([
      { sku: 'A', qty: 1 },
      { sku: '', qty: 0 },
    ])
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.errors.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('builders / cross-field (sameAs / differentFrom)', () => {
  it('sameAs detects matching/mismatching fields', () => {
    const schema = v.object({
      pwd: v.string().required(),
      pwd2: v.string().required().sameAs('pwd', '两次密码不一致'),
    })
    expect(schema.validate({ pwd: 'abc', pwd2: 'abc' }).success).toBe(true)
    const r = schema.validate({ pwd: 'abc', pwd2: 'xyz' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.firstError.message).toBe('两次密码不一致')
  })

  it('differentFrom prevents reusing the same value', () => {
    const schema = v.object({
      oldPwd: v.string().required(),
      newPwd: v.string().required().differentFrom('oldPwd', '新密码不能与旧密码相同'),
    })
    const r = schema.validate({ oldPwd: 'abc', newPwd: 'abc' })
    expect(r.success).toBe(false)
  })
})
