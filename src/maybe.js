const isNull = value => value === null || value === undefined

export const Maybe = a => (isNull(a) ? Nothing() : Just(a))

Maybe.of = a => Maybe(a)

const identity = a => a

export const Nothing = () => ({
  ap: () => Nothing(),
  bimap: (left = identity, right = identity) => left(null),
  cata: (f = { Left: identity }) => f.Left(null),
  chain: () => Nothing(),
  alt: (f = identity) => Maybe(f(null)),
  equals: id => id.cata({ Right: b => isNull(b) }),
  fold: () => {},
  foldl: () => {},
  foldr: () => {},
  inspect: () => 'Nothing()',
  map: () => Nothing(),
  of: a => Maybe(a)
})

Nothing.of = () => Nothing()

export const Just = a => ({
  ap: app => app.map(f => f(a)),
  bimap: (left = identity, right = identity) => right(a),
  cata: (f = { Right: identity }) => f.Right(a),
  chain: (f = identity) => f(a),
  alt: () => Just(a),
  equals: id => id.cata({ Right: b => a === b }),
  fold: (f = identity) => f(a),
  foldl: () => {},
  foldr: (f = identity) => f(a),
  inspect: () => `Just(${a})`,
  map: (f = identity) => Maybe(f(a)),
  of: a => Maybe(a)
})

Just.of = a => Just(a)

const encase = (f = identity) => {
  try {
    return Maybe(f(null))
  } catch (_) {
    return Nothing()
  }
}

Just.encase = encase

Nothing.encase = encase

Maybe.encase = encase

export const head = list => (list.length > 0 ? Maybe(list[0]) : Nothing())

export const tail = list => (list.length > 0 ? Maybe(list.slice(1)) : Nothing())

export const last = list => (list.length > 0 ? Maybe(list[list.length - 1]) : Nothing())

export const get = (...args) => a => args.reduce((acc, b) => acc.map(c => c && c[b]), Maybe(a))
