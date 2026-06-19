import { useState, useEffect, useRef } from 'react'
import classNames from 'classnames'

import ButtonNew from '@afs/components/ButtonNew'
import Field from '@afs/components/Field'
import FieldCountryAutocomplete from '../../../../../molecules/FieldCountryAutocomplete'

import ContactAddress from '../../../../../../types/ContactAddress'

import SearchIcon from '../../../../../../svgs/icons/search-icon.svg'

import styles from './styles.module.scss'

export interface ManualAddressEntryFieldsProps {
  className?: string
  address: ContactAddress
  onChange: (field: keyof ContactAddress, value: string) => void
  errors?: Partial<Record<keyof ContactAddress, { message?: string }>>
  onSearchForDifferentAddressButtonClick: () => void
}

const ManualAddressEntryFields = ({
  className,
  address,
  onChange,
  errors,
  onSearchForDifferentAddressButtonClick,
}: ManualAddressEntryFieldsProps) => {
  const [showAddressLine, setShowAddressLine] = useState(false)

  const componentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (componentRef?.current) {
      componentRef.current.scrollIntoView({ block: 'start' })
    }
  }, [])

  return (
    <div className={classNames(styles.component, className)} ref={componentRef}>
      <ButtonNew
        className={styles.searchButton}
        variant="primary-dark"
        type="button"
        size="s"
        onClick={onSearchForDifferentAddressButtonClick}
      >
        <SearchIcon className={styles.searchIcon} />
        Search for address
      </ButtonNew>

      <FieldCountryAutocomplete
        className={styles.countrySelect}
        name="country"
        label="Country of residence"
        value={address.country}
        onChange={(selectedCountry) =>
          onChange('country', selectedCountry?.name || '')
        }
        invalid={!!errors?.country?.message}
        error={errors?.country?.message || ''}
        size="small"
      />

      <Field
        name="line1"
        className={styles.field}
        label="First line of address"
        required
        value={address.line1}
        onChange={(e) => onChange('line1', e.target.value)}
        invalid={!!errors?.line1?.message}
        error={errors?.line1?.message || ''}
        size="small"
        autoComplete={'address-line1'}
      />

      <Field
        name="line2"
        className={styles.field}
        label="Second line of address"
        value={address.line2}
        onChange={(e) => onChange('line2', e.target.value)}
        invalid={!!errors?.line2?.message}
        error={errors?.line2?.message || ''}
        size="small"
        autoComplete={'address-line2'}
      />

      {showAddressLine === false ? (
        <ButtonNew
          type="button"
          className={styles.addAddressLineButton}
          onClick={() => setShowAddressLine(true)}
          styleAsLink={{
            variant: 'grey',
          }}
        >
          Add address line
        </ButtonNew>
      ) : null}

      {showAddressLine ? (
        <Field
          name="line3"
          className={styles.field}
          label="Third line of address"
          value={address.line3}
          onChange={(e) => onChange('line3', e.target.value)}
          invalid={!!errors?.line3?.message}
          error={errors?.line3?.message || ''}
          size="small"
          autoComplete={'address-line3'}
        />
      ) : null}

      <Field
        name="townCity"
        className={styles.field}
        label="Town / city"
        required
        value={address.townCity}
        onChange={(e) => onChange('townCity', e.target.value)}
        invalid={!!errors?.townCity?.message}
        error={errors?.townCity?.message || ''}
        size="small"
        autoComplete={'address-level2'}
      />

      <Field
        name="region"
        className={styles.field}
        label="State / province / region"
        value={address.region}
        onChange={(e) => onChange('region', e.target.value)}
        invalid={!!errors?.region?.message}
        error={errors?.region?.message || ''}
        size="small"
        autoComplete={'address-level1'}
      />

      <Field
        name="postcode"
        className={styles.field}
        label="Postcode / ZIP code"
        value={address.postcode}
        onChange={(e) => onChange('postcode', e.target.value)}
        invalid={!!errors?.postcode?.message}
        error={errors?.postcode?.message || ''}
        size="small"
        autoComplete={'postal-code'}
      />
    </div>
  )
}

export default ManualAddressEntryFields
