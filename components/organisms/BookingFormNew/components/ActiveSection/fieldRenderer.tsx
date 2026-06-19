import Field from '@afs/components/Field'
import FieldSelect from '@afs/components/FieldSelect'
import FieldCountryAutocomplete from '../../../../molecules/FieldCountryAutocomplete'
import FieldRadioGroup from '../../../../molecules/FieldRadioGroup'
import FieldPhoneNumber from '../FieldPhoneNumber'
import FieldDateOfBirth from '../FieldDateOfBirth'
import BookingFormAddressSection, {
  EMPTY_ADDRESS,
} from '../BookingFormAddressSection'

import { getAutocompleteSuggestions } from '../../../../../api/Search/autocompleteApi'
import { getAddressFromGooglePlaceId } from '../../../../../api/Booking/addressApi'
import { SectionDefinition } from '../../sectionBuilder'
import { ActiveSectionProps } from '../../types'
import { EMPTY_DOB } from '../../helpers/validation'

import styles from '../../styles.module.scss'

export const renderField = (
  field: SectionDefinition['fields'][number],
  props: ActiveSectionProps
) => {
  if (field.visibleWhen && !field.visibleWhen(props.values)) return null

  if (field.type === 'country') {
    return (
      <FieldCountryAutocomplete
        key={field.id}
        id={field.id}
        name={field.id}
        label={field.label}
        value={props.values[field.id] ?? ''}
        onChange={(val) => props.onChange(field.id, val ? val.name : '')}
        invalid={!!props.errors[field.id]}
        error={props.errors[field.id] || undefined}
        required={field.required}
        className={styles.inputCountry}
        size="small"
      />
    )
  }

  if (field.type === 'tel') {
    return (
      <FieldPhoneNumber
        key={field.id}
        id={field.id}
        name={field.id}
        label={field.label}
        value={props.values[field.id] ?? ''}
        countryCode={props.values[`${field.id}.countryCode`] ?? 'GB'}
        onChange={(val) => props.onChange(field.id, val)}
        onCountryCodeChange={(code) =>
          props.onChange(`${field.id}.countryCode`, code)
        }
        error={props.errors[field.id] || undefined}
        required={field.required}
        className={styles.inputPhone}
        size="small"
      />
    )
  }

  if (field.type === 'dob') {
    return (
      <FieldDateOfBirth
        key={field.id}
        id={field.id}
        label={field.label}
        value={props.dobValues[field.id] ?? EMPTY_DOB}
        onChange={(value) => props.onDobChange(field.id, value)}
        invalid={props.dobErrors[field.id]}
        required={true}
        className={styles.inputDob}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <FieldSelect
        key={field.id}
        id={field.id}
        name={field.id}
        label={field.label}
        options={field.options ?? []}
        value={props.values[field.id] ?? ''}
        onChange={(val) => props.onChange(field.id, val)}
        required={field.required}
        invalid={!!props.errors[field.id]}
        error={props.errors[field.id] || undefined}
        toggleType="input"
        itemToString={(item) => item?.value || ''}
        className={styles.inputSelect}
        shouldScrollIntoView={false}
        size="small"
      />
    )
  }

  if (field.type === 'address') {
    return (
      <BookingFormAddressSection
        key={field.id}
        id={field.id}
        name={field.id}
        fieldLabel={field.label}
        address={props.addressValues[field.id] ?? EMPTY_ADDRESS}
        selectAddress={(address) =>
          props.addressHandlers.onSelect(field.id, address)
        }
        clearAddress={() => props.addressHandlers.onClear(field.id)}
        autocompleteApi={getAutocompleteSuggestions}
        addressApi={getAddressFromGooglePlaceId}
        onAddressFieldChange={(addressField, value) =>
          props.addressHandlers.onFieldChange(field.id, addressField, value)
        }
        hasError={!!props.errors[field.id]}
        errorMessage={props.errors[field.id] || undefined}
        manualAddressErrors={props.manualAddressFieldErrors[field.id]}
        clearError={() => props.addressHandlers.onClearError(field.id)}
        autocompleteFieldInitialValue={props.values[field.id] ?? ''}
        classNameWrapper={styles.inputAddress}
      />
    )
  }

  if (field.type === 'radio') {
    return (
      <FieldRadioGroup
        key={field.id}
        inputRef={() => {}}
        name={field.id}
        uniqueId={`${field.id}-`}
        required={field.required ?? false}
        label={field.label}
        subTitle={field.subTitle}
        options={field.options ?? []}
        onChange={(event) => props.onChange(field.id, event.target.value)}
        invalid={!!props.errors[field.id]}
        error={props.errors[field.id] ?? ''}
        selectedValue={props.values[field.id] ?? ''}
        className={styles.inputRadio}
        labelClassName={styles.inputRadioMainLabel}
        adjacentOptions={field.inline}
        wrapperClassName={
          field.inline ? styles.inlineRadioWrapper : styles.blockRadioWrapper
        }
      />
    )
  }

  return (
    <Field
      key={field.id}
      id={field.id}
      label={field.label}
      name={field.label}
      type={field.type}
      value={props.values[field.id] ?? ''}
      required={field.required}
      onChange={(event) => props.onChange(field.id, event.target.value)}
      invalid={!!props.errors[field.id]}
      error={props.errors[field.id] || undefined}
      autoComplete={field.autoComplete}
      className={styles.input}
      size="small"
    />
  )
}
