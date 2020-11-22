import { Identity, iff } from './exalted'

export const Id = a => ({
  ap: app => app.map(f => iff(f, a)),
  alt: () => Id(a),
  bimap: (_, r) => iff(r, a),
  cata: (f = Identity) => f.Right(a),
  chain: f => iff(f, a),
  equals: id => id.cata({ Right: b => a === b }),
  fold: f => iff(f, a),
  foldl: f => iff(f, null),
  foldr: f => iff(f, a),
  map: f => Id(iff(f, a)),
  of: a => Id(a),
  inspect: () => 'Id(' + a + ')',
  swap: () => Id(a)
})

Id.of = a => Id(a)
