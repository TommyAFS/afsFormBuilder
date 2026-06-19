import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as Sentry from '@sentry/nextjs'

import BookingFormNew, { BookingFormNewProps } from './index'
import {
  stubbedBookingFormNewProps,
  stubbedProgressPayload,
  stubbedPersonalDetails,
  stubbedAdditionalDetails,
  stubbedEmergencyContact,
  stubbedGuarantor,
} from './test-data'
import {
  fillAndSubmitPersonalDetails,
  fillAndSubmitAdditionalDetails,
  fillAndSubmitEmergencyContact,
  fillAndSubmitGuarantorWithExistingEC,
  fillAndSubmitGuarantorWithNewGuarantor,
} from './testHelpers'
import type { FieldSelectProps } from '@afs/components/FieldSelect'
import InternationalPhoneNumber from '../../../models/InternationalPhoneNumber'

jest.mock('@afs/components/FieldSelect', () => ({
  __esModule: true,
  default: ({
    id,
    name,
    label,
    options,
    value,
    onChange,
    required,
    error,
  }: FieldSelectProps) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={name}
        value={value as string | undefined}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
      >
        <option value="">Select...</option>
        {(options || []).map((opt) => {
          const val = opt.value as string
          return (
            <option key={val} value={val}>
              {opt.label}
            </option>
          )
        })}
      </select>
      {error && <span>{error}</span>}
    </div>
  ),
}))

jest.mock('./components/FieldPhoneNumber')

jest.mock('./components/FieldDateOfBirth')

jest.mock('../../molecules/FieldCountryAutocomplete')

jest.mock('./components/BookingFormAddressSection')

const setup = (props: Partial<BookingFormNewProps> = {}) =>
  render(<BookingFormNew {...stubbedBookingFormNewProps} {...props} />)

describe('BookingFormNew', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
  })

  it('renders the booking form', () => {
    setup()
    expect(screen.getByTestId('booking-form-new')).toBeVisible()
  })

  it('renders all step legends', () => {
    setup()
    expect(screen.getByText(/Personal details/i)).toBeVisible()
    expect(screen.getByText(/Additional Details/i)).toBeVisible()
    expect(screen.getByText(/Emergency Contact/i)).toBeVisible()
    expect(screen.getByText(/Guarantor/i)).toBeVisible()
  })

  it('shows only the Personal Details step as active initially', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible()
    expect(
      screen.getByText(/Additional Details/i).closest('fieldset')
    ).toBeDisabled()
    expect(
      screen.getByText(/Emergency Contact/i).closest('fieldset')
    ).toBeDisabled()
    expect(screen.getByText(/Guarantor/i).closest('fieldset')).toBeDisabled()
  })

  describe('step validation', () => {
    it('shows required field errors when Continue is clicked on an empty Personal Details step', () => {
      setup()
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(screen.getByText('Please enter first name')).toBeVisible()
      expect(screen.getByText('Please enter last name')).toBeVisible()
      expect(screen.getByText('Please enter email address')).toBeVisible()
      expect(screen.getByText('Please enter phone number')).toBeVisible()
    })

    it('clears a field error as the user corrects a value', () => {
      setup()
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(screen.getByText('Please enter first name')).toBeVisible()
      fireEvent.change(screen.getByLabelText('First name'), {
        target: { value: stubbedPersonalDetails.firstName },
      })
      expect(
        screen.queryByText('Please enter first name')
      ).not.toBeInTheDocument()
    })

    it('shows an error for each date of birth field that is invalid, not just the first', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      fireEvent.change(screen.getByLabelText('Date of birth day'), {
        target: { value: '99' },
      })
      fireEvent.change(screen.getByLabelText('Date of birth month'), {
        target: { value: '13' },
      })
      fireEvent.change(screen.getByLabelText('Date of birth year'), {
        target: { value: '12' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(screen.getByText('Day must be a real date')).toBeVisible()
      expect(screen.getByText('Month must be a real date')).toBeVisible()
      expect(screen.getByText('Year must include 4 digits')).toBeVisible()
    })

    it('clears only the edited date of birth field error, leaving the other date of birth errors in place', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      fireEvent.change(screen.getByLabelText('Date of birth day'), {
        target: { value: '99' },
      })
      fireEvent.change(screen.getByLabelText('Date of birth month'), {
        target: { value: '13' },
      })
      fireEvent.change(screen.getByLabelText('Date of birth year'), {
        target: { value: '12' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      fireEvent.change(screen.getByLabelText('Date of birth day'), {
        target: { value: '15' },
      })
      expect(
        screen.queryByText('Day must be a real date')
      ).not.toBeInTheDocument()
      expect(screen.getByText('Month must be a real date')).toBeVisible()
      expect(screen.getByText('Year must include 4 digits')).toBeVisible()
    })
  })

  describe('step progression', () => {
    it('shows a summary of the completed Personal Details step', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      expect(
        screen.getByText(new RegExp(stubbedPersonalDetails.firstName))
      ).toBeVisible()
    })

    it('shows the Continue button as Saving... while the step is being submitted', async () => {
      globalThis.fetch = jest.fn().mockReturnValue(new Promise(() => {}))
      setup()
      fireEvent.change(screen.getByLabelText('First name'), {
        target: { value: stubbedPersonalDetails.firstName },
      })
      fireEvent.change(screen.getByLabelText('Last name'), {
        target: { value: stubbedPersonalDetails.lastName },
      })
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: stubbedPersonalDetails.email },
      })
      fireEvent.change(screen.getByLabelText('Phone number'), {
        target: { value: stubbedPersonalDetails.phone },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Saving...' })).toBeVisible()
      )
    })

    it('reports a failed step save to Sentry', async () => {
      ;(Sentry.captureException as jest.Mock).mockClear()
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })

      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('radio', { name: 'Yes' }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() =>
        expect(Sentry.captureException).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Soft booking progress save failed: transientError',
          }),
          expect.anything()
        )
      )
    })

    it('shows a summary of the completed Additional Details step', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      const serialisedDob = `${stubbedAdditionalDetails.dobDay}/${stubbedAdditionalDetails.dobMonth}/${stubbedAdditionalDetails.dobYear}`
      expect(screen.getByText(new RegExp(serialisedDob))).toBeVisible()
    })

    it('shows a summary of the completed Emergency Contact step', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
      expect(
        screen.getByText(new RegExp(stubbedEmergencyContact.firstName))
      ).toBeVisible()
    })

    it('shows a summary of the completed Guarantor step', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
      fireEvent.click(
        screen.getByRole('radio', { name: 'No, I need a guarantor' })
      )
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Continue to pay deposit' })
        ).toBeVisible()
      )
      expect(screen.getByText('No, I need a guarantor')).toBeVisible()
    })

    it('sends the emergency contact DOB as a UTC ISO string in the step API payload', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
      const fetchMock = globalThis.fetch as jest.Mock
      const ecCall = fetchMock.mock.calls.find(([, init]) => {
        try {
          return !!(JSON.parse(init.body) as Record<string, unknown>)
            .emergencyContact
        } catch {
          return false
        }
      })
      expect(ecCall).toBeDefined()
      const body = JSON.parse(ecCall[1].body)
      expect(body.emergencyContact.dateOfBirth).toBe(
        stubbedProgressPayload.emergencyContact!.dateOfBirth
      )
    })

    it('sends the student DOB as a UTC ISO string in the step API payload', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      const fetchMock = globalThis.fetch as jest.Mock
      const additionalDetailsCall = fetchMock.mock.calls.find(([, init]) => {
        try {
          return !!(JSON.parse(init.body) as Record<string, unknown>)
            .additionalDetails
        } catch {
          return false
        }
      })
      expect(additionalDetailsCall).toBeDefined()
      const body = JSON.parse(additionalDetailsCall[1].body)
      expect(body.additionalDetails.dateOfBirth).toBe(
        '2000-06-01T00:00:00.000Z'
      )
    })

    it('sends the personal details in the step API payload', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      const fetchMock = globalThis.fetch as jest.Mock
      const personalCall = fetchMock.mock.calls.find(([, init]) => {
        try {
          return !!(JSON.parse(init.body) as Record<string, unknown>)
            .personalDetails
        } catch {
          return false
        }
      })
      expect(personalCall).toBeDefined()
      const body = JSON.parse(personalCall[1].body)
      expect(body.personalDetails.firstName).toBe(
        stubbedPersonalDetails.firstName
      )
      expect(body.personalDetails.lastName).toBe(
        stubbedPersonalDetails.lastName
      )
      expect(body.personalDetails.email).toBe(stubbedPersonalDetails.email)
      // Phone is saved in international E.164 format.
      expect(body.personalDetails.phone).toBe(
        new InternationalPhoneNumber(
          stubbedPersonalDetails.phone,
          'GB'
        ).toE164Format()
      )
    })

    it('sends the guarantor DOB as a UTC ISO string in the step API payload', async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
      await fillAndSubmitGuarantorWithNewGuarantor()
      const fetchMock = globalThis.fetch as jest.Mock
      const guarantorCall = fetchMock.mock.calls.find(([, init]) => {
        try {
          return !!(JSON.parse(init.body) as Record<string, unknown>).guarantor
        } catch {
          return false
        }
      })
      expect(guarantorCall).toBeDefined()
      const body = JSON.parse(guarantorCall[1].body)
      expect(body.guarantor.dateOfBirth).toBe(
        stubbedProgressPayload.guarantor!.dateOfBirth
      )
    })

    it('uses the provided correlationId in API calls', async () => {
      const correlationId = 'test-correlation-id-123'
      render(
        <BookingFormNew
          {...stubbedBookingFormNewProps}
          correlationId={correlationId}
        />
      )
      await fillAndSubmitPersonalDetails()
      const fetchMock = globalThis.fetch as jest.Mock
      const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(url).toContain(correlationId)
    })
  })

  describe('Guarantor step', () => {
    const setupAtGuarantorSection = async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
    }

    it('does not submit the form when the guarantor "Learn more" link is activated', async () => {
      const onAdvancePageStep = jest.fn()
      render(
        <BookingFormNew
          {...stubbedBookingFormNewProps}
          initialFormState={{ guarantorRequirement: 'uk' }}
          onAdvancePageStep={onAdvancePageStep}
        />
      )
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()

      const learnMore = screen.getByRole('button', { name: 'Learn more' })
      // The link must not be a submit button, otherwise activating it (by click
      // or via implicit form submission on Enter) submits the booking form.
      expect(learnMore).toHaveAttribute('type', 'button')

      fireEvent.click(learnMore)
      expect(onAdvancePageStep).not.toHaveBeenCalled()
    })

    it('keeps entered guarantor details when guarantorSameAsEC is toggled off and back on', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('radio', { name: 'No' }))
      fireEvent.change(screen.getByLabelText('First name'), {
        target: { value: stubbedGuarantor.firstName },
      })
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: stubbedGuarantor.email },
      })

      // Toggle to "same as emergency contact" (hides the detail fields) and
      // back again — the previously entered details should still be there.
      fireEvent.click(screen.getByRole('radio', { name: 'Yes' }))
      fireEvent.click(screen.getByRole('radio', { name: 'No' }))

      expect(screen.getByLabelText('First name')).toHaveValue(
        stubbedGuarantor.firstName
      )
      expect(screen.getByLabelText('Email address')).toHaveValue(
        stubbedGuarantor.email
      )
    })

    it('does not show the guarantorSameAsEC field when hasGuarantor is not set', async () => {
      await setupAtGuarantorSection()
      expect(
        screen.queryByRole('radiogroup', {
          name: 'Is your guarantor the same as your emergency contact?',
        })
      ).not.toBeInTheDocument()
    })

    it('shows the guarantorSameAsEC field when hasGuarantor is yes', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      expect(
        screen.getByRole('radiogroup', {
          name: 'Is your guarantor the same as your emergency contact?',
        })
      ).toBeVisible()
    })

    it('shows the GuarantorDetails summary with emergency contact data when guarantorSameAsEC is yes', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('radio', { name: 'Yes' }))
      screen
        .getAllByText(
          `${stubbedEmergencyContact.firstName} ${stubbedEmergencyContact.lastName}`
        )
        .forEach((el) => expect(el).toBeVisible())
    })

    it('shows guarantor personal detail fields when guarantorSameAsEC is no', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('radio', { name: 'No' }))
      expect(screen.getByLabelText('Relationship to you')).toBeVisible()
    })

    it('hides the guarantorSameAsEC field when hasGuarantor changes away from yes', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      expect(
        screen.getByRole('radiogroup', {
          name: 'Is your guarantor the same as your emergency contact?',
        })
      ).toBeVisible()
      fireEvent.click(
        screen.getByRole('radio', { name: 'No, I need a guarantor' })
      )
      expect(
        screen.queryByRole('radiogroup', {
          name: 'Is your guarantor the same as your emergency contact?',
        })
      ).not.toBeInTheDocument()
    })

    it('shows a validation error when Continue is clicked without selecting hasGuarantor', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(screen.getByText('Please select an option')).toBeVisible()
    })

    it('shows a validation error for guarantorSameAsEC when hasGuarantor is yes and guarantorSameAsEC is not yet selected', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(screen.getByText('Please select an option')).toBeVisible()
    })

    it('shows validation errors for guarantor personal fields when guarantorSameAsEC is no and Continue is clicked', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('radio', { name: 'No' }))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(screen.getByText('Please select relationship')).toBeVisible()
      expect(screen.getByText('Please enter first name')).toBeVisible()
      expect(screen.getByText('Please enter last name')).toBeVisible()
      expect(screen.getByText('Please enter email address')).toBeVisible()
      expect(screen.getByText('Please enter phone number')).toBeVisible()
    })

    it('shows a DOB validation error when Continue is clicked with an empty guarantor date of birth', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('radio', { name: 'No' }))
      fireEvent.change(screen.getByLabelText('Relationship to you'), {
        target: { value: stubbedGuarantor.relationship },
      })
      fireEvent.change(screen.getByLabelText('First name'), {
        target: { value: stubbedGuarantor.firstName },
      })
      fireEvent.change(screen.getByLabelText('Last name'), {
        target: { value: stubbedGuarantor.lastName },
      })
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: stubbedGuarantor.email },
      })
      fireEvent.change(screen.getByLabelText('Phone number'), {
        target: { value: stubbedGuarantor.phone },
      })
      fireEvent.click(screen.getByTestId('address-select-guarantorAddress'))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(screen.getByText('Please enter date of birth')).toBeVisible()
    })

    it('copies emergency contact data into the guarantor payload when guarantorSameAsEC is yes', async () => {
      const onSubmitSuccess = jest.fn()
      setup({ onSubmitSuccess })
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
      await fillAndSubmitGuarantorWithExistingEC()

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )

      await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalled())
      const payload = onSubmitSuccess.mock.calls[0][0]
      expect(payload.guarantor.firstName).toBe(
        stubbedEmergencyContact.firstName
      )
      expect(payload.guarantor.lastName).toBe(stubbedEmergencyContact.lastName)
      expect(payload.guarantor.email).toBe(stubbedEmergencyContact.email)
      expect(payload.guarantor.dateOfBirth).toBe(
        stubbedProgressPayload.emergencyContact!.dateOfBirth
      )
    })

    it('navigates back to the Emergency Contact step when "Edit details" is clicked on the guarantor summary', async () => {
      await setupAtGuarantorSection()
      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
      fireEvent.click(screen.getByRole('radio', { name: 'Yes' }))
      fireEvent.click(screen.getByRole('button', { name: 'Edit details' }))
      expect(screen.getByLabelText('Relationship to you')).toBeVisible()
    })

    it('can complete the Guarantor step when guarantorSameAsEC is yes', async () => {
      await setupAtGuarantorSection()
      await fillAndSubmitGuarantorWithExistingEC()
      expect(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      ).toBeVisible()
    })

    it('shows EC details in the completed guarantor step summary when guarantorSameAsEC is yes', async () => {
      await setupAtGuarantorSection()
      await fillAndSubmitGuarantorWithExistingEC()
      screen
        .getAllByText(
          `${stubbedEmergencyContact.firstName} ${stubbedEmergencyContact.lastName}`
        )
        .forEach((el) => expect(el).toBeVisible())
      expect(screen.getByText(stubbedEmergencyContact.phone)).toBeVisible()
    })

    it('can complete the Guarantor step when guarantorSameAsEC is no', async () => {
      await setupAtGuarantorSection()
      await fillAndSubmitGuarantorWithNewGuarantor()
      expect(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      ).toBeVisible()
    })

    it('summarises the new guarantor with name and email and not the selection answers', async () => {
      await setupAtGuarantorSection()
      await fillAndSubmitGuarantorWithNewGuarantor()
      expect(
        screen.getByText(
          `${stubbedGuarantor.firstName} ${stubbedGuarantor.lastName}`
        )
      ).toBeVisible()
      expect(screen.getByText(stubbedGuarantor.email)).toBeVisible()
      // The hasGuarantor / guarantorSameAsEC radios must not leak into the
      // summary — it should follow the same pattern as the emergency contact.
      expect(screen.queryByText('Yes, I have one')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    const setupAtCompletedForm = async () => {
      setup()
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
      fireEvent.click(
        screen.getByRole('radio', { name: 'No, I need a guarantor' })
      )
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Continue to pay deposit' })
        ).toBeVisible()
      )
    }

    it('does not show the submit button until all steps are complete', () => {
      setup()
      expect(
        screen.queryByRole('button', { name: 'Continue to pay deposit' })
      ).not.toBeInTheDocument()
    })

    it('keeps the submit button mounted but disabled until all steps are complete', () => {
      setup()
      // The button is always rendered (hidden via CSS) so its space is
      // reserved, but it stays disabled so an Enter keypress cannot submit the
      // form before every section is complete.
      const submitButton = screen
        .getByText('Continue to pay deposit')
        .closest('button')
      expect(submitButton).toBeDisabled()
    })

    it('shows the submit button when all steps are complete', async () => {
      await setupAtCompletedForm()
      expect(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      ).toBeVisible()
    })

    it('shows a loading spinner on the submit button while the form is being submitted', async () => {
      await setupAtCompletedForm()
      globalThis.fetch = jest.fn().mockReturnValue(new Promise(() => {}))
      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )
      await waitFor(() => expect(screen.getByTestId('spinner')).toBeVisible())
      expect(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      ).toBeDisabled()
    })

    it('clears the submit button loading state after a successful submission so it is not stuck when the form is revisited', async () => {
      // The form stays mounted (just hidden by the parent) after advancing to
      // payment, so a lingering loading state would leave the button stuck
      // spinning when the user navigates back to Details.
      await setupAtCompletedForm()
      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Continue to pay deposit' })
        ).toBeEnabled()
      )
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })

    it('scrolls the submit button into view at the bottom of the viewport when the form is complete', async () => {
      const scrollIntoViewSpy = jest
        .spyOn(Element.prototype, 'scrollIntoView')
        .mockImplementation(() => {})

      try {
        setup()
        await fillAndSubmitPersonalDetails()
        await fillAndSubmitAdditionalDetails()
        await fillAndSubmitEmergencyContact()
        fireEvent.click(
          screen.getByRole('radio', { name: 'No, I need a guarantor' })
        )
        fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
        await waitFor(() =>
          expect(
            screen.getByRole('button', { name: 'Continue to pay deposit' })
          ).toBeVisible()
        )
        await waitFor(() =>
          expect(scrollIntoViewSpy).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'end',
          })
        )
      } finally {
        scrollIntoViewSpy.mockRestore()
      }
    })

    it('scrolls to the top of the page on submission so the next step is in view', async () => {
      const scrollToMock = jest.fn()
      const originalScrollTo = window.scrollTo
      window.scrollTo = scrollToMock as unknown as typeof window.scrollTo

      try {
        setup()
        await fillAndSubmitPersonalDetails()
        await fillAndSubmitAdditionalDetails()
        await fillAndSubmitEmergencyContact()
        fireEvent.click(
          screen.getByRole('radio', { name: 'No, I need a guarantor' })
        )
        fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
        await waitFor(() =>
          expect(
            screen.getByRole('button', { name: 'Continue to pay deposit' })
          ).toBeVisible()
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Continue to pay deposit' })
        )
        await waitFor(() =>
          expect(scrollToMock).toHaveBeenCalledWith({ top: 0 })
        )
      } finally {
        window.scrollTo = originalScrollTo
      }
    })

    it('sends the separate guarantor data in the full submit payload when guarantorSameAsEC is no', async () => {
      const onSubmitSuccess = jest.fn()
      setup({ onSubmitSuccess })
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      await fillAndSubmitEmergencyContact()
      await fillAndSubmitGuarantorWithNewGuarantor()

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )

      await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalled())
      const payload = onSubmitSuccess.mock.calls[0][0]
      expect(payload.guarantor.firstName).toBe(stubbedGuarantor.firstName)
      expect(payload.guarantor.lastName).toBe(stubbedGuarantor.lastName)
      expect(payload.guarantor.email).toBe(stubbedGuarantor.email)
      expect(payload.guarantor.dateOfBirth).toBe(
        stubbedProgressPayload.guarantor!.dateOfBirth
      )
    })

    it('does not submit again while a submission is already in flight', async () => {
      const onSubmitSuccess = jest.fn(() => new Promise<void>(() => {}))
      render(
        <BookingFormNew
          {...stubbedBookingFormNewProps}
          onSubmitSuccess={onSubmitSuccess}
          initialFormState={{
            guarantorRequirement: 'notRequired',
            personalDetails: stubbedProgressPayload.personalDetails,
            additionalDetails: stubbedProgressPayload.additionalDetails,
            emergencyContact: stubbedProgressPayload.emergencyContact,
          }}
        />
      )

      const submitButton = screen.getByRole('button', {
        name: 'Continue to pay deposit',
      })
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)

      expect(onSubmitSuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('submit retry escalation', () => {
    const renderCompletedForm = (props: Partial<BookingFormNewProps> = {}) =>
      render(
        <BookingFormNew
          {...stubbedBookingFormNewProps}
          initialFormState={{
            guarantorRequirement: 'notRequired',
            personalDetails: stubbedProgressPayload.personalDetails,
            additionalDetails: stubbedProgressPayload.additionalDetails,
            emergencyContact: stubbedProgressPayload.emergencyContact,
          }}
          {...props}
        />
      )

    it('relabels the submit button and stays on the form when a submit fails', async () => {
      const onAdvancePageStep = jest.fn()
      const onSubmitSuccess = jest.fn().mockResolvedValue(false)
      renderCompletedForm({ onSubmitSuccess, onAdvancePageStep })

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
      )
      expect(onAdvancePageStep).not.toHaveBeenCalled()
    })

    it('shows the retry message when a submit fails', async () => {
      const onSubmitSuccess = jest.fn().mockResolvedValue(false)
      renderCompletedForm({ onSubmitSuccess })

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )

      await waitFor(() =>
        expect(screen.getByText('Please try again.')).toBeVisible()
      )
    })

    it('escalates and stays on the form when a submit throws', async () => {
      const onAdvancePageStep = jest.fn()
      const onSubmitSuccess = jest
        .fn()
        .mockRejectedValue(new Error('Network error'))
      renderCompletedForm({ onSubmitSuccess, onAdvancePageStep })

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
      )
      expect(onAdvancePageStep).not.toHaveBeenCalled()
    })

    it('opens contact support instead of resubmitting once failures escalate', async () => {
      const onSubmitSuccess = jest.fn().mockResolvedValue(false)
      const onContactSupport = jest.fn()
      renderCompletedForm({ onSubmitSuccess, onContactSupport })

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )
      fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
      fireEvent.click(
        await screen.findByRole('button', { name: 'Try one more time' })
      )

      const supportButton = await screen.findByRole('button', {
        name: 'Contact support',
      })
      const submitCallsBeforeSupport = onSubmitSuccess.mock.calls.length
      fireEvent.click(supportButton)

      expect(onContactSupport).toHaveBeenCalled()
      expect(onSubmitSuccess).toHaveBeenCalledTimes(submitCallsBeforeSupport)
    })

    it('clears the retry message and advances when a retried submit succeeds', async () => {
      const onAdvancePageStep = jest.fn()
      const onSubmitSuccess = jest
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValue(undefined)
      renderCompletedForm({ onSubmitSuccess, onAdvancePageStep })

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      )

      fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))

      await waitFor(() => expect(onAdvancePageStep).toHaveBeenCalled())
      expect(screen.queryByText('Please try again.')).not.toBeInTheDocument()
    })
  })

  describe('guarantorRequirement', () => {
    it('shows the Guarantor step when guarantorRequirement is "uk"', () => {
      setup({ initialFormState: { guarantorRequirement: 'uk' } })
      expect(screen.getByText(/Guarantor/i)).toBeVisible()
    })

    it('shows the Guarantor step when guarantorRequirement is "international"', () => {
      setup({ initialFormState: { guarantorRequirement: 'international' } })
      expect(screen.getByText(/Guarantor/i)).toBeVisible()
    })

    it('does not show the Guarantor step when guarantorRequirement is "notRequired"', () => {
      setup({ initialFormState: { guarantorRequirement: 'notRequired' } })
      expect(screen.queryByText(/Guarantor/i)).not.toBeInTheDocument()
    })

    it('shows the submit button directly after completing Emergency Contact when guarantorRequirement is "notRequired"', async () => {
      setup({ initialFormState: { guarantorRequirement: 'notRequired' } })
      await fillAndSubmitPersonalDetails()
      await fillAndSubmitAdditionalDetails()
      fireEvent.change(screen.getByLabelText('Relationship to you'), {
        target: { value: stubbedEmergencyContact.relationship },
      })
      fireEvent.change(screen.getByLabelText('First name'), {
        target: { value: stubbedEmergencyContact.firstName },
      })
      fireEvent.change(screen.getByLabelText('Last name'), {
        target: { value: stubbedEmergencyContact.lastName },
      })
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: stubbedEmergencyContact.email },
      })
      fireEvent.change(screen.getByLabelText('Phone number'), {
        target: { value: stubbedEmergencyContact.phone },
      })
      fireEvent.change(screen.getByTestId('ecDob-day'), {
        target: { value: stubbedEmergencyContact.dobDay },
      })
      fireEvent.change(screen.getByTestId('ecDob-month'), {
        target: { value: stubbedEmergencyContact.dobMonth },
      })
      fireEvent.change(screen.getByTestId('ecDob-year'), {
        target: { value: stubbedEmergencyContact.dobYear },
      })
      fireEvent.click(screen.getByTestId('address-select-ecAddress'))
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Continue to pay deposit' })
        ).toBeVisible()
      )
    })

    it('shows the submit button when initialised with all non-guarantor steps completed and guarantorRequirement is "notRequired"', () => {
      setup({
        initialFormState: {
          guarantorRequirement: 'notRequired',
          personalDetails: stubbedProgressPayload.personalDetails,
          additionalDetails: stubbedProgressPayload.additionalDetails,
          emergencyContact: stubbedProgressPayload.emergencyContact,
        },
      })
      expect(
        screen.getByRole('button', { name: 'Continue to pay deposit' })
      ).toBeVisible()
    })

    it('shows the UK-specific hasGuarantor label when guarantorRequirement is "uk"', () => {
      setup({
        initialFormState: {
          guarantorRequirement: 'uk',
          personalDetails: stubbedProgressPayload.personalDetails,
          additionalDetails: stubbedProgressPayload.additionalDetails,
          emergencyContact: stubbedProgressPayload.emergencyContact,
        },
      })
      expect(
        screen.getByText('Do you have a UK-based guarantor?')
      ).toBeVisible()
    })

    it('shows the international hasGuarantor label when guarantorRequirement is "international"', () => {
      setup({
        initialFormState: {
          guarantorRequirement: 'international',
          personalDetails: stubbedProgressPayload.personalDetails,
          additionalDetails: stubbedProgressPayload.additionalDetails,
          emergencyContact: stubbedProgressPayload.emergencyContact,
        },
      })
      expect(
        screen.getByText('Do you have an international guarantor?')
      ).toBeVisible()
    })
  })

  describe('requiresEmergencyContact', () => {
    it('shows the Emergency contact step when requiresEmergencyContact is true', () => {
      setup({
        initialFormState: {
          guarantorRequirement: 'notRequired',
          requiresEmergencyContact: true,
        },
      })
      expect(screen.getByText('Emergency contact')).toBeVisible()
    })

    it('hides the Emergency contact step when requiresEmergencyContact is false', () => {
      setup({
        initialFormState: {
          guarantorRequirement: 'notRequired',
          requiresEmergencyContact: false,
        },
      })
      expect(screen.queryByText('Emergency contact')).not.toBeInTheDocument()
    })

    it('drops the same-as-emergency-contact question and collects guarantor details directly when there is no emergency contact', () => {
      setup({
        initialFormState: {
          guarantorRequirement: 'uk',
          requiresEmergencyContact: false,
          personalDetails: stubbedProgressPayload.personalDetails,
          additionalDetails: stubbedProgressPayload.additionalDetails,
        },
      })

      expect(screen.queryByText('Emergency contact')).not.toBeInTheDocument()
      expect(
        screen.getByText('Do you have a UK-based guarantor?')
      ).toBeVisible()

      fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))

      expect(
        screen.queryByRole('radiogroup', {
          name: 'Is your guarantor the same as your emergency contact?',
        })
      ).not.toBeInTheDocument()
      expect(screen.getByLabelText('Relationship to you')).toBeVisible()
    })
  })

  describe('when initialised with pre-existing form state', () => {
    describe('with personalDetails only', () => {
      beforeEach(() => {
        setup({
          initialFormState: {
            personalDetails: stubbedProgressPayload.personalDetails,
          },
        })
      })

      it('shows the personal details step as completed', () => {
        expect(
          screen.getByText(
            `${stubbedPersonalDetails.firstName} ${stubbedPersonalDetails.lastName}`
          )
        ).toBeVisible()
        expect(screen.getByText(stubbedPersonalDetails.email)).toBeVisible()
      })

      it('does not render the personal details input fields', () => {
        expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
      })

      it('shows an Edit button on the completed personal details step', () => {
        expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible()
      })

      it('activates the Additional Details step', () => {
        expect(
          screen.getByText(/Additional Details/i).closest('fieldset')
        ).not.toBeDisabled()
      })

      it('keeps Emergency Contact and Guarantor steps disabled', () => {
        expect(
          screen.getByText(/Emergency Contact/i).closest('fieldset')
        ).toBeDisabled()
        expect(
          screen.getByText(/Guarantor/i).closest('fieldset')
        ).toBeDisabled()
      })
    })

    describe('with all steps completed', () => {
      beforeEach(() => {
        setup({ initialFormState: stubbedProgressPayload })
      })

      it('shows the Continue to pay deposit button', () => {
        expect(
          screen.getByRole('button', { name: 'Continue to pay deposit' })
        ).toBeVisible()
      })

      it('uses a custom submit button label when one is provided', () => {
        setup({
          initialFormState: stubbedProgressPayload,
          submitButtonLabel: 'Submit booking',
        })

        expect(
          screen.getByRole('button', { name: 'Submit booking' })
        ).toBeVisible()
      })

      it('does not show a Continue button', () => {
        expect(
          screen.queryByRole('button', { name: 'Continue' })
        ).not.toBeInTheDocument()
      })

      it('shows an Edit button on each completed step', () => {
        expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(4)
      })

      it('shows a summary of the personal details', () => {
        expect(
          screen.getByText(
            `${stubbedPersonalDetails.firstName} ${stubbedPersonalDetails.lastName}`
          )
        ).toBeVisible()
        expect(screen.getByText(stubbedPersonalDetails.email)).toBeVisible()
      })

      it('shows a summary of the additional details', () => {
        const serialisedDob = `${stubbedAdditionalDetails.dobDay}/${stubbedAdditionalDetails.dobMonth}/${stubbedAdditionalDetails.dobYear}`
        expect(screen.getByText(new RegExp(serialisedDob))).toBeVisible()
      })

      it('shows a summary of the emergency contact details', () => {
        expect(
          screen.getByText(
            `${stubbedEmergencyContact.firstName} ${stubbedEmergencyContact.lastName}`
          )
        ).toBeVisible()
      })

      it('shows a summary of the guarantor details', () => {
        expect(
          screen.getByText(
            `${stubbedGuarantor.firstName} ${stubbedGuarantor.lastName}`
          )
        ).toBeVisible()
      })

      it('keeps the other completed sections summarised when one is edited', () => {
        fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])

        expect(screen.getByLabelText('First name')).toBeVisible()
        expect(
          screen.getByText(
            `${stubbedEmergencyContact.firstName} ${stubbedEmergencyContact.lastName}`
          )
        ).toBeVisible()
        expect(
          screen.getByText(
            `${stubbedGuarantor.firstName} ${stubbedGuarantor.lastName}`
          )
        ).toBeVisible()
        expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(3)
      })
    })

    describe('with personalDetails and additionalDetails', () => {
      beforeEach(() => {
        setup({
          initialFormState: {
            personalDetails: stubbedProgressPayload.personalDetails,
            additionalDetails: stubbedProgressPayload.additionalDetails,
          },
        })
      })

      it('activates the Emergency Contact step', () => {
        expect(screen.getByLabelText('Relationship to you')).toBeVisible()
      })

      it('shows the Additional Details step as completed', () => {
        const serialisedDob = `${stubbedAdditionalDetails.dobDay}/${stubbedAdditionalDetails.dobMonth}/${stubbedAdditionalDetails.dobYear}`
        expect(screen.getByText(new RegExp(serialisedDob))).toBeVisible()
      })

      it('keeps the Guarantor step disabled', () => {
        expect(
          screen.getByText(/Guarantor/i).closest('fieldset')
        ).toBeDisabled()
      })
    })

    describe('with personalDetails, additionalDetails, and emergencyContact', () => {
      beforeEach(() => {
        setup({
          initialFormState: {
            personalDetails: stubbedProgressPayload.personalDetails,
            additionalDetails: stubbedProgressPayload.additionalDetails,
            emergencyContact: stubbedProgressPayload.emergencyContact,
          },
        })
      })

      it('activates the Guarantor step', () => {
        expect(
          screen.getByRole('radio', { name: 'Yes, I have one' })
        ).toBeVisible()
      })

      it('shows the Emergency Contact step as completed', () => {
        expect(
          screen.getByText(
            `${stubbedEmergencyContact.firstName} ${stubbedEmergencyContact.lastName}`
          )
        ).toBeVisible()
      })
    })
  })
})
