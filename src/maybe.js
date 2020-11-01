import { Identity, isNull, noop, iff } from './id'

export const Nothing = () => ({
  ap: () => Nothing(),
  bimap: (l, _) => iff(l, null),
  cata: (f = Identity) => f.Left(null),
  chain: () => Nothing(),
  alt: f => Maybe(iff(f, null)),
  equals: id => id.cata({ Right: b => isNull(b) }),
  fold: noop,
  foldl: noop,
  foldr: noop,
  inspect: () => 'Nothing()',
  map: () => Nothing(),
  of: a => Maybe(a)
})

Nothing.of = () => Nothing()

export const Just = a => ({
  ap: app => app.map(f => f(a)),
  bimap: (_, r) => iff(r, a),
  cata: (f = Identity) => f.Right(a),
  chain: f => iff(f, a),
  alt: () => Just(a),
  equals: id => id.cata({ Right: b => a === b }),
  fold: f => iff(f, a),
  foldl: noop,
  foldr: f => iff(f, a),
  inspect: () => 'Just(' + a + ')',
  map: f => Maybe(iff(f, a)),
  of: a => Maybe(a)
})

Just.of = a => Just(a)

const encase = f => {
  try {
    return Maybe(iff(f, null))
  } catch (_) {
    return Nothing()
  }
}

Just.encase = encase

Nothing.encase = encase

export const Maybe = a => (isNull(a) ? Nothing() : Just(a))

Maybe.of = a => Maybe(a)

Maybe.encase = encase

export const head = list => (list.length > 0 ? Maybe(list[0]) : Nothing())

export const tail = list => (list.length > 0 ? Maybe(list.slice(1)) : Nothing())

export const last = list => (list.length > 0 ? Maybe(list[list.length - 1]) : Nothing())

export const get = (...args) => a => args.reduce((acc, b) => acc.map(c => c && c[b]), Maybe(a))
