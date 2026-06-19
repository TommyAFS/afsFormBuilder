import { useState, useEffect, useRef } from 'react'
import { useCombobox, UseComboboxStateChange } from 'downshift'

import throttle from '../../../../../utils/throttle'
import requestStatus from '../../../../../constants/requestStatus'
import useGoogleAutocompleteLoader from '../../../../../hooks/useGoogleAutocompleteLoader'
import ContactAddress from '../../../../../types/ContactAddress'
import AddressApiResponse from '../../../../../types/AddressApiResponse'
import { AutocompleteResponse } from '../../../../../api/Search/autocompleteApi'
import Suggestion from '../../../../../types/Suggestion'

type AutocompleteApi = (
  countryCode: 'allCountries',
  searchTerm: string
) => Promise<AutocompleteResponse>

const fetchSuggestions = throttle(
  async (
    searchTerm: string,
    autocompleteApi: AutocompleteApi,
    onSuccess: (suggestions: Suggestion[]) => void,
    onNoMatches: () => void,
    onError: () => void
  ) => {
    const response = await autocompleteApi('allCountries', searchTerm)

    if (!response.success) {
      onError()
      return
    }

    if (response.suggestions.length > 0) {
      onSuccess(response.suggestions)
    } else {
      onNoMatches()
    }
  },
  1000
)

interface UseAddressAutocompleteFieldArgs {
  id?: string
  name: string
  invalid: boolean
  addressFieldFocussed: boolean
  handleOnSelect: (address: ContactAddress) => void
  clearAddress: () => void
  autocompleteApi: AutocompleteApi
  addressApi: (googlePlaceId: string) => Promise<AddressApiResponse>
  clearError: () => void
  initialValue: string
  showFormattedAddressSection: () => void
}

const useAddressAutocompleteField = ({
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
}: UseAddressAutocompleteFieldArgs) => {
  const [options, setOptions] = useState<Suggestion[]>([])
  const [value, setValue] = useState(initialValue)
  const [inputHasBeenTouched, setInputHasBeenTouched] = useState(false)
  const [noMatches, setNoMatches] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [manuallyFocussed, setManuallyFocussed] = useState(false)
  const [autocompleteApiRequestStatus, setAutocompleteApiRequestStatus] =
    useState<string>(requestStatus.idle)
  const [addressApiRequestStatus, setAddressApiRequestStatus] =
    useState<string>(requestStatus.idle)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const manualAddressButtonRef = useRef<HTMLButtonElement | null>(null)
  const cantFindAddressButtonRef = useRef<HTMLButtonElement | null>(null)
  const clearButtonRef = useRef<HTMLButtonElement | null>(null)

  const { googleLoaded } = useGoogleAutocompleteLoader({
    onError: () => setAutocompleteApiRequestStatus(requestStatus.error),
  })

  useEffect(() => {
    if (inputRef.current && addressFieldFocussed) {
      inputRef.current.focus()
      setManuallyFocussed(true)
    }
  }, [addressFieldFocussed])

  const updateAutocompleteOptions = (inputValue: string) => {
    if (!inputValue || inputValue.length < 3) {
      setOptions([])
      setNoMatches(false)
      return
    }

    if (!googleLoaded) return

    fetchSuggestions(
      inputValue,
      autocompleteApi,
      (suggestions: Suggestion[]) => {
        setAutocompleteApiRequestStatus(requestStatus.success)
        setNoMatches(false)
        setOptions(suggestions)
      },
      () => {
        setAutocompleteApiRequestStatus(requestStatus.success)
        setNoMatches(true)
        setOptions([])
      },
      () => setAutocompleteApiRequestStatus(requestStatus.error)
    )
  }

  const clearInput = (reset: () => void) => {
    setValue('')
    setNoMatches(false)
    setOptions([])
    setMenuOpen(true)
    clearAddress()
    reset()
  }

  const onInputValueChange = (inputValue: string = '') => {
    setInputHasBeenTouched(true)
    setValue(inputValue)
    clearError()
    updateAutocompleteOptions(inputValue)
    setMenuOpen(true)
  }

  const onInputFocus = (inputValue: string, isInvalid: boolean) => {
    setInputHasBeenTouched(true)
    if (!inputValue) {
      setOptions([])
    } else {
      updateAutocompleteOptions(inputValue)
    }
    if (!(isInvalid && !inputValue)) {
      setMenuOpen(true)
    }
  }

  const onInputBlur = (
    event: { target: HTMLInputElement },
    selectedItem: Suggestion | null,
    reset: () => void
  ) => {
    const { value: blurredValue } = event.target
    if (!blurredValue) clearInput(reset)
    setManuallyFocussed(false)
    if (!blurredValue || !!selectedItem) setMenuOpen(false)
  }

  const onClearButtonClick = (reset: () => void) => {
    clearInput(reset)
    clearError()
    setNoMatches(false)
    inputRef.current?.focus()
  }

  const onSelectedItemChange = async (
    changes: UseComboboxStateChange<Suggestion>
  ): Promise<void> => {
    const { type, selectedItem: newSelectedItem } = changes
    const isUserSelection =
      type === useCombobox.stateChangeTypes.InputKeyDownEnter ||
      type === useCombobox.stateChangeTypes.ItemClick

    if (!isUserSelection || !newSelectedItem?.placeId) return

    setMenuOpen(false)
    setAddressApiRequestStatus(requestStatus.waiting)

    const response = await addressApi(newSelectedItem.placeId)

    if (!response.success) {
      setAddressApiRequestStatus(requestStatus.error)
      return
    }

    inputRef.current?.blur()
    handleOnSelect(response.address)
    showFormattedAddressSection()
    setAddressApiRequestStatus(requestStatus.success)
  }

  const inputId = id || name

  const combobox = useCombobox({
    id: inputId,
    items: options,
    itemToString: (item) => (item ? item.name : ''),
    isOpen: menuOpen,
    onSelectedItemChange,
    defaultHighlightedIndex: 0,
  })

  const hasAutocompleteSuggestions = options.length > 0
  const showEmptyState = !value && menuOpen && !manuallyFocussed
  const showError = autocompleteApiRequestStatus === requestStatus.error
  const showDropdown =
    (menuOpen && hasAutocompleteSuggestions) ||
    showEmptyState ||
    noMatches ||
    showError

  const isInvalid =
    addressApiRequestStatus === requestStatus.error || invalidProp

  return {
    value,
    options,
    noMatches,
    manuallyFocussed,
    autocompleteApiRequestStatus,
    addressApiRequestStatus,
    inputHasBeenTouched,
    hasAutocompleteSuggestions,
    showEmptyState,
    showError,
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
  }
}

export default useAddressAutocompleteField
