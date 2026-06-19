// No-op Sentry shim for local dev. The real @sentry/nextjs drags the full
// server SDK (@sentry/node) into the client bundle, which isn't wanted in this
// sandbox. Any named/default import resolves to a forgiving no-op: calling it
// runs a trailing callback if present (covers withScope/startSpan patterns).
const noop = (...args) => {
  const last = args[args.length - 1]
  return typeof last === 'function' ? last() : undefined
}

module.exports = new Proxy(noop, {
  get: () => noop,
})
