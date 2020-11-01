export const id = a => a

export const noop = () => {}

export const isNull = value => value === null || value === undefined

export const Identity = { Left: id, Right: id }

export const iff = (f = id, a) => f(a)
