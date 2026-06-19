import {
  buildSectionBookingData,
  buildFullBookingData,
} from './bookingProgressPayload'
import {
  stubbedPersonalDetails,
  stubbedAdditionalDetails,
  stubbedEmergencyContact,
  stubbedGuarantor,
  stubbedProgressPayload,
} from '../test-data'
import { contactAddress } from '../../../../test/data/booking/contactAddress'
import InternationalPhoneNumber from '../../../../models/InternationalPhoneNumber'

const toE164 = (phone: string) =>
  new InternationalPhoneNumber(phone, 'GB').toE164Format()

describe('buildSectionBookingData', () => {
  const formValues = {
    firstName: stubbedPersonalDetails.firstName,
    lastName: stubbedPersonalDetails.lastName,
    email: stubbedPersonalDetails.email,
    phone: stubbedPersonalDetails.phone,
    gender: stubbedAdditionalDetails.gender,
    country: stubbedAdditionalDetails.country,
    yearOfStudy: stubbedAdditionalDetails.yearOfStudy,
    university: stubbedAdditionalDetails.university,
    courseName: stubbedAdditionalDetails.courseName,
    ecRelationship: stubbedEmergencyContact.relationship,
    ecFirstName: stubbedEmergencyContact.firstName,
    ecLastName: stubbedEmergencyContact.lastName,
    ecEmail: stubbedEmergencyContact.email,
    ecPhone: stubbedEmergencyContact.phone,
    ecCountry: stubbedEmergencyContact.country,
    hasGuarantor: 'yes',
    guarantorSameAsEC: 'no',
    guarantorRelationship: stubbedGuarantor.relationship,
    guarantorFirstName: stubbedGuarantor.firstName,
    guarantorLastName: stubbedGuarantor.lastName,
    guarantorEmail: stubbedGuarantor.email,
    guarantorPhone: stubbedGuarantor.phone,
    guarantorCountry: stubbedGuarantor.country,
  }
  const dobValues = {
    dob: {
      day: stubbedAdditionalDetails.dobDay,
      month: stubbedAdditionalDetails.dobMonth,
      year: stubbedAdditionalDetails.dobYear,
    },
    ecDob: {
      day: stubbedEmergencyContact.dobDay,
      month: stubbedEmergencyContact.dobMonth,
      year: stubbedEmergencyContact.dobYear,
    },
    guarantorDob: {
      day: stubbedGuarantor.dobDay,
      month: stubbedGuarantor.dobMonth,
      year: stubbedGuarantor.dobYear,
    },
  }
  const addressValues = {
    address: contactAddress,
    ecAddress: contactAddress,
    guarantorAddress: contactAddress,
  }

  describe('personal step', () => {
    it('returns personalDetails with the form values', () => {
      const result = buildSectionBookingData(
        'personal',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.personalDetails).toEqual({
        firstName: stubbedPersonalDetails.firstName,
        lastName: stubbedPersonalDetails.lastName,
        email: stubbedPersonalDetails.email,
        phone: toE164(stubbedPersonalDetails.phone),
      })
    })

    it('does not include other sections', () => {
      const result = buildSectionBookingData(
        'personal',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.additionalDetails).toBeUndefined()
      expect(result.emergencyContact).toBeUndefined()
      expect(result.guarantor).toBeUndefined()
    })
  })

  describe('additional step', () => {
    it('returns additionalDetails with dateOfBirth as a UTC ISO string', () => {
      const result = buildSectionBookingData(
        'additional',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.additionalDetails!.dateOfBirth).toBe(
        stubbedProgressPayload.additionalDetails!.dateOfBirth
      )
    })

    it('returns additionalDetails with the ContactAddress object for address', () => {
      const result = buildSectionBookingData(
        'additional',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.additionalDetails!.address).toEqual(contactAddress)
    })

    it('returns additionalDetails with gender, country, yearOfStudy, university, courseName', () => {
      const result = buildSectionBookingData(
        'additional',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.additionalDetails!.gender).toBe(
        stubbedAdditionalDetails.gender
      )
      expect(result.additionalDetails!.country).toBe(
        stubbedAdditionalDetails.country
      )
      expect(result.additionalDetails!.yearOfStudy).toBe(
        stubbedAdditionalDetails.yearOfStudy
      )
    })
  })

  describe('emergency step', () => {
    it('maps ec-prefixed form fields to unprefixed API fields', () => {
      const result = buildSectionBookingData(
        'emergency',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.emergencyContact!.relationship).toBe(
        stubbedEmergencyContact.relationship
      )
      expect(result.emergencyContact!.firstName).toBe(
        stubbedEmergencyContact.firstName
      )
      expect(result.emergencyContact!.lastName).toBe(
        stubbedEmergencyContact.lastName
      )
      expect(result.emergencyContact!.email).toBe(stubbedEmergencyContact.email)
      expect(result.emergencyContact!.phone).toBe(
        toE164(stubbedEmergencyContact.phone)
      )
    })

    it('derives emergency contact country from the address country', () => {
      const result = buildSectionBookingData(
        'emergency',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.emergencyContact!.country).toBe(contactAddress.country)
    })

    it('returns emergency contact dateOfBirth as a UTC ISO string', () => {
      const result = buildSectionBookingData(
        'emergency',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.emergencyContact!.dateOfBirth).toBe(
        stubbedProgressPayload.emergencyContact!.dateOfBirth
      )
    })

    it('returns the ContactAddress object for emergency contact address', () => {
      const result = buildSectionBookingData(
        'emergency',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.emergencyContact!.address).toEqual(contactAddress)
    })
  })

  describe('guarantor step', () => {
    it('uses guarantor-specific fields when guarantorSameAsEC is no', () => {
      const result = buildSectionBookingData(
        'guarantor',
        formValues,
        dobValues,
        addressValues
      )
      expect(result.guarantor!.relationship).toBe(stubbedGuarantor.relationship)
      expect(result.guarantor!.firstName).toBe(stubbedGuarantor.firstName)
      expect(result.guarantor!.email).toBe(stubbedGuarantor.email)
      expect(result.guarantor!.country).toBe(contactAddress.country)
    })

    it('uses EC fields when guarantorSameAsEC is yes', () => {
      const result = buildSectionBookingData(
        'guarantor',
        { ...formValues, guarantorSameAsEC: 'yes' },
        dobValues,
        addressValues
      )
      expect(result.guarantor!.relationship).toBe(
        stubbedEmergencyContact.relationship
      )
      expect(result.guarantor!.firstName).toBe(
        stubbedEmergencyContact.firstName
      )
      expect(result.guarantor!.address).toEqual(contactAddress)
    })

    it('returns a null guarantor when the user has no guarantor', () => {
      const result = buildSectionBookingData(
        'guarantor',
        { ...formValues, hasGuarantor: 'no' },
        dobValues,
        addressValues
      )
      expect(result.guarantor).toBeNull()
    })
  })
})

describe('buildFullBookingData', () => {
  const formValues = {
    firstName: stubbedPersonalDetails.firstName,
    lastName: stubbedPersonalDetails.lastName,
    email: stubbedPersonalDetails.email,
    phone: stubbedPersonalDetails.phone,
    gender: stubbedAdditionalDetails.gender,
    country: stubbedAdditionalDetails.country,
    yearOfStudy: stubbedAdditionalDetails.yearOfStudy,
    university: stubbedAdditionalDetails.university,
    courseName: stubbedAdditionalDetails.courseName,
    ecRelationship: stubbedEmergencyContact.relationship,
    ecFirstName: stubbedEmergencyContact.firstName,
    ecLastName: stubbedEmergencyContact.lastName,
    ecEmail: stubbedEmergencyContact.email,
    ecPhone: stubbedEmergencyContact.phone,
    ecCountry: stubbedEmergencyContact.country,
    hasGuarantor: 'yes',
    guarantorSameAsEC: 'no',
    guarantorRelationship: stubbedGuarantor.relationship,
    guarantorFirstName: stubbedGuarantor.firstName,
    guarantorLastName: stubbedGuarantor.lastName,
    guarantorEmail: stubbedGuarantor.email,
    guarantorPhone: stubbedGuarantor.phone,
    guarantorCountry: stubbedGuarantor.country,
  }
  const dobValues = {
    dob: {
      day: stubbedAdditionalDetails.dobDay,
      month: stubbedAdditionalDetails.dobMonth,
      year: stubbedAdditionalDetails.dobYear,
    },
    ecDob: {
      day: stubbedEmergencyContact.dobDay,
      month: stubbedEmergencyContact.dobMonth,
      year: stubbedEmergencyContact.dobYear,
    },
    guarantorDob: {
      day: stubbedGuarantor.dobDay,
      month: stubbedGuarantor.dobMonth,
      year: stubbedGuarantor.dobYear,
    },
  }
  const addressValues = {
    address: contactAddress,
    ecAddress: contactAddress,
    guarantorAddress: contactAddress,
  }

  it('includes all four sections', () => {
    const result = buildFullBookingData(formValues, dobValues, addressValues)
    expect(result.personalDetails).toBeDefined()
    expect(result.additionalDetails).toBeDefined()
    expect(result.emergencyContact).toBeDefined()
    expect(result.guarantor).toBeDefined()
  })

  it('personal details match form values', () => {
    const result = buildFullBookingData(formValues, dobValues, addressValues)
    expect(result.personalDetails!.firstName).toBe(
      stubbedPersonalDetails.firstName
    )
    expect(result.personalDetails!.email).toBe(stubbedPersonalDetails.email)
  })

  it('additional details address is a ContactAddress object', () => {
    const result = buildFullBookingData(formValues, dobValues, addressValues)
    expect(result.additionalDetails!.address).toEqual(contactAddress)
  })

  it('emergency contact uses unprefixed API fields', () => {
    const result = buildFullBookingData(formValues, dobValues, addressValues)
    expect(result.emergencyContact!.relationship).toBe(
      stubbedEmergencyContact.relationship
    )
    expect(result.emergencyContact!.firstName).toBe(
      stubbedEmergencyContact.firstName
    )
  })

  it('guarantor uses guarantor-specific fields when guarantorSameAsEC is no', () => {
    const result = buildFullBookingData(formValues, dobValues, addressValues)
    expect(result.guarantor!.firstName).toBe(stubbedGuarantor.firstName)
  })

  it('sends a null guarantor when the user has no guarantor', () => {
    const result = buildFullBookingData(
      { ...formValues, hasGuarantor: 'no' },
      dobValues,
      addressValues
    )
    expect(result.guarantor).toBeNull()
  })

  it('sends a null emergency contact when the journey does not require one', () => {
    const result = buildFullBookingData(formValues, dobValues, addressValues, {
      requiresEmergencyContact: false,
    })
    expect(result.emergencyContact).toBeNull()
  })

  it('sends a null guarantor when the journey does not require one', () => {
    const result = buildFullBookingData(formValues, dobValues, addressValues, {
      guarantorRequirement: 'notRequired',
    })
    expect(result.guarantor).toBeNull()
  })
})
