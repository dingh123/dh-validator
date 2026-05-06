import { computed, reactive, type Ref } from 'vue'
import type { ObjectSchema } from './builders'
import type { ValidateResult } from './types'

/**
 * Vue 3 组合式校验 hook，把 schema 接到响应式 form 数据上。
 *
 * @example
 * const form = ref({ mobile: '', pwd: '' })
 * const schema = v.object({
 *   mobile: v.string().required().mobile(),
 *   pwd:    v.string().required().min(6),
 * })
 *
 * const { errors, validate, validateField, hasError, reset } = useValidator(schema, form)
 *
 * // 整表校验
 * const r = await validate()
 * if (r.success) submit(form.value)
 *
 * // 单字段校验（输入框 @blur 触发）
 * <input v-model="form.mobile" @blur="validateField('mobile')" />
 * <text v-if="errors.mobile">{{ errors.mobile }}</text>
 */
export function useValidator<T extends Record<string, any>>(
  schema: ObjectSchema,
  formRef: Ref<T>,
  options?: { locale?: string; immediate?: boolean },
) {
  // 响应式错误表：{ fieldName: '错误消息' }
  const errors = reactive<Record<string, string>>({})

  /** 写入或清除单字段错误 */
  function setError(field: string, msg?: string): void {
    if (msg) errors[field] = msg
    else delete errors[field]
  }

  /** 整表校验 */
  async function validate(): Promise<ValidateResult<T>> {
    const result = schema.hasAsyncRule
      ? await schema.validateAsync(formRef.value, { locale: options?.locale })
      : (schema.validate(formRef.value, { locale: options?.locale }) as ValidateResult<T>)

    // 清空旧错误
    for (const k of Object.keys(errors)) delete errors[k]
    if (!result.success) {
      for (const e of result.errors) {
        if (!errors[e.field]) errors[e.field] = e.message
      }
    }
    return result as ValidateResult<T>
  }

  /** 单字段校验（输入实时校验场景） */
  async function validateField(field: string): Promise<ValidateResult<any>> {
    const sub = schema.shape[field]
    const result = sub?.hasAsyncRule
      ? await schema.validateFieldAsync(field, formRef.value, { locale: options?.locale })
      : schema.validateField(field, formRef.value, { locale: options?.locale })

    if (result.success) {
      setError(field)
    } else {
      setError(field, result.errors[0]?.message)
    }
    return result
  }

  /** 清除所有错误 */
  function reset(): void {
    for (const k of Object.keys(errors)) delete errors[k]
  }

  /** 是否有任何字段存在错误 */
  const hasError = computed(() => Object.keys(errors).length > 0)

  /** 整表是否校验通过（与 hasError 相反，纯命名糖） */
  const isValid = computed(() => !hasError.value)

  if (options?.immediate) {
    validate()
  }

  return {
    errors,
    hasError,
    isValid,
    validate,
    validateField,
    setError,
    reset,
  }
}

// createValidator (框架无关) 见 ./agnostic.ts
