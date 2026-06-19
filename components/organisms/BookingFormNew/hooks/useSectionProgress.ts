import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import * as Sentry from '@sentry/nextjs'

import { SectionDefinition, sections } from '../sectionBuilder'
import { type SectionId } from '../formConfig'
import { buildSectionBookingData } from '../helpers/bookingProgressPayload'
import {
  validateStep,
  validateDobErrors,
  validateContactAddress,
} from '../helpers/validation'
import type { DateErrors } from '../components/FieldDateOfBirth/date.validation'
import { EMPTY_ADDRESS } from '../components/BookingFormAddressSection'
import {
  SaveProgressResult,
  SoftBookingProgressPayload,
} from '../../../../api/BookingNew/softBookingApi'
import { logCompleteBookingFormStepEvent } from '../../../../logging/booking.logging'
import { testVariantForLogging } from '../../../../hooks/useAbTest/exAfs006.config'

import ContactAddress from '../../../../types/ContactAddress'
import { GuarantorRequirement } from '../../../../types/GuarantorType'
import { BookingFormLoggingData, DateOfBirthValue } from '../types'
import { ManualAddressFieldErrors } from './useBookingFormFields'

interface UseSectionProgressParams {
  initialCompletedIds: SectionId[]
  guarantorRequirement?: GuarantorRequirement
  requiresEmergencyContact?: boolean
  bookingCorrelationId: string
  loggingData?: BookingFormLoggingData
  saveProgress: (
    payload: SoftBookingProgressPayload
  ) => Promise<SaveProgressResult>
  formValues: Record<string, string>
  dobValues: Record<string, DateOfBirthValue>
  addressValues: Record<string, ContactAddress>
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
  setDobErrors: Dispatch<SetStateAction<Record<string, DateErrors>>>
  setManualAddressFieldErrors: Dispatch<
    SetStateAction<ManualAddressFieldErrors>
  >
  resetSubmitState: () => void
}

export const useSectionProgress = ({
  initialCompletedIds,
  guarantorRequirement,
  requiresEmergencyContact,
  bookingCorrelationId,
  loggingData,
  saveProgress,
  formValues,
  dobValues,
  addressValues,
  setErrors,
  setDobErrors,
  setManualAddressFieldErrors,
  resetSubmitState,
}: UseSectionProgressParams) => {
  const [completedIds, setCompletedIds] =
    useState<SectionId[]>(initialCompletedIds)
  const [sectionLoading, setSectionLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const activeSectionIndex = sections(
    guarantorRequirement,
    requiresEmergencyContact
  ).findIndex((section) => !completedIds.includes(section.id))
  const isFormComplete = activeSectionIndex === -1

  const handleEdit = (fromIndex: number) => {
    const sectionToEdit = sections(
      guarantorRequirement,
      requiresEmergencyContact
    )[fromIndex]
    setCompletedIds((prev) => prev.filter((id) => id !== sectionToEdit.id))
    resetSubmitState()
    setIsEditing(true)
  }

  const handleContinue = async (
    section: SectionDefinition
  ): Promise<string | null> => {
    const sectionErrors = validateStep(
      section,
      formValues,
      dobValues,
      addressValues
    )
    setErrors((prev) => ({ ...prev, ...sectionErrors }))
    setDobErrors((prev) => ({
      ...prev,
      ...validateDobErrors(section, dobValues),
    }))

    const newManualAddressFieldErrors: ManualAddressFieldErrors = {}
    for (const field of section.fields) {
      if (field.type === 'address') {
        const address = addressValues[field.id]
        newManualAddressFieldErrors[field.id] = validateContactAddress(
          address ?? EMPTY_ADDRESS
        )
      }
    }
    setManualAddressFieldErrors((prev) => ({
      ...prev,
      ...newManualAddressFieldErrors,
    }))

    const firstErrorField =
      Object.entries(sectionErrors).find(([, message]) => !!message)?.[0] ??
      null
    if (firstErrorField) return firstErrorField

    setSectionLoading(true)

    const payload = buildSectionBookingData(
      section.id,
      formValues,
      dobValues,
      addressValues,
      {
        guarantorRequirement,
        requiresEmergencyContact,
      }
    )

    const result = await saveProgress(payload)

    setSectionLoading(false)
    setIsEditing(false)

    if (result.status === 'saved') {
      Sentry.addBreadcrumb({
        category: 'booking',
        message: `Step completed: ${section.id}`,
        data: { correlationId: bookingCorrelationId },
        level: 'info',
      })

      if (loggingData) {
        const allSections = sections(
          guarantorRequirement,
          requiresEmergencyContact
        )
        const sectionIndex = allSections.findIndex((s) => s.id === section.id)
        logCompleteBookingFormStepEvent({
          roomDetails: loggingData.roomDetails,
          roomId: loggingData.roomId,
          contract: loggingData.contract,
          origin: loggingData.origin,
          campaign: loggingData.campaign,
          stepNumber: sectionIndex + 1,
          stepName: section.label,
          abTest: testVariantForLogging,
        })
      }
    } else {
      Sentry.captureException(
        new Error(`Soft booking progress save failed: ${result.status}`),
        {
          tags: {
            'booking.step': section.id,
            'booking.action': 'progress',
          },
          extra: { correlationId: bookingCorrelationId },
        }
      )
    }

    const blocksCompletion =
      result.status === 'stale' || result.status === 'notFound'
    if (blocksCompletion) return null

    setCompletedIds((prev) => [...prev, section.id])
    return null
  }

  return {
    completedIds,
    sectionLoading,
    isEditing,
    activeSectionIndex,
    isFormComplete,
    handleEdit,
    handleContinue,
  }
}
