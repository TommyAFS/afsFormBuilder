import { useMemo, useState } from 'react'

import { serialiseAllDobs } from '../helpers/bookingFormSerialisers'
import { buildInitialState } from '../helpers/buildInitialState'
import type { DateErrors } from '../components/FieldDateOfBirth/date.validation'
import { EMPTY_ADDRESS } from '../components/BookingFormAddressSection'

import ContactAddress from '../../../../types/ContactAddress'
import { AddressHandlers, DateOfBirthValue } from '../types'

export type ManualAddressFieldErrors = Record<
  string,
  Partial<Record<keyof ContactAddress, { message?: string }>>
>

export const useBookingFormFields = (
  initial: ReturnType<typeof buildInitialState>
) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(
    initial.formValues
  )
  const [dobValues, setDobValues] = useState<Record<string, DateOfBirthValue>>(
    initial.dobValues
  )
  const [addressValues, setAddressValues] = useState<
    Record<string, ContactAddress>
  >(initial.addressValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dobErrors, setDobErrors] = useState<Record<string, DateErrors>>({})
  const [manualAddressFieldErrors, setManualAddressFieldErrors] =
    useState<ManualAddressFieldErrors>({})

  const serialisedDobValues = useMemo(
    () => serialiseAllDobs(dobValues),
    [dobValues]
  )
  const summaryValues = useMemo(
    () => ({ ...formValues, ...serialisedDobValues }),
    [formValues, serialisedDobValues]
  )

  const handleChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }))

    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: '' }))
    }
  }

  const handleDobChange = (fieldId: string, value: DateOfBirthValue) => {
    const previousValue = dobValues[fieldId]

    setDobValues((prev) => ({ ...prev, [fieldId]: value }))

    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: '' }))
    }

    const fieldDobErrors = dobErrors[fieldId]
    if (fieldDobErrors) {
      const changedParts = (['day', 'month', 'year'] as const).filter(
        (part) => value[part] !== previousValue?.[part]
      )
      const clearsAnError = changedParts.some(
        (part) => fieldDobErrors[part] !== undefined
      )

      if (clearsAnError) {
        setDobErrors((prev) => {
          const nextFieldErrors = { ...prev[fieldId] }
          changedParts.forEach((part) => delete nextFieldErrors[part])
          return { ...prev, [fieldId]: nextFieldErrors }
        })
      }
    }
  }

  const handleAddressSelect = (fieldId: string, address: ContactAddress) => {
    setAddressValues((prev) => ({ ...prev, [fieldId]: address }))
    const formatted = [address.line1, address.townCity, address.postcode]
      .filter(Boolean)
      .join(', ')
    setFormValues((prev) => ({ ...prev, [fieldId]: formatted }))
    setErrors((prev) => ({ ...prev, [fieldId]: '' }))
  }

  const handleAddressClear = (fieldId: string) => {
    setAddressValues((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
    setFormValues((prev) => ({ ...prev, [fieldId]: '' }))
  }

  const handleAddressFieldChange = (
    fieldId: string,
    addressField: keyof ContactAddress,
    value: string
  ) => {
    const updatedAddress = {
      ...(addressValues[fieldId] ?? EMPTY_ADDRESS),
      [addressField]: value,
    }
    handleAddressSelect(fieldId, updatedAddress)

    if (manualAddressFieldErrors[fieldId]?.[addressField]) {
      setManualAddressFieldErrors((prev) => {
        const nextFieldErrors = { ...prev[fieldId] }
        delete nextFieldErrors[addressField]
        return { ...prev, [fieldId]: nextFieldErrors }
      })
    }
  }

  const handleAddressClearError = (fieldId: string) => {
    setErrors((prev) => ({ ...prev, [fieldId]: '' }))
  }

  const addressHandlers: AddressHandlers = {
    onSelect: handleAddressSelect,
    onClear: handleAddressClear,
    onClearError: handleAddressClearError,
    onFieldChange: handleAddressFieldChange,
  }

  return {
    formValues,
    dobValues,
    addressValues,
    errors,
    dobErrors,
    manualAddressFieldErrors,
    setErrors,
    setDobErrors,
    setManualAddressFieldErrors,
    serialisedDobValues,
    summaryValues,
    handleChange,
    handleDobChange,
    addressHandlers,
  }
}
