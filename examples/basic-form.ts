/**
 * Basic registration form with cross-field validation.
 */
import { v } from '../src'

const schema = v.object({
  mobile: v.string().required().mobile().label('Mobile'),
  pwd: v.string().required().lengthBetween(6, 20).label('Password'),
  pwd2: v.string().required().sameAs('pwd', "Passwords don't match"),
  age: v.number().integer().between(18, 60).optional().label('Age'),
  agree: v.boolean().equals(true, 'Please accept the terms').label('Terms'),
})

const form = {
  mobile: '13912345678',
  pwd: 'abcdef',
  pwd2: 'abcdef',
  age: 28,
  agree: true,
}

const r = schema.validate(form)
console.log('valid:', r.success)
if (!r.success) {
  console.log('first error:', r.firstError.message)
  console.log('all errors:', r.errors)
}
