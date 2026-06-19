import { useEffect, useRef } from 'react'
import classNames from 'classnames'
import ButtonNew from '@afs/components/ButtonNew'

import ErrorMessage from '../../molecules/ErrorMessage'

import { sections } from './sectionBuilder'
import { SectionCard } from './components/SectionCard'
import { useBookingFormState } from './hooks/useBookingFormState'
import { BookingFormInitialData } from './helpers/bookingFormSerialisers'
import { BookingFormLoggingData } from './types'
import {
  SaveProgressResult,
  SoftBookingProgressPayload,
} from '../../../api/BookingNew/softBookingApi'
import { retryEscalationCopy } from '../../../constants/retryEscalationCopy'

import styles from './styles.module.scss'

export type { BookingFormLoggingData }

export interface BookingFormNewProps {
  className?: string
  onAdvancePageStep: (arg: number) => void
  currentPageStep: number
  correlationId: string | null
  pbsaId: number
  initialFormState: BookingFormInitialData | null
  loggingData?: BookingFormLoggingData
  onSubmitSuccess?: (
    payload: SoftBookingProgressPayload
  ) => boolean | void | Promise<boolean | void>
  onContactSupport: () => void
  submitButtonLabel?: string
  save?: (payload: SoftBookingProgressPayload) => Promise<SaveProgressResult>
}

const BookingFormNew = ({
  className,
  onAdvancePageStep,
  currentPageStep,
  correlationId,
  pbsaId,
  initialFormState,
  loggingData,
  onSubmitSuccess,
  onContactSupport,
  submitButtonLabel = 'Continue to pay deposit',
  save,
}: BookingFormNewProps) => {
  const {
    formValues,
    dobValues,
    addressValues,
    errors,
    dobErrors,
    manualAddressFieldErrors,
    completedIds,
    sectionLoading,
    isEditing,
    submitState,
    submitFailureCount,
    activeSectionIndex,
    isFormComplete,
    summaryValues,
    handleEdit,
    handleChange,
    handleContinue,
    handleDobChange,
    addressHandlers,
    handleSubmit,
  } = useBookingFormState({
    onAdvancePageStep,
    currentPageStep,
    correlationId,
    pbsaId,
    initialFormState,
    loggingData,
    onSubmitSuccess,
    save,
  })

  const submitButtonRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const hasMounted = useRef(false)
  const isResumingBooking = useRef(completedIds.length > 0)

  useEffect(() => {
    const isInitialRender = !hasMounted.current
    hasMounted.current = true

    if (isInitialRender && !isResumingBooking.current) return

    if (activeSectionIndex < 0) {
      submitButtonRef.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'end',
      })
      return
    }

    cardRefs.current[activeSectionIndex]?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    })
  }, [activeSectionIndex])

  const scrollToFirstInvalidField = (fieldId: string) => {
    const activeCard = cardRefs.current[activeSectionIndex]
    if (!activeCard) return
    const firstInvalidField =
      // text, email, tel, select, country, address — root input renders with id={fieldId}
      activeCard.querySelector<HTMLElement>(`#${fieldId}`) ??
      // dob — FieldDateOfBirth has no id on its wrapper; sub-inputs use id="${fieldId}-day"
      activeCard.querySelector<HTMLElement>(`#${fieldId}-day`) ??
      // radio — FieldRadioGroup generates input ids as "${fieldId}-${option.value}"
      activeCard.querySelector<HTMLElement>(`[id^="${fieldId}-"]`)
    firstInvalidField?.scrollIntoView({ behavior: 'smooth' })
  }

  const submitRetry =
    submitFailureCount > 0 ? retryEscalationCopy(submitFailureCount) : null

  return (
    <form
      data-testid="booking-form-new"
      className={classNames(styles.formBase, className)}
      onSubmit={handleSubmit}
    >
      {sections(
        initialFormState?.guarantorRequirement,
        initialFormState?.requiresEmergencyContact
      ).map((section, index) => {
        const isCompleted = completedIds.includes(section.id)
        const isActive = index === activeSectionIndex

        return (
          <SectionCard
            key={section.id}
            index={index}
            isActive={isActive}
            isCompleted={isCompleted}
            isUntouched={!isCompleted && !isActive}
            summaryValues={summaryValues}
            registerRef={(element) => {
              cardRefs.current[index] = element
            }}
            section={section}
            isEditing={isEditing}
            values={formValues}
            errors={errors}
            onChange={handleChange}
            onContinue={async () => {
              const firstInvalidFieldId = await handleContinue(section)
              if (firstInvalidFieldId)
                scrollToFirstInvalidField(firstInvalidFieldId)
            }}
            onEdit={handleEdit}
            sectionLoading={sectionLoading}
            dobValues={dobValues}
            onDobChange={handleDobChange}
            dobErrors={dobErrors}
            addressValues={addressValues}
            manualAddressFieldErrors={manualAddressFieldErrors}
            addressHandlers={addressHandlers}
          />
        )
      })}

      {isFormComplete && submitRetry && (
        <ErrorMessage
          text={
            <>
              {submitRetry.message} <strong>{submitRetry.emphasis}</strong>
            </>
          }
        />
      )}

      <div
        ref={submitButtonRef}
        aria-hidden={!isFormComplete}
        className={classNames(styles.submitButton, {
          [styles.submitButtonHidden]: !isFormComplete,
        })}
      >
        <ButtonNew
          className={styles.submitButtonControl}
          type={submitRetry?.escalated ? 'button' : 'submit'}
          onClick={submitRetry?.escalated ? onContactSupport : undefined}
          size="m"
          isLoading={submitState.status === 'loading'}
          disabled={!isFormComplete || submitState.status === 'loading'}
        >
          {submitRetry?.buttonLabel ?? submitButtonLabel}
        </ButtonNew>
      </div>
    </form>
  )
}

export default BookingFormNew
