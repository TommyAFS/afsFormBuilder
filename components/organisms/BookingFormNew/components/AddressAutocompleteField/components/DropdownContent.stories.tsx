import { useRef } from 'react'
import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/nextjs'

import type Suggestion from '../../../../../../types/Suggestion'

import DropdownContent from './DropdownContent'

const sampleOptions: Suggestion[] = [
  {
    placeId: 'pid-1',
    name: 'Baker House',
    label: { mainText: 'Baker House', secondaryText: 'Baker Street, London' },
    type: 'street',
    country: 'United Kingdom',
  },
  {
    placeId: 'pid-2',
    name: 'Baker Court',
    label: { mainText: 'Baker Court', secondaryText: 'Manchester' },
    type: 'street',
    country: 'United Kingdom',
  },
  {
    placeId: 'pid-3',
    name: 'Baker Apartments',
    label: { mainText: 'Baker Apartments', secondaryText: 'Birmingham' },
    type: 'street',
    country: 'United Kingdom',
  },
]

const Harness = (props: React.ComponentProps<typeof DropdownContent>) => {
  const cantFindAddressButtonRef = useRef<HTMLButtonElement | null>(null)

  return (
    <DropdownContent
      {...props}
      cantFindAddressButtonRef={cantFindAddressButtonRef}
    />
  )
}

const meta: Meta<typeof DropdownContent> = {
  title: 'Organisms/BookingFormNew/AddressAutocompleteField/DropdownContent',
  component: DropdownContent,
  render: (args) => <Harness {...args} />,
  args: {
    showError: false,
    showEmpty: false,
    noMatches: false,
    searchTerm: 'Baker',
    options: sampleOptions,
    highlightedIndex: 0,
    getItemProps: () => ({}),
    onManualAddressEntryButtonClick: action('onManualAddressEntryButtonClick'),
  },
  argTypes: {
    searchTerm: { control: 'text' },
    highlightedIndex: { control: { type: 'number' } },
    showError: { control: false, table: { disable: true } },
    showEmpty: { control: false, table: { disable: true } },
    noMatches: { control: false, table: { disable: true } },
    options: { control: false, table: { disable: true } },
    getItemProps: { control: false, table: { disable: true } },
    onManualAddressEntryButtonClick: {
      control: false,
      table: { disable: true },
    },
    cantFindAddressButtonRef: { control: false, table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: ['searchTerm', 'highlightedIndex'],
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

type Story = StoryObj<typeof DropdownContent>

export const Suggestions: Story = {}

export const NoMatches: Story = {
  args: {
    noMatches: true,
    options: [],
    searchTerm: 'Nonexistent place 12345',
  },
}

export const Empty: Story = {
  args: {
    showEmpty: true,
    options: [],
    searchTerm: 'B',
  },
}

export const Error: Story = {
  args: {
    showError: true,
    options: [],
    searchTerm: 'Baker',
  },
}
