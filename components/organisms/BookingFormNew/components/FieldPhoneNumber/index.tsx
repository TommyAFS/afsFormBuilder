import { useCallback, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import Input from '@afs/components/Input'
import Label from '@afs/components/Label'
import InputError from '@afs/components/InputError'

import countries from '../../../../../constants/countries/countries'
import useCloseOnClickOutside from '../../../../../hooks/useCloseOnClickOutside'

import FieldDiallingCodeAutocomplete, {
  HandlerFunction,
} from './FieldDiallingCodeAutocomplete'
import FlagIcon from './FlagIcon'

import Chevron from './svgs/chevron.svg'

import styles from './styles.module.scss'

export interface FieldPhoneNumberProps {
  className?: string
  id?: string
  name: string
  label: string
  value: string
  countryCode: string
  onChange: (value: string) => void
  onCountryCodeChange: (code: string) => void
  onBlur?: () => void
  error?: string
  isTouched?: boolean
  required?: boolean
  size?: 'small' | 'normal'
}

const FieldPhoneNumber = ({
  className,
  id,
  name,
  label,
  value,
  countryCode,
  onChange,
  onCountryCodeChange,
  onBlur,
  error,
  isTouched = false,
  required,
  size = 'normal',
}: FieldPhoneNumberProps) => {
  const [diallingCodeMenuOpen, setDiallingCodeMenuOpen] = useState(false)

  const phoneNumberFieldRef = useRef<HTMLInputElement | null>(null)

  const options = useMemo(() => {
    return countries.map(({ code, name, diallingCode, flag }) => ({
      value: code,
      label: `${name} (${diallingCode})`,
      diallingCode,
      flag,
    }))
  }, [])

  const selectedCountry = useMemo(
    () => options.find((option) => option.value === countryCode),
    [options, countryCode]
  )

  const phoneNumberFieldHasFocus =
    typeof document !== 'undefined' &&
    document.activeElement === phoneNumberFieldRef.current

  const phoneNumberHasValue = !!value

  const shouldDisplayError =
    (!phoneNumberFieldHasFocus &&
      !phoneNumberHasValue &&
      !diallingCodeMenuOpen) ||
    (phoneNumberHasValue && !!error && !diallingCodeMenuOpen)

  const inputId = id || `${name}.phoneNumber`

  const onSelectedCountryChange: HandlerFunction = (selectedItem) => {
    if (selectedItem) {
      onCountryCodeChange(selectedItem.value)
    }

    if (phoneNumberFieldRef.current) {
      phoneNumberFieldRef.current.focus()
    }

    setDiallingCodeMenuOpen(false)
  }

  const toggleDiallingCodeMenu = () => {
    setDiallingCodeMenuOpen((previousIsOpen) => {
      if (previousIsOpen && phoneNumberFieldRef.current) {
        phoneNumberFieldRef.current.focus()
      }

      return !previousIsOpen
    })
  }

  const itemToString = useCallback(
    (item: { value: string } | null) => (item ? item.value : ''),
    []
  )

  const { componentRef } = useCloseOnClickOutside<HTMLButtonElement>({
    callback: () => setDiallingCodeMenuOpen(false),
    portalElementId: 'dialling-code',
    isOpen: diallingCodeMenuOpen,
  })

  if (!selectedCountry) return null

  return (
    <div className={className}>
      <Label
        className={classNames({ [styles.requiredLabel]: required })}
        htmlFor={inputId}
      >
        {label}
      </Label>
      <div className={styles.inputWrapper}>
        <button
          ref={componentRef}
          className={classNames(styles.diallingCodeToggle, {
            [styles.diallingCodeToggleSmall]: size === 'small',
          })}
          type="button"
          aria-label={
            diallingCodeMenuOpen
              ? 'Close dialling code list'
              : 'Open dialling code list'
          }
          aria-haspopup="listbox"
          aria-controls="dialling-code"
          aria-expanded={diallingCodeMenuOpen ? 'true' : 'false'}
          data-testid={`${name}-dialling-code-button`}
          onClick={toggleDiallingCodeMenu}
        >
          <div className={styles.diallingCodeToggleInner}>
            <FlagIcon
              className={styles.flagIcon}
              flag={selectedCountry.flag}
              alt=""
            />
            <div className={styles.diallingCode} data-testid="dialling-code">
              {selectedCountry.diallingCode}
            </div>
            <Chevron
              className={classNames(styles.chevron, {
                [styles.chevronRotated]: diallingCodeMenuOpen,
              })}
              aria-hidden="true"
            />
          </div>
        </button>
        <Input
          className={styles.input}
          ref={(e: HTMLInputElement | null) => {
            phoneNumberFieldRef.current = e
          }}
          id={inputId}
          name={`${name}.phoneNumber`}
          type="tel"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          onBlur={onBlur}
          invalid={!!error && shouldDisplayError}
          validated={isTouched && phoneNumberHasValue && !error}
          required={required}
          data-testid={`field-${name}.phoneNumber`}
          aria-describedby={
            !!error && shouldDisplayError ? `${inputId}Error` : undefined
          }
          size={size as any}
        />
      </div>

      {error && shouldDisplayError ? (
        <InputError
          id={`${inputId}Error`}
          inputId={inputId}
          data-testid={`field-${name}.phoneNumber-error`}
        >
          {error}
        </InputError>
      ) : null}
      <FieldDiallingCodeAutocomplete
        id="dialling-code-autocomplete"
        name={`${name}.diallingCode`}
        options={options}
        handleChange={onSelectedCountryChange}
        selectedItem={selectedCountry}
        placeholder="Search for countries"
        notFoundText="No matches found"
        itemToString={itemToString}
        menuOpen={diallingCodeMenuOpen}
        setMenuOpen={setDiallingCodeMenuOpen}
      />
    </div>
  )
}

export default FieldPhoneNumber
