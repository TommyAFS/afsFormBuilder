import type { Preview } from '@storybook/react'

// Global design-system styles so components render with real fonts/tokens.
// Swap to '@afs/styles/main-without-fonts.scss' if font URLs cause noise locally.
import '@afs/styles/main.scss'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
