import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/nextjs'

import { GuarantorDetails } from './GuarantorDetails'

import type ContactAddress from '../../../../../types/ContactAddress'

const meta: Meta<typeof GuarantorDetails> = {
  title: 'Organisms/BookingFormNew/GuarantorDetails',
  component: GuarantorDetails,
  args: {
    onEdit: action('onEdit'),
  },
  parameters: {
    layout: 'padded',
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
type Story = StoryObj<typeof GuarantorDetails>

const completeAddress: ContactAddress = {
  line1: '221B Baker Street',
  line2: 'Marylebone',
  line3: '',
  townCity: 'London',
  region: 'Greater London',
  postcode: 'NW1 6XE',
  country: 'United Kingdom',
}

export const Complete: Story = {
  args: {
    values: {
      ecRelationship: 'parent',
      ecFirstName: 'Joan',
      ecLastName: 'Smith',
      ecEmail: 'joan.smith@example.com',
      ecPhone: '+44 7700 900123',
    },
    dobValues: {
      ecDob: { day: '12', month: '05', year: '1975' },
    },
    address: completeAddress,
  },
}

export const Partial: Story = {
  args: {
    values: {
      ecFirstName: 'Joan',
      ecLastName: 'Smith',
    },
    dobValues: {},
  },
}
