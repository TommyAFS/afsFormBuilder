import { BookingFormNewProps } from './index'

export {
  stubbedPersonalDetails,
  stubbedAdditionalDetails,
  stubbedInternationalAdditionalDetails,
  stubbedGuarantor,
  stubbedEmergencyContact,
  stubbedProgressPayload,
} from '../../../test/data/booking/bookingFormNew'

export const stubbedBookingFormNewProps: BookingFormNewProps = {
  currentPageStep: 2,
  onAdvancePageStep: () => {},
  onContactSupport: () => {},
  correlationId: null,
  pbsaId: 319,
  initialFormState: null,
}

export const stubbedBookingFormNewPropsInternationalGuarantor: BookingFormNewProps =
  {
    ...stubbedBookingFormNewProps,
    initialFormState: { guarantorRequirement: 'international' },
  }

export const stubbedBookingFormNewPropsNoGuarantor: BookingFormNewProps = {
  ...stubbedBookingFormNewProps,
  initialFormState: { guarantorRequirement: 'notRequired' },
}

export const PRESETS: Record<string, BookingFormNewProps> = {
  UK: stubbedBookingFormNewProps,
  INTERNATIONAL: stubbedBookingFormNewPropsInternationalGuarantor,
  NO_GUARANTOR: stubbedBookingFormNewPropsNoGuarantor,
}
