import { afterEach, describe, expect, it } from 'vitest'
import { extend, listExtensions, unextend, v } from '../src'

afterEach(() => {
  unextend('employeeId')
  unextend('contractNo')
  unextend('myAsync')
})

describe('extend / register and use', () => {
  it('registers a custom rule and uses it via .use()', () => {
    extend('employeeId', () => (value) => /^E\d{6}$/.test(String(value)) || '工号格式错误')

    const r1 = v.string().use('employeeId').validate('E000123')
    expect(r1.success).toBe(true)

    const r2 = v.string().use('employeeId').validate('not-id')
    expect(r2.success).toBe(false)
    if (!r2.success) expect(r2.firstError.message).toBe('工号格式错误')
  })

  it('passes args from .use(name, ...args) to factory', () => {
    extend('contractNo', (msg?: string) => (value) => {
      return /^CN\d{10}$/.test(String(value)) || (msg ?? '默认错误')
    })

    const r1 = v.string().use('contractNo', '请输入合同号').validate('bad')
    expect(r1.success).toBe(false)
    if (!r1.success) expect(r1.firstError.message).toBe('请输入合同号')

    const r2 = v.string().use('contractNo').validate('bad')
    expect(r2.success).toBe(false)
    if (!r2.success) expect(r2.firstError.message).toBe('默认错误')
  })

  it('throws if rule not registered', () => {
    expect(() => v.string().use('notRegistered')).toThrow(/未注册的规则/)
  })

  it('listExtensions returns registered names', () => {
    extend('employeeId', () => () => true)
    extend('contractNo', () => () => true)
    expect(listExtensions()).toContain('employeeId')
    expect(listExtensions()).toContain('contractNo')
  })

  it('unextend removes a rule', () => {
    extend('employeeId', () => () => true)
    unextend('employeeId')
    expect(() => v.string().use('employeeId')).toThrow()
  })
})

describe('extend / async rule via useAsync', () => {
  it('useAsync rule is recognized and runs via validateAsync', async () => {
    extend(
      'myAsync',
      () => async (value) =>
        new Promise<true | string>((resolve) => {
          setTimeout(() => resolve(value === 'ok' ? true : '不通过'), 5)
        }),
    )

    const schema = v.string().useAsync('myAsync')

    const r1 = await schema.validateAsync('ok')
    expect(r1.success).toBe(true)

    const r2 = await schema.validateAsync('bad')
    expect(r2.success).toBe(false)
  })

  it('async rule throws when run via sync validate()', () => {
    extend('myAsync', () => async () => true)
    const schema = v.string().useAsync('myAsync')
    expect(() => schema.validate('x')).toThrow(/validateAsync/)
  })
})
