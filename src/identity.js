const identity = a => a

export const Id = a => ({
  ap: app => app.map((f = identity) => f(a)),
  bimap: (left = identity, right = identity) => right(a),
  cata: (f = { Right: identity }) => f.Right(a),
  chain: (f = identity) => f(a),
  equals: id => id.cata({ Right: b => a === b }),
  fold: (f = identity) => f(a),
  foldl: (f = identity) => f(null),
  foldr: (f = identity) => f(a),
  map: f => Id(f(a)),
  of: a => Id(a),
  inspect: () => `Id(${a})`
})

Id.of = a => Id(a)
