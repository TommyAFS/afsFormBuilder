import { FC, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'

import { getAutocompleteSuggestions } from '../../../../../api/Search/autocompleteApi'
import { getAddressFromGooglePlaceId } from '../../../../../api/Booking/addressApi'
import type ContactAddress from '../../../../../types/ContactAddress'

import BookingFormAddressSection, {
  type BookingFormAddressSectionProps,
} from './index'

const emptyAddress: ContactAddress = {
  line1: '',
  line2: '',
  line3: '',
  region: '',
  townCity: '',
  postcode: '',
  country: '',
}

type StoryArgs = Omit<
  BookingFormAddressSectionProps,
  | 'address'
  | 'selectAddress'
  | 'clearAddress'
  | 'onAddressFieldChange'
  | 'hasError'
  | 'clearError'
>

const MockForm: FC<StoryArgs> = (props) => {
  const [address, setAddress] = useState<ContactAddress>(emptyAddress)
  const [hasError, setHasError] = useState(false)

  return (
    <BookingFormAddressSection
      {...props}
      address={address}
      selectAddress={setAddress}
      clearAddress={() => setAddress(emptyAddress)}
      onAddressFieldChange={(field, value) =>
        setAddress((prev) => ({ ...prev, [field]: value }))
      }
      hasError={hasError}
      clearError={() => setHasError(false)}
    />
  )
}

const meta: Meta<typeof MockForm> = {
  title: 'Organisms/BookingFormNew/BookingFormAddressSection',
  component: MockForm,
  args: {
    name: 'tenantDetails.address',
    autocompleteApi: getAutocompleteSuggestions,
    addressApi: getAddressFromGooglePlaceId,
    autocompleteFieldInitialValue: '',
  },
  argTypes: {
    autocompleteFieldInitialValue: {
      control: { type: 'text' },
    },
    name: { table: { disable: true } },
    autocompleteApi: { table: { disable: true } },
    addressApi: { table: { disable: true } },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
    manualAddressFieldsClassName: { table: { disable: true } },
    formattedAddressClassName: { table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: ['autocompleteFieldInitialValue'],
      expanded: true,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ marginBottom: '20em' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof MockForm>

export const Default: Story = {}
