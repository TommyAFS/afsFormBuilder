import { ReactNode, useState } from 'react'

import BookingFormFormattedAddress from './BookingFormFormattedAddress'
import ManualAddressEntryFields from './ManualAddressEntryFields'
import AddressAutocompleteField from '../AddressAutocompleteField'

import { AutocompleteResponse } from '../../../../../api/Search/autocompleteApi'
import AddressApiResponse from '../../../../../types/AddressApiResponse'
import ContactAddress from '../../../../../types/ContactAddress'
import addressSectionViews from './addressSectionViews'

import styles from './styles.module.scss'

export const EMPTY_ADDRESS: ContactAddress = {
  line1: '',
  line2: '',
  line3: '',
  townCity: '',
  region: '',
  postcode: '',
  country: '',
}

export interface BookingFormAddressSectionProps {
  className?: string
  classNameWrapper?: string
  id?: string
  name: string
  fieldLabel: string
  address: ContactAddress
  selectAddress: (contactAddress: ContactAddress) => void
  clearAddress: () => void
  autocompleteApi: (
    countryCode: 'allCountries',
    searchTerm: string
  ) => Promise<AutocompleteResponse>
  addressApi: (googlePlaceId: string) => Promise<AddressApiResponse>
  onAddressFieldChange: (field: keyof ContactAddress, value: string) => void
  hasError: boolean
  errorMessage?: string
  manualAddressErrors?: Partial<
    Record<keyof ContactAddress, { message?: string }>
  >
  clearError: () => void
  autocompleteFieldInitialValue: string
  manualAddressFieldsClassName?: string
  formattedAddressClassName?: string
}

const BookingFormAddressSection = ({
  className,
  classNameWrapper,
  id,
  name,
  fieldLabel,
  address,
  selectAddress,
  clearAddress,
  autocompleteApi,
  addressApi,
  onAddressFieldChange,
  hasError,
  errorMessage,
  manualAddressErrors,
  clearError,
  autocompleteFieldInitialValue,
  manualAddressFieldsClassName,
  formattedAddressClassName,
}: BookingFormAddressSectionProps) => {
  const [initialAddressValue, setInitialAddressValue] = useState(
    autocompleteFieldInitialValue
  )
  const [addressFieldFocussed, setAddressFieldFocussed] = useState(false)

  const addressContainsNonEmptyString = Object.values(address).some(
    (value) => value !== ''
  )

  const initialAddressSectionInView =
    !hasError && addressContainsNonEmptyString
      ? addressSectionViews.formattedAddress
      : addressSectionViews.autocompleteField

  const [currentAddressSectionView, setCurrentAddressSectionView] = useState<
    keyof typeof addressSectionViews
  >(initialAddressSectionInView)

  const effectiveView =
    hasError && addressContainsNonEmptyString
      ? addressSectionViews.manualEntryFields
      : currentAddressSectionView

  const showManualAddressEntryFields = () => {
    setCurrentAddressSectionView(addressSectionViews.manualEntryFields)
  }

  const showFormattedAddressSection = () => {
    setCurrentAddressSectionView(addressSectionViews.formattedAddress)
  }

  const showAddressAutocompleteField = () => {
    setCurrentAddressSectionView(addressSectionViews.autocompleteField)
  }

  const focusAddressField = () => {
    setAddressFieldFocussed(true)
  }

  const onAutocompleteManualAddressEntryButtonClick = () => {
    clearError()
    clearAddress()
    showManualAddressEntryFields()
  }

  const onSearchForDifferentAddressButtonClick = () => {
    setInitialAddressValue('')
    clearError()
    clearAddress()
    showAddressAutocompleteField()
    focusAddressField()
  }

  let addressView: ReactNode
  switch (effectiveView) {
    case addressSectionViews.autocompleteField: {
      addressView = (
        <AddressAutocompleteField
          name={name}
          required
          handleOnSelect={selectAddress}
          clearAddress={clearAddress}
          autocompleteApi={autocompleteApi}
          addressApi={addressApi}
          clearError={clearError}
          onManualAddressEntryButtonClick={
            onAutocompleteManualAddressEntryButtonClick
          }
          showFormattedAddressSection={showFormattedAddressSection}
          initialValue={initialAddressValue}
          addressFieldFocussed={addressFieldFocussed}
          invalid={hasError}
          error={errorMessage ? { message: errorMessage } : null}
          className={className}
          classNameWrapper={classNameWrapper}
        />
      )
      break
    }

    case addressSectionViews.manualEntryFields: {
      addressView = (
        <ManualAddressEntryFields
          className={manualAddressFieldsClassName}
          address={address}
          onChange={onAddressFieldChange}
          errors={manualAddressErrors}
          onSearchForDifferentAddressButtonClick={
            onSearchForDifferentAddressButtonClick
          }
        />
      )
      break
    }

    case addressSectionViews.formattedAddress: {
      addressView = (
        <BookingFormFormattedAddress
          className={formattedAddressClassName}
          address={address}
          showManualAddressEntryFields={showManualAddressEntryFields}
          onSearchForDifferentAddressButtonClick={
            onSearchForDifferentAddressButtonClick
          }
        />
      )
      break
    }
  }

  return (
    <>
      <p className={styles.title} id={id}>
        {fieldLabel}
      </p>
      {addressView}
    </>
  )
}

export default BookingFormAddressSection
