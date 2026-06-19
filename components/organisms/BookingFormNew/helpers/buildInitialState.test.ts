import { buildInitialState } from './buildInitialState'
import { SoftBookingProgressPayload } from '../../../../api/BookingNew/softBookingApi'
import {
  stubbedPersonalDetails,
  stubbedAdditionalDetails,
  stubbedEmergencyContact,
  stubbedGuarantor,
  stubbedProgressPayload,
} from '../test-data'
import { contactAddress } from '../../../../test/data/booking/contactAddress'

const formattedAddress = [
  contactAddress.line1,
  contactAddress.townCity,
  contactAddress.postcode,
]
  .filter(Boolean)
  .join(', ')

describe('buildInitialState', () => {
  describe('with null booking data', () => {
    it('returns empty form values', () => {
      expect(buildInitialState(null).formValues).toEqual({})
    })

    it('returns empty dob values', () => {
      expect(buildInitialState(null).dobValues).toEqual({})
    })

    it('returns empty address values', () => {
      expect(buildInitialState(null).addressValues).toEqual({})
    })

    it('returns no completed steps', () => {
      expect(buildInitialState(null).completedIds).toEqual([])
    })
  })

  describe('with personalDetails only', () => {
    const bookingData: SoftBookingProgressPayload = {
      personalDetails: stubbedProgressPayload.personalDetails,
    }

    it('populates personal form values', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(formValues.firstName).toBe(stubbedPersonalDetails.firstName)
      expect(formValues.lastName).toBe(stubbedPersonalDetails.lastName)
      expect(formValues.email).toBe(stubbedPersonalDetails.email)
      expect(formValues.phone).toBe(stubbedPersonalDetails.phone)
    })

    it('splits a stored E.164 phone into the national number and country code', () => {
      const { formValues } = buildInitialState({
        personalDetails: {
          ...stubbedProgressPayload.personalDetails!,
          phone: '+447758443617',
        },
      })
      expect(formValues.phone).toBe('07758443617')
      expect(formValues['phone.countryCode']).toBe('GB')
    })

    it('marks the personal step as completed', () => {
      expect(buildInitialState(bookingData).completedIds).toEqual(['personal'])
    })

    it('returns no dob values', () => {
      expect(buildInitialState(bookingData).dobValues).toEqual({})
    })
  })

  describe('with additionalDetails', () => {
    const additionalWithoutOptionals: SoftBookingProgressPayload['additionalDetails'] =
      {
        dateOfBirth: stubbedProgressPayload.additionalDetails!.dateOfBirth,
        gender: stubbedAdditionalDetails.gender,
        country: stubbedAdditionalDetails.country,
        address: contactAddress,
        yearOfStudy: stubbedAdditionalDetails.yearOfStudy,
      }
    const bookingData: SoftBookingProgressPayload = {
      personalDetails: stubbedProgressPayload.personalDetails,
      additionalDetails: additionalWithoutOptionals,
    }

    it('populates additional form values', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(formValues.gender).toBe(stubbedAdditionalDetails.gender)
      expect(formValues.country).toBe(stubbedAdditionalDetails.country)
      expect(formValues.yearOfStudy).toBe(stubbedAdditionalDetails.yearOfStudy)
    })

    it('populates address form value as a formatted string', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(formValues.address).toBe(formattedAddress)
    })

    it('populates address values with the ContactAddress object', () => {
      const { addressValues } = buildInitialState(bookingData)
      expect(addressValues.address).toEqual(contactAddress)
    })

    it('parses the UTC dob into day, month, year', () => {
      expect(buildInitialState(bookingData).dobValues.dob).toEqual({
        day: stubbedAdditionalDetails.dobDay,
        month: stubbedAdditionalDetails.dobMonth,
        year: stubbedAdditionalDetails.dobYear,
      })
    })

    it('marks personal and additional steps as completed', () => {
      expect(buildInitialState(bookingData).completedIds).toEqual([
        'personal',
        'additional',
      ])
    })

    it('omits optional university and courseName when absent', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(Object.keys(formValues)).not.toContain('university')
      expect(Object.keys(formValues)).not.toContain('courseName')
    })

    it('includes optional university and courseName when present', () => {
      const { formValues } = buildInitialState({
        personalDetails: stubbedProgressPayload.personalDetails,
        additionalDetails: stubbedProgressPayload.additionalDetails,
      })
      expect(formValues.university).toBe(stubbedAdditionalDetails.university)
      expect(formValues.courseName).toBe(stubbedAdditionalDetails.courseName)
    })
  })

  describe('with emergencyContact', () => {
    const bookingData: SoftBookingProgressPayload = {
      personalDetails: stubbedProgressPayload.personalDetails,
      additionalDetails: stubbedProgressPayload.additionalDetails,
      emergencyContact: stubbedProgressPayload.emergencyContact,
    }

    it('populates emergency contact form values using ec-prefixed field ids', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(formValues.ecRelationship).toBe(
        stubbedEmergencyContact.relationship
      )
      expect(formValues.ecFirstName).toBe(stubbedEmergencyContact.firstName)
      expect(formValues.ecLastName).toBe(stubbedEmergencyContact.lastName)
      expect(formValues.ecEmail).toBe(stubbedEmergencyContact.email)
      expect(formValues.ecPhone).toBe(stubbedEmergencyContact.phone)
      expect(formValues.ecCountry).toBe(stubbedEmergencyContact.country)
    })

    it('populates ecAddress as a formatted string', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(formValues.ecAddress).toBe(formattedAddress)
    })

    it('populates ecAddress in addressValues with the ContactAddress object', () => {
      const { addressValues } = buildInitialState(bookingData)
      expect(addressValues.ecAddress).toEqual(contactAddress)
    })

    it('parses the emergency contact UTC dob into day, month, year', () => {
      expect(buildInitialState(bookingData).dobValues.ecDob).toEqual({
        day: stubbedEmergencyContact.dobDay,
        month: stubbedEmergencyContact.dobMonth,
        year: stubbedEmergencyContact.dobYear,
      })
    })

    it('marks personal, additional, and emergency steps as completed', () => {
      expect(buildInitialState(bookingData).completedIds).toEqual([
        'personal',
        'additional',
        'emergency',
      ])
    })
  })

  describe('with guarantor', () => {
    const bookingData: SoftBookingProgressPayload = {
      personalDetails: stubbedProgressPayload.personalDetails,
      additionalDetails: stubbedProgressPayload.additionalDetails,
      emergencyContact: stubbedProgressPayload.emergencyContact,
      guarantor: stubbedProgressPayload.guarantor,
    }

    it('populates guarantor form values using guarantor-prefixed field ids', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(formValues.guarantorRelationship).toBe(
        stubbedGuarantor.relationship
      )
      expect(formValues.guarantorFirstName).toBe(stubbedGuarantor.firstName)
      expect(formValues.guarantorEmail).toBe(stubbedGuarantor.email)
    })

    it('parses the guarantor UTC dob into day, month, year', () => {
      expect(buildInitialState(bookingData).dobValues.guarantorDob).toEqual({
        day: stubbedGuarantor.dobDay,
        month: stubbedGuarantor.dobMonth,
        year: stubbedGuarantor.dobYear,
      })
    })

    it('marks all four steps as completed', () => {
      expect(buildInitialState(bookingData).completedIds).toEqual([
        'personal',
        'additional',
        'emergency',
        'guarantor',
      ])
    })

    it('restores the hasGuarantor and guarantorSameAsEC flags so the guarantor fields render', () => {
      const { formValues } = buildInitialState(bookingData)
      expect(formValues.hasGuarantor).toBe('yes')
      expect(formValues.guarantorSameAsEC).toBe('no')
    })

    it('does not add guarantorDob to dob values when absent', () => {
      const { dobValues } = buildInitialState({
        personalDetails: stubbedProgressPayload.personalDetails,
        additionalDetails: stubbedProgressPayload.additionalDetails,
        emergencyContact: stubbedProgressPayload.emergencyContact,
        guarantor: { relationship: 'parent' },
      })
      expect(Object.keys(dobValues)).not.toContain('guarantorDob')
    })
  })

  describe('with an invalid date string', () => {
    it('does not add the field to dob values', () => {
      const { dobValues } = buildInitialState({
        personalDetails: stubbedProgressPayload.personalDetails,
        additionalDetails: {
          ...stubbedProgressPayload.additionalDetails,
          dateOfBirth: 'not-a-date',
        },
      })
      expect(Object.keys(dobValues)).not.toContain('dob')
    })
  })
})
