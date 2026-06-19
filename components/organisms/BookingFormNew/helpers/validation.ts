import { z } from 'zod'
import InternationalPhoneNumber from '../../../../models/InternationalPhoneNumber'
import { FieldId, formConfig } from '../formConfig'
import { FieldDefinition, SectionDefinition } from '../sectionBuilder'
import { DateOfBirthValue, ValidationRule } from '../types'
import ContactAddress from '../../../../types/ContactAddress'
import {
  MAX_YEAR_OF_BIRTH_FOR_AN_ADULT,
  MAX_YEAR_OF_BIRTH_FOR_STUDENT,
  MIN_YEAR_OF_BIRTH,
} from '../../../../constants/ages'
import {
  validateDateOfBirth,
  type DateErrors,
} from '../components/FieldDateOfBirth/date.validation'

export const validationRules: Partial<Record<FieldId, ValidationRule>> =
  Object.fromEntries(
    formConfig.flatMap((step) =>
      step.fields
        .filter((field) => field.validation)
        .map((field) => [field.id, field.validation!])
    )
  )

export const EMAIL_SCHEMA = z
  .string()
  .email('Please enter a valid email address')

export function validatePhone(
  phoneNumber: string,
  countryCode: string
): string {
  if (!new InternationalPhoneNumber(phoneNumber, countryCode).isValid())
    return 'Please enter a valid phone number'
  return ''
}

export const EMPTY_DOB: DateOfBirthValue = { day: '', month: '', year: '' }

export const validate = (fieldId: FieldId, value: string) => {
  const rule = validationRules[fieldId]
  if (!rule) return ''

  const trimmed = value.trim()

  if (rule.required && !trimmed) return rule.required

  if (rule.pattern && !rule.pattern.value.test(trimmed))
    return rule.pattern.message

  return ''
}

export const validatePhoneField = (
  fieldId: FieldId,
  values: Record<string, string>
) => {
  const rule = validationRules[fieldId]
  const phoneNumber = values[fieldId] ?? ''
  const countryCode = values[`${fieldId}.countryCode`] ?? 'GB'
  if (!phoneNumber) return rule?.required ?? ''

  return validatePhone(phoneNumber, countryCode)
}

export const validateContactAddress = (
  address: ContactAddress
): Partial<Record<keyof ContactAddress, { message?: string }>> => {
  const errors: Partial<Record<keyof ContactAddress, { message?: string }>> = {}
  if (!address.line1.trim())
    errors.line1 = { message: 'Please enter first line of address' }
  if (!address.townCity.trim())
    errors.townCity = { message: 'Please enter a town / city' }
  if (!address.country.trim())
    errors.country = { message: 'Please enter a country of residence' }
  return errors
}

export const validateField = (
  field: FieldDefinition,
  formValues: Record<string, string>,
  dobValues: Record<string, DateOfBirthValue>,
  addressValues: Record<string, ContactAddress>
): string => {
  if (field.type === 'email') {
    const required = validationRules[field.id]?.required
    const trimmed = (formValues[field.id] ?? '').trim()
    if (required && !trimmed) return required
    const result = EMAIL_SCHEMA.safeParse(trimmed)
    return result.success ? '' : result.error.issues[0].message
  }

  if (field.type === 'dob') {
    const isStudentDob = field.id === 'dob'
    const result = validateDateOfBirth(dobValues[field.id] ?? EMPTY_DOB, {
      minYearOfBirth: MIN_YEAR_OF_BIRTH,
      maxYearOfBirth: isStudentDob
        ? MAX_YEAR_OF_BIRTH_FOR_STUDENT
        : MAX_YEAR_OF_BIRTH_FOR_AN_ADULT,
      contactType: isStudentDob ? 'student' : 'guarantor',
    })
    return result.isValid
      ? ''
      : result.errors.day || result.errors.month || result.errors.year || ''
  }

  if (field.type === 'address') {
    const address = addressValues[field.id]
    if (field.required && !address)
      return validationRules[field.id]?.required ?? ''
    if (address && Object.keys(validateContactAddress(address)).length > 0)
      return validationRules[field.id]?.required ?? ''
    return ''
  }

  if (field.type === 'tel') {
    return validatePhoneField(field.id, formValues)
  }

  return validate(field.id, formValues[field.id] ?? '')
}

export const validateDobErrors = (
  currentSection: SectionDefinition,
  dobValues: Record<string, DateOfBirthValue>
): Record<string, DateErrors> => {
  const result: Record<string, DateErrors> = {}
  for (const field of currentSection.fields) {
    if (field.type !== 'dob') continue
    const isStudentDob = field.id === 'dob'
    const { errors, isValid } = validateDateOfBirth(
      dobValues[field.id] ?? EMPTY_DOB,
      {
        minYearOfBirth: MIN_YEAR_OF_BIRTH,
        maxYearOfBirth: isStudentDob
          ? MAX_YEAR_OF_BIRTH_FOR_STUDENT
          : MAX_YEAR_OF_BIRTH_FOR_AN_ADULT,
        contactType: isStudentDob ? 'student' : 'guarantor',
      }
    )
    result[field.id] = isValid ? {} : errors
  }
  return result
}

export const validateStep = (
  currentSection: SectionDefinition,
  formValues: Record<string, string>,
  dobValues: Record<string, DateOfBirthValue>,
  addressValues: Record<string, ContactAddress>
): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const field of currentSection.fields) {
    if (field.visibleWhen && !field.visibleWhen(formValues)) continue
    errors[field.id] = validateField(
      field,
      formValues,
      dobValues,
      addressValues
    )
  }

  return errors
}
