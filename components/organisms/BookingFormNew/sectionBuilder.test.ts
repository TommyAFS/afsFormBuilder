import { sections } from './sectionBuilder'
import { formConfig } from './formConfig'
import {
  GENDER_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from './configVars'
import {
  stubbedPersonalDetails,
  stubbedAdditionalDetails,
  stubbedEmergencyContact,
  stubbedGuarantor,
} from './test-data'
import countries from '../../molecules/FieldCountryAutocomplete/countries'
import { GuarantorRequirement } from '../../../types/GuarantorType'

type BuiltSections = ReturnType<typeof sections>

const sectionIds = (
  guarantorRequirement?: GuarantorRequirement,
  requiresEmergencyContact?: boolean
) =>
  sections(guarantorRequirement, requiresEmergencyContact).map(
    (section) => section.id
  )

const findSection = (builtSections: BuiltSections, id: string) =>
  builtSections.find((section) => section.id === id)!

const labelFor = (
  builtSections: BuiltSections,
  sectionId: string,
  fieldId: string
) =>
  findSection(builtSections, sectionId).fields.find(
    (field) => field.id === fieldId
  )!.label

const fieldIds = (builtSections: BuiltSections, sectionId: string) =>
  findSection(builtSections, sectionId).fields.map((field) => field.id)

const configField = (sectionId: string, fieldId: string) =>
  formConfig
    .find((section) => section.id === sectionId)!
    .fields.find((field) => field.id === fieldId)!

const guarantorLabelConfig = configField('guarantor', 'hasGuarantor')
  .label as Record<string, string>

const genderLabel = GENDER_OPTIONS.find(
  (option) => option.value === stubbedAdditionalDetails.gender
)!.label

const yearOfStudyLabel = YEAR_OF_STUDY_OPTIONS.find(
  (option) => option.value === stubbedAdditionalDetails.yearOfStudy
)!.label

const relationshipLabel = RELATIONSHIP_OPTIONS.find(
  (option) => option.value === stubbedEmergencyContact.relationship
)!.label

const guarantorRelationshipLabel = RELATIONSHIP_OPTIONS.find(
  (option) => option.value === stubbedGuarantor.relationship
)!.label

const countryName = (code: string) =>
  countries.find((country) => country.code === code)!.name

describe('sections', () => {
  describe('section set per guarantor requirement and emergency contact requirement', () => {
    it('returns all four sections by default', () => {
      expect(sectionIds(undefined, undefined)).toEqual([
        'personal',
        'additional',
        'emergency',
        'guarantor',
      ])
    })

    it('returns all four sections for a uk requirement with emergency contact', () => {
      expect(sectionIds('uk', true)).toEqual([
        'personal',
        'additional',
        'emergency',
        'guarantor',
      ])
    })

    it('returns all four sections for an international requirement with emergency contact', () => {
      expect(sectionIds('international', true)).toEqual([
        'personal',
        'additional',
        'emergency',
        'guarantor',
      ])
    })

    it('drops the guarantor section for a notRequired requirement with emergency contact', () => {
      expect(sectionIds('notRequired', true)).toEqual([
        'personal',
        'additional',
        'emergency',
      ])
    })

    it('drops the emergency section for a uk requirement without emergency contact', () => {
      expect(sectionIds('uk', false)).toEqual([
        'personal',
        'additional',
        'guarantor',
      ])
    })

    it('drops the emergency section for an international requirement without emergency contact', () => {
      expect(sectionIds('international', false)).toEqual([
        'personal',
        'additional',
        'guarantor',
      ])
    })

    it('drops both emergency and guarantor for a notRequired requirement without emergency contact', () => {
      expect(sectionIds('notRequired', false)).toEqual([
        'personal',
        'additional',
      ])
    })
  })

  describe('label resolution', () => {
    it('uses the uk label for hasGuarantor when the requirement is uk', () => {
      const builtSections = sections('uk', true)
      expect(labelFor(builtSections, 'guarantor', 'hasGuarantor')).toBe(
        guarantorLabelConfig.uk
      )
    })

    it('uses the international label for hasGuarantor when the requirement is international', () => {
      const builtSections = sections('international', true)
      expect(labelFor(builtSections, 'guarantor', 'hasGuarantor')).toBe(
        guarantorLabelConfig.international
      )
    })

    it('falls back to the first label entry for hasGuarantor when no requirement is given', () => {
      const builtSections = sections(undefined, true)
      const firstLabel = Object.values(guarantorLabelConfig)[0]
      expect(labelFor(builtSections, 'guarantor', 'hasGuarantor')).toBe(
        firstLabel
      )
    })

    it('leaves plain string labels untouched', () => {
      const builtSections = sections('uk', true)
      expect(labelFor(builtSections, 'personal', 'firstName')).toBe(
        configField('personal', 'firstName').label
      )
      expect(labelFor(builtSections, 'additional', 'country')).toBe(
        configField('additional', 'country').label
      )
    })
  })

  describe('required flag derivation', () => {
    it('marks fields with a required validation rule as required', () => {
      const builtSections = sections('uk', true)
      const firstName = findSection(builtSections, 'personal').fields.find(
        (field) => field.id === 'firstName'
      )!
      expect(firstName.required).toBe(true)
    })

    it('marks fields without a required validation rule as not required', () => {
      const builtSections = sections('uk', true)
      const dob = findSection(builtSections, 'additional').fields.find(
        (field) => field.id === 'dob'
      )!
      expect(dob.required).toBe(false)
    })
  })

  describe('guarantor section transformation without emergency contact', () => {
    it('drops the guarantorSameAsEC field', () => {
      const builtSections = sections('uk', false)
      expect(fieldIds(builtSections, 'guarantor')).not.toContain(
        'guarantorSameAsEC'
      )
    })

    it('keeps the guarantor manual-detail fields', () => {
      const builtSections = sections('uk', false)
      const ids = fieldIds(builtSections, 'guarantor')
      expect(ids).toContain('hasGuarantor')
      expect(ids).toContain('guarantorRelationship')
      expect(ids).toContain('guarantorFirstName')
      expect(ids).toContain('guarantorLastName')
      expect(ids).toContain('guarantorEmail')
      expect(ids).toContain('guarantorPhone')
      expect(ids).toContain('guarantorDob')
      expect(ids).toContain('guarantorAddress')
    })

    it('keeps the guarantorSameAsEC field when emergency contact is required', () => {
      const builtSections = sections('uk', true)
      expect(fieldIds(builtSections, 'guarantor')).toContain(
        'guarantorSameAsEC'
      )
    })
  })

  describe('summarise', () => {
    it('summarises the personal section, concatenating first and last name', () => {
      const builtSections = sections('uk', true)
      const summary = findSection(builtSections, 'personal').summarise({
        firstName: stubbedPersonalDetails.firstName,
        lastName: stubbedPersonalDetails.lastName,
        email: stubbedPersonalDetails.email,
        phone: stubbedPersonalDetails.phone,
      })
      expect(summary).toEqual([
        `${stubbedPersonalDetails.firstName} ${stubbedPersonalDetails.lastName}`,
        stubbedPersonalDetails.email,
        stubbedPersonalDetails.phone,
      ])
    })

    it('falls back to just the first name when the last name is missing', () => {
      const builtSections = sections('uk', true)
      const summary = findSection(builtSections, 'personal').summarise({
        firstName: stubbedPersonalDetails.firstName,
        email: stubbedPersonalDetails.email,
        phone: stubbedPersonalDetails.phone,
      })
      expect(summary[0]).toBe(stubbedPersonalDetails.firstName)
    })

    it('summarises the additional section, resolving option labels and country name', () => {
      const builtSections = sections('uk', true)
      const summary = findSection(builtSections, 'additional').summarise({
        gender: stubbedAdditionalDetails.gender,
        country: stubbedAdditionalDetails.country,
        yearOfStudy: stubbedAdditionalDetails.yearOfStudy,
        university: stubbedAdditionalDetails.university,
        courseName: stubbedAdditionalDetails.courseName,
      })
      expect(summary).toContain(genderLabel)
      expect(summary).toContain(countryName(stubbedAdditionalDetails.country))
      expect(summary).toContain(yearOfStudyLabel)
      expect(summary).toContain(stubbedAdditionalDetails.university)
      expect(summary).toContain(stubbedAdditionalDetails.courseName)
    })

    it('falls back to the raw country code when the code is unknown', () => {
      const builtSections = sections('uk', true)
      const summary = findSection(builtSections, 'additional').summarise({
        gender: stubbedAdditionalDetails.gender,
        country: 'ZZ',
        yearOfStudy: stubbedAdditionalDetails.yearOfStudy,
      })
      expect(summary).toContain('ZZ')
    })

    it('summarises the emergency section, concatenating first and last name', () => {
      const builtSections = sections('uk', true)
      const summary = findSection(builtSections, 'emergency').summarise({
        ecRelationship: stubbedEmergencyContact.relationship,
        ecFirstName: stubbedEmergencyContact.firstName,
        ecLastName: stubbedEmergencyContact.lastName,
        ecEmail: stubbedEmergencyContact.email,
        ecPhone: stubbedEmergencyContact.phone,
      })
      expect(summary).toContain(relationshipLabel)
      expect(summary).toContain(
        `${stubbedEmergencyContact.firstName} ${stubbedEmergencyContact.lastName}`
      )
      expect(summary).toContain(stubbedEmergencyContact.email)
      expect(summary).toContain(stubbedEmergencyContact.phone)
    })

    it('summarises the guarantor section using guarantor-specific fields', () => {
      const builtSections = sections('uk', true)
      const summary = findSection(builtSections, 'guarantor').summarise({
        hasGuarantor: 'yes',
        guarantorSameAsEC: 'no',
        guarantorRelationship: stubbedGuarantor.relationship,
        guarantorFirstName: stubbedGuarantor.firstName,
        guarantorLastName: stubbedGuarantor.lastName,
        guarantorEmail: stubbedGuarantor.email,
        guarantorPhone: stubbedGuarantor.phone,
      })
      expect(summary).toContain(guarantorRelationshipLabel)
      expect(summary).toContain(
        `${stubbedGuarantor.firstName} ${stubbedGuarantor.lastName}`
      )
      expect(summary).toContain(stubbedGuarantor.email)
      expect(summary).toContain(stubbedGuarantor.phone)
    })

    it('returns only the No label when the user has no guarantor', () => {
      const builtSections = sections('uk', true)
      const noLabel = (
        configField('guarantor', 'hasGuarantor') as {
          options?: { value: string; label: string }[]
        }
      ).options!.find((option) => option.value === 'no')!.label
      const summary = findSection(builtSections, 'guarantor').summarise({
        hasGuarantor: 'no',
        guarantorSameAsEC: 'no',
        guarantorFirstName: stubbedGuarantor.firstName,
      })
      expect(summary).toEqual([noLabel])
    })

    it('summarises the emergency contact details when the guarantor is the same as the emergency contact', () => {
      const builtSections = sections('uk', true)
      const summary = findSection(builtSections, 'guarantor').summarise({
        hasGuarantor: 'yes',
        guarantorSameAsEC: 'yes',
        ecRelationship: stubbedEmergencyContact.relationship,
        ecFirstName: stubbedEmergencyContact.firstName,
        ecLastName: stubbedEmergencyContact.lastName,
        ecEmail: stubbedEmergencyContact.email,
      })
      const capitalisedRelationship = `${stubbedEmergencyContact.relationship[0].toUpperCase()}${stubbedEmergencyContact.relationship.slice(
        1
      )}`
      expect(summary).toEqual([
        capitalisedRelationship,
        `${stubbedEmergencyContact.firstName} ${stubbedEmergencyContact.lastName}`,
        stubbedEmergencyContact.email,
      ])
    })
  })
})
