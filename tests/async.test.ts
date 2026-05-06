import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('async / customAsync', () => {
  it('customAsync passes when factory returns true', async () => {
    const schema = v.string().required().customAsync(async () => true)
    const r = await schema.validateAsync('hello')
    expect(r.success).toBe(true)
  })

  it('customAsync fails with returned message', async () => {
    const schema = v.string().required().customAsync(async () => '该用户名已被占用')
    const r = await schema.validateAsync('admin')
    expect(r.success).toBe(false)
    if (!r.success) expect(r.firstError.message).toBe('该用户名已被占用')
  })

  it('throws on sync validate when async rule present', () => {
    const schema = v.string().customAsync(async () => true)
    expect(() => schema.validate('x')).toThrow(/validateAsync/)
  })

  it('mixed sync+async runs in order', async () => {
    const schema = v
      .string()
      .required()
      .min(3)
      .customAsync(async (val) => (val === 'admin' ? '已存在' : true))

    // required failure aborts → no async call
    const r1 = await schema.validateAsync('')
    expect(r1.success).toBe(false)
    if (!r1.success) expect(r1.errors[0].code).toBe('required')

    // min failure does NOT abort (no abortOnFail), async still runs
    // Note: min < 3 doesn't abort, so async still runs against 'ad'
    const r2 = await schema.validateAsync('ad')
    expect(r2.success).toBe(false)

    // all pass
    const r3 = await schema.validateAsync('hello')
    expect(r3.success).toBe(true)
  })
})

describe('async / object level', () => {
  it('hasAsyncRule reflects nested', () => {
    const schema = v.object({
      mobile: v.string().required().customAsync(async () => true),
    })
    expect(schema.hasAsyncRule).toBe(true)
  })

  it('object validateAsync resolves all fields', async () => {
    const schema = v.object({
      mobile: v
        .string()
        .required()
        .mobile()
        .customAsync(async (val) => (val === '13900000000' ? '已被注册' : true)),
      pwd: v.string().required().min(6),
    })
    const r = await schema.validateAsync({
      mobile: '13900000000',
      pwd: '123456',
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.errorMap.mobile?.message).toBe('已被注册')
    }
  })
})
