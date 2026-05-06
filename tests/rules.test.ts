import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('rules / string length', () => {
  it('min', () => {
    expect(v.string().min(6).validate('abc').success).toBe(false)
    expect(v.string().min(6).validate('abcdef').success).toBe(true)
  })

  it('max', () => {
    expect(v.string().max(3).validate('abcd').success).toBe(false)
    expect(v.string().max(3).validate('abc').success).toBe(true)
  })

  it('lengthBetween', () => {
    expect(v.string().lengthBetween(6, 20).validate('abc').success).toBe(false)
    expect(v.string().lengthBetween(6, 20).validate('abcdefgh').success).toBe(true)
    expect(v.string().lengthBetween(6, 20).validate('a'.repeat(21)).success).toBe(false)
  })

  it('length (fixed)', () => {
    expect(v.string().length(11).validate('1234567890').success).toBe(false)
    expect(v.string().length(11).validate('12345678901').success).toBe(true)
  })

  it('regex', () => {
    expect(v.string().regex(/^[A-Z]+$/).validate('abc').success).toBe(false)
    expect(v.string().regex(/^[A-Z]+$/).validate('ABC').success).toBe(true)
  })
})

describe('rules / number', () => {
  it('integer', () => {
    expect(v.number().integer().validate(3.14).success).toBe(false)
    expect(v.number().integer().validate(42).success).toBe(true)
  })

  it('between', () => {
    expect(v.number().between(18, 60).validate(15).success).toBe(false)
    expect(v.number().between(18, 60).validate(30).success).toBe(true)
    expect(v.number().between(18, 60).validate(61).success).toBe(false)
  })

  it('gt / gte / lt / lte', () => {
    expect(v.number().gt(10).validate(10).success).toBe(false)
    expect(v.number().gte(10).validate(10).success).toBe(true)
    expect(v.number().lt(10).validate(10).success).toBe(false)
    expect(v.number().lte(10).validate(10).success).toBe(true)
  })

  it('positive / negative', () => {
    expect(v.number().positive().validate(-1).success).toBe(false)
    expect(v.number().positive().validate(1).success).toBe(true)
    expect(v.number().negative().validate(1).success).toBe(false)
    expect(v.number().negative().validate(-1).success).toBe(true)
  })
})

describe('rules / business format - mobile', () => {
  it('CN mobile valid', () => {
    expect(v.string().mobile().validate('13912345678').success).toBe(true)
    expect(v.string().mobile().validate('17012345678').success).toBe(true)
  })

  it('CN mobile invalid', () => {
    expect(v.string().mobile().validate('12012345678').success).toBe(false)
    expect(v.string().mobile().validate('1391234567').success).toBe(false)
  })

  it('international E.164', () => {
    expect(v.string().mobile({ intl: true }).validate('+14155552671').success).toBe(true)
    expect(v.string().mobile({ intl: true }).validate('+8613912345678').success).toBe(true)
    expect(v.string().mobile({ intl: true }).validate('abc').success).toBe(false)
  })
})

describe('rules / business format - email/url/zip', () => {
  it('email', () => {
    expect(v.string().email().validate('a@b.com').success).toBe(true)
    expect(v.string().email().validate('hello@example.co.uk').success).toBe(true)
    expect(v.string().email().validate('not-email').success).toBe(false)
    expect(v.string().email().validate('a@').success).toBe(false)
  })

  it('url', () => {
    expect(v.string().url().validate('https://example.com').success).toBe(true)
    expect(v.string().url().validate('http://a.b/path?q=1').success).toBe(true)
    expect(v.string().url().validate('not-url').success).toBe(false)
  })

  it('zipCode (CN 6-digit)', () => {
    expect(v.string().zipCode().validate('100000').success).toBe(true)
    expect(v.string().zipCode().validate('1000').success).toBe(false)
  })

  it('ipv4', () => {
    expect(v.string().ipv4().validate('192.168.1.1').success).toBe(true)
    expect(v.string().ipv4().validate('256.1.1.1').success).toBe(false)
    expect(v.string().ipv4().validate('not-ip').success).toBe(false)
  })

  it('hexColor', () => {
    expect(v.string().hexColor().validate('#fff').success).toBe(true)
    expect(v.string().hexColor().validate('#FFFFFF').success).toBe(true)
    expect(v.string().hexColor().validate('fff').success).toBe(false)
    expect(v.string().hexColor().validate('#GGG').success).toBe(false)
  })
})

describe('rules / idCard (with checksum)', () => {
  it('valid 18-digit ID with checksum', () => {
    // 公开测试号（北京 1101...，校验位由权重算出）
    expect(v.string().idCard().validate('11010519491231002X').success).toBe(true)
  })

  it('invalid: bad checksum', () => {
    expect(v.string().idCard().validate('110105194912310021').success).toBe(false)
  })

  it('invalid: bad format', () => {
    expect(v.string().idCard().validate('123').success).toBe(false)
  })
})

describe('rules / bankCard (Luhn)', () => {
  it('valid Visa test number', () => {
    expect(v.string().bankCard().validate('4111111111111111').success).toBe(true)
  })

  it('valid Mastercard test number', () => {
    expect(v.string().bankCard().validate('5500000000000004').success).toBe(true)
  })

  it('strips spaces before validation', () => {
    expect(v.string().bankCard().validate('4111 1111 1111 1111').success).toBe(true)
  })

  it('invalid Luhn checksum', () => {
    expect(v.string().bankCard().validate('4111111111111112').success).toBe(false)
  })

  it('too short', () => {
    expect(v.string().bankCard().validate('41111').success).toBe(false)
  })
})

describe('rules / chinese & alpha', () => {
  it('cn (chinese chars only)', () => {
    expect(v.string().cn().validate('你好').success).toBe(true)
    expect(v.string().cn().validate('hello').success).toBe(false)
    expect(v.string().cn().validate('你好123').success).toBe(false)
  })

  it('cnNum', () => {
    expect(v.string().cnNum().validate('你好123').success).toBe(true)
    expect(v.string().cnNum().validate('hello').success).toBe(false)
  })

  it('alpha', () => {
    expect(v.string().alpha().validate('abcDEF').success).toBe(true)
    expect(v.string().alpha().validate('abc123').success).toBe(false)
  })

  it('alphanumeric', () => {
    expect(v.string().alphanumeric().validate('abc123').success).toBe(true)
    expect(v.string().alphanumeric().validate('abc-123').success).toBe(false)
  })
})

describe('rules / oneOf / notIn / equals', () => {
  it('oneOf', () => {
    expect(v.string().oneOf(['a', 'b']).validate('c').success).toBe(false)
    expect(v.string().oneOf(['a', 'b']).validate('a').success).toBe(true)
  })

  it('notIn', () => {
    expect(v.string().notIn(['a', 'b']).validate('a').success).toBe(false)
    expect(v.string().notIn(['a', 'b']).validate('c').success).toBe(true)
  })

  it('equals', () => {
    expect(v.string().equals('foo').validate('bar').success).toBe(false)
    expect(v.string().equals('foo').validate('foo').success).toBe(true)
  })

  it('boolean equals (agree to terms pattern)', () => {
    expect(v.boolean().equals(true, '请勾选').validate(false).success).toBe(false)
    expect(v.boolean().equals(true, '请勾选').validate(true).success).toBe(true)
  })
})

describe('rules / array', () => {
  it('arrayMin / arrayMax', () => {
    expect(v.array().min(1).validate([]).success).toBe(false)
    expect(v.array().min(1).validate([1]).success).toBe(true)
    expect(v.array().max(3).validate([1, 2, 3, 4]).success).toBe(false)
  })

  it('unique', () => {
    expect(v.array().unique().validate([1, 2, 2]).success).toBe(false)
    expect(v.array().unique().validate([1, 2, 3]).success).toBe(true)
  })

  it('uploading - all loading=false passes', () => {
    expect(v.array().uploading().validate([{ loading: false }, {}] as any[]).success).toBe(true)
    expect(v.array().uploading().validate([{ loading: true }] as any[]).success).toBe(false)
  })

  it('uploadFailed - all error=falsy passes', () => {
    expect(v.array().uploadFailed().validate([{}, { error: false }] as any[]).success).toBe(true)
    expect(v.array().uploadFailed().validate([{ error: 'NETWORK' }] as any[]).success).toBe(false)
  })
})
