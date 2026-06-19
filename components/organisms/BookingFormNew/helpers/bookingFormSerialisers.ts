import DOMPurify from 'dompurify'

import InternationalPhoneNumber from '../../../../models/InternationalPhoneNumber'
import {
  PersonalDetailsPayload,
  AdditionalDetailsPayload,
  EmergencyContactPayload,
  GuarantorPayload,
} from '../../../../api/BookingNew/softBookingApi'
import { GuarantorRequirement } from '../../../../types/GuarantorType'
import ContactAddress from '../../../../types/ContactAddress'
import { DateOfBirthValue } from '../types'
import { type FieldId } from '../formConfig'

export interface BookingFormInitialData {
  personalDetails?: PersonalDetailsPayload
  additionalDetails?: AdditionalDetailsPayload
  emergencyContact?: EmergencyContactPayload | null
  guarantor?: GuarantorPayload
  guarantorRequirement?: GuarantorRequirement
  requiresEmergencyContact?: boolean
}

export type DobKey = 'dob' | 'ecDob' | 'guarantorDob'
export type AddressKey = 'address' | 'ecAddress' | 'guarantorAddress'
export type PhoneFieldId = 'phone' | 'ecPhone' | 'guarantorPhone'
export type FormValues = Partial<
  Record<FieldId | 'guarantorType' | `${PhoneFieldId}.countryCode`, string>
>
export type JourneyConfig = Pick<
  BookingFormInitialData,
  'guarantorRequirement' | 'requiresEmergencyContact'
>

const DEFAULT_PHONE_COUNTRY = 'GB'

const parseDateOfBirth = (utcString: string): DateOfBirthValue | null => {
  const date = new Date(utcString)
  if (Number.isNaN(date.getTime())) return null
  return {
    day: String(date.getUTCDate()).padStart(2, '0'),
    month: String(date.getUTCMonth() + 1).padStart(2, '0'),
    year: String(date.getUTCFullYear()),
  }
}

export const addDateOfBirth = (
  dobValues: Partial<Record<DobKey, DateOfBirthValue>>,
  fieldId: DobKey,
  utcString: string | undefined
) => {
  if (!utcString) return
  const parsed = parseDateOfBirth(utcString)
  if (parsed) dobValues[fieldId] = parsed
}

export const pickDefined = (
  obj: Record<string, string | undefined>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(obj).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  )

export const formatAddress = (address: ContactAddress): string =>
  [address.line1, address.townCity, address.postcode].filter(Boolean).join(', ')

export const toE164Phone = (
  formValues: FormValues,
  phoneField: PhoneFieldId
): string => {
  const number = formValues[phoneField]
  if (!number) return ''
  const countryCode =
    formValues[`${phoneField}.countryCode`] ?? DEFAULT_PHONE_COUNTRY
  return new InternationalPhoneNumber(number, countryCode).toE164Format()
}

export const assignPhoneFromE164 = (
  formValues: FormValues,
  phoneField: PhoneFieldId,
  e164: string | undefined
): void => {
  if (!e164) return
  const parsed = InternationalPhoneNumber.fromE164(e164)
  if (parsed) {
    formValues[phoneField] = parsed.phoneNumber
    formValues[`${phoneField}.countryCode`] = parsed.countryCode
  } else {
    formValues[phoneField] = e164
  }
}

export const serialiseDob = (dob: DateOfBirthValue): string =>
  `${dob.day}/${dob.month}/${dob.year}`

export const serialiseAllDobs = (
  dobValues: Partial<Record<DobKey, DateOfBirthValue>>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(dobValues)
      .filter(
        (entry): entry is [string, DateOfBirthValue] => entry[1] !== undefined
      )
      .map(([id, dob]) => [id, serialiseDob(dob)])
  )

const serialiseDobToUtc = (dob: DateOfBirthValue): string =>
  new Date(
    Date.UTC(Number(dob.year), Number(dob.month) - 1, Number(dob.day))
  ).toISOString()

export const serialiseAllDobsToUtc = (
  dobValues: Partial<Record<DobKey, DateOfBirthValue>>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(dobValues)
      .filter(
        (entry): entry is [string, DateOfBirthValue] => entry[1] !== undefined
      )
      .map(([id, dob]) => [id, serialiseDobToUtc(dob)])
  )

export function sanitise(value: string): string
export function sanitise(value: string | undefined): string | undefined
export function sanitise(value: string | undefined): string | undefined {
  return value === undefined ? undefined : DOMPurify.sanitize(value)
}

export const sanitiseAddress = (
  address: ContactAddress | undefined
): ContactAddress | undefined =>
  address === undefined
    ? undefined
    : {
        line1: sanitise(address.line1),
        line2: sanitise(address.line2),
        line3: sanitise(address.line3),
        townCity: sanitise(address.townCity),
        region: sanitise(address.region),
        postcode: sanitise(address.postcode),
        country: sanitise(address.country),
      }
