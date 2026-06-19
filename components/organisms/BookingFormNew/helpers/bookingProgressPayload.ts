import {
  FormValues,
  DobKey,
  AddressKey,
  JourneyConfig,
  serialiseAllDobsToUtc,
  toE164Phone,
  sanitise,
  sanitiseAddress,
} from './bookingFormSerialisers'
import {
  SoftBookingProgressPayload,
  PersonalDetailsPayload,
  AdditionalDetailsPayload,
  EmergencyContactPayload,
  GuarantorPayload,
} from '../../../../api/BookingNew/softBookingApi'
import SelectedGuarantorOption, {
  GuarantorRequirement,
} from '../../../../types/GuarantorType'
import ContactAddress from '../../../../types/ContactAddress'
import { DateOfBirthValue } from '../types'
import { type SectionId } from '../formConfig'

const buildPersonalDetails = (
  formValues: FormValues
): PersonalDetailsPayload => ({
  firstName: sanitise(formValues.firstName),
  lastName: sanitise(formValues.lastName),
  email: sanitise(formValues.email),
  phone: toE164Phone(formValues, 'phone'),
})

const buildAdditionalDetails = (
  formValues: FormValues,
  utcDobValues: Record<string, string>,
  addressValues: Partial<Record<AddressKey, ContactAddress>>
): AdditionalDetailsPayload => ({
  dateOfBirth: utcDobValues.dob,
  gender: formValues.gender,
  country: formValues.country,
  address: sanitiseAddress(addressValues.address),
  yearOfStudy: formValues.yearOfStudy,
  university: sanitise(formValues.university),
  courseName: sanitise(formValues.courseName),
})

const buildEmergencyContact = (
  formValues: FormValues,
  utcDobValues: Record<string, string>,
  addressValues: Partial<Record<AddressKey, ContactAddress>>,
  requiresEmergencyContact: boolean
): EmergencyContactPayload | null => {
  if (!requiresEmergencyContact) return null

  return {
    relationship: formValues.ecRelationship,
    firstName: sanitise(formValues.ecFirstName),
    lastName: sanitise(formValues.ecLastName),
    email: sanitise(formValues.ecEmail),
    phone: toE164Phone(formValues, 'ecPhone'),
    country: sanitise(addressValues.ecAddress?.country),
    dateOfBirth: utcDobValues.ecDob,
    address: sanitiseAddress(addressValues.ecAddress),
  }
}

const buildGuarantor = (
  formValues: FormValues,
  utcDobValues: Record<string, string>,
  addressValues: Partial<Record<AddressKey, ContactAddress>>,
  guarantorRequirement?: GuarantorRequirement
): GuarantorPayload => {
  if (guarantorRequirement === 'notRequired') return null
  if (formValues.hasGuarantor !== 'yes') return null

  const sameAsEC = formValues.guarantorSameAsEC === 'yes'

  return {
    relationship: sameAsEC
      ? formValues.ecRelationship
      : formValues.guarantorRelationship,
    firstName: sanitise(
      sameAsEC ? formValues.ecFirstName : formValues.guarantorFirstName
    ),
    lastName: sanitise(
      sameAsEC ? formValues.ecLastName : formValues.guarantorLastName
    ),
    email: sanitise(sameAsEC ? formValues.ecEmail : formValues.guarantorEmail),
    phone: toE164Phone(formValues, sameAsEC ? 'ecPhone' : 'guarantorPhone'),
    country: sanitise(
      sameAsEC
        ? addressValues.ecAddress?.country
        : addressValues.guarantorAddress?.country
    ),
    dateOfBirth: sameAsEC ? utcDobValues.ecDob : utcDobValues.guarantorDob,
    address: sanitiseAddress(
      sameAsEC ? addressValues.ecAddress : addressValues.guarantorAddress
    ),
  }
}

export const buildSectionBookingData = (
  stepId: SectionId,
  formValues: FormValues,
  dobValues: Partial<Record<DobKey, DateOfBirthValue>>,
  addressValues: Partial<Record<AddressKey, ContactAddress>>,
  journey: JourneyConfig = {}
): SoftBookingProgressPayload => {
  const utcDobValues = serialiseAllDobsToUtc(dobValues)
  const requiresEmergencyContact = journey.requiresEmergencyContact ?? true
  switch (stepId) {
    case 'personal':
      return { personalDetails: buildPersonalDetails(formValues) }
    case 'additional':
      return {
        additionalDetails: buildAdditionalDetails(
          formValues,
          utcDobValues,
          addressValues
        ),
      }
    case 'emergency':
      return {
        emergencyContact: buildEmergencyContact(
          formValues,
          utcDobValues,
          addressValues,
          requiresEmergencyContact
        ),
      }
    case 'guarantor':
      return {
        guarantor: buildGuarantor(
          formValues,
          utcDobValues,
          addressValues,
          journey.guarantorRequirement
        ),
      }
  }
}

export const buildFullBookingData = (
  formValues: FormValues,
  dobValues: Partial<Record<DobKey, DateOfBirthValue>>,
  addressValues: Partial<Record<AddressKey, ContactAddress>>,
  journey: JourneyConfig = {}
): SoftBookingProgressPayload => {
  const utcDobValues = serialiseAllDobsToUtc(dobValues)
  return {
    personalDetails: buildPersonalDetails(formValues),
    additionalDetails: buildAdditionalDetails(
      formValues,
      utcDobValues,
      addressValues
    ),
    emergencyContact: buildEmergencyContact(
      formValues,
      utcDobValues,
      addressValues,
      journey.requiresEmergencyContact ?? true
    ),
    guarantorType: formValues.guarantorType as
      | SelectedGuarantorOption
      | undefined,
    guarantor: buildGuarantor(
      formValues,
      utcDobValues,
      addressValues,
      journey.guarantorRequirement
    ),
  }
}
