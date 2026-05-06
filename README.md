# dh-validator

[![npm](https://img.shields.io/npm/v/dh-validator.svg?style=flat&color=635bff)](https://www.npmjs.com/package/dh-validator)
[![license](https://img.shields.io/npm/l/dh-validator.svg?style=flat&color=4f46e5)](./LICENSE)
[![types](https://img.shields.io/npm/types/dh-validator.svg?style=flat)](https://www.npmjs.com/package/dh-validator)
[![CI](https://github.com/dinghui/dh-validator/actions/workflows/test.yml/badge.svg)](https://github.com/dinghui/dh-validator/actions)

A modern, type-safe form validation library — chainable schema, structured errors,
cross-field & conditional rules, async validation, Vue 3 composable, extensible plugins.
**30+** built-in business rules, framework-agnostic, < 30 KB minified.

> [中文文档](./README.zh-CN.md)

## Features

- **Chainable schema** with full TypeScript inference: `v.string().required().mobile()`
- **Structured errors**: `{ field, label, code, message, params }` — perfect for custom UIs and i18n
- **Cross-field validation** as a first-class API: `sameAs('pwd')`, `differentFrom('oldPwd')`
- **Conditional validation**: `when(field, { is, then, otherwise })`
- **Async rules**: `customAsync` / `useAsync`, with automatic sync vs async path detection
- **Vue 3 composable**: reactive `errors`, `validate`, `validateField`, `setError`, `reset`
- **Framework-agnostic core**: works in plain JS, Node, mini-programs, Vue 2.6+
- **Plugin system**: `extend(name, factory)` to register reusable business rules globally
- **30+ built-in rules**: mobile (CN / international), email, URL, Chinese ID card with checksum, bank card with Luhn, IPv4, hex color, etc.
- **i18n**: built-in `zh-CN` / `en`, swap or extend any time
- **Tiny**: ~30 KB minified, ESM + CJS dual bundle, fully tree-shakeable

## Install

```bash
pnpm add dh-validator
# or
npm install dh-validator
# or
yarn add dh-validator
```

## Quick start

```ts
import { v } from 'dh-validator'

const schema = v.object({
  mobile: v.string().required().mobile().label('Mobile'),
  pwd:    v.string().required().lengthBetween(6, 20).label('Password'),
  pwd2:   v.string().required().sameAs('pwd', "Passwords don't match"),
  age:    v.number().integer().between(18, 60).optional(),
  agree:  v.boolean().equals(true, 'Please accept the terms'),
})

const r = schema.validate(form)
if (!r.success) console.log(r.firstError.message)
```

## Vue 3 composable

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { v, useValidator } from 'dh-validator'

const form = ref({ mobile: '', pwd: '' })

const schema = v.object({
  mobile: v.string().required().mobile(),
  pwd:    v.string().required().min(6),
})

const { errors, validate, validateField, hasError } = useValidator(schema, form)
</script>

<template>
  <input v-model="form.mobile" @blur="validateField('mobile')" />
  <span v-if="errors.mobile">{{ errors.mobile }}</span>

  <button :disabled="hasError" @click="onSubmit">Submit</button>
</template>
```

## Conditional validation (`when`)

```ts
v.object({
  userType: v.string().oneOf(['personal', 'enterprise']),

  idCard: v.string().when('userType', {
    is: 'personal',
    then: v.string().required().idCard(),
    otherwise: v.string().optional(),
  }),

  bizLicense: v.string().when('userType', {
    is: 'enterprise',
    then: v.string().required().lengthBetween(15, 20),
  }),
})
```

`is` accepts a literal value (`===` compared) or a predicate function `(otherValue, ctx) => boolean`.

## Async validation

```ts
const schema = v.object({
  username: v.string().required().min(3).customAsync(async (val) => {
    const exists = await api.checkUsername(val)
    return exists ? 'Username taken' : true
  }),
})

const r = await schema.validateAsync(form)
```

Schemas containing async rules **must** be run via `validateAsync()`. `useValidator()` auto-detects.

## Plugin system (`extend`)

Register business rules once, use anywhere:

```ts
import { extend, v } from 'dh-validator'

extend('employeeId', (msg?: string) => (value) => {
  return /^E\d{6}$/.test(String(value)) || msg || 'Invalid employee ID'
})

v.string().required().use('employeeId')
v.string().required().use('employeeId', 'Format: E + 6 digits')
```

For TypeScript IntelliSense, declare a module augmentation:

```ts
// validator.d.ts
import 'dh-validator'
declare module 'dh-validator' {
  interface StringSchema {
    employeeId(message?: string): this
  }
}
```

## Built-in rules

| Category | Rules |
|---|---|
| **Common** | `required` · `optional` · `nullable` |
| **String** | `min` · `max` · `length` · `lengthBetween` · `regex` · `oneOf` · `notIn` · `equals` |
| **Number** | `integer` · `gt` · `gte` · `lt` · `lte` · `between` · `positive` · `negative` |
| **Format** | `mobile` (CN/intl) · `email` · `url` · `idCard` (with checksum) · `bankCard` (Luhn) · `zipCode` · `ipv4` · `hexColor` |
| **Chinese** | `cn` · `cnNum` · `alpha` · `alphanumeric` |
| **Cross-field** | `sameAs` · `differentFrom` · `when` |
| **Array** | `min` · `max` · `unique` · `each` · `uploading` · `uploadFailed` |
| **Custom** | `custom` · `customAsync` · `use` (registered via `extend`) · `useAsync` |

## Error structure

```ts
type ValidateResult<T> =
  | { success: true; data: T; errors: [] }
  | {
      success: false
      data: T
      errors: ValidateError[]                  // all errors (for error center UI)
      errorMap: Record<string, ValidateError>  // field → first error (for inline UI)
      firstError: ValidateError                // for toast / snackbar
    }

type ValidateError = {
  field: string                  // 'mobile' | 'address.city' | 'tags[0]'
  label: string                  // user-facing field name
  code: string                   // 'required' | 'mobile' | 'min' | 'custom:xxx'
  message: string                // rendered with {label} {min} {max} placeholders
  params?: Record<string, any>   // rule params for custom rendering
}
```

## i18n

```ts
import { setLocale, addMessages } from 'dh-validator'

setLocale('en') // built-in: 'zh-CN' | 'en'

addMessages('zh-CN', {
  mobile: '请输入正确的手机号',
})
```

Messages support `{label}`, `{min}`, `{max}`, `{otherLabel}` placeholders rendered at runtime.

## Framework-agnostic

```ts
import { createValidator, v } from 'dh-validator'

const schema = v.object({ /* ... */ })
const checker = createValidator(schema, () => formData)

const r = await checker.validate()
const msg = checker.getError('mobile')
```

Works in any environment without Vue: Vue 2.6 and below, mini-programs, Node CLI tools.

## Documentation

- 🇬🇧 [README (English)](./README.md)
- 🇨🇳 [中文文档](./README.zh-CN.md)
- 📓 [Examples](./examples)
- 📜 [Changelog](./CHANGELOG.md)

## Contributing

PRs welcome. Run `pnpm install`, then:

```bash
pnpm test          # run tests
pnpm test:watch    # watch mode
pnpm test:cov      # with coverage
pnpm lint          # eslint
pnpm format        # prettier
pnpm build         # tsup build → dist/
pnpm changeset     # add a changeset for next release
```

CI (GitHub Actions) runs typecheck + lint + tests + build on every PR.

## License

[MIT](./LICENSE) © dinghui
