import {
  useEffect,
  useRef,
  useState,
  useMemo,
  FocusEventHandler,
  ChangeEventHandler,
} from 'react'
import classNames from 'classnames'
import { useCombobox } from 'downshift'
import Input from '@afs/components/Input'

import {
  getScrollParent,
  getScrollParentHeight,
} from '../../../../../../utils/scrollIntoViewWithOffset'
import getMatchedAndNotMatchedSubstrings from '../../../../../../utils/search/getMatchedAndNotMatchedSubstrings'

import FlagIcon from '../FlagIcon'

import ClearButtonIcon from './svgs/clear.svg'
import SearchIcon from './svgs/search.svg'

import styles from './styles.module.scss'

type DiallingCodeOption = {
  value: string
  label: string
  flag: string
}

export type HandlerFunction = (selectedItem: DiallingCodeOption | null) => void

interface FieldDiallingCodeAutocompleteProps {
  className?: string
  id?: string
  name: string
  options: DiallingCodeOption[]
  handleChange: HandlerFunction
  handleFocus?: HandlerFunction
  handleBlur?: HandlerFunction
  selectedItem: DiallingCodeOption
  placeholder: string
  notFoundText: string
  itemToString: (item: DiallingCodeOption | null) => string
  menuOpen: boolean
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const FieldDiallingCodeAutocomplete = ({
  className,
  id,
  name,
  options,
  handleChange,
  handleFocus,
  handleBlur,
  selectedItem,
  placeholder,
  notFoundText,
  itemToString,
  menuOpen,
  setMenuOpen,
  ...props
}: FieldDiallingCodeAutocompleteProps) => {
  const inputId = id || name

  const popularCountries = ['GB', 'IN', 'NG', 'FR', 'US']

  const initialFilteredItems = useMemo(
    () =>
      popularCountries
        .map((code) => options.find((option) => option.value === code))
        .filter(Boolean) as DiallingCodeOption[],
    [options]
  )

  const [filteredItems, setFilteredItems] = useState(initialFilteredItems)

  const [inputValue, setInputValue] = useState(
    selectedItem ? selectedItem.label : ''
  )

  const listboxWrapperRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    setInputValue(selectedItem ? selectedItem.label : '')
  }, [selectedItem])

  useEffect(() => {
    if (menuOpen && menuRef && menuRef.current) {
      menuRef.current.scrollTop = 0
    }
  }, [menuOpen])

  const filterItems = (inputValue = '') => {
    const lowerCasedInputValue = inputValue.toLowerCase()
    return options.filter(
      (item) =>
        !inputValue || item.label.toLowerCase().includes(lowerCasedInputValue)
    )
  }

  const handleItemSelected = ({
    handleChange,
    setInputValue,
    selectedItem,
  }: {
    handleChange: HandlerFunction
    setInputValue: (value: string) => void
    selectedItem: DiallingCodeOption
  }) => {
    if (selectedItem) {
      handleChange(selectedItem)
      setInputValue(selectedItem.label)
      setMenuOpen(false)
    }
  }

  const onStateChange = ({
    state,
    setInputValue,
    handleChange,
  }: {
    state: {
      type: string
      selectedItem?: DiallingCodeOption | null | undefined
    }
    inputValue: string
    setInputValue: (value: string) => void
    handleChange: HandlerFunction
  }) => {
    const { type, selectedItem: newSelectedItem } = state

    if (
      type === useCombobox.stateChangeTypes.InputKeyDownEnter ||
      type === useCombobox.stateChangeTypes.ItemClick
    ) {
      if (newSelectedItem) {
        handleItemSelected({
          handleChange,
          setInputValue,
          selectedItem: newSelectedItem,
        })
      }

      if (!newSelectedItem && selectedItem) {
        setInputValue(selectedItem.label)
      }

      setMenuOpen(false)
    }
  }

  const { getMenuProps, getInputProps, highlightedIndex, getItemProps } =
    useCombobox({
      id: inputId,
      items: filteredItems,
      inputValue,
      isOpen: menuOpen,
      selectedItem,
      onStateChange: (state) =>
        onStateChange({
          state,
          inputValue,
          setInputValue,
          handleChange,
        }),
      itemToString,
      defaultHighlightedIndex: 0,
    })

  const handleInputFocus: FocusEventHandler<HTMLInputElement> = () => {
    setFilteredItems(initialFilteredItems)
    setInputValue('')
    setMenuOpen(true)
    handleFocus?.(selectedItem)
  }

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target
    setInputValue(value)
    setFilteredItems(filterItems(value))
    setMenuOpen(true)
  }

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = () => {
    setInputValue(selectedItem?.label || '')
    handleBlur?.(selectedItem)
  }

  const handleOnClear = () => {
    setInputValue('')

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    const listboxHasBeenRendered =
      listboxWrapperRef && listboxWrapperRef.current

    const scrollParentHeight = getScrollParentHeight(listboxWrapperRef.current)

    const listboxBelowTheFold = () => {
      if (listboxWrapperRef.current) {
        return (
          listboxHasBeenRendered &&
          listboxWrapperRef.current.getBoundingClientRect().bottom >
            scrollParentHeight
        )
      }
      return false
    }

    if (menuOpen && listboxBelowTheFold()) {
      const scrollParent = getScrollParent(listboxWrapperRef.current)

      const scrollParentIsBodyElement = scrollParent
        ? scrollParent.localName === 'body'
        : true

      if (inputRef.current && scrollParentIsBodyElement) {
        setTimeout(() => {
          inputRef.current!.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 0)
      }

      if (inputRef.current && !scrollParentIsBodyElement) {
        const { top } = inputRef.current!.getBoundingClientRect()

        setTimeout(() => {
          scrollParent.scrollTo({ top, behavior: 'smooth' })
        }, 0)
      }
    }
  }, [menuOpen])

  const renderItemText = (label: string, inputValue: string) => {
    const {
      matchedSubstring,
      notMatchedSubstringAtTheBeginning,
      notMatchedSubstringAtTheEnd,
    } = getMatchedAndNotMatchedSubstrings(label, inputValue)

    return (
      <div>
        {notMatchedSubstringAtTheBeginning}
        <span className={styles.matchedItemText}>{matchedSubstring}</span>
        {notMatchedSubstringAtTheEnd}
      </div>
    )
  }

  const isShowingClearButton = inputValue !== '' && menuOpen

  const renderInputField = () => {
    return (
      <div
        id="dialling-code"
        className={classNames(
          styles.field,
          { [styles.fieldVisible]: menuOpen },
          className
        )}
        data-testid="field-autocomplete"
      >
        <div className={styles.combobox}>
          <div
            className={classNames(styles.inputWrapper, {
              [styles.inputWrapperMenuOpen]: menuOpen,
            })}
            data-testid="input-wrapper"
          >
            <Input
              className={classNames(styles.diallingCodeInput, {
                [styles.inputWithClearButton]: isShowingClearButton,
              })}
              {...getInputProps(
                {
                  ref: (element: HTMLInputElement | null): void => {
                    inputRef.current = element
                  },
                  name,
                  type: 'text',
                  placeholder,
                  onFocus: handleInputFocus,
                  onBlur: handleInputBlur,
                  onChange: handleInputChange,
                  'aria-label': 'Country',
                  'data-testid': `field-${name}`,
                  'aria-describedby': `${name}-error`,
                  ...props,
                },
                { suppressRefError: true } // removes console error where input is rendered in a portal
              )}
            />

            <SearchIcon className={styles.searchIcon} />

            <button
              onClick={handleOnClear}
              className={classNames(styles.clearButton, {
                [styles.clearButtonVisible]: isShowingClearButton,
              })}
              aria-label="Clear"
              tabIndex={inputValue !== '' ? 0 : -1}
              type="button"
            >
              <ClearButtonIcon className={styles.clearButtonIcon} />
            </button>
          </div>

          <div
            className={classNames(styles.listboxWrapper, {
              [styles.listboxWrapperOpen]: menuOpen,
            })}
            ref={listboxWrapperRef}
            data-testid="listbox-wrapper"
          >
            <div
              className={classNames(styles.listbox, {
                [styles.listboxOpen]: menuOpen,
              })}
            >
              <div className={styles.menuWrapper}>
                <ul
                  {...getMenuProps(
                    {
                      ref: menuRef,
                    },
                    { suppressRefError: true } // removes console error where input is rendered in a portal
                  )}
                  className={classNames(styles.menu, {
                    [styles.menuOpen]: menuOpen,
                  })}
                  aria-label="Dialling code list"
                >
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      return (
                        <li
                          key={`${item.label}-${index}`}
                          {...getItemProps({ item, index })}
                          className={classNames(styles.item, {
                            [styles.highlightedItem]:
                              highlightedIndex === index,
                            [styles.selectedItem]:
                              itemToString(selectedItem) === itemToString(item),
                          })}
                        >
                          <FlagIcon
                            className={styles.flagIcon}
                            flag={item.flag}
                            alt=""
                          />
                          {renderItemText(item.label, inputValue)}
                        </li>
                      )
                    })
                  ) : (
                    <li className={styles.item} data-testid="not-found-text">
                      {notFoundText}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return renderInputField()
}

export default FieldDiallingCodeAutocomplete
