import { stubbedProgressPayload } from '../test-data'

const BookingFormNew = ({
  currentPageStep,
  onAdvancePageStep,
  onSubmitSuccess,
  save,
}: any) => {
  const handleSubmit = async () => {
    const result = await save?.(stubbedProgressPayload)
    if (result && result.status !== 'saved') return

    const succeeded = await onSubmitSuccess?.(stubbedProgressPayload)
    if (succeeded === false) return

    onAdvancePageStep(currentPageStep + 1)
  }

  return (
    <div data-testid="booking-form">
      <button type="button" data-testid="submit-booking" onClick={handleSubmit}>
        Submit booking
      </button>
    </div>
  )
}

export default BookingFormNew
