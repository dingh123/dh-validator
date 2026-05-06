import type {
  Rule,
  RuleFn,
  RuleResult,
  ValidateContext,
  ValidateError,
  ValidateResult,
} from './types'
import { getMessage, renderMessage } from './messages'
import { getRegisteredRule } from './extend'

/**
 * 把规则函数返回值规范化为 ValidateError | null。
 * 同时处理消息模板渲染。
 */
function normalizeRuleResult(
  result: RuleResult,
  rule: Rule,
  ctx: ValidateContext,
): ValidateError | null {
  if (result === true || result === null || result === undefined) return null

  let code = rule.code
  let message = ''
  let params = rule.params ?? {}

  if (result === false) {
    // 失败但用默认文案，不需要额外信息
  } else if (typeof result === 'string') {
    message = result
  } else if (typeof result === 'object') {
    code = result.code ?? code
    message = result.message
    params = { ...params, ...(result.params ?? {}) }
  }

  // 没拿到 message → 用默认文案模板
  if (!message) {
    const tpl = getMessage(code, ctx.locale)
    message = renderMessage(tpl, { label: ctx.label, ...params })
  } else if (message.indexOf('{') >= 0) {
    // 用户提供的 message 也支持模板变量
    message = renderMessage(message, { label: ctx.label, ...params })
  }

  return {
    field: ctx.path,
    label: ctx.label,
    code,
    message,
    params: Object.keys(params).length > 0 ? params : undefined,
  }
}

/** 同步执行规则列表，返回错误列表。遇到 abortOnFail 失败立即停止 */
export function runRulesSync(
  rules: Rule[],
  value: any,
  ctx: ValidateContext,
): ValidateError[] {
  const errors: ValidateError[] = []
  for (const rule of rules) {
    if (rule.isAsync) {
      throw new Error(
        `[dh-validator] 字段 "${ctx.path}" 含异步规则 "${rule.code}"，请使用 validateAsync() 而非 validate()`,
      )
    }
    const r = rule.fn(value, ctx) as RuleResult
    const err = normalizeRuleResult(r, rule, ctx)
    if (err) {
      errors.push(err)
      if (rule.abortOnFail) break
    }
  }
  return errors
}

/** 异步执行规则列表 */
export async function runRulesAsync(
  rules: Rule[],
  value: any,
  ctx: ValidateContext,
): Promise<ValidateError[]> {
  const errors: ValidateError[] = []
  for (const rule of rules) {
    const r = await rule.fn(value, ctx)
    const err = normalizeRuleResult(r, rule, ctx)
    if (err) {
      errors.push(err)
      if (rule.abortOnFail) break
    }
  }
  return errors
}

/** 把错误列表组装为统一返回结构 */
export function buildResult<T>(value: T, errors: ValidateError[]): ValidateResult<T> {
  if (errors.length === 0) {
    return { success: true, data: value, errors: [] }
  }
  const errorMap: Record<string, ValidateError> = {}
  for (const e of errors) {
    if (!errorMap[e.field]) errorMap[e.field] = e
  }
  return {
    success: false,
    data: value,
    errors,
    errorMap,
    firstError: errors[0],
  }
}

function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === ''
}

/**
 * Schema 基类：所有 builder（StringSchema / NumberSchema / ObjectSchema...）的父类。
 * 持有规则列表 + 可选/可空标志，提供统一的 validate / validateAsync 入口。
 */
/** when 条件分支配置 */
export interface WhenOptions<T = any> {
  /** 触发匹配：字面值（=== 比较）或谓词函数 */
  is: any | ((otherValue: any, ctx: ValidateContext) => boolean)
  /** 匹配时使用的 schema */
  then?: Schema<T>
  /** 不匹配时使用的 schema */
  otherwise?: Schema<T>
}

interface ConditionalEntry {
  field: string
  is: any | ((otherValue: any, ctx: ValidateContext) => boolean)
  then?: Schema<any>
  otherwise?: Schema<any>
}

export class Schema<T = any> {
  protected rules: Rule[] = []
  protected conditionals: ConditionalEntry[] = []
  protected _label = ''
  protected _isOptional = false
  protected _isNullable = false
  protected _typeName = 'any'

  /** 是否含异步规则（包括自身规则与条件分支中的子 schema） */
  get hasAsyncRule(): boolean {
    if (this.rules.some((r) => r.isAsync)) return true
    for (const c of this.conditionals) {
      if (c.then?.hasAsyncRule || c.otherwise?.hasAsyncRule) return true
    }
    return false
  }

  /** 给字段起一个业务名（用于错误消息） */
  label(label: string): this {
    this._label = label
    return this
  }

  /** 标记字段可选：值为 undefined / null / '' 时跳过所有规则 */
  optional(): this {
    this._isOptional = true
    return this
  }

  /** 允许 null（与 optional 区分：optional 跳过校验，nullable 把 null 视为合法值之一） */
  nullable(): this {
    this._isNullable = true
    return this
  }

  /**
   * 强制必填。等价于在最前面加一条 required 规则；空值时立即停止后续规则。
   * 链式调用 .required('自定义消息') 可覆盖默认文案。
   */
  required(message?: string): this {
    const rule: Rule = {
      code: 'required',
      abortOnFail: true,
      fn: (v) => (isEmpty(v) ? (message ?? false) : true),
    }
    this.rules.unshift(rule)
    this._isOptional = false
    return this
  }

  /** 添加同步自定义规则 */
  custom(fn: RuleFn<T>, code = 'custom'): this {
    this.rules.push({ code, fn })
    return this
  }

  /** 添加异步自定义规则 */
  customAsync(fn: RuleFn<T>, code = 'custom'): this {
    this.rules.push({ code, fn, isAsync: true })
    return this
  }

  /**
   * 调用通过 extend() 注册的全局规则。
   *
   * @example
   * extend('employeeId', () => (v) => /^E\d{6}$/.test(v) || '工号格式错误')
   * v.string().required().use('employeeId')
   */
  use(name: string, ...args: any[]): this {
    const factory = getRegisteredRule(name)
    if (!factory) {
      throw new Error(
        `[dh-validator] 未注册的规则 "${name}"，请先调用 extend('${name}', factory) 注册`,
      )
    }
    this.rules.push({ code: name, fn: factory(...args) })
    return this
  }

  /** 异步版的 use，用于注册的工厂返回 async 函数的场景 */
  useAsync(name: string, ...args: any[]): this {
    const factory = getRegisteredRule(name)
    if (!factory) {
      throw new Error(
        `[dh-validator] 未注册的规则 "${name}"，请先调用 extend('${name}', factory) 注册`,
      )
    }
    this.rules.push({ code: name, fn: factory(...args), isAsync: true })
    return this
  }

  /** 内部：子类 builder 用此方法注册规则 */
  protected addRule(rule: Rule): this {
    this.rules.push(rule)
    return this
  }

  /**
   * 条件校验：根据其他字段值动态切换 schema。
   *
   * @example
   * v.string().when('userType', {
   *   is: 'enterprise',
   *   then: v.string().required().idCard(),
   *   otherwise: v.string().optional(),
   * })
   */
  when(field: string, options: WhenOptions<T>): this {
    this.conditionals.push({
      field,
      is: options.is,
      then: options.then,
      otherwise: options.otherwise,
    })
    return this
  }

  /** 同步校验单个值 */
  validate(value: T, ctx?: Partial<ValidateContext>): ValidateResult<T> {
    const fullCtx: ValidateContext = {
      rootData: ctx?.rootData ?? value,
      path: ctx?.path ?? '',
      label: this._label || ctx?.label || ctx?.path || 'value',
      locale: ctx?.locale ?? 'zh-CN',
    }

    if (this._isOptional && isEmpty(value)) return buildResult(value, [])
    if (this._isNullable && value === null) return buildResult(value, [])

    const errors = runRulesSync(this.rules, value, fullCtx)

    // 跑条件分支
    for (const cond of this.conditionals) {
      const target = pickConditionalTarget(cond, fullCtx)
      if (target) {
        const r = target.validate(value, fullCtx)
        if (!r.success) errors.push(...r.errors)
      }
    }

    return buildResult(value, errors)
  }

  /** 异步校验单个值 */
  async validateAsync(value: T, ctx?: Partial<ValidateContext>): Promise<ValidateResult<T>> {
    const fullCtx: ValidateContext = {
      rootData: ctx?.rootData ?? value,
      path: ctx?.path ?? '',
      label: this._label || ctx?.label || ctx?.path || 'value',
      locale: ctx?.locale ?? 'zh-CN',
    }

    if (this._isOptional && isEmpty(value)) return buildResult(value, [])
    if (this._isNullable && value === null) return buildResult(value, [])

    const errors = await runRulesAsync(this.rules, value, fullCtx)

    // 跑条件分支
    for (const cond of this.conditionals) {
      const target = pickConditionalTarget(cond, fullCtx)
      if (target) {
        const r = target.hasAsyncRule
          ? await target.validateAsync(value, fullCtx)
          : target.validate(value, fullCtx)
        if (!r.success) errors.push(...r.errors)
      }
    }

    return buildResult(value, errors)
  }
}

/** 选择条件分支命中的子 schema */
function pickConditionalTarget(
  cond: ConditionalEntry,
  ctx: ValidateContext,
): Schema<any> | undefined {
  const otherValue = getByPath(ctx.rootData, cond.field)
  const matched =
    typeof cond.is === 'function'
      ? cond.is(otherValue, ctx)
      : otherValue === cond.is
  return matched ? cond.then : cond.otherwise
}

/** 路径取值（在此重声明，避免 core 依赖 rules.ts） */
function getByPath(obj: any, path: string): any {
  if (!path) return obj
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (const k of keys) {
    if (cur == null) return undefined
    cur = cur[k]
  }
  return cur
}
