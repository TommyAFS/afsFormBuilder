import countries from '../../molecules/FieldCountryAutocomplete/countries'
import { formConfig, type SectionId } from './formConfig'
import { FieldConfig, SectionConfig, SubTitleConfig } from './types'
import { GuarantorRequirement } from '../../../types/GuarantorType'
import { capitaliseFirstWord } from '../../../utils/formatting/capitaliseFirstWord'

export type FieldDefinition = Omit<FieldConfig, 'validation' | 'label'> & {
  label: string
  required?: boolean
}

export type SectionDefinition = {
  id: SectionId
  label: string
  subTitle?: SubTitleConfig
  fields: FieldDefinition[]
  summarise: (values: Record<string, string>) => string[]
}

function resolveFieldLabel(field: FieldDefinition, value: string): string {
  if ((field.type === 'select' || field.type === 'radio') && field.options) {
    return (
      field.options.find((option) => option.value === value)?.label ?? value
    )
  }
  return value ?? ''
}

function concatenateFirstAndLastName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(' ')
}

function summariseField(
  field: FieldDefinition,
  values: Record<string, string>
): string {
  if (field.id === 'firstName')
    return concatenateFirstAndLastName(values.firstName, values.lastName)
  if (field.id === 'ecFirstName')
    return concatenateFirstAndLastName(values.ecFirstName, values.ecLastName)
  if (field.id === 'guarantorFirstName')
    return concatenateFirstAndLastName(
      values.guarantorFirstName,
      values.guarantorLastName
    )

  if (field.type === 'country')
    return (
      countries.find((country) => country.code === values[field.id])?.name ??
      values[field.id]
    )
  return resolveFieldLabel(field, values[field.id])
}

function makeSummary(fields: FieldDefinition[]) {
  const fieldsToSummarise = fields.filter(
    (field) =>
      !field.id.includes('LastName') &&
      field.id !== 'lastName' &&
      field.id !== 'hasGuarantor' &&
      field.id !== 'guarantorSameAsEC'
  )
  const hasGuarantorField = fields.find((field) => field.id === 'hasGuarantor')

  return (values: Record<string, string>) => {
    if (hasGuarantorField) {
      if (values.hasGuarantor === 'no') {
        return [
          resolveFieldLabel(hasGuarantorField, values.hasGuarantor),
        ].filter(Boolean)
      }

      if (values.guarantorSameAsEC === 'yes') {
        return [
          capitaliseFirstWord(values.ecRelationship),
          concatenateFirstAndLastName(values.ecFirstName, values.ecLastName),
          values.ecEmail,
        ].filter(Boolean)
      }
    }
    return fieldsToSummarise
      .map((field) => summariseField(field, values))
      .filter(Boolean)
  }
}

function resolveSubTitle(
  subTitle: SectionConfig['subTitle'],
  guarantorRequirement?: GuarantorRequirement
): SubTitleConfig | undefined {
  if (!subTitle) return undefined
  return guarantorRequirement ? subTitle[guarantorRequirement] : undefined
}

function guarantorWithManualDetailsOnly(section: SectionConfig): SectionConfig {
  return {
    ...section,
    fields: section.fields
      .filter((field) => field.id !== 'guarantorSameAsEC')
      .map((field) =>
        field.visibleWhen
          ? { ...field, visibleWhen: (values) => values.hasGuarantor === 'yes' }
          : field
      ),
  }
}

function getConfiguredSections(
  guarantorRequirement?: GuarantorRequirement,
  requiresEmergencyContact: boolean = true
): SectionConfig[] {
  let configuredSections: SectionConfig[] = formConfig

  if (guarantorRequirement === 'notRequired') {
    configuredSections = configuredSections.filter(
      (section) => section.id !== 'guarantor'
    )
  }

  if (!requiresEmergencyContact) {
    configuredSections = configuredSections
      .filter((section) => section.id !== 'emergency')
      .map((section) =>
        section.id === 'guarantor'
          ? guarantorWithManualDetailsOnly(section)
          : section
      )
  }

  return configuredSections
}

export function sections(
  guarantorRequirement?: GuarantorRequirement,
  requiresEmergencyContact: boolean = true
): SectionDefinition[] {
  return getConfiguredSections(
    guarantorRequirement,
    requiresEmergencyContact
  ).map((section) => {
    const fields: FieldDefinition[] = section.fields.map(
      ({ validation, ...field }) => ({
        ...field,
        label:
          typeof field.label === 'string'
            ? field.label
            : (field.label[guarantorRequirement!] ??
              Object.values(field.label)[0]),
        required: !!validation?.required,
      })
    )
    const subTitle = resolveSubTitle(section.subTitle, guarantorRequirement)
    return {
      ...section,
      id: section.id as SectionId,
      subTitle,
      fields,
      summarise: makeSummary(fields),
    }
  })
}
