import { Schema, buildResult } from './core'
import type { ValidateContext, ValidateError, ValidateResult } from './types'
import {
  ruleAlpha,
  ruleAlphanumeric,
  ruleArrayMax,
  ruleArrayMin,
  ruleBankCard,
  ruleBetween,
  ruleCn,
  ruleCnNum,
  ruleDifferentFrom,
  ruleEmail,
  ruleEquals,
  ruleFloat,
  ruleGt,
  ruleGte,
  ruleHexColor,
  ruleIdCard,
  ruleInteger,
  ruleIpv4,
  ruleLength,
  ruleLengthRange,
  ruleLt,
  ruleLte,
  ruleMax,
  ruleMin,
  ruleMobile,
  ruleNegative,
  ruleNotIn,
  ruleOneOf,
  rulePositive,
  ruleRegex,
  ruleSameAs,
  ruleTypeArray,
  ruleTypeBoolean,
  ruleTypeNumber,
  ruleTypeObject,
  ruleTypeString,
  ruleUnique,
  ruleUploadFailed,
  ruleUploading,
  ruleUrl,
  ruleZipCode,
} from './rules'

/* ==================== StringSchema ==================== */

export class StringSchema extends Schema<string> {
  constructor() {
    super()
    this._typeName = 'string'
    this.addRule(ruleTypeString())
  }

  min(n: number, message?: string) {
    return this.addRule(ruleMin(n, message))
  }
  max(n: number, message?: string) {
    return this.addRule(ruleMax(n, message))
  }
  length(n: number, message?: string) {
    return this.addRule(ruleLength(n, message))
  }
  /** 长度区间 [min, max] */
  lengthBetween(min: number, max: number, message?: string) {
    return this.addRule(ruleLengthRange(min, max, message))
  }
  regex(re: RegExp, message?: string, code?: string) {
    return this.addRule(ruleRegex(re, message, code))
  }

  /** 中国大陆手机号；传 { intl: true } 切国际格式 */
  mobile(opts?: { intl?: boolean }, message?: string) {
    return this.addRule(ruleMobile(opts, message))
  }
  email(message?: string) {
    return this.addRule(ruleEmail(message))
  }
  url(message?: string) {
    return this.addRule(ruleUrl(message))
  }
  idCard(message?: string) {
    return this.addRule(ruleIdCard(message))
  }
  bankCard(message?: string) {
    return this.addRule(ruleBankCard(message))
  }
  zipCode(message?: string) {
    return this.addRule(ruleZipCode(message))
  }
  ipv4(message?: string) {
    return this.addRule(ruleIpv4(message))
  }
  hexColor(message?: string) {
    return this.addRule(ruleHexColor(message))
  }
  cn(message?: string) {
    return this.addRule(ruleCn(message))
  }
  cnNum(message?: string) {
    return this.addRule(ruleCnNum(message))
  }
  alpha(message?: string) {
    return this.addRule(ruleAlpha(message))
  }
  alphanumeric(message?: string) {
    return this.addRule(ruleAlphanumeric(message))
  }
  oneOf(options: string[], message?: string) {
    return this.addRule(ruleOneOf(options, message))
  }
  notIn(options: string[], message?: string) {
    return this.addRule(ruleNotIn(options, message))
  }
  equals(target: string, message?: string) {
    return this.addRule(ruleEquals(target, message))
  }
  sameAs(field: string, message?: string, otherLabel?: string) {
    return this.addRule(ruleSameAs(field, message, otherLabel))
  }
  differentFrom(field: string, message?: string, otherLabel?: string) {
    return this.addRule(ruleDifferentFrom(field, message, otherLabel))
  }
}

/* ==================== NumberSchema ==================== */

export class NumberSchema extends Schema<number> {
  constructor() {
    super()
    this._typeName = 'number'
    this.addRule(ruleTypeNumber())
  }

  integer(message?: string) {
    return this.addRule(ruleInteger(message))
  }
  float(message?: string) {
    return this.addRule(ruleFloat(message))
  }
  positive(message?: string) {
    return this.addRule(rulePositive(message))
  }
  negative(message?: string) {
    return this.addRule(ruleNegative(message))
  }
  gt(min: number, message?: string) {
    return this.addRule(ruleGt(min, message))
  }
  gte(min: number, message?: string) {
    return this.addRule(ruleGte(min, message))
  }
  lt(max: number, message?: string) {
    return this.addRule(ruleLt(max, message))
  }
  lte(max: number, message?: string) {
    return this.addRule(ruleLte(max, message))
  }
  between(min: number, max: number, message?: string) {
    return this.addRule(ruleBetween(min, max, message))
  }
  oneOf(options: number[], message?: string) {
    return this.addRule(ruleOneOf(options, message))
  }
  equals(target: number, message?: string) {
    return this.addRule(ruleEquals(target, message))
  }
  sameAs(field: string, message?: string, otherLabel?: string) {
    return this.addRule(ruleSameAs(field, message, otherLabel))
  }
}

/* ==================== BooleanSchema ==================== */

export class BooleanSchema extends Schema<boolean> {
  constructor() {
    super()
    this._typeName = 'boolean'
    this.addRule(ruleTypeBoolean())
  }

  equals(target: boolean, message?: string) {
    return this.addRule(ruleEquals(target, message))
  }
}

/* ==================== ArraySchema ==================== */

export class ArraySchema<TItem = any> extends Schema<TItem[]> {
  private _itemSchema?: Schema<TItem>

  constructor(itemSchema?: Schema<TItem>) {
    super()
    this._typeName = 'array'
    this._itemSchema = itemSchema
    this.addRule(ruleTypeArray())
  }

  /** 含子 schema 的异步规则也应该被识别 */
  override get hasAsyncRule(): boolean {
    return super.hasAsyncRule || this._itemSchema?.hasAsyncRule === true
  }

  min(n: number, message?: string) {
    return this.addRule(ruleArrayMin(n, message))
  }
  max(n: number, message?: string) {
    return this.addRule(ruleArrayMax(n, message))
  }
  unique(message?: string) {
    return this.addRule(ruleUnique(message))
  }
  uploading(message?: string) {
    return this.addRule(ruleUploading(message))
  }
  uploadFailed(message?: string) {
    return this.addRule(ruleUploadFailed(message))
  }
  /** 对每一项执行子 schema 校验 */
  each(itemSchema: Schema<TItem>) {
    this._itemSchema = itemSchema
    return this
  }

  /** 重写：先跑数组级规则，再对每项跑子 schema */
  validate(value: TItem[], ctx?: Partial<ValidateContext>): ValidateResult<TItem[]> {
    const baseResult = super.validate(value, ctx)
    if (!baseResult.success) return baseResult
    if (!this._itemSchema || !Array.isArray(value)) return baseResult

    const errors: ValidateError[] = []
    for (let i = 0; i < value.length; i++) {
      const itemPath = `${ctx?.path ?? ''}[${i}]`
      const r = this._itemSchema.validate(value[i], {
        rootData: ctx?.rootData ?? value,
        path: itemPath,
        label: `${this._label || '项'}[${i}]`,
        locale: ctx?.locale,
      })
      if (!r.success) errors.push(...r.errors)
    }
    return errors.length ? buildResult(value, errors) : baseResult
  }

  async validateAsync(
    value: TItem[],
    ctx?: Partial<ValidateContext>,
  ): Promise<ValidateResult<TItem[]>> {
    const baseResult = await super.validateAsync(value, ctx)
    if (!baseResult.success) return baseResult
    if (!this._itemSchema || !Array.isArray(value)) return baseResult

    const errors: ValidateError[] = []
    for (let i = 0; i < value.length; i++) {
      const itemPath = `${ctx?.path ?? ''}[${i}]`
      const r = await this._itemSchema.validateAsync(value[i], {
        rootData: ctx?.rootData ?? value,
        path: itemPath,
        label: `${this._label || '项'}[${i}]`,
        locale: ctx?.locale,
      })
      if (!r.success) errors.push(...r.errors)
    }
    return errors.length ? buildResult(value, errors) : baseResult
  }
}

/* ==================== ObjectSchema ==================== */

export type Shape = Record<string, Schema<any>>

export class ObjectSchema<S extends Shape = Shape> extends Schema<Record<string, any>> {
  private _shape: S

  constructor(shape: S) {
    super()
    this._typeName = 'object'
    this._shape = shape
    this.addRule(ruleTypeObject())
  }

  /** 任一字段含异步规则即视为异步 */
  override get hasAsyncRule(): boolean {
    if (super.hasAsyncRule) return true
    for (const key of Object.keys(this._shape)) {
      if (this._shape[key].hasAsyncRule) return true
    }
    return false
  }

  /** 拓展字段 */
  extend<S2 extends Shape>(extra: S2): ObjectSchema<S & S2> {
    return new ObjectSchema({ ...this._shape, ...extra })
  }

  /** 同步校验整张表单 */
  validate(
    value: Record<string, any>,
    ctx?: Partial<ValidateContext>,
  ): ValidateResult<Record<string, any>> {
    const root = ctx?.rootData ?? value
    const baseCtx: Partial<ValidateContext> = {
      rootData: root,
      path: ctx?.path ?? '',
      label: this._label || ctx?.label,
      locale: ctx?.locale,
    }

    const baseResult = super.validate(value, baseCtx)
    // 类型不对（不是 object）就直接返回
    if (!baseResult.success) return baseResult
    if (!value || typeof value !== 'object') return baseResult

    const errors: ValidateError[] = []
    for (const key of Object.keys(this._shape)) {
      const sub = this._shape[key]
      const subPath = baseCtx.path ? `${baseCtx.path}.${key}` : key
      const r = sub.validate(value[key], {
        rootData: root,
        path: subPath,
        label: undefined,
        locale: ctx?.locale,
      })
      if (!r.success) errors.push(...r.errors)
    }
    return errors.length ? buildResult(value, errors) : baseResult
  }

  /** 异步校验整张表单 */
  async validateAsync(
    value: Record<string, any>,
    ctx?: Partial<ValidateContext>,
  ): Promise<ValidateResult<Record<string, any>>> {
    const root = ctx?.rootData ?? value
    const baseCtx: Partial<ValidateContext> = {
      rootData: root,
      path: ctx?.path ?? '',
      label: this._label || ctx?.label,
      locale: ctx?.locale,
    }

    const baseResult = await super.validateAsync(value, baseCtx)
    if (!baseResult.success) return baseResult
    if (!value || typeof value !== 'object') return baseResult

    const errors: ValidateError[] = []
    for (const key of Object.keys(this._shape)) {
      const sub = this._shape[key]
      const subPath = baseCtx.path ? `${baseCtx.path}.${key}` : key
      const r = await sub.validateAsync(value[key], {
        rootData: root,
        path: subPath,
        label: undefined,
        locale: ctx?.locale,
      })
      if (!r.success) errors.push(...r.errors)
    }
    return errors.length ? buildResult(value, errors) : baseResult
  }

  /** 单字段校验：用于 useValidator 的实时校验场景 */
  validateField(
    field: string,
    rootData: Record<string, any>,
    ctx?: Partial<ValidateContext>,
  ): ValidateResult<any> {
    const sub = this._shape[field]
    if (!sub) return { success: true, data: rootData[field], errors: [] }
    return sub.validate(rootData[field], {
      rootData,
      path: field,
      locale: ctx?.locale,
    })
  }

  async validateFieldAsync(
    field: string,
    rootData: Record<string, any>,
    ctx?: Partial<ValidateContext>,
  ): Promise<ValidateResult<any>> {
    const sub = this._shape[field]
    if (!sub) return { success: true, data: rootData[field], errors: [] }
    return sub.validateAsync(rootData[field], {
      rootData,
      path: field,
      locale: ctx?.locale,
    })
  }

  /** 取出 shape，便于框架集成层访问 */
  get shape(): S {
    return this._shape
  }
}
