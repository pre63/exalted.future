export const compose = (...rest) => (...a) =>
  rest
    .slice(0, rest.length - 1)
    .reduceRight((acc, func) => func(acc), rest.slice(rest.length - 1)[0](...a))

const fmap = f => functor => functor.map(f)

export const map = (...functions) => functor =>
  functions.reduceRight((acc, f) => fmap(f)(acc), functor)

const id = a => a

export const leftIdentity = { Left: id }

export const rightIdentity = { Right: id }

export const identity = { Left: id, Right: id }
