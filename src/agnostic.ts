import type { ObjectSchema } from './builders'
import type { ValidateError, ValidateResult } from './types'

/**
 * 框架无关的校验器（Vue 2 / Vue 2.6- / 小程序原生 / Node 工具脚本可用）。
 * 不依赖任何前端框架，调用方自行接到响应式系统或界面。
 *
 * @example
 * const checker = createValidator(schema, () => form)
 * const r = await checker.validate()
 * const msg = checker.getError('mobile')
 */
export function createValidator<T extends Record<string, any>>(
  schema: ObjectSchema,
  getData: () => T,
  options?: { locale?: string },
) {
  let lastErrors: Record<string, ValidateError> = {}

  async function validate(): Promise<ValidateResult<T>> {
    const data = getData()
    const result = schema.hasAsyncRule
      ? await schema.validateAsync(data, { locale: options?.locale })
      : (schema.validate(data, { locale: options?.locale }) as ValidateResult<T>)
    lastErrors = result.success ? {} : result.errorMap
    return result as ValidateResult<T>
  }

  async function validateField(field: string): Promise<ValidateResult<any>> {
    const data = getData()
    const sub = schema.shape[field]
    const result = sub?.hasAsyncRule
      ? await schema.validateFieldAsync(field, data, { locale: options?.locale })
      : schema.validateField(field, data, { locale: options?.locale })
    if (result.success) delete lastErrors[field]
    else if (result.errors[0]) lastErrors[field] = result.errors[0]
    return result
  }

  function getError(field: string): string | undefined {
    return lastErrors[field]?.message
  }

  function getErrors(): Record<string, string> {
    const out: Record<string, string> = {}
    for (const k of Object.keys(lastErrors)) out[k] = lastErrors[k].message
    return out
  }

  function reset(): void {
    lastErrors = {}
  }

  return { validate, validateField, getError, getErrors, reset }
}
