import { fireEvent, waitFor, screen } from '@testing-library/react'
import {
  stubbedAdditionalDetails,
  stubbedEmergencyContact,
  stubbedGuarantor,
  stubbedPersonalDetails,
} from './test-data'

export const fillAndSubmitPersonalDetails = async () => {
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
  await waitFor(() => expect(screen.getByLabelText('Gender')).toBeVisible())
}

export const fillAndSubmitAdditionalDetails = async () => {
  fireEvent.change(screen.getByTestId('dob-day'), {
    target: { value: stubbedAdditionalDetails.dobDay },
  })
  fireEvent.change(screen.getByTestId('dob-month'), {
    target: { value: stubbedAdditionalDetails.dobMonth },
  })
  fireEvent.change(screen.getByTestId('dob-year'), {
    target: { value: stubbedAdditionalDetails.dobYear },
  })
  fireEvent.change(screen.getByLabelText('Gender'), {
    target: { value: stubbedAdditionalDetails.gender },
  })
  fireEvent.change(screen.getByLabelText('Country of citizenship'), {
    target: { value: stubbedAdditionalDetails.country },
  })
  fireEvent.click(screen.getByTestId('address-select-address'))
  fireEvent.change(screen.getByLabelText('Year of study'), {
    target: { value: stubbedAdditionalDetails.yearOfStudy },
  })
  fireEvent.change(screen.getByLabelText('University'), {
    target: { value: stubbedAdditionalDetails.university },
  })
  fireEvent.change(screen.getByLabelText('Course title'), {
    target: { value: stubbedAdditionalDetails.courseName },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() =>
    expect(screen.getByLabelText('Relationship to you')).toBeVisible()
  )
}

export const fillAndSubmitEmergencyContact = async () => {
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
    expect(screen.getByRole('radio', { name: 'Yes, I have one' })).toBeVisible()
  )
}

export const fillAndSubmitGuarantorWithExistingEC = async () => {
  fireEvent.click(screen.getByRole('radio', { name: 'Yes, I have one' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Yes' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Continue to pay deposit' })
    ).toBeVisible()
  )
}

export const fillAndSubmitGuarantorWithNewGuarantor = async () => {
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
  fireEvent.change(screen.getByTestId('guarantorDob-day'), {
    target: { value: stubbedGuarantor.dobDay },
  })
  fireEvent.change(screen.getByTestId('guarantorDob-month'), {
    target: { value: stubbedGuarantor.dobMonth },
  })
  fireEvent.change(screen.getByTestId('guarantorDob-year'), {
    target: { value: stubbedGuarantor.dobYear },
  })
  fireEvent.click(screen.getByTestId('address-select-guarantorAddress'))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Continue to pay deposit' })
    ).toBeVisible()
  )
}
