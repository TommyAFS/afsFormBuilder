import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'

import FieldDateOfBirth from './index'

import type { DateErrors } from './date.validation'

type DateOfBirthValue = {
  day: string
  month: string
  year: string
}

type StoryArgs = {
  label?: string
  required?: boolean
  day: string
  month: string
  year: string
  invalid?: DateErrors
}

const meta: Meta<StoryArgs> = {
  title: 'Organisms/BookingFormNew/FieldDateOfBirth',
  args: {
    label: 'Date of birth',
    required: false,
    day: '',
    month: '',
    year: '',
    invalid: undefined,
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    day: { control: 'text' },
    month: { control: 'text' },
    year: { control: 'text' },
    invalid: { control: false, table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
    controls: {
      include: ['label', 'required', 'day', 'month', 'year'],
      expanded: true,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<StoryArgs>

const Harness = ({ label, required, day, month, year, invalid }: StoryArgs) => {
  const [value, setValue] = useState<DateOfBirthValue>({ day, month, year })

  return (
    <FieldDateOfBirth
      id="dateOfBirth"
      label={label}
      required={required}
      value={value}
      invalid={invalid}
      onChange={setValue}
    />
  )
}

export const Default: Story = {
  render: (args) => <Harness {...args} />,
}

export const Filled: Story = {
  render: (args) => <Harness {...args} />,
  args: {
    day: '24',
    month: '08',
    year: '2001',
  },
}

export const WithError: Story = {
  render: (args) => <Harness {...args} />,
  args: {
    day: '99',
    month: '13',
    year: '12',
    invalid: {
      day: 'Day must be a real date',
      month: 'Month must be a real date',
      year: 'Year must be 4 digits',
    },
  },
}
