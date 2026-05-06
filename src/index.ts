/**
 * dh-validator: A modern, type-safe form validation library.
 *
 * Chainable Schema + cross-field + conditional (when) + async rules
 * + Vue 3 composable + extensible plugin system.
 *
 * Works with Vue 2.7+ / Vue 3 / TS / JS / mini-programs / Node.
 *
 * @example
 *   import { v } from 'dh-validator'
 *   const schema = v.object({
 *     mobile: v.string().required().mobile(),
 *     pwd:    v.string().required().min(6),
 *   })
 *   const r = schema.validate(form)
 */
import {
  ArraySchema,
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  type Shape,
} from './builders'
import { Schema } from './core'

/* ===== Chainable Schema factory ===== */

export const v = {
  /** String schema: v.string().required().min(6).mobile() */
  string: () => new StringSchema(),
  /** Number schema: v.number().integer().between(18, 60) */
  number: () => new NumberSchema(),
  /** Boolean schema: v.boolean().equals(true, 'Please agree') */
  boolean: () => new BooleanSchema(),
  /** Array schema: v.array().min(1).each(v.string().email()) */
  array: <T = any>(itemSchema?: Schema<T>) => new ArraySchema<T>(itemSchema),
  /** Object schema: v.object({ mobile: v.string().mobile(), age: v.number() }) */
  object: <S extends Shape>(shape: S) => new ObjectSchema<S>(shape),
}

/* ===== Vue 3 integration (requires vue package, Vue 3 / Vue 2.7+) ===== */

export { useValidator } from './vue'

/* ===== Framework-agnostic validator (Vue 2.6- / mini-programs / Node) ===== */

export { createValidator } from './agnostic'

/* ===== i18n ===== */

export { addMessages, getLocale, setLocale } from './messages'

/* ===== Global plugin system (extend custom business rules) ===== */

export { extend, listExtensions, unextend } from './extend'

/* ===== Utilities ===== */

export { getByPath } from './rules'

/* ===== Schema classes (for type annotations) ===== */

export { ArraySchema, BooleanSchema, NumberSchema, ObjectSchema, Schema, StringSchema }

/* ===== Type exports ===== */

export type {
  Rule,
  RuleFn,
  RuleResult,
  ValidateContext,
  ValidateError,
  ValidateResult,
} from './types'
