import {
  validatePhone,
  validate,
  validatePhoneField,
  validateContactAddress,
  validateField,
  validateDobErrors,
  validateStep,
  EMPTY_DOB,
} from './validation'
import { sections } from '../sectionBuilder'
import ContactAddress from '../../../../types/ContactAddress'
import {
  stubbedPersonalDetails,
  stubbedAdditionalDetails,
  stubbedEmergencyContact,
  stubbedGuarantor,
} from '../test-data'
import { contactAddress } from '../../../../test/data/booking/contactAddress'

const ukSections = sections('uk')
const internationalSections = sections('international')

const findSection = (sectionList: ReturnType<typeof sections>, id: string) =>
  sectionList.find((section) => section.id === id)!

const findField = (sectionList: ReturnType<typeof sections>, fieldId: string) =>
  sectionList
    .flatMap((section) => section.fields)
    .find((field) => field.id === fieldId)!

const studentDob = {
  day: stubbedAdditionalDetails.dobDay,
  month: stubbedAdditionalDetails.dobMonth,
  year: stubbedAdditionalDetails.dobYear,
}

const emergencyDob = {
  day: stubbedEmergencyContact.dobDay,
  month: stubbedEmergencyContact.dobMonth,
  year: stubbedEmergencyContact.dobYear,
}

const guarantorDob = {
  day: stubbedGuarantor.dobDay,
  month: stubbedGuarantor.dobMonth,
  year: stubbedGuarantor.dobYear,
}

const validFormValues: Record<string, string> = {
  firstName: stubbedPersonalDetails.firstName,
  lastName: stubbedPersonalDetails.lastName,
  email: stubbedPersonalDetails.email,
  phone: stubbedPersonalDetails.phone,
  'phone.countryCode': 'GB',
  gender: stubbedAdditionalDetails.gender,
  country: stubbedAdditionalDetails.country,
  address: 'formatted address',
  yearOfStudy: stubbedAdditionalDetails.yearOfStudy,
  university: stubbedAdditionalDetails.university,
  courseName: stubbedAdditionalDetails.courseName,
  ecRelationship: stubbedEmergencyContact.relationship,
  ecFirstName: stubbedEmergencyContact.firstName,
  ecLastName: stubbedEmergencyContact.lastName,
  ecEmail: stubbedEmergencyContact.email,
  ecPhone: stubbedEmergencyContact.phone,
  'ecPhone.countryCode': 'GB',
  ecAddress: 'formatted address',
  hasGuarantor: 'yes',
  guarantorSameAsEC: 'no',
  guarantorRelationship: stubbedGuarantor.relationship,
  guarantorFirstName: stubbedGuarantor.firstName,
  guarantorLastName: stubbedGuarantor.lastName,
  guarantorEmail: stubbedGuarantor.email,
  guarantorPhone: stubbedGuarantor.phone,
  'guarantorPhone.countryCode': 'GB',
  guarantorAddress: 'formatted address',
}

const validDobValues = {
  dob: studentDob,
  ecDob: emergencyDob,
  guarantorDob,
}

const validAddressValues = {
  address: contactAddress,
  ecAddress: contactAddress,
  guarantorAddress: contactAddress,
}

describe('validatePhone', () => {
  it('returns no error for a valid phone number', () => {
    expect(validatePhone(stubbedPersonalDetails.phone, 'GB')).toBe('')
  })

  it('returns an error for an incomplete phone number', () => {
    expect(validatePhone('07', 'GB')).toBe('Please enter a valid phone number')
  })

  it('returns an error for a garbage phone number', () => {
    expect(validatePhone('not-a-phone', 'GB')).toBe(
      'Please enter a valid phone number'
    )
  })

  it('returns an error for an empty phone number', () => {
    expect(validatePhone('', 'GB')).toBe('Please enter a valid phone number')
  })
})

describe('validate', () => {
  it('returns no error for a populated required field', () => {
    expect(validate('firstName', stubbedPersonalDetails.firstName)).toBe('')
  })

  it('returns the required message for an empty required field', () => {
    const requiredMessage = findField(ukSections, 'firstName')
    expect(validate('firstName', '')).toBe('Please enter first name')
    expect(requiredMessage.required).toBe(true)
  })

  it('returns the required message for a whitespace-only required field', () => {
    expect(validate('firstName', '   ')).toBe('Please enter first name')
  })

  it('trims surrounding whitespace before checking a populated value', () => {
    expect(
      validate('firstName', `  ${stubbedPersonalDetails.firstName}  `)
    ).toBe('')
  })

  it('returns no error for a field id without a validation rule', () => {
    expect(validate('dob', '')).toBe('')
  })
})

describe('validatePhoneField', () => {
  it('returns no error for a valid phone number', () => {
    expect(
      validatePhoneField('phone', {
        phone: stubbedPersonalDetails.phone,
        'phone.countryCode': 'GB',
      })
    ).toBe('')
  })

  it('falls back to the GB country code when none is provided', () => {
    expect(
      validatePhoneField('phone', { phone: stubbedPersonalDetails.phone })
    ).toBe('')
  })

  it('returns the required message when the phone number is empty', () => {
    expect(validatePhoneField('phone', {})).toBe('Please enter phone number')
  })

  it('returns the invalid message for a garbage phone number', () => {
    expect(
      validatePhoneField('phone', {
        phone: 'not-a-phone',
        'phone.countryCode': 'GB',
      })
    ).toBe('Please enter a valid phone number')
  })
})

describe('validateContactAddress', () => {
  it('returns no errors for a complete address', () => {
    expect(validateContactAddress(contactAddress)).toEqual({})
  })

  it('returns an error when line1 is missing', () => {
    const errors = validateContactAddress({ ...contactAddress, line1: '' })
    expect(errors.line1).toEqual({
      message: 'Please enter first line of address',
    })
  })

  it('returns an error when line1 is whitespace-only', () => {
    const errors = validateContactAddress({ ...contactAddress, line1: '   ' })
    expect(errors.line1).toEqual({
      message: 'Please enter first line of address',
    })
  })

  it('returns an error when townCity is missing', () => {
    const errors = validateContactAddress({ ...contactAddress, townCity: '' })
    expect(errors.townCity).toEqual({ message: 'Please enter a town / city' })
  })

  it('returns an error when country is missing', () => {
    const errors = validateContactAddress({ ...contactAddress, country: '' })
    expect(errors.country).toEqual({
      message: 'Please enter a country of residence',
    })
  })

  it('returns errors for every missing required field at once', () => {
    const emptyAddress: ContactAddress = {
      line1: '',
      line2: '',
      line3: '',
      townCity: '',
      region: '',
      postcode: '',
      country: '',
    }
    expect(Object.keys(validateContactAddress(emptyAddress))).toEqual([
      'line1',
      'townCity',
      'country',
    ])
  })

  it('ignores optional address fields', () => {
    const errors = validateContactAddress({
      ...contactAddress,
      line2: '',
      line3: '',
      region: '',
      postcode: '',
    })
    expect(errors).toEqual({})
  })
})

describe('validateField', () => {
  describe('email fields', () => {
    const emailField = findField(ukSections, 'email')

    it('returns no error for a valid email address', () => {
      expect(
        validateField(
          emailField,
          validFormValues,
          validDobValues,
          validAddressValues
        )
      ).toBe('')
    })

    it('returns the required message for an empty email', () => {
      expect(
        validateField(
          emailField,
          { ...validFormValues, email: '' },
          validDobValues,
          validAddressValues
        )
      ).toBe('Please enter email address')
    })

    it('returns the required message for a whitespace-only email', () => {
      expect(
        validateField(
          emailField,
          { ...validFormValues, email: '   ' },
          validDobValues,
          validAddressValues
        )
      ).toBe('Please enter email address')
    })

    it('returns the invalid message for a malformed email', () => {
      expect(
        validateField(
          emailField,
          { ...validFormValues, email: 'jane@' },
          validDobValues,
          validAddressValues
        )
      ).toBe('Please enter a valid email address')
    })
  })

  describe('tel fields', () => {
    const phoneField = findField(ukSections, 'phone')

    it('returns no error for a valid phone number', () => {
      expect(
        validateField(
          phoneField,
          validFormValues,
          validDobValues,
          validAddressValues
        )
      ).toBe('')
    })

    it('returns the invalid message for a garbage phone number', () => {
      expect(
        validateField(
          phoneField,
          { ...validFormValues, phone: 'not-a-phone' },
          validDobValues,
          validAddressValues
        )
      ).toBe('Please enter a valid phone number')
    })

    it('returns the required message for an empty phone number', () => {
      expect(
        validateField(
          phoneField,
          { ...validFormValues, phone: '' },
          validDobValues,
          validAddressValues
        )
      ).toBe('Please enter phone number')
    })
  })

  describe('address fields', () => {
    const addressField = findField(ukSections, 'address')

    it('returns no error for a complete address', () => {
      expect(
        validateField(
          addressField,
          validFormValues,
          validDobValues,
          validAddressValues
        )
      ).toBe('')
    })

    it('returns the required message when the address is missing', () => {
      expect(
        validateField(addressField, validFormValues, validDobValues, {})
      ).toBe('Search address or enter address manually')
    })

    it('returns the required message when the address is incomplete', () => {
      expect(
        validateField(addressField, validFormValues, validDobValues, {
          ...validAddressValues,
          address: { ...contactAddress, line1: '' },
        })
      ).toBe('Search address or enter address manually')
    })
  })

  describe('dob fields', () => {
    const studentDobField = findField(ukSections, 'dob')
    const guarantorDobField = findField(internationalSections, 'guarantorDob')

    it('returns no error for a valid student date of birth', () => {
      expect(
        validateField(
          studentDobField,
          validFormValues,
          validDobValues,
          validAddressValues
        )
      ).toBe('')
    })

    it('returns no error for a valid guarantor date of birth', () => {
      expect(
        validateField(
          guarantorDobField,
          validFormValues,
          validDobValues,
          validAddressValues
        )
      ).toBe('')
    })

    it('returns an error when the date of birth is empty', () => {
      expect(
        validateField(
          studentDobField,
          validFormValues,
          { ...validDobValues, dob: EMPTY_DOB },
          validAddressValues
        )
      ).toBe('Please enter date of birth')
    })

    it('returns an error for an impossible date', () => {
      expect(
        validateField(
          studentDobField,
          validFormValues,
          { ...validDobValues, dob: { day: '32', month: '01', year: '2000' } },
          validAddressValues
        )
      ).toBe('Day must be a real date')
    })

    it('returns an error for a student who is too young', () => {
      const tooRecentYear = String(new Date().getFullYear())
      expect(
        validateField(
          studentDobField,
          validFormValues,
          {
            ...validDobValues,
            dob: { ...studentDob, year: tooRecentYear },
          },
          validAddressValues
        )
      ).not.toBe('')
    })

    it('returns the under-18 error for an underage guarantor', () => {
      const underageYear = String(new Date().getFullYear() - 17)
      expect(
        validateField(
          guarantorDobField,
          validFormValues,
          {
            ...validDobValues,
            guarantorDob: { ...guarantorDob, year: underageYear },
          },
          validAddressValues
        )
      ).toBe('Guarantor must be at least 18 years old')
    })
  })

  describe('plain text and select fields', () => {
    it('returns no error for a populated text field', () => {
      expect(
        validateField(
          findField(ukSections, 'firstName'),
          validFormValues,
          validDobValues,
          validAddressValues
        )
      ).toBe('')
    })

    it('returns the required message for an empty text field', () => {
      expect(
        validateField(
          findField(ukSections, 'firstName'),
          { ...validFormValues, firstName: '' },
          validDobValues,
          validAddressValues
        )
      ).toBe('Please enter first name')
    })

    it('returns the required message for an unselected select field', () => {
      expect(
        validateField(
          findField(ukSections, 'gender'),
          { ...validFormValues, gender: '' },
          validDobValues,
          validAddressValues
        )
      ).toBe('Please select gender')
    })
  })
})

describe('validateDobErrors', () => {
  it('returns no errors for a valid additional details date of birth', () => {
    const additionalSection = findSection(ukSections, 'additional')
    expect(validateDobErrors(additionalSection, validDobValues)).toEqual({
      dob: {},
    })
  })

  it('returns errors for an empty date of birth', () => {
    const additionalSection = findSection(ukSections, 'additional')
    const result = validateDobErrors(additionalSection, {
      ...validDobValues,
      dob: EMPTY_DOB,
    })
    expect(result.dob).toEqual({
      day: 'Please enter date of birth',
      month: '',
      year: '',
    })
  })

  it('ignores sections without a dob field', () => {
    const personalSection = findSection(ukSections, 'personal')
    expect(validateDobErrors(personalSection, validDobValues)).toEqual({})
  })
})

describe('validateStep', () => {
  it('returns no errors when every visible field in the personal step is valid', () => {
    const personalSection = findSection(ukSections, 'personal')
    const errors = validateStep(
      personalSection,
      validFormValues,
      validDobValues,
      validAddressValues
    )
    expect(Object.values(errors).every((message) => message === '')).toBe(true)
  })

  it('returns errors keyed by field id for invalid fields', () => {
    const personalSection = findSection(ukSections, 'personal')
    const errors = validateStep(
      personalSection,
      { ...validFormValues, firstName: '', email: 'jane@' },
      validDobValues,
      validAddressValues
    )
    expect(errors.firstName).toBe('Please enter first name')
    expect(errors.email).toBe('Please enter a valid email address')
    expect(errors.lastName).toBe('')
  })

  it('skips fields hidden by visibleWhen', () => {
    const guarantorSection = findSection(internationalSections, 'guarantor')
    const errors = validateStep(
      guarantorSection,
      { ...validFormValues, hasGuarantor: 'no' },
      validDobValues,
      validAddressValues
    )
    expect(Object.keys(errors)).toEqual(['hasGuarantor'])
    expect(errors.guarantorFirstName).toBeUndefined()
    expect(errors.guarantorSameAsEC).toBeUndefined()
  })

  it('validates the separate guarantor fields when guarantorSameAsEC is no', () => {
    const guarantorSection = findSection(internationalSections, 'guarantor')
    const errors = validateStep(
      guarantorSection,
      validFormValues,
      validDobValues,
      validAddressValues
    )
    expect(Object.keys(errors)).toContain('guarantorFirstName')
    expect(Object.values(errors).every((message) => message === '')).toBe(true)
  })

  it('skips the separate guarantor fields when the guarantor is the same as the emergency contact', () => {
    const guarantorSection = findSection(internationalSections, 'guarantor')
    const errors = validateStep(
      guarantorSection,
      { ...validFormValues, guarantorSameAsEC: 'yes', guarantorFirstName: '' },
      validDobValues,
      validAddressValues
    )
    expect(errors.guarantorFirstName).toBeUndefined()
    expect(errors.guarantorSameAsEC).toBe('')
  })
})

describe('journey configuration', () => {
  it('omits the guarantor section when no guarantor is required', () => {
    const sectionIds = sections('notRequired').map((section) => section.id)
    expect(sectionIds).not.toContain('guarantor')
  })

  it('omits the emergency section when no emergency contact is required', () => {
    const sectionIds = sections('uk', false).map((section) => section.id)
    expect(sectionIds).not.toContain('emergency')
  })

  it('drops the guarantorSameAsEC field when no emergency contact is required', () => {
    const guarantorSection = findSection(sections('uk', false), 'guarantor')
    const fieldIds = guarantorSection.fields.map((field) => field.id)
    expect(fieldIds).not.toContain('guarantorSameAsEC')
  })

  it('keeps the guarantor manual fields visible by hasGuarantor alone when no emergency contact is required', () => {
    const guarantorSection = findSection(sections('uk', false), 'guarantor')
    const errors = validateStep(
      guarantorSection,
      { ...validFormValues, hasGuarantor: 'yes', guarantorSameAsEC: '' },
      validDobValues,
      validAddressValues
    )
    expect(Object.keys(errors)).toContain('guarantorFirstName')
  })
})
