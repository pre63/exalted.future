import { Identity, iff } from './id'

export const Id = a => ({
  ap: app => app.map((f) => iff(f, a)),
  bimap: (_, r) => iff(r,a),
  cata: (f = Identity) => f.Right(a),
  chain: (f ) => iff(f,a),
  equals: id => id.cata({ Right: b => a === b }),
  fold: (f ) => iff(f,a),
  foldl: (f ) => iff(f,null),
  foldr: (f ) => iff(f,a),
  map: f => Id(iff(f, a)),
  of: a => Id(a),
  inspect: () => 'Id(' + a + ')'
})

Id.of = a => Id(a)
