import { render, screen } from '@testing-library/react'

import FieldDateOfBirth from './index'

const setup = (invalid?: { day?: string; month?: string; year?: string }) =>
  render(
    <FieldDateOfBirth
      id="dob"
      label="Date of birth"
      value={{ day: '', month: '', year: '' }}
      onChange={() => {}}
      invalid={invalid}
    />
  )

describe('FieldDateOfBirth', () => {
  it('marks all three fields invalid when the whole date is missing', () => {
    const { container } = setup({
      day: 'Please enter date of birth',
      month: '',
      year: '',
    })

    expect(container.querySelectorAll('.form-field--invalid')).toHaveLength(3)
    expect(screen.getByText('Please enter date of birth')).toBeVisible()
  })

  it('marks only the affected field invalid for a single-field error', () => {
    const { container } = setup({
      day: 'Day must be a real date',
      month: undefined,
      year: undefined,
    })

    expect(container.querySelectorAll('.form-field--invalid')).toHaveLength(1)
    expect(screen.getByText('Day must be a real date')).toBeVisible()
  })

  it('shows a message for each field that has one', () => {
    setup({
      day: 'Day must be a real date',
      month: 'Month must be a real date',
      year: 'Year must include 4 digits',
    })

    expect(screen.getByText('Day must be a real date')).toBeVisible()
    expect(screen.getByText('Month must be a real date')).toBeVisible()
    expect(screen.getByText('Year must include 4 digits')).toBeVisible()
  })
})
