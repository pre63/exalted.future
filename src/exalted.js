export const compose = (...rest) => (...a) =>
  rest
    .slice(0, rest.length - 1)
    .reduceRight((acc, func) => func(acc), rest.slice(rest.length - 1)[0](...a))

export const map = (...functions) => functor =>
  functions.reduceRight((functor, f) => functor.map(f), functor)

export const id = a => a

export const noop = () => {}

export const isNull = value => value === null || value === undefined

export const Identity = { Left: id, Right: id }

export const iff = (f = id, a) => f(a)

export const log = (...a) => (console.log(...a), a[0])
