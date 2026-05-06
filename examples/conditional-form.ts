/**
 * Conditional validation: branch by another field's value.
 */
import { v } from '../src'

const schema = v.object({
  userType: v.string().required().oneOf(['personal', 'enterprise']).label('User type'),

  idCard: v.string().when('userType', {
    is: 'personal',
    then: v.string().required().idCard().label('ID card'),
    otherwise: v.string().optional(),
  }),

  bizLicense: v.string().when('userType', {
    is: 'enterprise',
    then: v.string().required().lengthBetween(15, 20).label('Business license'),
    otherwise: v.string().optional(),
  }),

  invoiceTitle: v.string().when('userType', {
    is: (type) => type === 'enterprise',
    then: v.string().required().label('Invoice title'),
    otherwise: v.string().optional(),
  }),
})

// personal user — only idCard required
console.log(
  schema.validate({
    userType: 'personal',
    idCard: '11010519491231002X',
    bizLicense: '',
    invoiceTitle: '',
  }),
)

// enterprise user — bizLicense + invoiceTitle required
console.log(
  schema.validate({
    userType: 'enterprise',
    idCard: '',
    bizLicense: '91110000123456789X',
    invoiceTitle: 'Acme Corp.',
  }),
)
