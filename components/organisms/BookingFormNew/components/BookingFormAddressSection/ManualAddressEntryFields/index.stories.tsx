import { FC, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { OverlayProvider } from '@afs/components/OverlayContext'
import ManualAddressEntryFields from './index'
import type ContactAddress from '../../../../../../types/ContactAddress'

const stubbedContactAddress: ContactAddress = {
  country: 'United Kingdom',
  line1: '221B Baker Street',
  line2: '',
  line3: '',
  townCity: 'London',
  region: 'Greater London',
  postcode: 'NW1 6XE',
}

type StoryArgs = {
  initialAddress: ContactAddress
}

const MockForm: FC<StoryArgs> = ({ initialAddress }) => {
  const [address, setAddress] = useState<ContactAddress>(initialAddress)

  return (
    <OverlayProvider>
      <div style={{ maxWidth: 720 }}>
        <ManualAddressEntryFields
          address={address}
          onChange={(field, value) =>
            setAddress((prev) => ({ ...prev, [field]: value }))
          }
          onSearchForDifferentAddressButtonClick={() => {
            console.log('Search for address clicked')
          }}
        />
      </div>
    </OverlayProvider>
  )
}

const meta: Meta<StoryArgs> = {
  title: 'Organisms/BookingFormNew/ManualAddressEntryFields',
  component: MockForm,
  args: {
    initialAddress: stubbedContactAddress,
  },
  argTypes: {
    initialAddress: {
      control: 'object',
      description: 'Initial address values',
    },
  },
  parameters: {
    layout: 'padded',
    controls: { include: ['initialAddress'], expanded: true },
  },
}
export default meta

type Story = StoryObj<StoryArgs>

export const Default: Story = {}
