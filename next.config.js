const path = require('path')
const { svgoConfig } = require('./.svgrrc.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@afs/components', '@afs/styles'],
  webpack: (config, { webpack }) => {
    // SVGs are imported as React components, matching the main repo's setup.
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.(js|jsx|ts|tsx)$/,
      use: [{ loader: require.resolve('@svgr/webpack'), options: { svgoConfig } }],
    })

    config.resolve.alias = {
      ...config.resolve.alias,
      // Stub Sentry — it's monitoring, and the real SDK pulls server-only code
      // into the bundle. Not needed for local dev.
      '@sentry/nextjs': path.resolve(__dirname, '_shims/sentry.js'),
    }

    // The repo is Pages Router (publicRuntimeConfig); App Router doesn't
    // populate next/config, so getConfig() is undefined. Shim it. A plugin is
    // used (not resolve.alias) because Next registers its own exact alias for
    // next/config that would otherwise win.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^next\/config$/,
        path.resolve(__dirname, '_shims/next-config.js')
      )
    )

    // NOTE: do NOT alias react/react-dom. Next 14 App Router aliases every
    // `react` import to its own vendored canary (which has React.use/cache),
    // including the symlinked real components — so React is already a single
    // instance. Overriding it forces plain react@18.3.1 (no `use`/`cache`) and
    // crashes Next's runtime. Don't alias @afs/* either (breaks their exports).

    return config
  },
}

module.exports = nextConfig
