/**
 * 单条结构化错误。
 * 用 code 区分规则类型（用于业务侧精准捕获），用 message 给最终用户看。
 */
export interface ValidateError {
  /** 字段路径，如 'mobile' / 'address.city' / 'tags[0]' */
  field: string
  /** 字段中文/业务名称，用于消息插值 */
  label: string
  /** 错误码：'required' / 'mobile' / 'min' / 'custom:xxx' */
  code: string
  /** 最终消息（已经过文案模板渲染） */
  message: string
  /** 规则参数，便于业务侧自定义 UI */
  params?: Record<string, any>
}

/** 整体校验结果。判别式联合，TS 自动收窄 */
export type ValidateResult<T = any> =
  | { success: true; data: T; errors: [] }
  | {
      success: false
      data: T
      errors: ValidateError[]
      /** 字段 → 该字段的首条错误，便于表单 UI 直接绑定 */
      errorMap: Record<string, ValidateError>
      /** 全表第一条错误（按字段顺序） */
      firstError: ValidateError
    }

/**
 * 单条规则的同步/异步返回值约定：
 * - true / null / undefined: 通过
 * - false: 失败，使用默认文案模板（按 rule.code 取）
 * - string: 失败，作为最终消息（支持模板变量 {label} {min} 等）
 * - object: 失败，结构化定义错误
 */
export type RuleResult =
  | boolean
  | null
  | undefined
  | string
  | { code: string; message: string; params?: Record<string, any> }

/** 校验上下文，规则函数可以拿到它做跨字段校验 */
export interface ValidateContext {
  /** 整张表单的根数据，用于跨字段引用 */
  rootData: any
  /** 当前字段路径 */
  path: string
  /** 字段 label，用于消息插值 */
  label: string
  /** 当前 locale */
  locale: string
}

/** 规则函数签名 */
export type RuleFn<T = any> = (value: T, ctx: ValidateContext) => RuleResult | Promise<RuleResult>

/** 规则描述对象 */
export interface Rule<T = any> {
  /** 错误码：'required' / 'min' / 'mobile' / 'custom:xxx' */
  code: string
  /** 规则参数（min:6 中的 6），用于消息模板替换与 errors 透出 */
  params?: Record<string, any>
  /** 实际校验函数 */
  fn: RuleFn<T>
  /** 失败后是否停止后续规则（如 required 失败就别再跑 mobile） */
  abortOnFail?: boolean
  /** 是否异步规则；含异步规则的 schema 必须用 validateAsync() */
  isAsync?: boolean
}

/** 默认错误消息表 */
export type LocaleMessages = Record<string, string>
