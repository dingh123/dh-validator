# Changelog

All notable changes to this project will be documented here.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html);
versions are managed by [changesets](https://github.com/changesets/changesets).

## 1.0.0 (2026-05-06)

### 🎉 Initial release

A modern, type-safe form validation library — built from scratch with no legacy baggage.

#### Highlights

- **Chainable schema API** with full TypeScript inference: `v.string().required().mobile()`
- **Structured errors** (`{ field, label, code, message, params }`) — perfect for custom UIs and i18n
- **Cross-field & conditional** validation as first-class APIs: `sameAs`, `differentFrom`, `when`
- **Async rules** (`customAsync`) with automatic sync/async path detection
- **Vue 3 composable** (`useValidator`) + framework-agnostic core (`createValidator`)
- **Plugin system**: `extend(name, factory)` to register reusable business rules globally
- **30+ built-in rules**: mobile (CN/intl), email, URL, Chinese ID card with checksum, bank card with Luhn, IPv4, hex color, etc.
- **i18n**: built-in `zh-CN` / `en`, swap or extend at runtime
- **Tiny**: ~30 KB minified, ESM + CJS dual bundle, fully tree-shakeable

#### Compatibility

- **Frameworks**: Vue 2.7+ / Vue 3 / pure JS / pure TS
- **Runtimes**: browser / Node 18+ / mini-programs (WeChat, Alipay, ByteDance, ...) / HarmonyOS
- **Build**: tsup (esbuild) → ESM + CJS + d.ts

#### Coverage

77 tests, 85%+ statement coverage on core / rules / builders / when / extend / async modules.
