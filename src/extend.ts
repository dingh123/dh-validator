import type { RuleFn } from './types'

/** 已注册的全局规则工厂表 */
const registry: Record<string, (...args: any[]) => RuleFn> = {}

/**
 * 注册一条全局自定义规则，注册后可通过 .use(name, ...args) 在任何 schema 上调用。
 *
 * @example
 * extend('employeeId', (message) => (value) => {
 *   return /^E\d{6}$/.test(String(value)) ? true : message ?? '工号格式错误'
 * })
 *
 * v.string().required().use('employeeId')
 * v.string().required().use('employeeId', '工号必须以 E 开头')
 *
 * // 想要 IDE 类型提示，配合 module augmentation：
 * declare module '@/uni_modules/dh-validator' {
 *   interface StringSchema {
 *     employeeId(message?: string): this
 *   }
 * }
 */
export function extend(name: string, factory: (...args: any[]) => RuleFn): void {
  if (registry[name]) {
    console.warn(`[dh-validator] 规则 "${name}" 已注册，将被覆盖`)
  }
  registry[name] = factory
}

/** 内部：取注册表中的工厂函数 */
export function getRegisteredRule(name: string): ((...args: any[]) => RuleFn) | undefined {
  return registry[name]
}

/** 取消注册一条规则（测试或动态卸载场景） */
export function unextend(name: string): void {
  delete registry[name]
}

/** 列出所有已注册规则名（用于调试） */
export function listExtensions(): string[] {
  return Object.keys(registry)
}
