import { useState, useRef } from 'react'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  CountryState,
  countryStateFromQuery,
  useCountryContext,
} from '../../../../../contexts/countryContext'

import AddressAutocompleteField, {
  AddressAutocompleteFieldProps,
} from './index'
import AddressApiResponse from '../../../../../types/AddressApiResponse'
import ContactAddress from '../../../../../types/ContactAddress'

jest.mock('../../../../../utils/throttle', () => {
  return (fn: (...args: any[]) => void) => fn
})

jest.mock('../../../../../contexts/countryContext')

const mockUseCountryContext = useCountryContext as jest.MockedFunction<
  typeof useCountryContext
>

const fullCountryState: CountryState = countryStateFromQuery({
  country: 'gb',
})

const mockUpdate = jest.fn()

const mockContextValue = {
  ...fullCountryState,
  update: mockUpdate,
}

mockUseCountryContext.mockReturnValue(mockContextValue)

const suggestionsFromApiResponse = [
  {
    name: '12, Abbey Street, Howth, Dublin, Ireland',
    label: {
      mainText: '12',
      secondaryText: 'Abbey Street, Howth, Dublin, Ireland',
    },
    type: 'location',
    placeId: 'ChIJO3pnbZgEZ0gRYHbnU19oh34',
    country: 'Ireland',
  },
  {
    name: '12, Abbey Street, Derby, UK',
    label: {
      mainText: '12',
      secondaryText: 'Abbey Street, Derby, UK',
    },
    type: 'location',
    placeId: 'ChIJnQvphTzxeUgR7w0bIQeC8RA',
    country: 'UK',
  },
  {
    name: '12 Abbey Street, Valleyfield, Dunfermline, UK',
    label: {
      mainText: '12 Abbey Street',
      secondaryText: 'Valleyfield, Dunfermline, UK',
    },
    type: 'location',
    placeId:
      'Ei0xMiBBYmJleSBTdHJlZXQsIFZhbGxleWZpZWxkLCBEdW5mZXJtbGluZSwgVUsiMBIuChQKEgmrMPh-KtSHSBHiLbn-sdL7LxAMKhQKEgkffip3KtSHSBHKUa5LijFuLw',
    country: 'UK',
  },
  {
    name: '12 Abbey Street, Gornalwood, Dudley, UK',
    label: {
      mainText: '12 Abbey Street',
      secondaryText: 'Gornalwood, Dudley, UK',
    },
    type: 'location',
    placeId:
      'EicxMiBBYmJleSBTdHJlZXQsIEdvcm5hbHdvb2QsIER1ZGxleSwgVUsiMBIuChQKEgkZwGKnfppwSBHtEt2YMqDntxAMKhQKEgmLT1UBfJpwSBF9Zhx1CD07jA',
    country: 'UK',
  },
  {
    name: '12, Abbey Street, Rhyl, Denbighshire, UK',
    label: {
      mainText: '12',
      secondaryText: 'Abbey Street, Rhyl, Denbighshire, UK',
    },
    type: 'location',
    placeId: 'ChIJKcoqXRUoZUgR3ZOiddftRz4',
    country: 'UK',
  },
]

const countryFromApiResponse = 'Ireland'

const stubbedAutocompleteApi = jest.fn().mockResolvedValue({
  success: true,
  suggestions: suggestionsFromApiResponse,
  country: countryFromApiResponse,
})

const stubbedAddressApi = jest.fn().mockResolvedValue({
  success: true,
  address: {
    line1: '1 Abbey Street',
    line2: 'Howth',
    line3: '',
    townCity: 'Dublin',
    region: '',
    postcode: 'D13 R2P6',
    country: 'Ireland',
  },
})

const label = () => screen.getByText('Search address')
const input = () => screen.queryByRole('searchbox') as HTMLInputElement

const options = () =>
  within(screen.getByTestId('address-autocomplete-options')).queryAllByRole(
    'option'
  )

describe('AddressAutocompleteField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  type MockFormProps = Omit<
    AddressAutocompleteFieldProps,
    'handleOnSelect' | 'clearAddress' | 'clearError'
  >

  const MockForm = (props: MockFormProps) => {
    const [fieldInvalid, setFieldInvalid] = useState(false)
    const [fieldError, setFieldError] = useState<{
      message?: string
    } | null>(null)
    const addressSelectedRef = useRef(false)

    const selectAddress = (_address: ContactAddress) => {
      addressSelectedRef.current = true
      setFieldInvalid(false)
      setFieldError(null)
    }

    const clearAddress = () => {
      addressSelectedRef.current = false
    }

    const clearAddressError = () => {
      setFieldInvalid(false)
      setFieldError(null)
    }

    return (
      <AddressAutocompleteField
        handleOnSelect={selectAddress}
        clearAddress={clearAddress}
        clearError={clearAddressError}
        invalid={fieldInvalid}
        error={fieldError}
        {...props}
      />
    )
  }

  const setup = async (
    props?: Omit<Partial<AddressAutocompleteFieldProps>, 'name'>
  ) => {
    const initialProps: MockFormProps = {
      name: 'tenantDetails.address',
      required: true,
      autocompleteApi: stubbedAutocompleteApi,
      addressApi: stubbedAddressApi,
      initialValue: '',
      onManualAddressEntryButtonClick: () => {},
      showFormattedAddressSection: () => {},
      addressFieldFocussed: false,
    }

    const mergedProps: MockFormProps & Partial<AddressAutocompleteFieldProps> =
      {
        ...initialProps,
        ...props,
      }

    render(<MockForm {...mergedProps} />)

    await act(async () => {
      // Wait for Google autocomplete to load
      await Promise.resolve()
    })
  }

  describe('Searching for an address', () => {
    it('renders with the correct label, and placeholder', async () => {
      await setup()

      expect(label().textContent).toBe('Search address')
      expect(input()?.name).toBe('tenantDetails.address')
      expect(input()?.placeholder).toBe('Start typing address')
    })

    it('renders with an initialValue where one is provided', async () => {
      await setup({ initialValue: '12 Crabville Gardens, UK' })

      expect(input()).toHaveValue('12 Crabville Gardens, UK')
    })

    it('calls the autocomplete api with the input value as the user types', async () => {
      const mockAutocompleteApi = jest
        .fn()
        .mockResolvedValue({ success: true, suggestions: [] })

      const searchTerm = 'Manch'

      await setup({ autocompleteApi: mockAutocompleteApi })

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: searchTerm } })

      await waitFor(() => {
        expect(mockAutocompleteApi).toHaveBeenCalledWith(
          'allCountries',
          searchTerm
        )
      })
    })

    it('does not call the autocomplete api while the user has typed in less than 3 characters', async () => {
      const mockAutocompleteApi = jest
        .fn()
        .mockResolvedValue({ success: true, suggestions: [] })

      const searchTerm = 'Ma'

      await setup({ autocompleteApi: mockAutocompleteApi })

      fireEvent.change(input(), { target: { value: searchTerm } })

      await waitFor(() => {
        expect(mockAutocompleteApi).not.toHaveBeenCalled()
      })
    })

    it('clears the dropdown options when user types in less than 3 characters', async () => {
      await setup()

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey Street D' } })

      await waitFor(() => {
        expect(options().length).toBe(5)
      })

      fireEvent.change(input(), { target: { value: 'Ab' } })

      await waitFor(() => {
        expect(
          screen.queryByTestId('address-autocomplete-options')
        ).not.toBeInTheDocument()
      })
    })

    it('renders the suggestions returned by the api as dropdown options, when api has returned suggestions', async () => {
      await setup()

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey Street D' } })

      await waitFor(() => {
        expect(options().length).toBe(suggestionsFromApiResponse.length)

        expect(options()[0].textContent).toBe(
          `${suggestionsFromApiResponse[0].label.mainText} ${suggestionsFromApiResponse[0].label.secondaryText}`
        )
        expect(options()[1].textContent).toBe(
          `${suggestionsFromApiResponse[1].label.mainText} ${suggestionsFromApiResponse[1].label.secondaryText}`
        )
        expect(options()[2].textContent).toBe(
          `${suggestionsFromApiResponse[2].label.mainText} ${suggestionsFromApiResponse[2].label.secondaryText}`
        )
      })
    })

    it('renders a `manually enter address` button in the dropdown, when the api has returned suggestions', async () => {
      await setup()

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey Street D' } })

      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: `Can't find your address? Enter it manually`,
          })
        ).toBeVisible()
      })
    })

    it('updates the selected dropdown item when the user selects an item using the Enter key', async () => {
      const mockHandleOnSelect = jest.fn()

      await setup({ handleOnSelect: mockHandleOnSelect })

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey' } })

      await waitFor(() => {
        expect(options().length).toBe(suggestionsFromApiResponse.length)
        fireEvent.keyDown(input(), { keyCode: 13 })
      })

      expect(mockHandleOnSelect).toHaveBeenCalledWith({
        line1: '1 Abbey Street',
        line2: 'Howth',
        line3: '',
        townCity: 'Dublin',
        region: '',
        postcode: 'D13 R2P6',
        country: 'Ireland',
      })
    })

    it('updates the selected dropdown item when the user selects an item by clicking it', async () => {
      const mockHandleOnSelect = jest.fn()

      await setup({ handleOnSelect: mockHandleOnSelect })

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey' } })

      await waitFor(() => {
        expect(options().length).toBe(suggestionsFromApiResponse.length)
        fireEvent.click(options()[1])
      })

      await waitFor(() => {
        expect(mockHandleOnSelect).toHaveBeenCalledWith({
          line1: '1 Abbey Street',
          line2: 'Howth',
          line3: '',
          townCity: 'Dublin',
          region: '',
          postcode: 'D13 R2P6',
          country: 'Ireland',
        })
      })
    })

    it('does not update the selected dropdown item with the first autocomplete suggestion when the user blurs the input by tabbing onto the clear button', async () => {
      const mockHandleOnSelect = jest.fn()

      await setup({ handleOnSelect: mockHandleOnSelect })

      await userEvent.type(input(), '1 Abbey')

      await waitFor(() => {
        expect(options().length).toBe(suggestionsFromApiResponse.length)
      })

      await userEvent.tab()

      await waitFor(() => {
        expect(mockHandleOnSelect).not.toHaveBeenCalled()
      })
    })

    it('explains to the user what to search for when the user focuses on the field and there is no value currently in there', async () => {
      await setup()

      fireEvent.focus(input())

      expect(screen.getByTestId('empty-search-text')).toBeInTheDocument()
    })

    it('hides the explanation of what a user should search for when a user moves focus from the field', async () => {
      await setup()

      fireEvent.blur(screen.getByPlaceholderText('Start typing address'))

      expect(screen.queryByTestId('empty-search-text')).not.toBeInTheDocument()
    })

    it('hides the explanation of what a user should search for when a user starts to type', async () => {
      await setup()

      fireEvent.focus(input())

      expect(screen.getByTestId('empty-search-text')).toBeInTheDocument()

      await userEvent.type(input(), 'Man')

      await waitFor(() => {
        expect(
          screen.queryByTestId('empty-search-text')
        ).not.toBeInTheDocument()
      })
    })

    it('displays no suggestions found message when the search term does not match any results from the autocomplete api', async () => {
      const stubbedAutocompleteApiNoMatches = jest
        .fn()
        .mockResolvedValue({ success: true, suggestions: [] })

      await setup({ autocompleteApi: stubbedAutocompleteApiNoMatches })

      fireEvent.focus(screen.getByPlaceholderText('Start typing address'))
      fireEvent.change(screen.getByPlaceholderText('Start typing address'), {
        target: { value: 'abcdef' },
      })

      await waitFor(() => {
        expect(screen.getByTestId('no-matches-found')).toBeVisible()
        expect(
          screen.getByText('Maybe try a less specific address?')
        ).toBeVisible()
      })
    })

    it('displays the clear button after a use has started typing into the field', async () => {
      await setup()

      expect(screen.getByRole('button', { name: 'Clear' })).toHaveClass(
        'clearButton'
      )

      fireEvent.change(input(), { target: { value: 'Hello' } })

      expect(screen.getByRole('button', { name: 'Clear' })).toHaveClass(
        'clearButton clearButtonVisible'
      )
    })

    it('does not display no suggestions found message when the search term does not match any results and the user clicks the clear button', async () => {
      const stubbedAutocompleteApiNoMatches = jest
        .fn()
        .mockResolvedValue({ success: true, suggestions: [] })

      await setup({ autocompleteApi: stubbedAutocompleteApiNoMatches })

      fireEvent.focus(screen.getByPlaceholderText('Start typing address'))
      fireEvent.change(screen.getByPlaceholderText('Start typing address'), {
        target: { value: 'abcdef' },
      })

      await waitFor(() => {
        expect(screen.queryByTestId('no-matches-found')).toBeVisible()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

      expect(screen.queryByTestId('no-matches-found')).not.toBeInTheDocument()
    })

    it('deletes the value in the field when the clear button is clicked', async () => {
      await setup()

      fireEvent.change(input(), { target: { value: 'Manchester' } })

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

      expect(input().value).toBe('')
    })

    it('displays an error message when the autocomplete api returns an error', async () => {
      const stubbedFailedAutoCompleteApi = jest
        .fn()
        .mockResolvedValue({ success: false })

      await setup({ autocompleteApi: stubbedFailedAutoCompleteApi })

      fireEvent.focus(screen.getByPlaceholderText('Start typing address'))
      fireEvent.change(screen.getByPlaceholderText('Start typing address'), {
        target: { value: 'abcdef' },
      })

      await waitFor(() => {
        expect(stubbedFailedAutoCompleteApi).toHaveBeenCalled()
        expect(
          screen.getByText('We couldn’t retrieve any addresses.')
        ).toBeInTheDocument()
      })
    })

    it('displays an error message when the address api returns an error', async () => {
      const stubbedFailedAddressApi = jest
        .fn()
        .mockResolvedValue({ success: false })

      await setup({
        addressApi: stubbedFailedAddressApi,
      })

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey' } })

      await waitFor(() => {
        fireEvent.click(options()[1])
      })

      await waitFor(() => {
        expect(
          screen.getByText('We couldn’t retrieve the address.')
        ).toBeInTheDocument()
      })
    })

    it('disables the input when an address has been selected and the addressApi request has not yet resolved', async () => {
      const unresolvedAddressApi = (): Promise<AddressApiResponse> => {
        return new Promise(() => {})
      }

      await setup({
        addressApi: unresolvedAddressApi,
      })

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey' } })

      await waitFor(() => {
        fireEvent.click(options()[1])
      })

      await waitFor(() => {
        expect(input()).toBeDisabled()
      })
    })

    it('clears field errors when the field is typed into and the field has an error', async () => {
      const mockClearError = jest.fn()

      await setup({ clearError: mockClearError })

      fireEvent.focus(input())
      fireEvent.change(input(), { target: { value: '1 Abbey D' } })

      expect(mockClearError).toHaveBeenCalled()
    })
  })
})
