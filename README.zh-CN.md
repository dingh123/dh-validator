# dh-validator

[![npm](https://img.shields.io/npm/v/dh-validator.svg?style=flat&color=635bff)](https://www.npmjs.com/package/dh-validator)
[![license](https://img.shields.io/npm/l/dh-validator.svg?style=flat&color=4f46e5)](./LICENSE)
[![types](https://img.shields.io/npm/types/dh-validator.svg?style=flat)](https://www.npmjs.com/package/dh-validator)
[![CI](https://github.com/dingh123/dh-validator/actions/workflows/test.yml/badge.svg)](https://github.com/dingh123/dh-validator/actions)
[![Demo](https://img.shields.io/badge/在线演示-live-635bff?style=flat)](https://dingh123.github.io/dh-validator/)

现代化 TS 表单校验工具：链式 Schema API、结构化错误、跨字段与条件校验、异步规则、Vue 3 组合式 API、可扩展插件机制。**30+** 内置业务规则，框架无关，压缩后 < 30 KB。

> 🎮 **[在线演示 →](https://dingh123.github.io/dh-validator/)** &nbsp;·&nbsp; [English README](./README.md)

## 特性

- **链式 Schema**，完整 TS 类型推导：`v.string().required().mobile()`
- **结构化错误**（`{ field, label, code, message, params }`），UI 可按 code / params 自由定制
- **跨字段一等公民**：`sameAs('pwd')`、`differentFrom('oldPwd')`
- **条件校验**：`when(field, { is, then, otherwise })`
- **异步规则**：`customAsync` / `useAsync`，引擎自动判断走同步或异步路径
- **Vue 3 组合式 API**：响应式 `errors`、`validate`、`validateField`、`setError`、`reset`
- **框架无关核心**：纯 JS、Node、小程序、Vue 2.6+ 都能跑
- **插件机制**：`extend(name, factory)` 全局注册业务规则
- **30+ 内置规则**：手机号（大陆/国际）、邮箱、URL、含校验位的中国身份证、Luhn 银行卡、IPv4、HEX 颜色等
- **i18n**：内置 `zh-CN` / `en`，运行时可切换或扩展
- **轻量**：压缩 ~30 KB，ESM + CJS 双产物，完全 treeshakeable

## 安装

```bash
pnpm add dh-validator
# 或
npm install dh-validator
# 或
yarn add dh-validator
```

## 快速开始

```ts
import { v } from 'dh-validator'

const schema = v.object({
  mobile: v.string().required().mobile().label('手机号'),
  pwd:    v.string().required().lengthBetween(6, 20).label('密码'),
  pwd2:   v.string().required().sameAs('pwd', '两次密码不一致'),
  age:    v.number().integer().between(18, 60).optional(),
  agree:  v.boolean().equals(true, '请勾选用户协议'),
})

const r = schema.validate(form)
if (!r.success) console.log(r.firstError.message)
```

## Vue 3 组合式 API

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

  <button :disabled="hasError" @click="onSubmit">提交</button>
</template>
```

返回值：

| 属性 | 类型 | 说明 |
|---|---|---|
| `errors` | `Reactive<Record<string, string>>` | 字段 → 首条错误，UI 直接绑定 |
| `hasError` | `ComputedRef<boolean>` | 是否有任何字段存在错误 |
| `isValid` | `ComputedRef<boolean>` | hasError 的反向语义糖 |
| `validate` | `() => Promise<ValidateResult>` | 整表校验 |
| `validateField` | `(field) => Promise<ValidateResult>` | 单字段校验（输入实时校验） |
| `setError` | `(field, msg?) => void` | 手动写入或清除字段错误（远程接口失败回填） |
| `reset` | `() => void` | 清空所有错误 |

## 条件校验（`when`）

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

`is` 支持字面值（`===` 比较）或谓词函数 `(otherValue, ctx) => boolean`。

## 异步校验

```ts
const schema = v.object({
  username: v.string().required().min(3).customAsync(async (val) => {
    const exists = await api.checkUsername(val)
    return exists ? '用户名已被占用' : true
  }),
})

const r = await schema.validateAsync(form)
```

含异步规则的 schema **必须** 用 `validateAsync()` 而非 `validate()`。`useValidator()` 会自动判断走哪条路径。

## 插件机制（`extend`）

注册一次，全局可用。适合公司内部业务规则：

```ts
import { extend, v } from 'dh-validator'

extend('employeeId', (msg?: string) => (value) => {
  return /^E\d{6}$/.test(String(value)) || msg || '工号格式错误'
})

v.string().required().use('employeeId')
v.string().required().use('employeeId', '工号必须以 E 开头加 6 位数字')
```

享受 TS 智能提示（module augmentation）：

```ts
// validator.d.ts
import 'dh-validator'
declare module 'dh-validator' {
  interface StringSchema {
    employeeId(message?: string): this
  }
}
```

## 内置规则

| 分类 | 规则 |
|---|---|
| **通用** | `required` · `optional` · `nullable` |
| **字符串** | `min` · `max` · `length` · `lengthBetween` · `regex` · `oneOf` · `notIn` · `equals` |
| **数字** | `integer` · `gt` · `gte` · `lt` · `lte` · `between` · `positive` · `negative` |
| **业务格式** | `mobile`（大陆/国际） · `email` · `url` · `idCard`（含校验位） · `bankCard`（Luhn） · `zipCode` · `ipv4` · `hexColor` |
| **中文/字母** | `cn` · `cnNum` · `alpha` · `alphanumeric` |
| **跨字段** | `sameAs` · `differentFrom` · `when` |
| **数组** | `min` · `max` · `unique` · `each` · `uploading` · `uploadFailed` |
| **自定义** | `custom` · `customAsync` · `use`（通过 `extend` 注册） · `useAsync` |

## 错误结构

```ts
type ValidateResult<T> =
  | { success: true; data: T; errors: [] }
  | {
      success: false
      data: T
      errors: ValidateError[]                  // 全部错误（错误中心 UI）
      errorMap: Record<string, ValidateError>  // 字段 → 首条错误（按字段绑定 UI）
      firstError: ValidateError                // 整表第一条（toast 用）
    }

type ValidateError = {
  field: string                  // 'mobile' | 'address.city' | 'tags[0]'
  label: string                  // '手机号'
  code: string                   // 'required' | 'mobile' | 'min' | 'custom:xxx'
  message: string                // 已经过 {label} {min} 等模板替换
  params?: Record<string, any>   // 规则参数，供 UI 自定义渲染
}
```

## i18n 多语言

```ts
import { setLocale, addMessages } from 'dh-validator'

setLocale('en')  // 内置 'zh-CN' / 'en'，默认 'zh-CN'

addMessages('zh-CN', {
  mobile: '请输入正确的手机号',
})
```

错误消息支持 `{label}` `{min}` `{max}` `{otherLabel}` 等占位符。

## 框架无关用法（Vue 2 / 小程序 / Node）

```ts
import { createValidator, v } from 'dh-validator'

const schema = v.object({ /* ... */ })
const checker = createValidator(schema, () => formData)

const r = await checker.validate()
const msg = checker.getError('mobile')
```

不依赖 vue 包，Vue 2.6 及以下、小程序原生开发、Node 工具脚本都能用。

## 设计原则

1. **Schema 驱动** —— 校验作为独立 schema，与 UI 解耦
2. **结构化错误** —— `code / params / label / message` 四要素，UI 可任意定制
3. **跨字段与条件一等公民** —— 不靠手写 closure
4. **异步透明** —— 引擎自动判断 sync/async 路径
5. **抗 abortEarly 偏见** —— `required` / `type` 短路，其他规则累加错误一次显示
6. **可扩展** —— `custom` (实例) + `extend` (全局) 两层

## 常见问题

**Q1：链式 Schema 默认必填还是可选？**
默认必填（与 zod 对齐）。`.optional()` 显式声明可选。

**Q2：required 失败后，后续规则还会跑吗？**
不会。`required` / `type` 类规则带 `abortOnFail`，失败立即停止该字段后续规则。其他普通规则（如 `min` / `max` / `email`）失败后会继续累加错误，让用户一次看到所有问题。

**Q3：跨字段校验拿不到其他字段值？**
`sameAs` / `differentFrom` / `when` 通过 `ctx.rootData` 访问整张表单，要求把字段都放在同一个 `ObjectSchema` 下。

**Q4：远程接口校验后想标记某个字段失败？**
用 `useValidator` 返回的 `setError(field, message)` 手动回填错误，常见于"提交后发现重复"场景。

**Q5：Vue 2.6 及以下能用吗？**
`useValidator` 依赖 Vue 3 / Vue 2.7+ 的 Composition API；Vue 2.6 及以下用框架无关的 `createValidator`。

## 文档

- 🎮 [**在线演示**](https://dingh123.github.io/dh-validator/) — 可交互的 playground
- 🇬🇧 [README (English)](./README.md)
- 🇨🇳 [中文文档](./README.zh-CN.md)
- 📓 [Examples](./examples)
- 📜 [Changelog](./CHANGELOG.md)

## 贡献

欢迎 PR。`pnpm install` 后：

```bash
pnpm test          # 跑测试
pnpm test:watch    # watch 模式
pnpm test:cov      # 含覆盖率
pnpm lint          # eslint
pnpm format        # prettier
pnpm build         # tsup 构建 → dist/
pnpm changeset     # 写 changeset 用于下次发版
```

CI（GitHub Actions）每个 PR 跑 typecheck + lint + tests + build。

## License

[MIT](./LICENSE) © dinghui
