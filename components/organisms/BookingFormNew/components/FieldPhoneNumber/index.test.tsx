import { useState } from 'react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FieldPhoneNumber from './index'
import InternationalPhoneNumber from '../../../../../models/InternationalPhoneNumber'

jest.mock('next/dynamic', () => {
  return (
    loadComponent: () => Promise<{ default: React.ComponentType<any> }>
  ) => {
    return (props: any) => <svg {...props}></svg>
  }
})

describe('FieldPhoneNumber', () => {
  const phoneNumberInput = () => screen.getByRole('textbox')
  const diallingCodeInput = () => screen.getByRole('combobox')
  const openDiallingCodeList = () =>
    screen.getByRole('button', { name: 'Open dialling code list' })

  const closeDiallingCodeList = () =>
    screen.getByRole('button', { name: 'Close dialling code list' })

  const stubbedCountryData = [
    ['United Kingdom', '+44'],
    ['United States', '+1'],
    ['Timor-Leste', '+670'],
    ['Spain', '+34'],
    ['Nigeria', '+234'],
    ['Latvia', '+371'],
  ]

  const MockForm = () => {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [countryCode, setCountryCode] = useState('GB')
    const [error, setError] = useState<string | undefined>(undefined)
    const [isTouched, setIsTouched] = useState(false)

    const validate = (number: string, code: string): string | undefined => {
      if (!number) return 'Please enter your phone number'
      if (!new InternationalPhoneNumber(number, code).isValid())
        return 'Please enter a valid phone number'
      return undefined
    }

    const handleBlur = () => {
      setIsTouched(true)
      setError(validate(phoneNumber, countryCode))
    }

    return (
      <FieldPhoneNumber
        name="phoneNumber"
        label="Phone number"
        value={phoneNumber}
        countryCode={countryCode}
        onChange={setPhoneNumber}
        onCountryCodeChange={setCountryCode}
        onBlur={handleBlur}
        error={isTouched ? error : undefined}
        isTouched={isTouched}
        required
      />
    )
  }

  const setup = () => {
    render(<MockForm />)
  }

  it('renders a required input', () => {
    setup()

    expect(phoneNumberInput()).toBeRequired()
  })

  it('renders with a GB flag icon and a GB dialling code as default', () => {
    setup()

    expect(
      within(screen.getByTestId('phoneNumber-dialling-code-button')).getByRole(
        'img'
      )
    ).toBeVisible()

    expect(screen.getByTestId('dialling-code')).toHaveTextContent('+44')
  })

  it('opens the dialling code autocomplete when the autocomplete is closed and the toggle button is clicked', () => {
    setup()

    expect(
      screen.getByTestId('phoneNumber-dialling-code-button')
    ).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(openDiallingCodeList())

    fireEvent.click(closeDiallingCodeList())

    expect(
      screen.getByTestId('phoneNumber-dialling-code-button')
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the dialling code autocomplete when the autocomplete is open and the toggle button is clicked', () => {
    setup()

    fireEvent.click(openDiallingCodeList())

    fireEvent.click(closeDiallingCodeList())

    expect(
      screen.getByTestId('phoneNumber-dialling-code-button')
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the dialling code autocomplete when the autocomplete is open and the user clicks outside of the component', async () => {
    setup()

    fireEvent.click(openDiallingCodeList())
    await userEvent.click(document.body)

    expect(
      screen.getByTestId('phoneNumber-dialling-code-button')
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it.each(stubbedCountryData)(
    'displays the correct flag icon and dialling code when a country is selected from the dialling code dropdown',
    async (name, diallingCode) => {
      setup()

      fireEvent.click(openDiallingCodeList())

      fireEvent.focus(diallingCodeInput())

      await userEvent.type(diallingCodeInput(), name)

      fireEvent.keyDown(diallingCodeInput(), { keyCode: 13 })

      expect(screen.getByTestId('dialling-code')).toHaveTextContent(
        diallingCode
      )
      const expectedFileName = name.toLowerCase().replaceAll(/\s+/g, '_')
      expect(
        within(
          screen.getByTestId('phoneNumber-dialling-code-button')
        ).getByRole('img')
      ).toHaveAttribute('src', `/media/images/flags/${expectedFileName}.svg`)
    }
  )

  it('displays in a validated state when a valid phone number is entered', async () => {
    setup()

    expect(phoneNumberInput()).toHaveValue('')

    fireEvent.change(phoneNumberInput(), { target: { value: '07428688846' } })

    fireEvent.blur(phoneNumberInput())

    expect(phoneNumberInput()).toHaveValue('07428688846')

    await waitFor(() => {
      expect(phoneNumberInput()).toHaveClass('form-input--validated')
      expect(phoneNumberInput()).not.toHaveClass('form-input--invalid')
    })
  })

  it('displays in an invalid state when an invalid phone number is entered', async () => {
    setup()

    expect(phoneNumberInput()).toHaveValue('')

    fireEvent.change(phoneNumberInput(), { target: { value: '07625' } })

    fireEvent.blur(phoneNumberInput())

    expect(phoneNumberInput()).toHaveValue('07625')

    await waitFor(() => {
      expect(phoneNumberInput()).toHaveClass('form-input--invalid')
      expect(phoneNumberInput()).not.toHaveClass('form-input--validated')
      expect(
        screen.getByTestId('field-phoneNumber.phoneNumber-error')
      ).toBeVisible()
    })
  })

  it('displays an error when a dialling code has been selected and an invalid phone number is entered', async () => {
    setup()

    fireEvent.click(openDiallingCodeList())
    fireEvent.focus(diallingCodeInput())

    await userEvent.type(diallingCodeInput(), 'Nigeria')

    fireEvent.keyDown(diallingCodeInput(), { keyCode: 13 })

    fireEvent.change(phoneNumberInput(), { target: { value: '07528777777' } })

    fireEvent.blur(phoneNumberInput())

    await waitFor(() => {
      expect(phoneNumberInput()).toHaveClass('form-input--invalid')
      expect(phoneNumberInput()).not.toHaveClass('form-input--validated')
      expect(
        screen.getByTestId('field-phoneNumber.phoneNumber-error')
      ).toBeVisible()
    })
  })

  it('does not display an error when the phone number field is empty and the dialling code menu has been opened then closed', async () => {
    setup()

    fireEvent.click(openDiallingCodeList())
    fireEvent.click(closeDiallingCodeList())

    await waitFor(() => {
      expect(phoneNumberInput()).not.toHaveClass('form-input--invalid')
      expect(
        screen.queryByTestId('field-phoneNumber.phoneNumber-error')
      ).not.toBeInTheDocument()
    })
  })

  it('does not display an error message when the dialling code menu is open', async () => {
    setup()

    expect(phoneNumberInput()).toHaveValue('')

    fireEvent.change(phoneNumberInput(), { target: { value: 'ddd' } })

    fireEvent.blur(phoneNumberInput())

    expect(phoneNumberInput()).toHaveValue('ddd')

    fireEvent.click(openDiallingCodeList())

    await waitFor(() => {
      expect(phoneNumberInput()).not.toHaveClass('form-input--invalid')
      expect(
        screen.queryByTestId('field-phoneNumber.phoneNumber-error')
      ).not.toBeInTheDocument()
    })
  })
})
