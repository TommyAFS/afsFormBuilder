import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/nextjs'

import type ContactAddress from '../../../../../../types/ContactAddress'

import BookingFormFormattedAddress from './index'

const sampleAddress: ContactAddress = {
  line1: '221B Baker Street',
  line2: 'Marylebone',
  line3: '',
  townCity: 'London',
  region: 'Greater London',
  postcode: 'NW1 6XE',
  country: 'United Kingdom',
}

const meta: Meta<typeof BookingFormFormattedAddress> = {
  title: 'Organisms/BookingFormNew/BookingFormFormattedAddress',
  component: BookingFormFormattedAddress,
  args: {
    address: sampleAddress,
    showManualAddressEntryFields: action('showManualAddressEntryFields'),
    onSearchForDifferentAddressButtonClick: action(
      'onSearchForDifferentAddressButtonClick'
    ),
  },
  argTypes: {
    className: { control: false, table: { disable: true } },
    showManualAddressEntryFields: {
      control: false,
      table: { disable: true },
    },
    onSearchForDifferentAddressButtonClick: {
      control: false,
      table: { disable: true },
    },
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: ['address'],
      expanded: true,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof BookingFormFormattedAddress>

export const Default: Story = {}
