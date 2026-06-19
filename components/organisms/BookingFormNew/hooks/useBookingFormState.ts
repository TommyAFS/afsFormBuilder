import { useRef } from 'react'

import { buildInitialState } from '../helpers/buildInitialState'
import { BookingFormInitialData } from '../helpers/bookingFormSerialisers'
import {
  saveSoftBookingProgress,
  SaveProgressResult,
  SoftBookingProgressPayload,
} from '../../../../api/BookingNew/softBookingApi'
import { BookingFormLoggingData } from '../types'
import { useBookingFormFields } from './useBookingFormFields'
import { useSectionProgress } from './useSectionProgress'
import { useBookingFormSubmission } from './useBookingFormSubmission'

interface UseBookingFormStateParams {
  onAdvancePageStep: (arg: number) => void
  currentPageStep: number
  correlationId: string | null
  pbsaId: number
  initialFormState: BookingFormInitialData | null
  loggingData?: BookingFormLoggingData
  onSubmitSuccess?: (
    payload: SoftBookingProgressPayload
  ) => boolean | void | Promise<boolean | void>
  save?: (payload: SoftBookingProgressPayload) => Promise<SaveProgressResult>
}

export const useBookingFormState = ({
  onAdvancePageStep,
  currentPageStep,
  correlationId,
  pbsaId,
  initialFormState,
  loggingData,
  onSubmitSuccess,
  save,
}: UseBookingFormStateParams) => {
  const bookingCorrelationId = useRef(
    correlationId ?? crypto.randomUUID()
  ).current

  const saveProgress =
    save ??
    ((payload: SoftBookingProgressPayload) =>
      saveSoftBookingProgress(bookingCorrelationId, pbsaId, payload))

  const initial = buildInitialState(initialFormState)

  const fields = useBookingFormFields(initial)

  const submission = useBookingFormSubmission({
    bookingCorrelationId,
    currentPageStep,
    guarantorRequirement: initialFormState?.guarantorRequirement,
    requiresEmergencyContact: initialFormState?.requiresEmergencyContact,
    formValues: fields.formValues,
    dobValues: fields.dobValues,
    addressValues: fields.addressValues,
    onAdvancePageStep,
    onSubmitSuccess,
  })

  const progress = useSectionProgress({
    initialCompletedIds: initial.completedIds,
    guarantorRequirement: initialFormState?.guarantorRequirement,
    requiresEmergencyContact: initialFormState?.requiresEmergencyContact,
    bookingCorrelationId,
    loggingData,
    saveProgress,
    formValues: fields.formValues,
    dobValues: fields.dobValues,
    addressValues: fields.addressValues,
    setErrors: fields.setErrors,
    setDobErrors: fields.setDobErrors,
    setManualAddressFieldErrors: fields.setManualAddressFieldErrors,
    resetSubmitState: submission.resetSubmitState,
  })

  return {
    formValues: fields.formValues,
    dobValues: fields.dobValues,
    addressValues: fields.addressValues,
    errors: fields.errors,
    dobErrors: fields.dobErrors,
    manualAddressFieldErrors: fields.manualAddressFieldErrors,
    completedIds: progress.completedIds,
    sectionLoading: progress.sectionLoading,
    isEditing: progress.isEditing,
    submitState: submission.submitState,
    submitFailureCount: submission.submitFailureCount,
    activeSectionIndex: progress.activeSectionIndex,
    isFormComplete: progress.isFormComplete,
    summaryValues: fields.summaryValues,
    handleEdit: progress.handleEdit,
    handleChange: fields.handleChange,
    handleContinue: progress.handleContinue,
    handleDobChange: fields.handleDobChange,
    addressHandlers: fields.addressHandlers,
    handleSubmit: submission.handleSubmit,
  }
}
