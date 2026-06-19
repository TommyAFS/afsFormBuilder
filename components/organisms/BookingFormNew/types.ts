import { ReactNode } from 'react'
import ContactAddress from '../../../types/ContactAddress'
import BookingFormRoomDetails from '../../../types/BookingFormRoomDetails'
import { BookingSummaryContract } from '../../../types/Contract'
import BookingFormOrigin from '../../../constants/types/BookingFormOrigin'
import { FieldId } from './formConfig'
import { SectionDefinition } from './sectionBuilder'
import type { DateErrors } from './components/FieldDateOfBirth/date.validation'
import { GuarantorRequirement } from '../../../types/GuarantorType'

export interface BookingFormLoggingData {
  roomDetails: BookingFormRoomDetails
  roomId: number
  contract: BookingSummaryContract
  origin: BookingFormOrigin
  campaign?: string
}

export type DateOfBirthValue = { day: string; month: string; year: string }

export type PersonalDetails = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

export type AdditionalDetails = {
  dob?: string
  gender?: string
  country?: string
  address?: string
  yearOfStudy?: string
  university?: string
  courseName?: string
}

export type EmergencyContact = {
  ecRelationship?: string
  ecFirstName?: string
  ecLastName?: string
  ecEmail?: string
  ecPhone?: string
  ecCountry?: string
  ecDob?: string
  ecAddress?: string
}

export type Guarantor = {
  hasGuarantor?: string
  guarantorSameAsEC?: string
  guarantorRelationship?: string
  guarantorFirstName?: string
  guarantorLastName?: string
  guarantorEmail?: string
  guarantorPhone?: string
  guarantorCountry?: string
  guarantorDob?: string
  guarantorAddress?: string
}

export type BookingFormState = {
  personalDetails: PersonalDetails
  additionalDetails: AdditionalDetails
  emergencyContact: EmergencyContact
  guarantor: Guarantor
}

export type AddressHandlers = {
  onSelect: (fieldId: string, address: ContactAddress) => void
  onClear: (fieldId: string) => void
  onClearError: (fieldId: string) => void
  onFieldChange: (
    fieldId: string,
    field: keyof ContactAddress,
    value: string
  ) => void
}

export type SubmitState = { status: 'idle' } | { status: 'loading' }

export type ValidationRule = {
  required?: string
  pattern?: { value: RegExp; message: string }
}

// FIELD/STEP TYPES
export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'dob'
  | 'country'
  | 'address'

export type FieldConfig = {
  id: FieldId
  label: string | Record<string, string>
  subTitle?: string
  type: FieldType
  inline?: boolean
  autoComplete?: string
  options?: { value: string; label: string }[]
  validation?: ValidationRule
  visibleWhen?: (values: Record<string, string>) => boolean
}

export type SubTitleConfig = {
  content: ReactNode
  overlayContent: ReactNode
}

export type SectionConfig = {
  id: string
  label: string
  subTitle?: Partial<Record<GuarantorRequirement, SubTitleConfig>>
  fields: FieldConfig[]
}

export type ActiveSectionProps = {
  section: SectionDefinition
  isEditing: boolean
  values: Record<string, string>
  errors: Record<string, string>
  onChange: (fieldId: string, value: string) => void
  onContinue: () => void
  onEdit: (fromIndex: number) => void
  sectionLoading: boolean
  dobValues: Record<string, DateOfBirthValue>
  onDobChange: (fieldId: string, value: DateOfBirthValue) => void
  dobErrors: Record<string, DateErrors>
  addressValues: Record<string, ContactAddress>
  manualAddressFieldErrors: Record<
    string,
    Partial<Record<keyof ContactAddress, { message?: string }>>
  >
  addressHandlers: AddressHandlers
}
