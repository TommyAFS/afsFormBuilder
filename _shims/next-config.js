// Shim for `next/config`. The main repo is Pages Router and exposes these
// values via publicRuntimeConfig; App Router doesn't populate runtime config,
// so getConfig() is undefined and destructuring it throws. This mirrors the
// repo's next.runtimeConfig.js. Values come from env vars (undefined in local
// dev unless you set them — e.g. GOOGLE_MAPS_JS_API_KEY for address lookup).
const publicRuntimeConfig = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  googleMapsJsApiKey: process.env.GOOGLE_MAPS_JS_API_KEY,
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
  stripeApiKey: process.env.STRIPE_API_KEY,
  stripePaymentMethodConfigId: process.env.STRIPE_PAYMENT_METHOD_CONFIG_ID,
  baseUrl: process.env.BASE_URL,
  apiBaseUrl: process.env.API_BASE_URL,
  wordpressApiBaseUrl: process.env.WORDPRESS_API_BASE_URL,
  publicApiBaseUrl: process.env.PUBLIC_API_BASE_URL,
  searchBaseUrl: process.env.SEARCH_BASE_URL,
  publicSearchBaseUrl: process.env.PUBLIC_SEARCH_BASE_URL,
  placeholderImageSrc: process.env.PLACEHOLDER_IMAGE_SRC,
  afsPropertiesImageBaseUrl: process.env.AFS_PROPERTIES_IMAGE_BASE_URL,
  cookieDomain: process.env.COOKIE_DOMAIN,
  isLocalEnvironment: process.env.COOKIE_ENV === 'local',
  sentryDsn: process.env.SENTRY_DSN,
  runtimeEnvironment: process.env.RUNTIME_ENV,
}

function getConfig() {
  return { serverRuntimeConfig: {}, publicRuntimeConfig }
}

function setConfig() {}

// Export shapes for both `import getConfig from 'next/config'` (ESM default,
// needs __esModule + .default) and `require('next/config')` (CJS, the function).
module.exports = getConfig
module.exports.default = getConfig
module.exports.setConfig = setConfig
module.exports.__esModule = true
