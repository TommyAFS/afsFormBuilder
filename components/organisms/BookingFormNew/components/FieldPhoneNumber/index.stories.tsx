import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import FieldPhoneNumber from './index'
import { stubbedFieldPhoneNumberArgs } from './test-data'
import countries from '../../../../../constants/countries/countries'

type StoryArgs = {
  label: string
  required?: boolean
  countryCode: string
  phoneNumber: string
}

const COUNTRY_CODES = countries.map((c) => c.code)

const meta: Meta<StoryArgs> = {
  title: 'Organisms/BookingFormNew/FieldPhoneNumber',
  component: FieldPhoneNumber as any,
  args: {
    ...stubbedFieldPhoneNumberArgs,
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    countryCode: { control: { type: 'select' }, options: COUNTRY_CODES },
    phoneNumber: { control: 'text' },
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: ['label', 'required', 'countryCode', 'phoneNumber'],
      expanded: true,
    },
  },
}

export default meta
type Story = StoryObj<StoryArgs>

const Harness = ({
  label,
  required,
  countryCode: initialCountryCode,
  phoneNumber: initialPhoneNumber,
}: StoryArgs) => {
  const safeInitialCountryCode = useMemo(() => {
    return COUNTRY_CODES.includes(initialCountryCode)
      ? initialCountryCode
      : COUNTRY_CODES[0]
  }, [initialCountryCode])

  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [countryCode, setCountryCode] = useState(safeInitialCountryCode)

  return (
    <FieldPhoneNumber
      name="contactNumber"
      id="contactNumber.phoneNumber"
      label={label}
      required={required}
      value={phoneNumber}
      countryCode={countryCode}
      onChange={setPhoneNumber}
      onCountryCodeChange={setCountryCode}
    />
  )
}

export const Default: Story = {
  render: (args) => <Harness {...args} />,
}
