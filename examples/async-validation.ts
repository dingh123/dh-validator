/**
 * Async validation: remote uniqueness check.
 */
import { v } from '../src'

// Pretend this hits an API
async function fakeCheckUsername(name: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 200))
  return ['admin', 'test', 'root'].includes(name)
}

const schema = v.object({
  username: v
    .string()
    .required()
    .min(3)
    .max(20)
    .label('Username')
    .customAsync(async (val) => {
      const exists = await fakeCheckUsername(val)
      return exists ? 'Username already taken' : true
    }),
})

;(async () => {
  console.log(await schema.validateAsync({ username: 'admin' }))
  console.log(await schema.validateAsync({ username: 'newcomer' }))
})()
