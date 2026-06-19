import { useRef, useState } from 'react'
import * as Sentry from '@sentry/nextjs'

import { buildFullBookingData } from '../helpers/bookingProgressPayload'
import { SoftBookingProgressPayload } from '../../../../api/BookingNew/softBookingApi'

import ContactAddress from '../../../../types/ContactAddress'
import { GuarantorRequirement } from '../../../../types/GuarantorType'
import { DateOfBirthValue, SubmitState } from '../types'

interface UseBookingFormSubmissionParams {
  bookingCorrelationId: string
  currentPageStep: number
  guarantorRequirement?: GuarantorRequirement
  requiresEmergencyContact?: boolean
  formValues: Record<string, string>
  dobValues: Record<string, DateOfBirthValue>
  addressValues: Record<string, ContactAddress>
  onAdvancePageStep: (arg: number) => void
  onSubmitSuccess?: (
    payload: SoftBookingProgressPayload
  ) => boolean | void | Promise<boolean | void>
}

export const useBookingFormSubmission = ({
  bookingCorrelationId,
  currentPageStep,
  guarantorRequirement,
  requiresEmergencyContact,
  formValues,
  dobValues,
  addressValues,
  onAdvancePageStep,
  onSubmitSuccess,
}: UseBookingFormSubmissionParams) => {
  const isSubmittingRef = useRef(false)
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
  })
  const [submitFailureCount, setSubmitFailureCount] = useState(0)

  const resetSubmitState = () => setSubmitState({ status: 'idle' })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setSubmitState({ status: 'loading' })

    const payload = buildFullBookingData(formValues, dobValues, addressValues, {
      guarantorRequirement,
      requiresEmergencyContact,
    })

    const registerSubmitFailure = () => {
      setSubmitFailureCount((count) => count + 1)
      isSubmittingRef.current = false
      setSubmitState({ status: 'idle' })
    }

    try {
      const succeeded = await onSubmitSuccess?.(payload)

      if (succeeded === false) {
        registerSubmitFailure()
        return
      }

      setSubmitFailureCount(0)
      onAdvancePageStep(currentPageStep + 1)
      window.scrollTo({ top: 0 })
      isSubmittingRef.current = false
      setSubmitState({ status: 'idle' })
    } catch (error) {
      Sentry.captureException(error, {
        tags: { 'booking.action': 'submit' },
        extra: { correlationId: bookingCorrelationId },
      })
      registerSubmitFailure()
    }
  }

  return {
    submitState,
    submitFailureCount,
    resetSubmitState,
    handleSubmit,
  }
}
