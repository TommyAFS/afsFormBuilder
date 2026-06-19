import { useMemo, useState } from 'react'
import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/nextjs'

import countries from '../../../../../../constants/countries/countries'

import FieldDiallingCodeAutocomplete from './index'

type DiallingCodeOption = {
  value: string
  label: string
  flag: string
}

const options: DiallingCodeOption[] = countries.map(
  ({ code, name, diallingCode, flag }) => ({
    value: code,
    label: `${name} (${diallingCode})`,
    flag,
  })
)

const itemToString = (item: DiallingCodeOption | null) =>
  item ? item.value : ''

type StoryArgs = {
  initiallyOpen: boolean
  countryCode: string
  placeholder: string
  notFoundText: string
}

const COUNTRY_CODES = options.map((option) => option.value)

const Harness = ({
  initiallyOpen,
  countryCode,
  placeholder,
  notFoundText,
}: StoryArgs) => {
  const safeCountryCode = useMemo(
    () =>
      COUNTRY_CODES.includes(countryCode) ? countryCode : COUNTRY_CODES[0],
    [countryCode]
  )

  const [menuOpen, setMenuOpen] = useState(initiallyOpen)
  const [selectedItem, setSelectedItem] = useState<DiallingCodeOption>(
    () =>
      options.find((option) => option.value === safeCountryCode) || options[0]
  )

  const handleChange = (item: DiallingCodeOption | null) => {
    action('handleChange')(item)
    if (item) {
      setSelectedItem(item)
    }
  }

  return (
    <FieldDiallingCodeAutocomplete
      id="dialling-code-autocomplete"
      name="contactNumber.diallingCode"
      options={options}
      handleChange={handleChange}
      handleFocus={action('handleFocus')}
      handleBlur={action('handleBlur')}
      selectedItem={selectedItem}
      placeholder={placeholder}
      notFoundText={notFoundText}
      itemToString={itemToString}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
    />
  )
}

const meta: Meta<StoryArgs> = {
  title: 'Organisms/BookingFormNew/FieldDiallingCodeAutocomplete',
  render: (args) => <Harness {...args} />,
  args: {
    initiallyOpen: false,
    countryCode: 'GB',
    placeholder: 'Search for countries',
    notFoundText: 'No matches found',
  },
  argTypes: {
    initiallyOpen: { control: 'boolean' },
    countryCode: { control: { type: 'select' }, options: COUNTRY_CODES },
    placeholder: { control: 'text' },
    notFoundText: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: ['initiallyOpen', 'countryCode', 'placeholder', 'notFoundText'],
      expanded: true,
    },
  },
  decorators: [
    (Story) => (
      <div
        id="dialling-code"
        style={{ maxWidth: 360, padding: 16, position: 'relative' }}
      >
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<StoryArgs>

export const Default: Story = {}

export const Open: Story = {
  args: {
    initiallyOpen: true,
  },
}
