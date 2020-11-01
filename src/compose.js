export const compose = (...rest) => (...a) =>
  rest
    .slice(0, rest.length - 1)
    .reduceRight((acc, func) => func(acc), rest.slice(rest.length - 1)[0](...a))

export const map = (...functions) => functor =>
  functions.reduceRight((functor, f) => functor.map(f), functor)
