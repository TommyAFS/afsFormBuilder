import {
  BookingFormInitialData,
  FormValues,
  DobKey,
  AddressKey,
  addDateOfBirth,
  assignPhoneFromE164,
  pickDefined,
  formatAddress,
} from './bookingFormSerialisers'
import ContactAddress from '../../../../types/ContactAddress'
import { DateOfBirthValue } from '../types'
import { type SectionId } from '../formConfig'

export const buildInitialState = (
  bookingData: BookingFormInitialData | null
): {
  formValues: FormValues
  dobValues: Partial<Record<DobKey, DateOfBirthValue>>
  addressValues: Partial<Record<AddressKey, ContactAddress>>
  completedIds: SectionId[]
} => {
  if (!bookingData)
    return {
      formValues: {},
      dobValues: {},
      addressValues: {},
      completedIds: [],
    }

  const formValues: FormValues = {}
  const dobValues: Partial<Record<DobKey, DateOfBirthValue>> = {}
  const addressValues: Partial<Record<AddressKey, ContactAddress>> = {}
  const completedIds: SectionId[] = []

  if (bookingData.personalDetails) {
    const { firstName, lastName, email, phone } = bookingData.personalDetails
    Object.assign(formValues, pickDefined({ firstName, lastName, email }))
    assignPhoneFromE164(formValues, 'phone', phone)
    completedIds.push('personal')
  }

  if (bookingData.additionalDetails) {
    const {
      dateOfBirth,
      gender,
      country,
      address,
      yearOfStudy,
      university,
      courseName,
    } = bookingData.additionalDetails
    Object.assign(
      formValues,
      pickDefined({ gender, country, yearOfStudy, university, courseName })
    )
    if (address) {
      addressValues.address = address
      formValues.address = formatAddress(address)
    }
    addDateOfBirth(dobValues, 'dob', dateOfBirth)
    completedIds.push('additional')
  }

  if (bookingData.emergencyContact) {
    const {
      relationship,
      firstName,
      lastName,
      email,
      phone,
      country,
      dateOfBirth,
      address,
    } = bookingData.emergencyContact
    Object.assign(
      formValues,
      pickDefined({
        ecRelationship: relationship,
        ecFirstName: firstName,
        ecLastName: lastName,
        ecEmail: email,
        ecCountry: country,
      })
    )
    assignPhoneFromE164(formValues, 'ecPhone', phone)
    if (address) {
      addressValues.ecAddress = address
      formValues.ecAddress = formatAddress(address)
    }
    addDateOfBirth(dobValues, 'ecDob', dateOfBirth)
    completedIds.push('emergency')
  }

  if (bookingData.guarantorRequirement) {
    formValues.guarantorType = bookingData.guarantorRequirement
  }

  if (bookingData.guarantor) {
    const {
      relationship,
      firstName,
      lastName,
      email,
      phone,
      country,
      dateOfBirth,
      address,
    } = bookingData.guarantor
    formValues.hasGuarantor = 'yes'
    formValues.guarantorSameAsEC = 'no'
    Object.assign(
      formValues,
      pickDefined({
        guarantorRelationship: relationship,
        guarantorFirstName: firstName,
        guarantorLastName: lastName,
        guarantorEmail: email,
        guarantorCountry: country,
      })
    )
    assignPhoneFromE164(formValues, 'guarantorPhone', phone)
    if (address) {
      addressValues.guarantorAddress = address
      formValues.guarantorAddress = formatAddress(address)
    }
    if (dateOfBirth) addDateOfBirth(dobValues, 'guarantorDob', dateOfBirth)
    completedIds.push('guarantor')
  }

  return { formValues, dobValues, addressValues, completedIds }
}
