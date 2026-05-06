import type { LocaleMessages } from './types'

/** 默认中文文案，{label} / {min} / {max} / {value} 等占位符会在运行时替换 */
const zhCN: LocaleMessages = {
  required: '{label}为必填项',
  optional: '',
  type_string: '{label}必须为字符串',
  type_number: '{label}必须为数字',
  type_boolean: '{label}必须为布尔值',
  type_array: '{label}必须为数组',
  type_object: '{label}必须为对象',

  min: '{label}长度不能小于 {min} 位',
  max: '{label}长度不能大于 {max} 位',
  length: '{label}长度必须为 {length} 位',
  length_range: '{label}长度必须在 {min}-{max} 之间',
  regex: '{label}格式不正确',

  integer: '{label}必须为整数',
  float: '{label}必须为数字',
  positive: '{label}必须为正数',
  negative: '{label}必须为负数',
  gt: '{label}必须大于 {min}',
  gte: '{label}必须大于或等于 {min}',
  lt: '{label}必须小于 {max}',
  lte: '{label}必须小于或等于 {max}',
  between: '{label}必须在 {min}-{max} 之间',

  mobile: '{label}格式不正确',
  email: '{label}邮箱格式不正确',
  url: '{label}URL 格式不正确',
  idCard: '{label}身份证号不正确',
  bankCard: '{label}银行卡号不正确',
  zipCode: '{label}邮政编码不正确',
  ipv4: '{label}IPv4 地址不正确',
  hexColor: '{label}颜色值不正确',

  cn: '{label}只能为中文汉字',
  cnNum: '{label}只能为中文汉字和数字',
  alpha: '{label}只能为英文字母',
  alphanumeric: '{label}只能为英文字母和数字',

  oneOf: '{label}只能为 {options} 之一',
  notIn: '{label}不能为 {options} 之中的值',
  equals: '{label}必须等于指定值',
  sameAs: '{label}与{otherLabel}不一致',
  differentFrom: '{label}不能与{otherLabel}相同',

  arrayMin: '{label}至少包含 {min} 项',
  arrayMax: '{label}最多包含 {max} 项',
  unique: '{label}存在重复项',

  uploading: '{label}正在上传中，请稍后',
  uploadFailed: '{label}有上传失败的文件',

  custom: '{label}校验未通过',
}

const en: LocaleMessages = {
  required: '{label} is required',
  type_string: '{label} must be a string',
  type_number: '{label} must be a number',
  min: '{label} must be at least {min} characters',
  max: '{label} must be at most {max} characters',
  mobile: '{label} is not a valid phone number',
  email: '{label} is not a valid email',
  custom: '{label} is invalid',
}

const locales: Record<string, LocaleMessages> = {
  'zh-CN': zhCN,
  en,
}

let currentLocale = 'zh-CN'

export function setLocale(locale: string): void {
  if (locales[locale]) currentLocale = locale
}

export function getLocale(): string {
  return currentLocale
}

export function addMessages(locale: string, messages: LocaleMessages): void {
  locales[locale] = { ...(locales[locale] ?? {}), ...messages }
}

/** 取出指定 code 的文案模板 */
export function getMessage(code: string, locale?: string): string {
  const l = locale ?? currentLocale
  const fallback = locales['zh-CN']
  return locales[l]?.[code] ?? fallback?.[code] ?? '{label}校验未通过'
}

/** 模板替换：'{label}必须大于 {min}' + { label:'年龄', min:18 } -> '年龄必须大于 18' */
export function renderMessage(template: string, params: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = params[key]
    return v === undefined || v === null ? '' : String(v)
  })
}
