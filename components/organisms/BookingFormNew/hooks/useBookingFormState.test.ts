import { act, renderHook } from '@testing-library/react'
import type { FormEvent } from 'react'

import { useBookingFormState } from './useBookingFormState'
import { sections } from '../sectionBuilder'
import { BookingFormInitialData } from '../helpers/bookingFormSerialisers'
import { SaveProgressResult } from '../../../../api/BookingNew/softBookingApi'
import { stubbedPersonalDetails } from '../test-data'
import ContactAddress from '../../../../types/ContactAddress'

jest.mock('../components/BookingFormAddressSection', () => ({
  EMPTY_ADDRESS: {
    line1: '',
    line2: '',
    line3: '',
    townCity: '',
    region: '',
    postcode: '',
    country: '',
  },
}))

beforeAll(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  })
})

afterAll(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: undefined,
    writable: false,
  })
})

const initialFormState: BookingFormInitialData = {
  guarantorRequirement: 'uk',
  requiresEmergencyContact: true,
}

const allSections = sections(
  initialFormState.guarantorRequirement,
  initialFormState.requiresEmergencyContact
)
const personalSection = allSections.find(
  (section) => section.id === 'personal'
)!

const sampleAddress: ContactAddress = {
  line1: '1 High Street',
  line2: '',
  line3: '',
  townCity: 'London',
  region: '',
  postcode: 'N1 1AA',
  country: 'United Kingdom',
}

const setup = (
  overrides: {
    save?: jest.Mock
    onSubmitSuccess?: jest.Mock
    onAdvancePageStep?: jest.Mock
  } = {}
) => {
  const save =
    overrides.save ?? jest.fn().mockResolvedValue({ status: 'saved' })
  const onSubmitSuccess = overrides.onSubmitSuccess ?? jest.fn()
  const onAdvancePageStep = overrides.onAdvancePageStep ?? jest.fn()

  const utils = renderHook(() =>
    useBookingFormState({
      onAdvancePageStep,
      currentPageStep: 1,
      correlationId: 'test-correlation-id',
      pbsaId: 123,
      initialFormState,
      onSubmitSuccess,
      save,
    })
  )

  return { ...utils, save, onSubmitSuccess, onAdvancePageStep }
}

const fillValidPersonalDetails = (
  handleChange: (fieldId: string, value: string) => void
) => {
  handleChange('firstName', stubbedPersonalDetails.firstName)
  handleChange('lastName', stubbedPersonalDetails.lastName)
  handleChange('email', stubbedPersonalDetails.email)
  handleChange('phone', stubbedPersonalDetails.phone)
  handleChange('phone.countryCode', 'GB')
}

describe('useBookingFormState', () => {
  describe('initial state', () => {
    it('starts with the first section active and nothing completed', () => {
      const { result } = setup()

      expect(result.current.completedIds).toEqual([])
      expect(result.current.activeSectionIndex).toBe(0)
      expect(result.current.isFormComplete).toBe(false)
      expect(result.current.formValues.guarantorType).toBe('uk')
    })
  })

  describe('handleChange', () => {
    it('updates a form value', () => {
      const { result } = setup()

      act(() => {
        result.current.handleChange('firstName', 'Jane')
      })

      expect(result.current.formValues.firstName).toBe('Jane')
    })

    it('clears an existing error for the changed field', async () => {
      const { result } = setup()

      await act(async () => {
        await result.current.handleContinue(personalSection)
      })
      expect(result.current.errors.firstName).toBeTruthy()

      act(() => {
        result.current.handleChange('firstName', 'Jane')
      })

      expect(result.current.errors.firstName).toBe('')
    })
  })

  describe('handleDobChange', () => {
    it('updates a date of birth value', () => {
      const { result } = setup()
      const dob = { day: '12', month: '05', year: '1990' }

      act(() => {
        result.current.handleDobChange('dob', dob)
      })

      expect(result.current.dobValues.dob).toEqual(dob)
    })
  })

  describe('addressHandlers', () => {
    it('onSelect stores the address, sets a formatted form value and clears the error', () => {
      const { result } = setup()

      act(() => {
        result.current.addressHandlers.onSelect('address', sampleAddress)
      })

      expect(result.current.addressValues.address).toEqual(sampleAddress)
      expect(result.current.formValues.address).toBe(
        '1 High Street, London, N1 1AA'
      )
      expect(result.current.errors.address).toBe('')
    })

    it('onClear removes the address and clears the form value', () => {
      const { result } = setup()

      act(() => {
        result.current.addressHandlers.onSelect('address', sampleAddress)
      })

      act(() => {
        result.current.addressHandlers.onClear('address')
      })

      expect(result.current.addressValues.address).toBeUndefined()
      expect(result.current.formValues.address).toBe('')
    })

    it('onFieldChange updates a single field of the address', () => {
      const { result } = setup()

      act(() => {
        result.current.addressHandlers.onSelect('address', sampleAddress)
      })

      act(() => {
        result.current.addressHandlers.onFieldChange(
          'address',
          'townCity',
          'Manchester'
        )
      })

      expect(result.current.addressValues.address?.townCity).toBe('Manchester')
    })
  })

  describe('handleContinue', () => {
    it('returns the first invalid field and does not save when the section is invalid', async () => {
      const { result, save } = setup()

      let firstInvalidField: string | null = null
      await act(async () => {
        firstInvalidField = await result.current.handleContinue(personalSection)
      })

      expect(firstInvalidField).toBe('firstName')
      expect(save).not.toHaveBeenCalled()
      expect(result.current.completedIds).toEqual([])
    })

    it('saves and marks the section complete when the section is valid', async () => {
      const { result, save } = setup()

      act(() => {
        fillValidPersonalDetails(result.current.handleChange)
      })

      let firstInvalidField: string | null = 'unset'
      await act(async () => {
        firstInvalidField = await result.current.handleContinue(personalSection)
      })

      expect(firstInvalidField).toBeNull()
      expect(save).toHaveBeenCalledTimes(1)
      expect(result.current.completedIds).toContain('personal')
      expect(result.current.activeSectionIndex).toBe(1)
    })

    it('does not complete the section when the save is not found', async () => {
      const save = jest
        .fn()
        .mockResolvedValue({ status: 'notFound' } as SaveProgressResult)
      const { result } = setup({ save })

      act(() => {
        fillValidPersonalDetails(result.current.handleChange)
      })

      await act(async () => {
        await result.current.handleContinue(personalSection)
      })

      expect(result.current.completedIds).not.toContain('personal')
    })
  })

  describe('handleEdit', () => {
    it('removes only the edited section from completed and enters editing mode', async () => {
      const { result } = setup()

      act(() => {
        fillValidPersonalDetails(result.current.handleChange)
      })
      await act(async () => {
        await result.current.handleContinue(personalSection)
      })
      expect(result.current.completedIds).toContain('personal')

      act(() => {
        result.current.handleEdit(0)
      })

      expect(result.current.completedIds).toEqual([])
      expect(result.current.isEditing).toBe(true)
    })
  })

  describe('handleSubmit', () => {
    const submitEvent = {
      preventDefault: jest.fn(),
    } as unknown as FormEvent

    it('advances to the next page step and resets the failure count on success', async () => {
      const onSubmitSuccess = jest.fn().mockResolvedValue(undefined)
      const onAdvancePageStep = jest.fn()
      const { result } = setup({ onSubmitSuccess, onAdvancePageStep })

      await act(async () => {
        await result.current.handleSubmit(submitEvent)
      })

      expect(onSubmitSuccess).toHaveBeenCalledTimes(1)
      expect(onAdvancePageStep).toHaveBeenCalledWith(2)
      expect(result.current.submitFailureCount).toBe(0)
    })

    it('increments the failure count and resets to idle when submit reports failure', async () => {
      const onSubmitSuccess = jest.fn().mockResolvedValue(false)
      const onAdvancePageStep = jest.fn()
      const { result } = setup({ onSubmitSuccess, onAdvancePageStep })

      await act(async () => {
        await result.current.handleSubmit(submitEvent)
      })

      expect(onAdvancePageStep).not.toHaveBeenCalled()
      expect(result.current.submitFailureCount).toBe(1)
      expect(result.current.submitState.status).toBe('idle')
    })
  })
})
