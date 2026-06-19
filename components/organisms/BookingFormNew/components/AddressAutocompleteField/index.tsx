import classNames from 'classnames'
import Label from '@afs/components/Label'
import Input from '@afs/components/Input'
import InputError from '@afs/components/InputError'

import requestStatus from '../../../../../constants/requestStatus'

import LinkButton from '../../../../atoms/LinkButton'

import ContactAddress from '../../../../../types/ContactAddress'
import AddressApiResponse from '../../../../../types/AddressApiResponse'
import { AutocompleteResponse } from '../../../../../api/Search/autocompleteApi'

import DropdownContent from './components/DropdownContent'

import SearchIcon from '../../../../../svgs/icons/search-icon.svg'
import ClearIcon from './svgs/clear-icon.svg'
import CloseIcon from './svgs/close-icon.svg'
import useAddressAutocompleteField from './useAddressAutocompleteField'

import styles from './styles.module.scss'

export interface AddressAutocompleteFieldProps {
  className?: string
  classNameWrapper?: string
  id?: string
  name: string
  required: boolean
  handleOnSelect: (contactAddress: ContactAddress) => void
  clearAddress: () => void
  autocompleteApi: (
    countryCode: 'allCountries',
    searchTerm: string
  ) => Promise<AutocompleteResponse>
  addressApi: (googlePlaceId: string) => Promise<AddressApiResponse>
  clearError: () => void
  initialValue: string
  addressFieldFocussed: boolean
  showFormattedAddressSection: () => void
  onManualAddressEntryButtonClick: () => void
  invalid?: boolean
  error?: { message?: string } | null
}

const AddressAutocompleteField = ({
  className,
  classNameWrapper,
  id,
  name,
  required,
  handleOnSelect,
  clearAddress,
  autocompleteApi,
  addressApi,
  clearError,
  initialValue,
  addressFieldFocussed,
  showFormattedAddressSection,
  onManualAddressEntryButtonClick,
  invalid: invalidProp = false,
  error,
}: AddressAutocompleteFieldProps) => {
  const {
    value,
    options,
    noMatches,
    showError,
    addressApiRequestStatus,
    showEmptyState,
    showDropdown,
    isInvalid,
    inputId,
    inputRef,
    dropdownRef,
    manualAddressButtonRef,
    cantFindAddressButtonRef,
    clearButtonRef,
    onInputValueChange,
    onInputFocus,
    onInputBlur,
    onClearButtonClick,
    combobox,
  } = useAddressAutocompleteField({
    id,
    name,
    invalid: invalidProp,
    addressFieldFocussed,
    handleOnSelect,
    clearAddress,
    autocompleteApi,
    addressApi,
    clearError,
    initialValue,
    showFormattedAddressSection,
  })

  const {
    getMenuProps,
    getLabelProps,
    getInputProps,
    selectedItem,
    highlightedIndex,
    getItemProps,
    reset,
  } = combobox

  const errorId = `${inputId}-error`

  return (
    <>
      <div
        className={classNameWrapper}
        data-testid="address-autocomplete-wrapper"
      >
        <div className={classNames(styles.field, className)}>
          <div className={styles.combobox}>
            <Label
              {...getLabelProps()}
              className={classNames(styles.searchLabel, {
                [styles.required]: required,
                [styles.waiting]:
                  addressApiRequestStatus === requestStatus.waiting,
              })}
            >
              Search address
            </Label>
            <div className={styles.inputWrapper}>
              <Input
                {...getInputProps({
                  ref: (element: HTMLInputElement | null): void => {
                    inputRef.current = element
                  },
                  className: classNames(
                    styles.input,
                    {
                      [styles.inputWithClearButton]: !!value,
                    },
                    className
                  ),
                  name,
                  type: 'text',
                  role: 'searchbox',
                  value,
                  placeholder: 'Start typing address',
                  required,
                  disabled: addressApiRequestStatus === requestStatus.waiting,
                  invalid: isInvalid,
                  autoComplete: 'one-time-code',
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    onInputValueChange(e.target.value)
                  },
                  onFocus: (e) => {
                    onInputFocus(e.target.value, invalidProp)
                  },
                  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                    onInputBlur(e, selectedItem, reset)
                  },
                  'aria-describedby':
                    invalidProp && error ? errorId : undefined,
                  'data-testid': 'input-address-autocomplete',
                })}
              />

              <SearchIcon
                className={classNames(styles.searchIcon, {
                  [styles.searchIconWaiting]:
                    addressApiRequestStatus === requestStatus.waiting,
                })}
              />

              <button
                ref={clearButtonRef}
                className={classNames(styles.clearButton, {
                  [styles.clearButtonVisible]: value,
                })}
                onClick={() => {
                  onClearButtonClick(reset)
                }}
                aria-controls={getInputProps().id}
                type="button"
                aria-label="Clear"
              >
                <ClearIcon className={styles.clearIcon} />
              </button>
            </div>
          </div>

          <div
            {...getMenuProps()}
            className={classNames(styles.menu, {
              [styles.menuOpen]: showDropdown,
            })}
            aria-hidden={showDropdown ? 'false' : 'true'}
            data-testid="address-dropdown-menu"
          >
            <div ref={dropdownRef} className={styles.dropdown}>
              <DropdownContent
                showError={showError}
                showEmpty={showEmptyState}
                noMatches={noMatches}
                searchTerm={value}
                options={options}
                highlightedIndex={highlightedIndex}
                getItemProps={getItemProps}
                onManualAddressEntryButtonClick={
                  onManualAddressEntryButtonClick
                }
                cantFindAddressButtonRef={cantFindAddressButtonRef}
              />
            </div>
          </div>
        </div>

        {error ? (
          <InputError id={errorId} inputId={inputId}>
            {error.message || 'Search address or enter address manually'}
          </InputError>
        ) : null}

        <LinkButton
          ref={manualAddressButtonRef}
          className={classNames(styles.manualAddressLinkButton, {
            [styles.manualAddressLinkButtonWaiting]:
              addressApiRequestStatus === requestStatus.waiting,
          })}
          onClick={onManualAddressEntryButtonClick}
        >
          Enter address manually
        </LinkButton>
      </div>

      {addressApiRequestStatus === requestStatus.error ? (
        <div
          className={classNames(styles.errorItem, styles.errorItemAddressApi)}
          data-testid="error-text"
        >
          <div className={styles.errorItemText}>
            <span className={styles.errorHeading}>
              Oops! Something broke...
            </span>
            <span className={styles.errorText}>
              We couldn’t retrieve the address.
            </span>
            <span className={styles.errorText}>Please try again later.</span>
          </div>
          <CloseIcon className={styles.closeIcon} />
        </div>
      ) : null}
    </>
  )
}

export default AddressAutocompleteField
