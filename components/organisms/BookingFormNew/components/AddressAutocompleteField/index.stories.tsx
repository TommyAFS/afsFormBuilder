import { ComponentProps, useEffect } from 'react'
import { action } from 'storybook/actions'
import AddressAutocompleteField from './index'

import type { Meta, StoryObj } from '@storybook/nextjs'

const RESULTS_MODES = ['success', 'empty', 'error'] as const
type ResultsMode = (typeof RESULTS_MODES)[number]

type Suggestion = {
  placeId: string
  name: string
  label: { mainText: string; secondaryText: string }
}

type AutocompleteResponse =
  | { success: true; suggestions: Suggestion[] }
  | { success: false; suggestions: [] }

type AddressApiResponse = { success: true; address: any } | { success: false }

type StoryArgs = ComponentProps<typeof AddressAutocompleteField> & {
  resultsMode?: ResultsMode
}

function makeSuggestions(q: string): Suggestion[] {
  const base = q.trim() || 'Example'
  return [
    {
      placeId: 'pid-1',
      name: `${base} House`,
      label: {
        mainText: `${base} House`,
        secondaryText: 'Baker Street, London',
      },
    },
    {
      placeId: 'pid-2',
      name: `${base} Court`,
      label: { mainText: `${base} Court`, secondaryText: 'Manchester' },
    },
    {
      placeId: 'pid-3',
      name: `${base} Apartments`,
      label: { mainText: `${base} Apartments`, secondaryText: 'Birmingham' },
    },
  ]
}

// --- Mock APIs (driven by the resultsMode arg)
function mkAutocompleteApi(getMode: () => ResultsMode) {
  return async (
    _country: 'allCountries',
    searchTerm: string
  ): Promise<AutocompleteResponse> => {
    const mode = getMode()
    await new Promise((r) => setTimeout(r, 300)) // tiny delay, feels real
    if (mode === 'error') return { success: false, suggestions: [] }
    if (mode === 'empty') return { success: true, suggestions: [] }
    return { success: true, suggestions: makeSuggestions(searchTerm) }
  }
}

function mkAddressApi(getMode: () => ResultsMode) {
  return async (_placeId: string): Promise<AddressApiResponse> => {
    const mode = getMode()
    await new Promise((r) => setTimeout(r, 250))
    if (mode === 'error') return { success: false }
    return {
      success: true,
      address: {
        address1: '221B',
        address2: 'Baker Street',
        city: 'London',
        postcode: 'NW1 6XE',
        country: 'UK',
      },
    }
  }
}

const meta: Meta<StoryArgs> = {
  title: 'Organisms/BookingFormNew/AddressAutocompleteField',
  component: AddressAutocompleteField,
  args: {
    resultsMode: 'success',

    id: 'address-autocomplete',
    name: 'contactAddress' as any,
    required: true,
    initialValue: '',
    addressFieldFocussed: false,

    handleOnSelect: action('handleOnSelect'),
    clearAddress: action('clearAddress'),
    clearError: action('clearError'),
    showFormattedAddressSection: action('showFormattedAddressSection'),
    onManualAddressEntryButtonClick: action('onManualAddressEntryButtonClick'),
  },
  argTypes: {
    resultsMode: { control: { type: 'select' }, options: RESULTS_MODES },

    required: { control: 'boolean' },
    initialValue: { control: 'text' },
    addressFieldFocussed: { control: 'boolean' },

    className: { control: false },
    name: { control: false, table: { disable: true } },

    handleOnSelect: { control: false, table: { disable: true } },
    clearAddress: { control: false, table: { disable: true } },
    clearError: { control: false, table: { disable: true } },
    showFormattedAddressSection: { control: false, table: { disable: true } },
    onManualAddressEntryButtonClick: {
      control: false,
      table: { disable: true },
    },

    autocompleteApi: { control: false, table: { disable: true } },
    addressApi: { control: false, table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'resultsMode',
        'required',
        'initialValue',
        'addressFieldFocussed',
      ],
      expanded: true,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, padding: 16, position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<StoryArgs>

export const Default: Story = {
  render: (args) => {
    useEffect(() => {
      ;(window as any).google = (window as any).google || {
        maps: { places: {} },
      }
    }, [])

    const getMode = () => args.resultsMode ?? 'success'
    const autocompleteApi = mkAutocompleteApi(getMode)
    const addressApi = mkAddressApi(getMode)

    return (
      <AddressAutocompleteField
        {...args}
        autocompleteApi={autocompleteApi as any}
        addressApi={addressApi as any}
      />
    )
  },
}
