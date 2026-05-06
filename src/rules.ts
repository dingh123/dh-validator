import type { Rule } from './types'

/* -------------------- 类型断言 -------------------- */

export const ruleTypeString = (): Rule => ({
  code: 'type_string',
  abortOnFail: true,
  fn: (v) => typeof v === 'string',
})

export const ruleTypeNumber = (): Rule => ({
  code: 'type_number',
  abortOnFail: true,
  fn: (v) => typeof v === 'number' && !isNaN(v),
})

export const ruleTypeBoolean = (): Rule => ({
  code: 'type_boolean',
  abortOnFail: true,
  fn: (v) => typeof v === 'boolean',
})

export const ruleTypeArray = (): Rule => ({
  code: 'type_array',
  abortOnFail: true,
  fn: (v) => Array.isArray(v),
})

export const ruleTypeObject = (): Rule => ({
  code: 'type_object',
  abortOnFail: true,
  fn: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
})

/* -------------------- 长度（字符串/数组通用） -------------------- */

const len = (v: any): number => {
  if (typeof v === 'string') return v.length
  if (Array.isArray(v)) return v.length
  if (v == null) return 0
  return String(v).length
}

export const ruleMin = (min: number, message?: string): Rule => ({
  code: 'min',
  params: { min },
  fn: (v) => (len(v) >= min ? true : message ?? false),
})

export const ruleMax = (max: number, message?: string): Rule => ({
  code: 'max',
  params: { max },
  fn: (v) => (len(v) <= max ? true : message ?? false),
})

export const ruleLength = (n: number, message?: string): Rule => ({
  code: 'length',
  params: { length: n },
  fn: (v) => (len(v) === n ? true : message ?? false),
})

export const ruleLengthRange = (min: number, max: number, message?: string): Rule => ({
  code: 'length_range',
  params: { min, max },
  fn: (v) => {
    const l = len(v)
    return l >= min && l <= max ? true : message ?? false
  },
})

/* -------------------- 正则 -------------------- */

export const ruleRegex = (re: RegExp, message?: string, code = 'regex'): Rule => ({
  code,
  fn: (v) => (re.test(String(v)) ? true : message ?? false),
})

/* -------------------- 数字比较 -------------------- */

const num = (v: any): number => Number(v)

export const ruleInteger = (message?: string): Rule => ({
  code: 'integer',
  fn: (v) => (Number.isInteger(num(v)) ? true : message ?? false),
})

export const ruleFloat = (message?: string): Rule => ({
  code: 'float',
  fn: (v) => (!isNaN(num(v)) ? true : message ?? false),
})

export const rulePositive = (message?: string): Rule => ({
  code: 'positive',
  fn: (v) => (num(v) > 0 ? true : message ?? false),
})

export const ruleNegative = (message?: string): Rule => ({
  code: 'negative',
  fn: (v) => (num(v) < 0 ? true : message ?? false),
})

export const ruleGt = (min: number, message?: string): Rule => ({
  code: 'gt',
  params: { min },
  fn: (v) => (num(v) > min ? true : message ?? false),
})

export const ruleGte = (min: number, message?: string): Rule => ({
  code: 'gte',
  params: { min },
  fn: (v) => (num(v) >= min ? true : message ?? false),
})

export const ruleLt = (max: number, message?: string): Rule => ({
  code: 'lt',
  params: { max },
  fn: (v) => (num(v) < max ? true : message ?? false),
})

export const ruleLte = (max: number, message?: string): Rule => ({
  code: 'lte',
  params: { max },
  fn: (v) => (num(v) <= max ? true : message ?? false),
})

export const ruleBetween = (min: number, max: number, message?: string): Rule => ({
  code: 'between',
  params: { min, max },
  fn: (v) => {
    const n = num(v)
    return n >= min && n <= max ? true : message ?? false
  },
})

/* -------------------- 业务格式 -------------------- */

// 中国大陆手机号（含虚拟号段 17x）
const RE_MOBILE_CN = /^1[3-9]\d{9}$/
// 国际：E.164 简化版 +(country)(7-14digits)
const RE_MOBILE_INTL = /^\+?[1-9]\d{6,14}$/

export const ruleMobile = (opts?: { intl?: boolean }, message?: string): Rule => ({
  code: 'mobile',
  fn: (v) => {
    const s = String(v)
    const re = opts?.intl ? RE_MOBILE_INTL : RE_MOBILE_CN
    return re.test(s) ? true : message ?? false
  },
})

// RFC 5322 简化版
const RE_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
export const ruleEmail = (message?: string): Rule => ({
  code: 'email',
  fn: (v) => (RE_EMAIL.test(String(v)) ? true : message ?? false),
})

const RE_URL = /^https?:\/\/[^\s/$.?#].[^\s]*$/i
export const ruleUrl = (message?: string): Rule => ({
  code: 'url',
  fn: (v) => (RE_URL.test(String(v)) ? true : message ?? false),
})

// 中国身份证 18 位含校验位
const ID_WEIGHT = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const ID_CHECK = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
function isValidIdCard(id: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(id)) return false
  let sum = 0
  for (let i = 0; i < 17; i++) sum += parseInt(id[i], 10) * ID_WEIGHT[i]
  return ID_CHECK[sum % 11] === id[17].toUpperCase()
}
export const ruleIdCard = (message?: string): Rule => ({
  code: 'idCard',
  fn: (v) => (isValidIdCard(String(v)) ? true : message ?? false),
})

// 银行卡 Luhn 校验（13-19 位）
function isValidLuhn(card: string): boolean {
  if (!/^\d{13,19}$/.test(card)) return false
  let sum = 0
  let alt = false
  for (let i = card.length - 1; i >= 0; i--) {
    let n = parseInt(card[i], 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}
export const ruleBankCard = (message?: string): Rule => ({
  code: 'bankCard',
  fn: (v) => (isValidLuhn(String(v).replace(/\s+/g, '')) ? true : message ?? false),
})

const RE_ZIP_CN = /^\d{6}$/
export const ruleZipCode = (message?: string): Rule => ({
  code: 'zipCode',
  fn: (v) => (RE_ZIP_CN.test(String(v)) ? true : message ?? false),
})

const RE_IPV4 =
  /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
export const ruleIpv4 = (message?: string): Rule => ({
  code: 'ipv4',
  fn: (v) => (RE_IPV4.test(String(v)) ? true : message ?? false),
})

const RE_HEX_COLOR = /^#([0-9A-Fa-f]{3}){1,2}$/
export const ruleHexColor = (message?: string): Rule => ({
  code: 'hexColor',
  fn: (v) => (RE_HEX_COLOR.test(String(v)) ? true : message ?? false),
})

/* -------------------- 中文/字母 -------------------- */

const RE_CN = /^[一-龥]+$/
const RE_CN_NUM = /^[一-龥0-9]+$/
const RE_ALPHA = /^[A-Za-z]+$/
const RE_ALPHANUM = /^[A-Za-z0-9]+$/

export const ruleCn = (message?: string): Rule => ({
  code: 'cn',
  fn: (v) => (RE_CN.test(String(v)) ? true : message ?? false),
})
export const ruleCnNum = (message?: string): Rule => ({
  code: 'cnNum',
  fn: (v) => (RE_CN_NUM.test(String(v)) ? true : message ?? false),
})
export const ruleAlpha = (message?: string): Rule => ({
  code: 'alpha',
  fn: (v) => (RE_ALPHA.test(String(v)) ? true : message ?? false),
})
export const ruleAlphanumeric = (message?: string): Rule => ({
  code: 'alphanumeric',
  fn: (v) => (RE_ALPHANUM.test(String(v)) ? true : message ?? false),
})

/* -------------------- 集合 -------------------- */

export const ruleOneOf = (options: any[], message?: string): Rule => ({
  code: 'oneOf',
  params: { options: options.join(', ') },
  fn: (v) => (options.includes(v) ? true : message ?? false),
})

export const ruleNotIn = (options: any[], message?: string): Rule => ({
  code: 'notIn',
  params: { options: options.join(', ') },
  fn: (v) => (!options.includes(v) ? true : message ?? false),
})

export const ruleEquals = (target: any, message?: string): Rule => ({
  code: 'equals',
  params: { target },
  fn: (v) => (v === target ? true : message ?? false),
})

/* -------------------- 跨字段 -------------------- */

export const ruleSameAs = (otherField: string, message?: string, otherLabel?: string): Rule => ({
  code: 'sameAs',
  params: { otherField, otherLabel: otherLabel ?? otherField },
  fn: (v, ctx) => {
    const other = getByPath(ctx.rootData, otherField)
    return v === other ? true : message ?? false
  },
})

export const ruleDifferentFrom = (
  otherField: string,
  message?: string,
  otherLabel?: string,
): Rule => ({
  code: 'differentFrom',
  params: { otherField, otherLabel: otherLabel ?? otherField },
  fn: (v, ctx) => {
    const other = getByPath(ctx.rootData, otherField)
    return v !== other ? true : message ?? false
  },
})

/* -------------------- 数组规则 -------------------- */

export const ruleArrayMin = (min: number, message?: string): Rule => ({
  code: 'arrayMin',
  params: { min },
  fn: (v) => (Array.isArray(v) && v.length >= min ? true : message ?? false),
})

export const ruleArrayMax = (max: number, message?: string): Rule => ({
  code: 'arrayMax',
  params: { max },
  fn: (v) => (Array.isArray(v) && v.length <= max ? true : message ?? false),
})

export const ruleUnique = (message?: string): Rule => ({
  code: 'unique',
  fn: (v) => {
    if (!Array.isArray(v)) return true
    return new Set(v).size === v.length ? true : message ?? false
  },
})

/* -------------------- 文件 -------------------- */

export const ruleUploading = (message?: string): Rule => ({
  code: 'uploading',
  fn: (v) => {
    if (!Array.isArray(v)) return true
    return v.every((item: any) => !item?.loading) ? true : message ?? false
  },
})

export const ruleUploadFailed = (message?: string): Rule => ({
  code: 'uploadFailed',
  fn: (v) => {
    if (!Array.isArray(v)) return true
    return v.every((item: any) => !item?.error) ? true : message ?? false
  },
})

/* -------------------- 工具 -------------------- */

/** 从对象中按路径取值，支持 'a.b.c' / 'a[0].b' 格式 */
export function getByPath(obj: any, path: string): any {
  if (!path) return obj
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (const k of keys) {
    if (cur == null) return undefined
    cur = cur[k]
  }
  return cur
}
