import type { Meta, StoryObj } from '@storybook/nextjs'
import BookingFormNew, { BookingFormNewProps } from './index'
import {
  PRESETS,
  stubbedBookingFormNewProps,
  stubbedProgressPayload,
} from './test-data'

type PresetKey = keyof typeof PRESETS
type StoryArgs = BookingFormNewProps & { preset?: PresetKey }

const meta: Meta<StoryArgs> = {
  title: 'Organisms/BookingFormNew',
  component: BookingFormNew,
  args: { ...stubbedBookingFormNewProps, preset: 'UK' },
  argTypes: {
    preset: { control: { type: 'select' }, options: Object.keys(PRESETS) },
    onAdvancePageStep: {
      action: 'onAdvancePageStep',
      table: { disable: true },
    },
    initialFormState: { table: { disable: true } },
    correlationId: { table: { disable: true } },
    pbsaId: { table: { disable: true } },
    currentPageStep: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
    controls: { include: ['preset'], expanded: true },
  },
}
export default meta

type Story = StoryObj<StoryArgs>

export const Default: Story = {
  render: ({ preset, ...rest }) => {
    const derived = PRESETS[(preset ?? 'UK') as PresetKey]
    return <BookingFormNew {...rest} {...derived} />
  },
}

// A pre-completed form whose submit always fails, so clicking the submit button
// walks the retry escalation in real form context: the button relabels Try
// again -> Try one more time -> Contact support and the escalating message
// appears. Transient submit failures surface here, not on the per-section
// Continue saves (which only raise the stale-data overlays).
export const SubmitError: Story = {
  name: 'Submit error (retry escalation)',
  parameters: { controls: { include: [] } },
  render: () => (
    <BookingFormNew
      {...stubbedBookingFormNewProps}
      initialFormState={{
        guarantorRequirement: 'notRequired',
        personalDetails: stubbedProgressPayload.personalDetails,
        additionalDetails: stubbedProgressPayload.additionalDetails,
        emergencyContact: stubbedProgressPayload.emergencyContact,
      }}
      onSubmitSuccess={() => false}
    />
  ),
}
