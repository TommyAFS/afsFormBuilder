export const EMPTY_ADDRESS = {
  line1: '',
  line2: '',
  line3: '',
  townCity: '',
  region: '',
  postcode: '',
  country: '',
}

const BookingFormAddressSection = ({ name, selectAddress }: any) => (
  <button
    type="button"
    data-testid={`address-select-${name}`}
    onClick={() =>
      selectAddress({
        line1: '1 Test Road',
        line2: '',
        line3: '',
        townCity: 'London',
        region: '',
        postcode: 'EC1A 1BB',
        country: 'United Kingdom',
      })
    }
  >
    Select address
  </button>
)

export default BookingFormAddressSection
