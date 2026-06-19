import type { StorybookConfig } from '@storybook/nextjs'

// Story globs are scoped to source folders so Storybook never scans node_modules.
const config: StorybookConfig = {
  stories: [
    '../index.stories.tsx',
    '../components/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
}

export default config
