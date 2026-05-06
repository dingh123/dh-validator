import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('when / literal is value', () => {
  it('then branch fires when matched', () => {
    const schema = v.object({
      userType: v.string().required(),
      idCard: v.string().when('userType', {
        is: 'personal',
        then: v.string().required().idCard(),
        otherwise: v.string().optional(),
      }),
    })

    // personal user without idCard → fail
    const r1 = schema.validate({ userType: 'personal', idCard: '' })
    expect(r1.success).toBe(false)

    // enterprise user without idCard → ok
    const r2 = schema.validate({ userType: 'enterprise', idCard: '' })
    expect(r2.success).toBe(true)
  })
})

describe('when / predicate function as is', () => {
  it('predicate decides branch', () => {
    const schema = v.object({
      country: v.string(),
      phone: v.string().when('country', {
        is: (val: string) => val === 'CN',
        then: v.string().required().mobile(),
        otherwise: v.string().required().mobile({ intl: true }),
      }),
    })

    // CN with valid mobile
    expect(schema.validate({ country: 'CN', phone: '13912345678' }).success).toBe(true)
    // US with E.164
    expect(schema.validate({ country: 'US', phone: '+14155552671' }).success).toBe(true)
    // CN with international format → fail
    expect(schema.validate({ country: 'CN', phone: '+14155552671' }).success).toBe(false)
  })
})

describe('when / no otherwise branch', () => {
  it('skips when not matched and no otherwise given', () => {
    const schema = v.object({
      kind: v.string(),
      ext: v.string().when('kind', {
        is: 'special',
        then: v.string().required(),
      }),
    })

    expect(schema.validate({ kind: 'normal', ext: '' }).success).toBe(true)
    expect(schema.validate({ kind: 'special', ext: '' }).success).toBe(false)
  })
})
